const express = require('express');
const router = express.Router();
const scheduleController = require('./schedule.controller');
const protect = require('../../middleware/auth');
const authorize = require('../../middleware/authorize');
const { ROLES } = require('../../utils/constants');

// All schedule routes require authentication
router.use(protect);

// ─── Timetable Routes ────────────────────────────────────────────

// Admin: create/update timetable for a class
router.post(
  '/timetable',
  authorize(ROLES.ADMIN),
  scheduleController.upsertTimetable
);

// Admin, Teacher: get timetable by class
router.get(
  '/timetable/class/:classId',
  authorize(ROLES.ADMIN, ROLES.TEACHER),
  scheduleController.getTimetableByClass
);

// Teacher: my personal teaching schedule
router.get(
  '/timetable/teacher-schedule',
  authorize(ROLES.TEACHER),
  scheduleController.getTeacherSchedule
);

// Student: my class daily routine
router.get(
  '/timetable/my-routine',
  authorize(ROLES.STUDENT),
  scheduleController.getStudentRoutine
);

// Admin: conflict detection before saving
router.get(
  '/timetable/check-conflict',
  authorize(ROLES.ADMIN),
  scheduleController.checkConflict
);

// ─── Exam Datesheet Routes ────────────────────────────────────────

// Student: my upcoming exams (must be before /:id to avoid param conflict)
router.get(
  '/datesheets/my-exams',
  authorize(ROLES.STUDENT),
  scheduleController.getStudentExams
);

// Admin: create new datesheet
router.post(
  '/datesheets',
  authorize(ROLES.ADMIN),
  scheduleController.createDatesheet
);

// Admin, Teacher: list datesheets with filters
router.get(
  '/datesheets',
  authorize(ROLES.ADMIN, ROLES.TEACHER),
  scheduleController.getDatesheets
);

// All authenticated: get single datesheet
router.get(
  '/datesheets/:id',
  scheduleController.getDatesheetById
);

// Admin: update datesheet
router.put(
  '/datesheets/:id',
  authorize(ROLES.ADMIN),
  scheduleController.updateDatesheet
);

// Admin: publish datesheet and notify students
router.patch(
  '/datesheets/:id/publish',
  authorize(ROLES.ADMIN),
  scheduleController.publishDatesheet
);

// Admin: delete datesheet
router.delete(
  '/datesheets/:id',
  authorize(ROLES.ADMIN),
  scheduleController.deleteDatesheet
);

module.exports = router;
