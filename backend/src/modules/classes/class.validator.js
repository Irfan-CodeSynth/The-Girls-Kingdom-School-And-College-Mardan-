const { z } = require('zod');
const { CLASS_STATUS } = require('../../utils/constants');

const createClassSchema = {
  body: z.object({
    name: z.string().min(2, 'Class name must be at least 2 characters').max(100),
    code: z.string().min(2, 'Class code must be at least 2 characters').max(20),
    description: z.string().optional(),
    academicYear: z.string().min(4, 'Academic year is required (e.g. 2025-2026)'),
    status: z.enum(Object.values(CLASS_STATUS)).optional()
  })
};

const updateClassSchema = {
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Class ID')
  }),
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    code: z.string().min(2).max(20).optional(),
    description: z.string().optional(),
    academicYear: z.string().optional(),
    status: z.enum(Object.values(CLASS_STATUS)).optional()
  })
};

const enrollStudentSchema = {
  body: z.object({
    studentId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Student User ID'),
    classId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Class ID')
  })
};

const assignTeacherSchema = {
  body: z.object({
    teacherId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Teacher User ID'),
    classId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Class ID')
  })
};

module.exports = {
  createClassSchema,
  updateClassSchema,
  enrollStudentSchema,
  assignTeacherSchema
};
