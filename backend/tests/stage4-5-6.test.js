/**
 * Stage 5 & 6 Integration Tests — Grades, Transcripts & Notifications
 * Tests:
 *  - Stage 5: GET /api/quizzes/my-grades (attempts aggregation, summary calculation, RBAC)
 *  - Stage 6: Notification triggers (publish, submit, grade, enroll)
 *  - Stage 6: Notification CRUD & actions (list, unread-count, mark-read, mark-all-read, delete, security isolation)
 *
 * Run: node tests/stage4-5-6.test.js
 */
const request = require('supertest');
const app = require('../src/app');
const connectDB = require('../src/config/db');
const { disconnectDB } = require('../src/config/db');
const User = require('../src/modules/users/user.model');
const Class = require('../src/modules/classes/class.model');
const Enrollment = require('../src/modules/classes/enrollment.model');
const Quiz = require('../src/modules/quizzes/quiz.model');
const Attempt = require('../src/modules/quizzes/attempt.model');
const Notification = require('../src/modules/notifications/notification.model');

const TS = Date.now();
const ADMIN_EMAIL = `admin_s56_${TS}@gkc.edu`;
const TEACHER_EMAIL = `teacher_s56_${TS}@gkc.edu`;
const STUDENT_EMAIL = `student_s56_${TS}@gkc.edu`;
const STUDENT2_EMAIL = `student2_s56_${TS}@gkc.edu`;
const PASS = 'Test@12345!';

let adminToken, teacherToken, studentToken, student2Token;
let teacherUserId, studentUserId, student2UserId;
let classId, quizId, attemptId, notificationId;

let passed = 0;
let failed = 0;

async function test(name, fn) {
  try {
    await fn();
    console.log(`  ✅ ${name}`);
    passed++;
  } catch (err) {
    console.log(`  ❌ ${name}`);
    console.log(`     ${err.message}`);
    failed++;
  }
}

function expect(actual) {
  return {
    toBe: (expected) => {
      if (actual !== expected)
        throw new Error(`Expected ${JSON.stringify(actual)} to be ${JSON.stringify(expected)}`);
    },
    toBeDefined: () => {
      if (actual === undefined || actual === null)
        throw new Error(`Expected value to be defined, got ${actual}`);
    },
    toBeGreaterThan: (n) => {
      if (!(actual > n)) throw new Error(`Expected ${actual} > ${n}`);
    },
    toBeGreaterThanOrEqual: (n) => {
      if (!(actual >= n)) throw new Error(`Expected ${actual} >= ${n}`);
    },
    toContain: (val) => {
      if (!String(actual).includes(String(val)))
        throw new Error(`Expected "${actual}" to contain "${val}"`);
    }
  };
}

async function runTests() {
  await connectDB();

  console.log('\n══════════════════════════════════════════════');
  console.log('  STAGE 5 & 6 — GRADES & NOTIFICATIONS TESTS');
  console.log('══════════════════════════════════════════════\n');

  // Setup accounts
  await User.deleteMany({ email: { $in: [ADMIN_EMAIL, TEACHER_EMAIL, STUDENT_EMAIL, STUDENT2_EMAIL] } });

  await User.create({
    fullName: 'Stage56 Admin',
    email: ADMIN_EMAIL,
    password: PASS,
    role: 'admin',
    isActive: true
  });

  const adminRes = await request(app)
    .post('/api/auth/login')
    .send({ email: ADMIN_EMAIL, password: PASS });
  adminToken = adminRes.body.data.token;

  const tReg = await request(app)
    .post('/api/auth/register/teacher')
    .send({ fullName: 'Prof. Testing', email: TEACHER_EMAIL, password: PASS, teacherId: `T${TS}`, department: 'CS' });
  teacherToken = tReg.body.data.token;
  teacherUserId = tReg.body.data.user.id || tReg.body.data.user._id;

  const sReg = await request(app)
    .post('/api/auth/register/student')
    .send({ fullName: 'Amina Student', email: STUDENT_EMAIL, password: PASS, studentId: `S${TS}` });
  studentToken = sReg.body.data.token;
  studentUserId = sReg.body.data.user.id || sReg.body.data.user._id;

  const s2Reg = await request(app)
    .post('/api/auth/register/student')
    .send({ fullName: 'Zainab Student', email: STUDENT2_EMAIL, password: PASS, studentId: `S2${TS}` });
  student2Token = s2Reg.body.data.token;
  student2UserId = s2Reg.body.data.user.id || s2Reg.body.data.user._id;

  // Create Class
  const clsRes = await request(app)
    .post('/api/classes')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ name: 'Computer Science 101', code: `CS${TS.toString().slice(-4)}`, academicYear: '2025-2026' });
  classId = clsRes.body.data?.class?._id || clsRes.body.data?._id;

  // Assign Teacher
  await request(app)
    .post('/api/classes/assign-teacher')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ teacherId: teacherUserId, classId });

  // ─────────────────────────────────────────────────────────────
  // STAGE 6: ENROLLMENT NOTIFICATION TRIGGER
  // ─────────────────────────────────────────────────────────────
  console.log('🔔 NOTIFICATION TRIGGER — ENROLLMENT');

  await test('Admin enrolls student triggers enrollment notification', async () => {
    const enrollRes = await request(app)
      .post('/api/classes/enroll')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ studentId: studentUserId, classId });
    expect(enrollRes.status).toBe(201);

    // Wait a brief tick for async setImmediate trigger
    await new Promise(r => setTimeout(r, 200));

    const notifs = await Notification.find({ recipient: studentUserId, type: 'enrollment' });
    expect(notifs.length).toBeGreaterThanOrEqual(1);
    expect(notifs[0].title).toBe('Class Enrollment');
    notificationId = notifs[0]._id.toString();
  });

  // ─────────────────────────────────────────────────────────────
  // STAGE 6: QUIZ PUBLISHED NOTIFICATION TRIGGER
  // ─────────────────────────────────────────────────────────────
  console.log('\n🔔 NOTIFICATION TRIGGER — QUIZ PUBLISHED');

  await test('Teacher publishing quiz notifies all enrolled students', async () => {
    // Create draft quiz
    const qRes = await request(app)
      .post('/api/quizzes')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        title: 'Midterm Algorithms',
        description: 'Test your understanding of sorting',
        classId,
        duration: 30,
        passingMarks: 5
      });
    expect(qRes.status).toBe(201);
    quizId = qRes.body.data?.quiz?._id || qRes.body.data?._id;

    // Set Questions: 1 MCQ (5 marks) + 1 Comprehensive (5 marks)
    await request(app)
      .put(`/api/quizzes/${quizId}/questions`)
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        questions: [
          {
            type: 'mcq',
            questionText: 'What is QuickSort average complexity?',
            marks: 5,
            options: [
              { text: 'O(n log n)', isCorrect: true },
              { text: 'O(n^2)', isCorrect: false }
            ]
          },
          {
            type: 'comprehensive',
            questionText: 'Explain the difference between QuickSort and MergeSort.',
            marks: 5
          }
        ]
      });

    // Publish quiz
    const pubRes = await request(app)
      .post(`/api/quizzes/${quizId}/publish`)
      .set('Authorization', `Bearer ${teacherToken}`);
    expect(pubRes.status).toBe(200);

    // Wait for setImmediate
    await new Promise(r => setTimeout(r, 150));

    const notifs = await Notification.find({ recipient: studentUserId, type: 'quiz_published' });
    expect(notifs.length).toBeGreaterThanOrEqual(1);
    expect(notifs[0].title).toBe('New Quiz Available');
    expect(notifs[0].message).toContain('Midterm Algorithms');
  });

  // ─────────────────────────────────────────────────────────────
  // STAGE 6: QUIZ SUBMISSION NOTIFICATION TRIGGER
  // ─────────────────────────────────────────────────────────────
  console.log('\n🔔 NOTIFICATION TRIGGER — QUIZ SUBMISSION');

  await test('Student submitting quiz triggers confirmation notification', async () => {
    // Start attempt
    const startRes = await request(app)
      .post(`/api/quizzes/${quizId}/start`)
      .set('Authorization', `Bearer ${studentToken}`);
    expect(startRes.status).toBe(201);
    attemptId = startRes.body.data.attempt._id;

    const quizDetails = await request(app)
      .get(`/api/quizzes/${quizId}`)
      .set('Authorization', `Bearer ${studentToken}`);
    const questions = quizDetails.body.data.quiz.questions;
    const mcqQ = questions.find(q => q.type === 'mcq');
    const compQ = questions.find(q => q.type === 'comprehensive');

    // Submit attempt with correct MCQ option and written response
    const subRes = await request(app)
      .post(`/api/quizzes/attempts/${attemptId}/submit`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        answers: [
          { questionId: mcqQ._id, selectedOptionId: mcqQ.options[0]._id },
          { questionId: compQ._id, writtenAnswer: 'MergeSort is stable and O(n log n) always; QuickSort is in-place.' }
        ]
      });
    expect(subRes.status).toBe(200);

    // Wait for setImmediate
    await new Promise(r => setTimeout(r, 150));

    const notifs = await Notification.find({ recipient: studentUserId, type: 'result_available' });
    expect(notifs.length).toBeGreaterThanOrEqual(1);
    expect(notifs[0].title).toBe('Quiz Submitted');
  });

  // ─────────────────────────────────────────────────────────────
  // STAGE 6: QUIZ GRADED NOTIFICATION TRIGGER
  // ─────────────────────────────────────────────────────────────
  console.log('\n🔔 NOTIFICATION TRIGGER — QUIZ GRADED');

  await test('Teacher grading comprehensive answer triggers quiz_graded notification', async () => {
    const quizDetails = await request(app)
      .get(`/api/quizzes/${quizId}`)
      .set('Authorization', `Bearer ${teacherToken}`);
    const compQ = quizDetails.body.data.quiz.questions.find(q => q.type === 'comprehensive');

    // Grade the comprehensive answer (award 4/5)
    const gradeRes = await request(app)
      .patch(`/api/quizzes/attempts/${attemptId}/grade/${compQ._id}`)
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        teacherMarks: 4,
        teacherFeedback: 'Excellent distinction between stability and in-place properties.'
      });
    expect(gradeRes.status).toBe(200);
    expect(gradeRes.body.data.attempt.status).toBe('graded');
    expect(gradeRes.body.data.attempt.isPassed).toBe(true);

    // Wait for setImmediate
    await new Promise(r => setTimeout(r, 150));

    const notifs = await Notification.find({ recipient: studentUserId, type: 'quiz_graded' });
    expect(notifs.length).toBeGreaterThanOrEqual(1);
    expect(notifs[0].title).toBe('Quiz Result Ready');
    expect(notifs[0].message).toContain('Midterm Algorithms');
  });

  // ─────────────────────────────────────────────────────────────
  // STAGE 5: GRADES & TRANSCRIPTS ENDPOINT (GET /api/quizzes/my-grades)
  // ─────────────────────────────────────────────────────────────
  console.log('\n📊 STAGE 5 — GRADES & TRANSCRIPTS');

  await test('Student can fetch their aggregated grades and performance summary', async () => {
    const res = await request(app)
      .get('/api/quizzes/my-grades')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const { attempts, summary } = res.body.data;
    expect(attempts).toBeDefined();
    expect(attempts.length).toBe(1);
    expect(attempts[0].obtainedMarks).toBe(9); // 5 auto + 4 manual
    expect(attempts[0].totalMarks).toBe(10);
    expect(attempts[0].percentage).toBe(90);
    expect(attempts[0].isPassed).toBe(true);

    // Verify summary statistics
    expect(summary.totalAttempts).toBe(1);
    expect(summary.totalGraded).toBe(1);
    expect(summary.avgPercentage).toBe(90);
    expect(summary.highestScore).toBe(90);
    expect(summary.passedCount).toBe(1);
  });

  await test('Unauthenticated access to my-grades is rejected (401)', async () => {
    const res = await request(app).get('/api/quizzes/my-grades');
    expect(res.status).toBe(401);
  });

  await test('Teacher or admin cannot call student-only my-grades route (403)', async () => {
    const res = await request(app)
      .get('/api/quizzes/my-grades')
      .set('Authorization', `Bearer ${teacherToken}`);
    expect(res.status).toBe(403);
  });

  // ─────────────────────────────────────────────────────────────
  // STAGE 6: NOTIFICATIONS API CRUD & ISOLATION
  // ─────────────────────────────────────────────────────────────
  console.log('\n📬 STAGE 6 — NOTIFICATIONS API CRUD & ISOLATION');

  await test('Student can list their notifications and get accurate unreadCount', async () => {
    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.notifications).toBeDefined();
    expect(res.body.data.unreadCount).toBeGreaterThanOrEqual(3);
    expect(res.body.data.pagination).toBeDefined();

    const countRes = await request(app)
      .get('/api/notifications/unread-count')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(countRes.status).toBe(200);
    expect(countRes.body.data.unreadCount).toBe(res.body.data.unreadCount);
  });

  await test('Student can mark a single notification as read', async () => {
    const existing = await Notification.findOne({ recipient: studentUserId });
    expect(existing).toBeDefined();
    const targetId = existing._id.toString();

    const markRes = await request(app)
      .patch(`/api/notifications/${targetId}/read`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(markRes.status).toBe(200);
    expect(markRes.body.data.notification.isRead).toBe(true);
  });

  await test('Student can filter unread-only notifications', async () => {
    const res = await request(app)
      .get('/api/notifications?unreadOnly=true')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    const unreadList = res.body.data.notifications;
    const hasRead = unreadList.some(n => n.isRead === true);
    expect(hasRead).toBe(false);
  });

  await test('Student can mark all notifications as read', async () => {
    const res = await request(app)
      .patch('/api/notifications/mark-all-read')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);

    const countRes = await request(app)
      .get('/api/notifications/unread-count')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(countRes.body.data.unreadCount).toBe(0);
  });

  await test('Student can delete a notification', async () => {
    const existing = await Notification.findOne({ recipient: studentUserId });
    expect(existing).toBeDefined();
    const targetId = existing._id.toString();

    const delRes = await request(app)
      .delete(`/api/notifications/${targetId}`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(delRes.status).toBe(200);

    const check = await Notification.findById(targetId);
    expect(check).toBe(null);
  });

  await test('User isolation: Student2 CANNOT read or delete Student1 notifications', async () => {
    const n = await Notification.create({
      recipient: studentUserId,
      type: 'general',
      title: 'Private Notice',
      message: 'Confidential'
    });

    const hackRead = await request(app)
      .patch(`/api/notifications/${n._id}/read`)
      .set('Authorization', `Bearer ${student2Token}`);
    expect(hackRead.status).toBe(404);

    const hackDel = await request(app)
      .delete(`/api/notifications/${n._id}`)
      .set('Authorization', `Bearer ${student2Token}`);
    expect(hackDel.status).toBe(404);

    const stillExists = await Notification.findById(n._id);
    expect(stillExists).toBeDefined();
    expect(stillExists.isRead).toBe(false);
  });

  console.log('\n══════════════════════════════════════════════');
  console.log(`  Results: ${passed}/${passed + failed} passed`);
  if (failed === 0) {
    console.log('  🎉 ALL STAGE 5 & 6 TESTS PASSED!');
  } else {
    console.log(`  ❌ ${failed} TESTS FAILED.`);
  }
  console.log('══════════════════════════════════════════════\n');

  await disconnectDB();
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(err => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
