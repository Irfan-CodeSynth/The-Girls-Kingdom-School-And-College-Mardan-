const mongoose = require('mongoose');
const User = require('../users/user.model');
const ParentProfile = require('../users/parentProfile.model');
const StudentProfile = require('../users/studentProfile.model');
const Class = require('../classes/class.model');
const Enrollment = require('../classes/enrollment.model');
const Attendance = require('../classes/attendance.model');
const FeeChallan = require('../fees/feeChallan.model');
const Quiz = require('../quizzes/quiz.model');
const Attempt = require('../quizzes/attempt.model');
const ExamDatesheet = require('../schedule/datesheet.model');
const Timetable = require('../schedule/timetable.model');
const TuitionEnrollment = require('../tuitions/tuitionEnrollment.model');
const TuitionProgress = require('../tuitions/tuitionProgress.model');
const TuitionCourse = require('../tuitions/tuitionCourse.model');
const TuitionLecture = require('../tuitions/tuitionLecture.model');
const Notification = require('../notifications/notification.model');
const ApiError = require('../../utils/ApiError');
const { ROLES, ENROLLMENT_STATUS, ATTENDANCE_STATUS, QUIZ_STATUS } = require('../../utils/constants');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/**
 * IDOR Guard: Verify that the student is linked to the authenticated parent
 */
const verifyParentChildAccess = async (parentId, studentId) => {
  if (!isValidObjectId(studentId)) throw ApiError.badRequest('Invalid student ID.');

  let profile = await ParentProfile.findOne({ user: parentId });
  if (!profile) {
    // If profile hasn't been created yet, check if student exists
    const student = await User.findById(studentId);
    if (!student) throw ApiError.notFound('Student not found.');
    throw ApiError.forbidden('Parent profile not initialized or no children linked.');
  }

  const isLinked = profile.children.some(
    (c) => c.student && c.student.toString() === studentId.toString()
  );

  if (!isLinked) {
    throw ApiError.forbidden('You are not authorized to view academic records for this student.');
  }

  return profile;
};

/**
 * Retrieve all children linked to the logged-in parent
 */
const getParentChildren = async (parentId) => {
  let profile = await ParentProfile.findOne({ user: parentId }).populate(
    'children.student',
    'fullName email phone profilePhoto isActive'
  );

  if (!profile || !profile.children || profile.children.length === 0) {
    return [];
  }

  const childrenData = await Promise.all(
    profile.children.map(async (childItem) => {
      const studentUser = childItem.student;
      if (!studentUser) return null;

      const [sProfile, enrollment] = await Promise.all([
        StudentProfile.findOne({ user: studentUser._id }).lean(),
        Enrollment.findOne({
          student: studentUser._id,
          status: ENROLLMENT_STATUS.ACTIVE,
        })
          .populate('class', 'name code academicYear')
          .lean(),
      ]);

      return {
        _id: studentUser._id,
        fullName: studentUser.fullName,
        email: studentUser.email,
        phone: studentUser.phone,
        profilePhoto: studentUser.profilePhoto,
        relationship: childItem.relationship,
        isPrimaryContact: childItem.isPrimaryContact,
        studentId: sProfile?.studentId || 'N/A',
        class: enrollment?.class || null,
        enrolledAt: enrollment?.enrolledAt || null,
      };
    })
  );

  return childrenData.filter(Boolean);
};

/**
 * Retrieve high-level academic KPI summary for a selected child
 */
const getChildSummary = async (parentId, studentId) => {
  await verifyParentChildAccess(parentId, studentId);

  const student = await User.findById(studentId).select('fullName email');
  if (!student) throw ApiError.notFound('Student not found.');

  const enrollment = await Enrollment.findOne({
    student: studentId,
    status: ENROLLMENT_STATUS.ACTIVE,
  })
    .populate('class', 'name code academicYear')
    .lean();

  const classId = enrollment?.class?._id;

  // 1. Attendance Summary (all time or current academic year)
  const [totalAttendanceDays, presentDays, lateDays, absentDays] = await Promise.all([
    Attendance.countDocuments({ student: studentId }),
    Attendance.countDocuments({ student: studentId, status: ATTENDANCE_STATUS.PRESENT }),
    Attendance.countDocuments({ student: studentId, status: ATTENDANCE_STATUS.LATE }),
    Attendance.countDocuments({ student: studentId, status: ATTENDANCE_STATUS.ABSENT }),
  ]);

  const attendancePercentage =
    totalAttendanceDays > 0
      ? Math.round(((presentDays + lateDays * 0.5) / totalAttendanceDays) * 100)
      : 100;

  // 2. Fee Summary
  const feeChallans = await FeeChallan.find({ student: studentId }).sort({ billingMonth: -1 }).lean();
  const unpaidChallans = feeChallans.filter(
    (c) => c.status === 'unpaid' || c.status === 'overdue' || c.status === 'partial'
  );
  const totalDues = unpaidChallans.reduce((sum, c) => sum + (c.balanceAmount || c.totalAmount || 0), 0);
  const latestChallan = feeChallans[0] || null;

  // 3. Quizzes Summary
  const attempts = await Attempt.find({ student: studentId, status: { $in: ['submitted', 'graded'] } })
    .populate('quiz', 'title totalMarks')
    .sort({ submittedAt: -1 })
    .lean();

  const avgQuizScore =
    attempts.length > 0
      ? Math.round(
          attempts.reduce((sum, a) => sum + (a.percentage || 0), 0) / attempts.length
        )
      : null;

  // 4. Upcoming Exams
  let upcomingExamsCount = 0;
  let nextExam = null;
  if (classId) {
    const datesheet = await ExamDatesheet.findOne({
      class: classId,
      status: 'published',
      endDate: { $gte: new Date() },
    }).lean();

    if (datesheet && datesheet.entries) {
      const futureEntries = datesheet.entries.filter((e) => new Date(e.examDate) >= new Date());
      upcomingExamsCount = futureEntries.length;
      nextExam = futureEntries[0] || null;
    }
  }

  // 5. Online Tuitions Summary
  const tuitionEnrollments = await TuitionEnrollment.find({
    student: studentId,
    status: 'active',
  })
    .populate('course', 'title code totalLecturesCount')
    .lean();

  const totalTuitionCourses = tuitionEnrollments.length;
  const avgTuitionProgress =
    totalTuitionCourses > 0
      ? Math.round(
          tuitionEnrollments.reduce((sum, te) => sum + (te.progressPercentage || 0), 0) /
            totalTuitionCourses
        )
      : 0;

  return {
    student: {
      _id: student._id,
      fullName: student.fullName,
      email: student.email,
      class: enrollment?.class || null,
    },
    kpis: {
      attendance: {
        totalDays: totalAttendanceDays,
        presentDays,
        lateDays,
        absentDays,
        percentage: attendancePercentage,
      },
      fees: {
        unpaidCount: unpaidChallans.length,
        totalDues,
        latestChallanStatus: latestChallan?.status || 'clear',
        latestChallan,
      },
      quizzes: {
        totalAttempts: attempts.length,
        averagePercentage: avgQuizScore,
        recentAttempts: attempts.slice(0, 3),
      },
      exams: {
        upcomingCount: upcomingExamsCount,
        nextExam,
      },
      tuitions: {
        enrolledCount: totalTuitionCourses,
        averageProgress: avgTuitionProgress,
        courses: tuitionEnrollments,
      },
    },
  };
};

/**
 * Retrieve detailed monthly attendance records for child
 */
const getChildAttendance = async (parentId, studentId, query = {}) => {
  await verifyParentChildAccess(parentId, studentId);

  const filter = { student: studentId };

  if (query.month) {
    // format YYYY-MM
    const [year, month] = query.month.split('-');
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    filter.date = { $gte: startDate, $lte: endDate };
  }

  const records = await Attendance.find(filter)
    .populate('class', 'name code')
    .sort({ date: -1 })
    .lean();

  const total = records.length;
  const present = records.filter((r) => r.status === ATTENDANCE_STATUS.PRESENT).length;
  const absent = records.filter((r) => r.status === ATTENDANCE_STATUS.ABSENT).length;
  const late = records.filter((r) => r.status === ATTENDANCE_STATUS.LATE).length;
  const excused = records.filter((r) => r.status === ATTENDANCE_STATUS.EXCUSED).length;

  const percentage = total > 0 ? Math.round(((present + late * 0.5) / total) * 100) : 100;

  return {
    records,
    summary: { total, present, absent, late, excused, percentage },
  };
};

/**
 * Retrieve fee challans and ledger for child
 */
const getChildFees = async (parentId, studentId) => {
  await verifyParentChildAccess(parentId, studentId);

  const challans = await FeeChallan.find({ student: studentId })
    .populate('class', 'name code')
    .sort({ billingMonth: -1 })
    .lean();

  const totalBilled = challans.reduce((sum, c) => sum + (c.totalAmount || 0), 0);
  const totalPaid = challans.reduce((sum, c) => sum + (c.paidAmount || 0), 0);
  const totalDues = challans
    .filter((c) => c.status !== 'paid' && c.status !== 'cancelled')
    .reduce((sum, c) => sum + (c.balanceAmount || c.totalAmount || 0), 0);

  return { challans, summary: { totalBilled, totalPaid, totalDues } };
};

/**
 * Retrieve quizzes, attempts, and grades transcript for child
 */
const getChildQuizzes = async (parentId, studentId) => {
  await verifyParentChildAccess(parentId, studentId);

  const enrollment = await Enrollment.findOne({
    student: studentId,
    status: ENROLLMENT_STATUS.ACTIVE,
  }).lean();

  let classQuizzes = [];
  if (enrollment?.class) {
    classQuizzes = await Quiz.find({
      class: enrollment.class,
      status: QUIZ_STATUS.PUBLISHED,
    })
      .select('title subject totalMarks durationMinutes deadline createdAt')
      .sort({ createdAt: -1 })
      .lean();
  }

  const attempts = await Attempt.find({
    student: studentId,
    status: { $in: ['submitted', 'graded'] },
  })
    .populate('quiz', 'title totalMarks subject')
    .sort({ submittedAt: -1 })
    .lean();

  return { quizzes: classQuizzes, attempts };
};

/**
 * Retrieve published exam date sheets and timetables for child's class
 */
const getChildExams = async (parentId, studentId) => {
  await verifyParentChildAccess(parentId, studentId);

  const enrollment = await Enrollment.findOne({
    student: studentId,
    status: ENROLLMENT_STATUS.ACTIVE,
  })
    .populate('class', 'name code')
    .lean();

  if (!enrollment?.class) {
    return { datesheets: [], timetable: null };
  }

  const [datesheets, timetable] = await Promise.all([
    ExamDatesheet.find({
      class: enrollment.class._id,
      status: 'published',
    })
      .sort({ startDate: -1 })
      .lean(),
    Timetable.findOne({
      class: enrollment.class._id,
      isActive: true,
    }).lean(),
  ]);

  return {
    class: enrollment.class,
    datesheets,
    timetable,
  };
};

/**
 * Retrieve child's online tuition courses & sequential progress records
 */
const getChildTuitions = async (parentId, studentId) => {
  await verifyParentChildAccess(parentId, studentId);

  const enrollments = await TuitionEnrollment.find({
    student: studentId,
    status: 'active',
  })
    .populate({
      path: 'course',
      populate: { path: 'instructor', select: 'fullName email' },
    })
    .sort({ enrolledAt: -1 })
    .lean();

  const courseIds = enrollments.map((e) => e.course?._id).filter(Boolean);

  const [allLectures, progressRecords] = await Promise.all([
    TuitionLecture.find({ course: { $in: courseIds }, isPublished: true })
      .select('course title order video hasQuiz')
      .sort({ order: 1 })
      .lean(),
    TuitionProgress.find({ student: studentId, course: { $in: courseIds } }).lean(),
  ]);

  const coursesWithProgress = enrollments.map((en) => {
    const course = en.course || {};
    const courseLectures = allLectures.filter(
      (l) => l.course.toString() === course._id.toString()
    );
    const courseProgress = progressRecords.filter(
      (p) => p.course.toString() === course._id.toString()
    );

    const detailedLectures = courseLectures.map((lec) => {
      const prog = courseProgress.find((p) => p.lecture.toString() === lec._id.toString());
      return {
        _id: lec._id,
        title: lec.title,
        order: lec.order,
        hasQuiz: lec.hasQuiz,
        videoCompleted: Boolean(prog?.videoCompleted),
        maxWatchPercentage: prog?.maxWatchPercentage || 0,
        quizCompleted: Boolean(prog?.quizCompleted),
        quizScore: prog?.quizScore || 0,
        quizTotalMarks: prog?.quizTotalMarks || 0,
        lectureFullyCompleted: Boolean(prog?.lectureFullyCompleted),
      };
    });

    const completedCount = detailedLectures.filter((l) => l.lectureFullyCompleted).length;

    return {
      course,
      enrolledAt: en.enrolledAt,
      progressPercentage: en.progressPercentage || 0,
      totalLectures: courseLectures.length,
      completedLectures: completedCount,
      lectures: detailedLectures,
    };
  });

  return { courses: coursesWithProgress };
};

// ─── ADMIN: PARENT MANAGEMENT & LINKING ──────────────────────────────────────

const createParentAccount = async (data) => {
  const {
    fullName,
    email,
    password,
    phone,
    studentId,
    studentIds,
    relationship = 'guardian',
    cnic = '',
    occupation = '',
    address = '',
    emergencyContact = '',
  } = data;

  if (!fullName || !fullName.trim()) throw ApiError.badRequest('Parent full name is required.');
  if (!email || !email.trim()) throw ApiError.badRequest('Parent email is required.');
  if (!password || password.length < 6) throw ApiError.badRequest('Password must be at least 6 characters.');

  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw ApiError.badRequest(`A user with email "${normalizedEmail}" already exists.`);
  }

  // Gather children student ids
  const targetStudentIds = [];
  if (studentId && isValidObjectId(studentId)) {
    targetStudentIds.push(studentId.toString());
  }
  if (Array.isArray(studentIds)) {
    studentIds.forEach((id) => {
      if (isValidObjectId(id) && !targetStudentIds.includes(id.toString())) {
        targetStudentIds.push(id.toString());
      }
    });
  }

  // Verify that all students exist and have STUDENT role
  if (targetStudentIds.length > 0) {
    const verifiedStudents = await User.find({
      _id: { $in: targetStudentIds },
      role: ROLES.STUDENT,
    });
    if (verifiedStudents.length !== targetStudentIds.length) {
      throw ApiError.badRequest('One or more selected student IDs are invalid or not registered as students.');
    }
  }

  // Create User
  const user = await User.create({
    fullName: fullName.trim(),
    email: normalizedEmail,
    password: password,
    role: ROLES.PARENT,
    phone: phone ? phone.trim() : '',
    isActive: true,
  });

  // Create Parent Profile
  const children = targetStudentIds.map((sId, index) => ({
    student: sId,
    relationship: relationship || 'guardian',
    isPrimaryContact: index === 0,
  }));

  const profile = await ParentProfile.create({
    user: user._id,
    children,
    cnic: cnic ? cnic.trim() : '',
    occupation: occupation ? occupation.trim() : '',
    address: address ? address.trim() : '',
    emergencyContact: emergencyContact ? emergencyContact.trim() : (phone || ''),
  });

  return {
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    profileId: profile._id,
    childrenCount: children.length,
  };
};

const getAllParents = async (query = {}) => {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(Math.max(1, Number(query.limit) || 20), 100);
  const skip = (page - 1) * limit;

  let userFilter = { role: ROLES.PARENT };
  if (query.search) {
    const searchRegex = new RegExp(query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    userFilter.$or = [{ fullName: searchRegex }, { email: searchRegex }, { phone: searchRegex }];
  }

  const [parentUsers, total] = await Promise.all([
    User.find(userFilter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(userFilter),
  ]);

  const userIds = parentUsers.map((u) => u._id);
  const profiles = await ParentProfile.find({ user: { $in: userIds } })
    .populate('children.student', 'fullName email phone profilePhoto')
    .lean();

  const profileMap = new Map(profiles.map((p) => [p.user.toString(), p]));

  // Also populate student class and reg number for each child
  const allChildStudentIds = [];
  profiles.forEach((p) => {
    (p.children || []).forEach((c) => {
      if (c.student?._id) allChildStudentIds.push(c.student._id);
    });
  });

  const [studentProfiles, enrollments] = await Promise.all([
    StudentProfile.find({ user: { $in: allChildStudentIds } }).lean(),
    Enrollment.find({ student: { $in: allChildStudentIds }, status: ENROLLMENT_STATUS.ACTIVE })
      .populate('class', 'name code')
      .lean(),
  ]);

  const spMap = new Map(studentProfiles.map((sp) => [sp.user.toString(), sp]));
  const enMap = new Map(enrollments.map((en) => [en.student.toString(), en]));

  const parents = parentUsers.map((u) => {
    const profile = profileMap.get(u._id.toString());
    const enrichedChildren = (profile?.children || []).map((c) => {
      const studentObj = c.student || {};
      const sIdStr = studentObj._id?.toString() || '';
      const sp = spMap.get(sIdStr);
      const en = enMap.get(sIdStr);
      return {
        _id: studentObj._id,
        fullName: studentObj.fullName,
        email: studentObj.email,
        phone: studentObj.phone,
        profilePhoto: studentObj.profilePhoto,
        studentId: sp?.studentId || 'N/A',
        class: en?.class || null,
        relationship: c.relationship,
        isPrimaryContact: c.isPrimaryContact,
      };
    });

    return {
      _id: u._id,
      fullName: u.fullName,
      email: u.email,
      phone: u.phone,
      isActive: u.isActive,
      lastLogin: u.lastLogin,
      createdAt: u.createdAt,
      cnic: profile?.cnic || '',
      occupation: profile?.occupation || '',
      address: profile?.address || '',
      emergencyContact: profile?.emergencyContact || '',
      children: enrichedChildren,
    };
  });

  return {
    parents,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
};

const getParentsByStudent = async (studentId) => {
  if (!isValidObjectId(studentId)) throw ApiError.badRequest('Invalid student ID.');

  const profiles = await ParentProfile.find({ 'children.student': studentId })
    .populate('user', 'fullName email phone isActive lastLogin createdAt')
    .lean();

  return profiles.map((p) => {
    const childEntry = (p.children || []).find((c) => c.student?.toString() === studentId.toString());
    return {
      _id: p.user?._id,
      profileId: p._id,
      fullName: p.user?.fullName,
      email: p.user?.email,
      phone: p.user?.phone,
      isActive: p.user?.isActive,
      relationship: childEntry?.relationship || 'guardian',
      isPrimaryContact: childEntry?.isPrimaryContact || false,
      cnic: p.cnic,
      occupation: p.occupation,
      address: p.address,
      emergencyContact: p.emergencyContact,
    };
  });
};

const linkStudentToParent = async (parentId, data) => {
  const { studentId, relationship = 'guardian', isPrimaryContact = false } = data;
  if (!isValidObjectId(parentId)) throw ApiError.badRequest('Invalid parent ID.');
  if (!isValidObjectId(studentId)) throw ApiError.badRequest('Invalid student ID.');

  const [parentUser, studentUser] = await Promise.all([
    User.findOne({ _id: parentId, role: ROLES.PARENT }),
    User.findOne({ _id: studentId, role: ROLES.STUDENT }),
  ]);

  if (!parentUser) throw ApiError.notFound('Parent account not found.');
  if (!studentUser) throw ApiError.notFound('Student account not found.');

  let profile = await ParentProfile.findOne({ user: parentId });
  if (!profile) {
    profile = await ParentProfile.create({
      user: parentId,
      children: [],
    });
  }

  const alreadyLinked = profile.children.some((c) => c.student.toString() === studentId.toString());
  if (alreadyLinked) {
    throw ApiError.badRequest('This student is already linked to this parent account.');
  }

  profile.children.push({
    student: studentId,
    relationship,
    isPrimaryContact,
  });

  await profile.save();
  return { message: 'Student successfully linked to parent.', parent: parentUser, student: studentUser };
};

const unlinkStudentFromParent = async (parentId, studentId) => {
  if (!isValidObjectId(parentId)) throw ApiError.badRequest('Invalid parent ID.');
  if (!isValidObjectId(studentId)) throw ApiError.badRequest('Invalid student ID.');

  const profile = await ParentProfile.findOne({ user: parentId });
  if (!profile) throw ApiError.notFound('Parent profile not found.');

  profile.children = profile.children.filter((c) => c.student.toString() !== studentId.toString());
  await profile.save();

  return { message: 'Student unlinked from parent successfully.' };
};

const resetParentPassword = async (parentId, newPassword) => {
  if (!isValidObjectId(parentId)) throw ApiError.badRequest('Invalid parent ID.');
  if (!newPassword || newPassword.length < 6) throw ApiError.badRequest('Password must be at least 6 characters.');

  const parentUser = await User.findOne({ _id: parentId, role: ROLES.PARENT });
  if (!parentUser) throw ApiError.notFound('Parent account not found.');

  parentUser.password = newPassword;
  await parentUser.save();

  return { message: `Password for ${parentUser.fullName} has been reset successfully.` };
};

const toggleParentStatus = async (parentId, isActive) => {
  if (!isValidObjectId(parentId)) throw ApiError.badRequest('Invalid parent ID.');

  const parentUser = await User.findOneAndUpdate(
    { _id: parentId, role: ROLES.PARENT },
    { isActive: Boolean(isActive) },
    { new: true }
  ).select('-password');

  if (!parentUser) throw ApiError.notFound('Parent account not found.');
  return { message: `Parent account is now ${parentUser.isActive ? 'active' : 'suspended'}.`, parentUser };
};

module.exports = {
  verifyParentChildAccess,
  getParentChildren,
  getChildSummary,
  getChildAttendance,
  getChildFees,
  getChildQuizzes,
  getChildExams,
  getChildTuitions,
  createParentAccount,
  getAllParents,
  getParentsByStudent,
  linkStudentToParent,
  unlinkStudentFromParent,
  resetParentPassword,
  toggleParentStatus,
};
