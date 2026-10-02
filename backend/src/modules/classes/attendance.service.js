const mongoose = require('mongoose');
const { Attendance, ATTENDANCE_STATUS } = require('./attendance.model');

/**
 * Normalizes any date string or Date instance into UTC Midnight.
 * Guarantees zero time-skew across timezones.
 * @param {string|Date} dateInput - e.g. "2026-10-02" or Date object
 * @returns {Date}
 */
function toUtcMidnight(dateInput) {
  if (dateInput instanceof Date) {
    return new Date(Date.UTC(dateInput.getUTCFullYear(), dateInput.getUTCMonth(), dateInput.getUTCDate(), 0, 0, 0, 0));
  }
  const cleanStr = String(dateInput).split('T')[0];
  const [year, month, day] = cleanStr.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
}

/**
 * Idempotently saves or updates roll-call records for a class on a specified date.
 * Uses atomic bulkWrite updateOne with upsert: true.
 */
async function bulkUpsertAttendance(classId, dateStr, records, teacherId) {
  const date = toUtcMidnight(dateStr);
  const classObjId = new mongoose.Types.ObjectId(classId);
  const teacherObjId = teacherId ? new mongoose.Types.ObjectId(teacherId) : null;

  const ops = records.map((r) => ({
    updateOne: {
      filter: {
        class: classObjId,
        student: new mongoose.Types.ObjectId(r.studentId),
        date: date,
      },
      update: {
        $set: {
          status: r.status,
          remarks: r.remarks || '',
          markedBy: teacherObjId,
        },
      },
      upsert: true,
    },
  }));

  const result = await Attendance.bulkWrite(ops, { ordered: false });
  return result;
}

/**
 * Retrieves attendance records for a class on a specific date.
 */
async function getAttendanceByDate(classId, dateStr) {
  const date = toUtcMidnight(dateStr);
  const classObjId = new mongoose.Types.ObjectId(classId);

  const records = await Attendance.find({
    class: classObjId,
    date: date,
  })
    .populate('student', 'fullName email phone studentId profilePhoto')
    .lean();

  return records;
}

/**
 * Computes class-wide attendance summary analytics.
 */
async function getClassAttendanceSummary(classId) {
  const classObjId = new mongoose.Types.ObjectId(classId);

  const pipeline = [
    { $match: { class: classObjId } },
    {
      $group: {
        _id: '$date',
        total: { $sum: 1 },
        present: {
          $sum: { $cond: [{ $eq: ['$status', ATTENDANCE_STATUS.PRESENT] }, 1, 0] },
        },
        absent: {
          $sum: { $cond: [{ $eq: ['$status', ATTENDANCE_STATUS.ABSENT] }, 1, 0] },
        },
        late: {
          $sum: { $cond: [{ $eq: ['$status', ATTENDANCE_STATUS.LATE] }, 1, 0] },
        },
        excused: {
          $sum: { $cond: [{ $eq: ['$status', ATTENDANCE_STATUS.EXCUSED] }, 1, 0] },
        },
      },
    },
    {
      $group: {
        _id: null,
        daysCount: { $sum: 1 },
        totalRecords: { $sum: '$total' },
        totalPresent: { $sum: '$present' },
        totalAbsent: { $sum: '$absent' },
        totalLate: { $sum: '$late' },
        totalExcused: { $sum: '$excused' },
      },
    },
    {
      $project: {
        _id: 0,
        daysCount: 1,
        totalRecords: 1,
        totalPresent: 1,
        totalAbsent: 1,
        totalLate: 1,
        totalExcused: 1,
        attendanceRate: {
          $cond: [
            { $gt: ['$totalRecords', 0] },
            { $round: [{ $multiply: [{ $divide: ['$totalPresent', '$totalRecords'] }, 100] }, 1] },
            0,
          ],
        },
        absentRate: {
          $cond: [
            { $gt: ['$totalRecords', 0] },
            { $round: [{ $multiply: [{ $divide: ['$totalAbsent', '$totalRecords'] }, 100] }, 1] },
            0,
          ],
        },
      },
    },
  ];

  const summaries = await Attendance.aggregate(pipeline);
  return (
    summaries[0] || {
      daysCount: 0,
      totalRecords: 0,
      totalPresent: 0,
      totalAbsent: 0,
      totalLate: 0,
      totalExcused: 0,
      attendanceRate: 0,
      absentRate: 0,
    }
  );
}

/**
 * Retrieves attendance records for a specific student, optionally filtered by class.
 */
async function getStudentAttendance(studentId, classId = null) {
  const query = { student: new mongoose.Types.ObjectId(studentId) };
  if (classId) {
    query.class = new mongoose.Types.ObjectId(classId);
  }

  const records = await Attendance.find(query)
    .populate('class', 'name code academicYear status')
    .sort({ date: -1 })
    .lean();

  return records;
}

module.exports = {
  toUtcMidnight,
  bulkUpsertAttendance,
  getAttendanceByDate,
  getClassAttendanceSummary,
  getStudentAttendance,
  ATTENDANCE_STATUS,
};
