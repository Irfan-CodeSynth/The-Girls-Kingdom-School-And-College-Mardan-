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

module.exports = {
  updateTeacherSchema
};
