const express = require('express');
const router = express.Router();
const protect = require('../../middleware/auth');
const authorize = require('../../middleware/authorize');
const { ROLES } = require('../../utils/constants');
const ctrl = require('./tuition.controller');

// All tuition routes require authentication
router.use(protect);

// ─── Admin Overview ───────────────────────────────────────────────────────────
router.get('/admin/overview', authorize(ROLES.ADMIN), ctrl.getAdminOverview);

// ─── Courses CRUD ─────────────────────────────────────────────────────────────
router.post('/courses', authorize(ROLES.ADMIN), ctrl.createCourse);
router.get('/courses', authorize(ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT), ctrl.getCourses);
router.get('/courses/:id', authorize(ROLES.ADMIN, ROLES.TEACHER), ctrl.getCourseById);
router.put('/courses/:id', authorize(ROLES.ADMIN, ROLES.TEACHER), ctrl.updateCourse);
router.delete('/courses/:id', authorize(ROLES.ADMIN), ctrl.deleteCourse);

// ─── Enrollments (Admin enrolls, Teacher/Admin view) ───────────────────────────
router.post('/courses/:id/enroll', authorize(ROLES.ADMIN), ctrl.enrollStudent);
router.get('/courses/:id/enrollments', authorize(ROLES.ADMIN, ROLES.TEACHER), ctrl.getCourseEnrollments);
router.patch('/enrollments/:enrollmentId/status', authorize(ROLES.ADMIN), ctrl.updateEnrollmentStatus);

// ─── Teacher Analytics ────────────────────────────────────────────────────────
router.get('/courses/:id/analytics', authorize(ROLES.TEACHER, ROLES.ADMIN), ctrl.getTeacherAnalytics);

// ─── Sections ─────────────────────────────────────────────────────────────────
router.post('/courses/:courseId/sections', authorize(ROLES.ADMIN, ROLES.TEACHER), ctrl.createSection);
router.get('/courses/:courseId/sections', authorize(ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT), ctrl.getSections);
router.put('/sections/:sectionId', authorize(ROLES.ADMIN, ROLES.TEACHER), ctrl.updateSection);
router.delete('/sections/:sectionId', authorize(ROLES.ADMIN, ROLES.TEACHER), ctrl.deleteSection);

// ─── Lectures ─────────────────────────────────────────────────────────────────
router.post('/courses/:courseId/sections/:sectionId/lectures', authorize(ROLES.ADMIN, ROLES.TEACHER), ctrl.createLecture);
router.get('/courses/:courseId/lectures', authorize(ROLES.ADMIN, ROLES.TEACHER), ctrl.getLectures);
router.get('/lectures/:lectureId', authorize(ROLES.ADMIN, ROLES.TEACHER), ctrl.getLectureById);
router.put('/lectures/:lectureId', authorize(ROLES.ADMIN, ROLES.TEACHER), ctrl.updateLecture);
router.delete('/lectures/:lectureId', authorize(ROLES.ADMIN, ROLES.TEACHER), ctrl.deleteLecture);

// ─── Student Routes ───────────────────────────────────────────────────────────
router.get('/my/enrollments', authorize(ROLES.STUDENT), ctrl.getMyEnrollments);
router.get('/my/courses/:id/curriculum', authorize(ROLES.STUDENT), ctrl.getCourseCurriculum);
router.get('/my/lectures/:lectureId', authorize(ROLES.STUDENT), ctrl.getStudentLecture);
router.post('/my/lectures/:lectureId/progress', authorize(ROLES.STUDENT), ctrl.updateVideoProgress);
router.post('/my/lectures/:lectureId/quiz', authorize(ROLES.STUDENT), ctrl.submitLectureQuiz);

module.exports = router;
