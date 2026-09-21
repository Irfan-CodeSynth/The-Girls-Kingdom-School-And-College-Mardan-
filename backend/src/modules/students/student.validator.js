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

module.exports = {
  updateStudentSchema
};
