const express = require('express');
const router = express.Router();
const protect = require('../../middleware/auth');
const authorize = require('../../middleware/authorize');
const { ROLES } = require('../../utils/constants');
const ctrl = require('./parent.controller');

// All parent routes require authentication and PARENT role
router.use(protect);
router.use(authorize(ROLES.PARENT));

// ─── Child selector & summary ────────────────────────────────────────────────
router.get('/children', ctrl.getMyChildren);
router.get('/children/:studentId/summary', ctrl.getChildSummary);

// ─── Specialized child tracking hubs ──────────────────────────────────────────
router.get('/children/:studentId/attendance', ctrl.getChildAttendance);
router.get('/children/:studentId/fees', ctrl.getChildFees);
router.get('/children/:studentId/quizzes', ctrl.getChildQuizzes);
router.get('/children/:studentId/exams', ctrl.getChildExams);
router.get('/children/:studentId/tuitions', ctrl.getChildTuitions);

module.exports = router;
