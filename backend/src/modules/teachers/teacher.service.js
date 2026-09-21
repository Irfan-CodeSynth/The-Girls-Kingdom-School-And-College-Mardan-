const User = require('../users/user.model');
const TeacherProfile = require('../users/teacherProfile.model');
const TeacherAssignment = require('../classes/teacherAssignment.model');
const ApiError = require('../../utils/ApiError');
const { ROLES } = require('../../utils/constants');

const getTeachers = async ({ search, department, isActive, page = 1, limit = 50 }) => {
  const query = { role: ROLES.TEACHER };
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
  const [profiles, assignments] = await Promise.all([
    TeacherProfile.find({ user: { $in: userIds } }),
    TeacherAssignment.find({ teacher: { $in: userIds }, status: 'active' }).populate('class')
  ]);

  const profileMap = Object.fromEntries(profiles.map(p => [p.user.toString(), p]));
  const assignmentMap = {};
  assignments.forEach(a => {
    const tid = a.teacher.toString();
    if (!assignmentMap[tid]) assignmentMap[tid] = [];
    if (a.class) assignmentMap[tid].push(a.class);
  });

  const teachers = users.map(user => {
    const userObj = user.toJSON();
    const profile = profileMap[user._id.toString()];
    return {
      ...userObj,
      teacherId: profile?.teacherId || 'N/A',
      department: profile?.department || 'N/A',
      assignedClasses: assignmentMap[user._id.toString()] || []
    };
  });

  return {
    teachers,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / limit)
    }
  };
};

const getTeacherById = async (id) => {
  const user = await User.findOne({ _id: id, role: ROLES.TEACHER });
  if (!user) {
    throw ApiError.notFound('Teacher not found.');
  }

  const [profile, assignments] = await Promise.all([
    TeacherProfile.findOne({ user: id }),
    TeacherAssignment.find({ teacher: id, status: 'active' }).populate('class')
  ]);

  return {
    teacher: {
      ...user.toJSON(),
      teacherId: profile?.teacherId || 'N/A',
      department: profile?.department || 'N/A',
      assignedClasses: assignments.map(a => a.class).filter(Boolean),
      assignments
    }
  };
};

const updateTeacher = async (id, data) => {
  const user = await User.findOne({ _id: id, role: ROLES.TEACHER });
  if (!user) {
    throw ApiError.notFound('Teacher not found.');
  }

  if (data.fullName !== undefined) user.fullName = data.fullName;
  if (data.phone !== undefined) user.phone = data.phone;
  if (data.isActive !== undefined) user.isActive = data.isActive;
  await user.save();

  const profileUpdate = {};
  if (data.teacherId) profileUpdate.teacherId = data.teacherId;
  if (data.department) profileUpdate.department = data.department;

  if (Object.keys(profileUpdate).length > 0) {
    await TeacherProfile.findOneAndUpdate(
      { user: id },
      profileUpdate,
      { upsert: true }
    );
  }

  return await getTeacherById(id);
};

module.exports = {
  getTeachers,
  getTeacherById,
  updateTeacher
};
