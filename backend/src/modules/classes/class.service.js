const Class = require('./class.model');
const Enrollment = require('./enrollment.model');
const TeacherAssignment = require('./teacherAssignment.model');
const User = require('../users/user.model');
const ApiError = require('../../utils/ApiError');
const notificationService = require('../notifications/notification.service');
const { ROLES, ENROLLMENT_STATUS, CLASS_STATUS } = require('../../utils/constants');

// --- Class CRUD ---
const createClass = async (data) => {
  const existing = await Class.findOne({ code: data.code.toUpperCase() });
  if (existing) {
    throw ApiError.conflict(`Class with code ${data.code} already exists.`);
  }
  return await Class.create({
    ...data,
    code: data.code.toUpperCase()
  });
};

const getClasses = async ({ search, status, academicYear, page = 1, limit = 50 }) => {
  const query = {};
  if (status) query.status = status;
  if (academicYear) query.academicYear = academicYear;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { code: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (page - 1) * limit;
  const [classes, total] = await Promise.all([
    Class.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Class.countDocuments(query)
  ]);

  // Aggregate student and teacher counts for each class
  const classIds = classes.map(c => c._id);
  const [enrollmentCounts, teacherCounts] = await Promise.all([
    Enrollment.aggregate([
      { $match: { class: { $in: classIds }, status: ENROLLMENT_STATUS.ACTIVE } },
      { $group: { _id: '$class', count: { $sum: 1 } } }
    ]),
    TeacherAssignment.aggregate([
      { $match: { class: { $in: classIds }, status: 'active' } },
      { $group: { _id: '$class', count: { $sum: 1 } } }
    ])
  ]);

  const studentCountMap = Object.fromEntries(enrollmentCounts.map(e => [e._id.toString(), e.count]));
  const teacherCountMap = Object.fromEntries(teacherCounts.map(t => [t._id.toString(), t.count]));

  const classesWithCounts = classes.map(c => ({
    ...c.toObject(),
    studentCount: studentCountMap[c._id.toString()] || 0,
    teacherCount: teacherCountMap[c._id.toString()] || 0
  }));

  return {
    classes: classesWithCounts,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / limit)
    }
  };
};

const getClassById = async (id) => {
  const cls = await Class.findById(id);
  if (!cls) {
    throw ApiError.notFound('Class not found.');
  }

  const [students, teachers] = await Promise.all([
    getClassStudents(id),
    getClassTeachers(id)
  ]);

  return {
    class: cls,
    students,
    teachers
  };
};

const updateClass = async (id, data) => {
  if (data.code) {
    const existing = await Class.findOne({ code: data.code.toUpperCase(), _id: { $ne: id } });
    if (existing) {
      throw ApiError.conflict(`Class with code ${data.code} already exists.`);
    }
    data.code = data.code.toUpperCase();
  }

  const updated = await Class.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!updated) {
    throw ApiError.notFound('Class not found.');
  }
  return updated;
};

// --- Student Enrollment ---
const enrollStudent = async (studentId, classId) => {
  const [student, cls] = await Promise.all([
    User.findById(studentId),
    Class.findById(classId)
  ]);

  if (!student || student.role !== ROLES.STUDENT) {
    throw ApiError.badRequest('Invalid student account.');
  }
  if (!cls || cls.status !== CLASS_STATUS.ACTIVE) {
    throw ApiError.badRequest('Class is not active or does not exist.');
  }

  // Deactivate any existing active enrollment for this student
  await Enrollment.updateMany(
    { student: studentId, status: ENROLLMENT_STATUS.ACTIVE },
    { $set: { status: ENROLLMENT_STATUS.TRANSFERRED, removedAt: new Date() } }
  );

  // Create new active enrollment
  const enrollment = await Enrollment.create({
    student: studentId,
    class: classId,
    status: ENROLLMENT_STATUS.ACTIVE,
    enrolledAt: new Date()
  });

  const populated = await enrollment.populate(['student', 'class']);

  // Fire-and-forget: notify student of enrollment
  setImmediate(async () => {
    try {
      await notificationService.notifyEnrollment(populated);
    } catch (e) {
      console.error('[Notifications] enrollment hook error:', e.message);
    }
  });

  return populated;
};

const removeStudentEnrollment = async (enrollmentId) => {
  const enrollment = await Enrollment.findByIdAndUpdate(
    enrollmentId,
    { status: ENROLLMENT_STATUS.REMOVED, removedAt: new Date() },
    { new: true }
  );
  if (!enrollment) {
    throw ApiError.notFound('Enrollment record not found.');
  }
  return enrollment;
};

const getClassStudents = async (classId) => {
  return await Enrollment.find({
    class: classId,
    status: ENROLLMENT_STATUS.ACTIVE
  })
    .populate({
      path: 'student',
      select: 'fullName email phone profilePhoto isActive'
    })
    .sort({ enrolledAt: -1 });
};

const getStudentEnrollment = async (studentId) => {
  return await Enrollment.findOne({
    student: studentId,
    status: ENROLLMENT_STATUS.ACTIVE
  }).populate('class');
};

// --- Teacher Assignment ---
const assignTeacherToClass = async (teacherId, classId) => {
  const [teacher, cls] = await Promise.all([
    User.findById(teacherId),
    Class.findById(classId)
  ]);

  if (!teacher || teacher.role !== ROLES.TEACHER) {
    throw ApiError.badRequest('Invalid faculty account.');
  }
  if (!cls || cls.status !== CLASS_STATUS.ACTIVE) {
    throw ApiError.badRequest('Class is not active or does not exist.');
  }

  // Check if already actively assigned
  const existing = await TeacherAssignment.findOne({
    teacher: teacherId,
    class: classId,
    status: 'active'
  });
  if (existing) {
    throw ApiError.conflict('Teacher is already assigned to this class.');
  }

  const assignment = await TeacherAssignment.create({
    teacher: teacherId,
    class: classId,
    status: 'active',
    assignedAt: new Date()
  });

  return await assignment.populate(['teacher', 'class']);
};

const removeTeacherAssignment = async (assignmentId) => {
  const assignment = await TeacherAssignment.findByIdAndUpdate(
    assignmentId,
    { status: 'removed' },
    { new: true }
  );
  if (!assignment) {
    throw ApiError.notFound('Teacher assignment record not found.');
  }
  return assignment;
};

const getClassTeachers = async (classId) => {
  return await TeacherAssignment.find({
    class: classId,
    status: 'active'
  })
    .populate({
      path: 'teacher',
      select: 'fullName email phone profilePhoto isActive'
    })
    .sort({ assignedAt: -1 });
};

const getTeacherAssignedClasses = async (teacherId) => {
  const assignments = await TeacherAssignment.find({
    teacher: teacherId,
    status: 'active'
  }).populate('class');

  return assignments.map(a => a.class).filter(Boolean);
};

// Check if a teacher has authorization for a given class
const isTeacherAuthorizedForClass = async (teacherId, classId) => {
  const assignment = await TeacherAssignment.findOne({
    teacher: teacherId,
    class: classId,
    status: 'active'
  });
  return Boolean(assignment);
};

module.exports = {
  createClass,
  getClasses,
  getClassById,
  updateClass,
  enrollStudent,
  removeStudentEnrollment,
  getClassStudents,
  getStudentEnrollment,
  assignTeacherToClass,
  removeTeacherAssignment,
  getClassTeachers,
  getTeacherAssignedClasses,
  isTeacherAuthorizedForClass
};
