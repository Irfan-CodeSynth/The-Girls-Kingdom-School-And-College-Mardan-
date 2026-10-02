const { z } = require('zod');

const updateStudentSchema = {
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Student User ID')
  }),
  body: z.object({
    fullName: z.string().min(2).max(100).optional(),
    phone: z.string().optional(),
    isActive: z.boolean().optional(),
    studentId: z.string().min(1).optional()
  })
};

const createStudentSchema = {
  body: z.object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100),
    email: z.string().email('Please enter a valid email address'),
    studentId: z.string().min(1, 'Student ID is required').max(50),
    password: z.string().min(6, 'Password must be at least 6 characters').optional(),
    phone: z.string().optional(),
    classId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Class ID').optional().nullable()
  })
};

const resetStudentPasswordSchema = {
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Student User ID')
  }),
  body: z.object({
    newPassword: z.string().min(6, 'New password must be at least 6 characters').optional()
  })
};

module.exports = {
  updateStudentSchema,
  createStudentSchema,
  resetStudentPasswordSchema
};
