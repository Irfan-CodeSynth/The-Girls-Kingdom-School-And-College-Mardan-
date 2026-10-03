const Timetable = require('./timetable.model');
const ExamDatesheet = require('./datesheet.model');
const Enrollment = require('../classes/enrollment.model');

// ── Day name helper ──────────────────────────────────────────────
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// ═══════════════════════════════════════════════════════════════
// TIMETABLE SERVICES
// ═══════════════════════════════════════════════════════════════

/**
 * Create or update the weekly timetable for a class+academicYear
 */
const upsertTimetable = async ({ classId, academicYear, days, notes, userId }) => {
  const saved = await Timetable.findOneAndUpdate(
    { class: classId, academicYear },
    {
      class: classId,
      academicYear,
      days,
      notes,
      isActive: true,
      createdBy: userId,
    },
    { upsert: true, new: true, runValidators: true }
  )
    .populate('class', 'name code')
    .populate('createdBy', 'fullName');

  // Populate teacher names in periods
  await saved.populate('days.periods.teacher', 'fullName email');
  return saved;
};

/**
 * Get timetable for a specific class
 */
const getTimetableByClass = async (classId) => {
  const tt = await Timetable.findOne({ class: classId, isActive: true })
    .populate('class', 'name code')
    .populate('days.periods.teacher', 'fullName email');
  return tt;
};

/**
 * Get personalized teaching schedule for a teacher across all classes
 */
const getTeacherSchedule = async (userId) => {
  const timetables = await Timetable.find({ isActive: true })
    .populate('class', 'name code')
    .lean();

  const schedule = {};

  for (const tt of timetables) {
    for (const dayEntry of tt.days) {
      for (const period of dayEntry.periods) {
        if (period.teacher && period.teacher.toString() === userId.toString()) {
          if (!schedule[dayEntry.day]) schedule[dayEntry.day] = [];
          schedule[dayEntry.day].push({
            periodNumber: period.periodNumber,
            startTime: period.startTime,
            endTime: period.endTime,
            subject: period.subject,
            room: period.room,
            isBreak: period.isBreak,
            class: { _id: tt.class._id, name: tt.class.name, code: tt.class.code },
          });
        }
      }
    }
  }

  // Sort each day's periods by periodNumber
  for (const day of Object.keys(schedule)) {
    schedule[day].sort((a, b) => a.periodNumber - b.periodNumber);
  }

  return { schedule };
};

/**
 * Get the timetable for a student's enrolled class
 */
const getStudentRoutine = async (userId) => {
  const enrollment = await Enrollment.findOne({ student: userId, status: 'active' })
    .sort({ createdAt: -1 });

  if (!enrollment) {
    return { timetable: null, message: 'No active class enrollment found' };
  }

  const timetable = await getTimetableByClass(enrollment.class);
  return { timetable };
};

/**
 * Check if a teacher or room is double-booked for a specific period
 */
const checkConflict = async ({ classId, day, periodNumber, teacherId, room, excludeTimetableId }) => {
  const query = { isActive: true };
  if (excludeTimetableId) query._id = { $ne: excludeTimetableId };

  const timetables = await Timetable.find(query).lean();
  const conflicts = [];

  for (const tt of timetables) {
    // Skip the same class
    if (tt.class.toString() === classId) continue;

    const dayEntry = tt.days.find(d => d.day === day);
    if (!dayEntry) continue;

    const period = dayEntry.periods.find(p => p.periodNumber === Number(periodNumber));
    if (!period) continue;

    if (teacherId && period.teacher && period.teacher.toString() === teacherId.toString()) {
      conflicts.push({ type: 'teacher', message: `Teacher is already assigned to period ${periodNumber} on ${day} for another class` });
    }

    if (room && period.room && period.room.toLowerCase() === room.toLowerCase() && !period.isBreak) {
      conflicts.push({ type: 'room', message: `Room "${room}" is already booked for period ${periodNumber} on ${day}` });
    }
  }

  return {
    hasConflict: conflicts.length > 0,
    conflicts,
  };
};

// ═══════════════════════════════════════════════════════════════
// EXAM DATESHEET SERVICES
// ═══════════════════════════════════════════════════════════════

/**
 * Create a new exam datesheet
 */
const createDatesheet = async ({ data, userId }) => {
  const { classId, entries, startDate, endDate, ...rest } = data;

  // Compute day names from examDate
  const processedEntries = (entries || []).map(entry => ({
    ...entry,
    examDate: new Date(entry.examDate),
    day: DAY_NAMES[new Date(entry.examDate).getDay()],
  }));

  const datesheet = await ExamDatesheet.create({
    ...rest,
    class: classId,
    entries: processedEntries,
    startDate: startDate ? new Date(startDate) : undefined,
    endDate: endDate ? new Date(endDate) : undefined,
    createdBy: userId,
  });

  return datesheet.populate([
    { path: 'class', select: 'name code' },
    { path: 'createdBy', select: 'fullName' },
    { path: 'entries.invigilator', select: 'fullName email' },
  ]);
};

/**
 * Get datesheets with optional filters
 */
const getDatesheets = async ({ classId, examType, academicYear, status } = {}) => {
  const query = {};
  if (classId) query.class = classId;
  if (examType) query.examType = examType;
  if (academicYear) query.academicYear = academicYear;
  if (status) query.status = status;

  const datesheets = await ExamDatesheet.find(query)
    .sort({ createdAt: -1 })
    .populate('class', 'name code')
    .populate('createdBy', 'fullName')
    .populate('entries.invigilator', 'fullName email');

  return { datesheets };
};

/**
 * Get one datesheet by ID
 */
const getDatesheetById = async (id) => {
  const datesheet = await ExamDatesheet.findById(id)
    .populate('class', 'name code')
    .populate('createdBy', 'fullName email')
    .populate('entries.invigilator', 'fullName email');

  if (!datesheet) throw new Error('Datesheet not found');
  return datesheet;
};

/**
 * Update a datesheet
 */
const updateDatesheet = async (id, data) => {
  const { classId, entries, startDate, endDate, ...rest } = data;

  const updatePayload = { ...rest };
  if (classId) updatePayload.class = classId;
  if (startDate !== undefined) updatePayload.startDate = startDate ? new Date(startDate) : null;
  if (endDate !== undefined) updatePayload.endDate = endDate ? new Date(endDate) : null;

  if (entries) {
    updatePayload.entries = entries.map(entry => ({
      ...entry,
      examDate: new Date(entry.examDate),
      day: DAY_NAMES[new Date(entry.examDate).getDay()],
    }));
  }

  const updated = await ExamDatesheet.findByIdAndUpdate(id, updatePayload, { new: true, runValidators: true })
    .populate('class', 'name code')
    .populate('entries.invigilator', 'fullName email');

  if (!updated) throw new Error('Datesheet not found');
  return updated;
};

/**
 * Publish a datesheet and send notifications to enrolled students
 */
const publishDatesheet = async (id) => {
  const datesheet = await ExamDatesheet.findById(id).populate('class', 'name code');
  if (!datesheet) throw new Error('Datesheet not found');

  datesheet.status = 'published';
  await datesheet.save();

  // Send in-app notifications to students in this class
  try {
    const Notification = require('../notifications/notification.model');
    const enrollments = await Enrollment.find({ class: datesheet.class._id, status: 'active' }).select('student');
    const studentIds = enrollments.map(e => e.student);

    if (studentIds.length > 0) {
      const notifications = studentIds.map(studentId => ({
        recipient : studentId,
        type      : 'exam_schedule',
        title     : '📅 Exam Datesheet Published',
        message   : `The ${datesheet.examType.replace('_', ' ')} exam schedule for ${datesheet.class.name} has been published. Check your exam datesheet for timings and subjects.`,
        data      : { classId: datesheet.class._id },
      }));
      await Notification.insertMany(notifications);
    }
  } catch (notifErr) {
    console.warn('Notification send failed:', notifErr.message);
  }

  return datesheet;
};

/**
 * Get upcoming published datesheets for a student's class
 */
const getStudentExams = async (userId) => {
  const enrollment = await Enrollment.findOne({ student: userId, status: 'active' })
    .sort({ createdAt: -1 });

  if (!enrollment) return { datesheets: [] };

  const datesheets = await ExamDatesheet.find({
    class: enrollment.class,
    status: 'published',
  })
    .sort({ startDate: 1 })
    .populate('class', 'name code')
    .populate('entries.invigilator', 'fullName');

  return { datesheets };
};

/**
 * Delete a datesheet
 */
const deleteDatesheet = async (id) => {
  const deleted = await ExamDatesheet.findByIdAndDelete(id);
  if (!deleted) throw new Error('Datesheet not found');
  return { message: 'Datesheet deleted successfully' };
};

module.exports = {
  upsertTimetable,
  getTimetableByClass,
  getTeacherSchedule,
  getStudentRoutine,
  checkConflict,
  createDatesheet,
  getDatesheets,
  getDatesheetById,
  updateDatesheet,
  publishDatesheet,
  getStudentExams,
  deleteDatesheet,
};
