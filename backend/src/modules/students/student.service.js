const User = require('../users/user.model');
const StudentProfile = require('../users/studentProfile.model');
const Enrollment = require('../classes/enrollment.model');
const ApiError = require('../../utils/ApiError');
const { ROLES, ENROLLMENT_STATUS } = require('../../utils/constants');

const getStudents = async ({ search, isActive, page = 1, limit = 50 }) => {
  const query = { role: ROLES.STUDENT };
  if (isActive !== undefined) {
    query.isActive = isActive === 'true' || isActive === true;
  }
  if (search) {
    query.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (page - 1) * limit;
  const [users, total] = await Promise.all([
    User.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    User.countDocuments(query)
  ]);

  const userIds = users.map(u => u._id);
  const [profiles, enrollments] = await Promise.all([
    StudentProfile.find({ user: { $in: userIds } }),
    Enrollment.find({ student: { $in: userIds }, status: ENROLLMENT_STATUS.ACTIVE }).populate('class')
  ]);

  const profileMap = Object.fromEntries(profiles.map(p => [p.user.toString(), p]));
  const enrollmentMap = Object.fromEntries(enrollments.map(e => [e.student.toString(), e]));

  const students = users.map(user => {
    const userObj = user.toJSON();
    const profile = profileMap[user._id.toString()];
    const activeEnrollment = enrollmentMap[user._id.toString()];
    return {
      ...userObj,
      studentId: profile?.studentId || 'N/A',
      enrolledClass: activeEnrollment?.class || null,
      enrollmentId: activeEnrollment?._id || null
    };
  });

  return {
    students,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / limit)
    }
  };
};

const getStudentById = async (id) => {
  const user = await User.findOne({ _id: id, role: ROLES.STUDENT });
  if (!user) {
    throw ApiError.notFound('Student not found.');
  }

  const [profile, enrollments] = await Promise.all([
    StudentProfile.findOne({ user: id }),
    Enrollment.find({ student: id }).populate('class').sort({ enrolledAt: -1 })
  ]);

  const activeEnrollment = enrollments.find(e => e.status === ENROLLMENT_STATUS.ACTIVE);

  return {
    student: {
      ...user.toJSON(),
      studentId: profile?.studentId || 'N/A',
      enrolledClass: activeEnrollment?.class || null,
      enrollmentId: activeEnrollment?._id || null,
      enrollmentHistory: enrollments
    }
  };
};

const updateStudent = async (id, data) => {
  const user = await User.findOne({ _id: id, role: ROLES.STUDENT });
  if (!user) {
    throw ApiError.notFound('Student not found.');
  }

  if (data.fullName !== undefined) user.fullName = data.fullName;
  if (data.phone !== undefined) user.phone = data.phone;
  if (data.isActive !== undefined) user.isActive = data.isActive;
  await user.save();

  if (data.studentId) {
    await StudentProfile.findOneAndUpdate(
      { user: id },
      { studentId: data.studentId },
      { upsert: true }
    );
  }

  return await getStudentById(id);
};

module.exports = {
  getStudents,
  getStudentById,
  updateStudent
};
