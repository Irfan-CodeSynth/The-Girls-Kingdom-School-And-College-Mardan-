const { z } = require('zod');

// ── Period schema ────────────────────────────────────────────────
const periodSchema = z.object({
  periodNumber: z.number().int().min(1).max(10),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  subject: z.string().min(1, 'Subject is required'),
  teacher: z.string().optional().nullable(),
  room: z.string().optional().default('Classroom'),
  isBreak: z.boolean().optional().default(false),
});

// ── Day schema ───────────────────────────────────────────────────
const DAY_ENUM = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

const dayScheduleSchema = z.object({
  day: z.enum(DAY_ENUM, { errorMap: () => ({ message: 'Invalid day' }) }),
  periods: z.array(periodSchema).min(1, 'At least one period required'),
});

// ── Create Timetable ─────────────────────────────────────────────
const createTimetableSchema = z.object({
  classId: z.string().min(1, 'Class is required'),
  academicYear: z.string().min(1, 'Academic year is required').default('2025-2026'),
  days: z.array(dayScheduleSchema).min(1, 'At least one day schedule required'),
  notes: z.string().optional(),
});

// ── Exam entry schema ────────────────────────────────────────────
const examEntrySchema = z.object({
  subject: z.string().min(1, 'Subject name is required'),
  examDate: z.string().min(1, 'Exam date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  room: z.string().optional().default('Examination Hall'),
  invigilator: z.string().optional().nullable(),
  totalMarks: z.number().optional().default(100),
  passingMarks: z.number().optional().default(40),
  syllabus: z.string().optional(),
});

// ── Create Datesheet ─────────────────────────────────────────────
const EXAM_TYPE_ENUM = ['midterm', 'final', 'monthly_test', 'mock_board'];

const createDatesheetSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  examType: z.enum(EXAM_TYPE_ENUM, { errorMap: () => ({ message: 'Invalid exam type' }) }),
  classId: z.string().min(1, 'Class is required'),
  academicYear: z.string().min(1, 'Academic year is required').default('2025-2026'),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  entries: z.array(examEntrySchema).min(1, 'At least one exam paper entry required'),
  generalInstructions: z.string().optional(),
});

// ── Update Datesheet ─────────────────────────────────────────────
const updateDatesheetSchema = createDatesheetSchema.partial();

module.exports = {
  createTimetableSchema,
  createDatesheetSchema,
  updateDatesheetSchema,
};
