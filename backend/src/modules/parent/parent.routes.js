const express = require('express');
const router = express.Router();
const protect = require('../../middleware/auth');
const authorize = require('../../middleware/authorize');
const { ROLES } = require('../../utils/constants');
const ctrl = require('./parent.controller');

// All routes require authentication
router.use(protect);

// ─── ADMIN: Parent Account Management & Student Linking ──────────────────────
router.get('/admin/all', authorize(ROLES.ADMIN), ctrl.getAllParents);
router.post('/admin/create', authorize(ROLES.ADMIN), ctrl.createParent);
router.get('/admin/student/:studentId', authorize(ROLES.ADMIN), ctrl.getParentsByStudent);
router.post('/admin/:parentId/link', authorize(ROLES.ADMIN), ctrl.linkStudentToParent);
router.delete('/admin/:parentId/link/:studentId', authorize(ROLES.ADMIN), ctrl.unlinkStudentFromParent);
router.post('/admin/:parentId/reset-password', authorize(ROLES.ADMIN), ctrl.resetParentPassword);
router.patch('/admin/:parentId/status', authorize(ROLES.ADMIN), ctrl.toggleParentStatus);

// ─── PARENT: Child Selector & Academic Tracking Hubs ─────────────────────────
router.get('/children', authorize(ROLES.PARENT), ctrl.getMyChildren);
router.get('/children/:studentId/summary', authorize(ROLES.PARENT), ctrl.getChildSummary);
router.get('/children/:studentId/attendance', authorize(ROLES.PARENT), ctrl.getChildAttendance);
router.get('/children/:studentId/fees', authorize(ROLES.PARENT), ctrl.getChildFees);
router.get('/children/:studentId/quizzes', authorize(ROLES.PARENT), ctrl.getChildQuizzes);
router.get('/children/:studentId/exams', authorize(ROLES.PARENT), ctrl.getChildExams);
router.get('/children/:studentId/tuitions', authorize(ROLES.PARENT), ctrl.getChildTuitions);

module.exports = router;
