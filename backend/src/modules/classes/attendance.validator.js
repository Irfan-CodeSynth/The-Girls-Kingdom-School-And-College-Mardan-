const { z } = require('zod');
const { ATTENDANCE_STATUS } = require('../../utils/constants');

const attendanceRecordSchema = z.object({
  studentId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Student User ID'),
  status: z.enum(Object.values(ATTENDANCE_STATUS)),
  remarks: z.string().max(250).optional().default(''),
});

const bulkAttendanceSchema = {
  body: z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
    records: z.array(attendanceRecordSchema).min(1, 'At least one student record is required'),
  }),
};

module.exports = {
  bulkAttendanceSchema,
};
