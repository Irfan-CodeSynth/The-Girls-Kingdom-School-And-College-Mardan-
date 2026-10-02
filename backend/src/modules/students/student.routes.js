const express = require('express');
const router = express.Router();
const studentController = require('./student.controller');
const protect = require('../../middleware/auth');
const authorize = require('../../middleware/authorize');
const validate = require('../../middleware/validate');
const { ROLES } = require('../../utils/constants');
const { updateStudentSchema } = require('./student.validator');

router.use(protect);

// Student access to own attendance records
router.get('/my-attendance', authorize(ROLES.STUDENT), async (req, res, next) => {
  try {
    const { getStudentAttendance } = require('../classes/attendance.service');
    const ApiResponse = require('../../utils/ApiResponse');
    const records = await getStudentAttendance(req.user.id || req.user._id);
    return ApiResponse.success(res, { records }, 'Student attendance records retrieved.');
  } catch (err) {
    next(err);
  }
});

router.use(authorize(ROLES.ADMIN));

router.get('/', studentController.getStudents);
router.get('/:id', studentController.getStudentById);
router.patch('/:id', validate(updateStudentSchema), studentController.updateStudent);

module.exports = router;
