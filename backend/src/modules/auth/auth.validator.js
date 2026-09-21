const { z } = require('zod');

const registerStudentSchema = {
  body: z.object({
    fullName: z.string().min(2).max(100),
    email: z.string().email(),
    password: z.string().min(6).max(128),
    studentId: z.string().min(1).max(50),
    phone: z.string().optional(),
    profilePhoto: z.string().optional()
  })
};

const registerTeacherSchema = {
  body: z.object({
    fullName: z.string().min(2).max(100),
    email: z.string().email(),
    password: z.string().min(6).max(128),
    teacherId: z.string().min(1).max(50),
    department: z.string().min(1).max(100),
    phone: z.string().optional()
  })
};

const loginSchema = {
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1)
  })
};

const changePasswordSchema = {
  body: z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(6).max(128),
    confirmPassword: z.string().min(6).max(128)
  }).refine(data => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
  })
};

module.exports = {
  registerStudentSchema,
  registerTeacherSchema,
  loginSchema,
  changePasswordSchema
};
