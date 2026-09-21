const express = require('express');
const authController = require('./auth.controller');
const validate = require('../../middleware/validate');
const protect = require('../../middleware/auth');
const { authLimiter } = require('../../middleware/rateLimiter');
const { registerStudentSchema, registerTeacherSchema, loginSchema, changePasswordSchema } = require('./auth.validator');

const router = express.Router();

router.post('/register/student', validate(registerStudentSchema), authController.registerStudent);
router.post('/register/teacher', validate(registerTeacherSchema), authController.registerTeacher);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/logout', protect, authController.logout);
router.get('/me', protect, authController.getMe);
router.patch('/change-password', protect, validate(changePasswordSchema), authController.changePassword);

module.exports = router;
