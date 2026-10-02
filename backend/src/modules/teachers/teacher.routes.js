const express = require('express');
const router = express.Router();
const teacherController = require('./teacher.controller');
const protect = require('../../middleware/auth');
const authorize = require('../../middleware/authorize');
const validate = require('../../middleware/validate');
const { ROLES } = require('../../utils/constants');
const { updateTeacherSchema, createTeacherSchema, resetTeacherPasswordSchema } = require('./teacher.validator');

router.use(protect);
router.use(authorize(ROLES.ADMIN));

router.get('/', teacherController.getTeachers);
router.post('/', validate(createTeacherSchema), teacherController.createTeacher);
router.get('/:id', teacherController.getTeacherById);
router.patch('/:id', validate(updateTeacherSchema), teacherController.updateTeacher);
router.post('/:id/reset-password', validate(resetTeacherPasswordSchema), teacherController.resetTeacherPassword);

module.exports = router;
