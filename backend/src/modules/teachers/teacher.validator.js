const { z } = require('zod');

const updateTeacherSchema = {
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Teacher User ID')
  }),
  body: z.object({
    fullName: z.string().min(2).max(100).optional(),
    phone: z.string().optional(),
    isActive: z.boolean().optional(),
    teacherId: z.string().min(1).optional(),
    department: z.string().min(1).optional()
  })
};

const createTeacherSchema = {
  body: z.object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100),
    email: z.string().email('Please enter a valid email address'),
    teacherId: z.string().min(1, 'Teacher ID is required').max(50),
    department: z.string().min(1, 'Department is required').max(100),
    password: z.string().min(6, 'Password must be at least 6 characters').optional(),
    phone: z.string().optional()
  })
};

const resetTeacherPasswordSchema = {
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Teacher User ID')
  }),
  body: z.object({
    newPassword: z.string().min(6, 'New password must be at least 6 characters').optional()
  })
};

module.exports = {
  updateTeacherSchema,
  createTeacherSchema,
  resetTeacherPasswordSchema
};
