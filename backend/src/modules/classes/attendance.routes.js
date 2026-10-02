const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  createOrUpdateAttendance,
  fetchAttendanceByDate,
  fetchClassSummary,
  fetchMyAttendance,
} = require('./attendance.controller');
const { bulkAttendanceSchema } = require('./attendance.validator');
const { ROLES } = require('../../utils/constants');
const authorize = require('../../middleware/authorize');
const validate = require('../../middleware/validate');

// Teachers and Admins can view roll-call and record daily attendance
router.get('/', authorize(ROLES.TEACHER, ROLES.ADMIN), fetchAttendanceByDate);
router.post(
  '/',
  authorize(ROLES.TEACHER, ROLES.ADMIN),
  validate(bulkAttendanceSchema),
  createOrUpdateAttendance
);

// Attendance aggregated summary
router.get('/summary', authorize(ROLES.TEACHER, ROLES.ADMIN), fetchClassSummary);

// Student view for this class
router.get(
  '/my-attendance',
  authorize(ROLES.STUDENT, ROLES.TEACHER, ROLES.ADMIN),
  fetchMyAttendance
);

module.exports = router;
