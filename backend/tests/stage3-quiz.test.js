/**
 * Stage 3 Integration Tests — Quiz System Backend
 * Tests: Quiz CRUD, lifecycle (draft → publish → close),
 *        question management, student attempt, auto-grading,
 *        teacher manual grading, RBAC
 *
 * Run: npm run test:stage3
 */
const request = require('supertest');
const app = require('../src/app');
const connectDB = require('../src/config/db');
const { disconnectDB } = require('../src/config/db');
const User = require('../src/modules/users/user.model');
const Class = require('../src/modules/classes/class.model');
const Enrollment = require('../src/modules/classes/enrollment.model');
const TeacherAssignment = require('../src/modules/classes/teacherAssignment.model');

const TS = Date.now();
const ADMIN_EMAIL = `admin_s3_${TS}@gkc.edu`;
const TEACHER_EMAIL = `teacher_s3_${TS}@gkc.edu`;
const STUDENT_EMAIL = `student_s3_${TS}@gkc.edu`;
const PASS = 'Test@12345!';

let adminToken, teacherToken, studentToken;
let teacherUserId, studentUserId;
let classId, quizId, attemptId;

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
    toContain: (val) => {
      if (!String(actual).includes(String(val)))
        throw new Error(`Expected "${actual}" to contain "${val}"`);
    }
  };
}

async function setup() {
  await connectDB();

  await User.deleteMany({ email: { $in: [ADMIN_EMAIL, TEACHER_EMAIL, STUDENT_EMAIL] } });

  // Create admin
  await User.create({
    fullName: 'Stage3 Admin',
    email: ADMIN_EMAIL,
    password: PASS,
    role: 'admin',
    isActive: true
  });

  const adminRes = await request(app).post('/api/auth/login').send({ email: ADMIN_EMAIL, password: PASS });
  adminToken = adminRes.body.data?.token;

  // Register teacher
  const tchRes = await request(app).post('/api/auth/register/teacher').send({
    fullName: 'Quiz Teacher',
    email: TEACHER_EMAIL,
    password: PASS,
    teacherId: `TCH3-${TS}`,
    department: 'Computer Science'
  });
  teacherUserId = tchRes.body.data?.user?._id;
  const tchLogin = await request(app).post('/api/auth/login').send({ email: TEACHER_EMAIL, password: PASS });
  teacherToken = tchLogin.body.data?.token;

  // Register student
  const stuRes = await request(app).post('/api/auth/register/student').send({
    fullName: 'Quiz Student',
    email: STUDENT_EMAIL,
    password: PASS,
    studentId: `STU3-${TS}`
  });
  studentUserId = stuRes.body.data?.user?._id;
  const stuLogin = await request(app).post('/api/auth/login').send({ email: STUDENT_EMAIL, password: PASS });
  studentToken = stuLogin.body.data?.token;

  // Create a class
  const classCode = `QZ-${TS.toString().slice(-8)}`;
  const cls = await Class.create({
    name: 'Quiz Test Class',
    code: classCode,
    academicYear: '2025-2026',
    status: 'active'
  });
  classId = cls._id.toString();

  // Assign teacher to class
  await TeacherAssignment.create({
    teacher: teacherUserId,
    class: classId,
    status: 'active',
    assignedAt: new Date()
  });

  // Enroll student in class
  await Enrollment.create({
    student: studentUserId,
    class: classId,
    status: 'active',
    enrolledAt: new Date()
  });

  if (!adminToken || !teacherToken || !studentToken) {
    throw new Error('Token setup failed');
  }
}

async function runTests() {
  console.log('\n══════════════════════════════════════════════');
  console.log('  STAGE 3 — QUIZ SYSTEM TESTS');
  console.log('══════════════════════════════════════════════\n');

  // ── QUIZ CRUD ──────────────────────────────────────────────
  console.log('📝 QUIZ MANAGEMENT');

  await test('Teacher can create a quiz (draft)', async () => {
    const res = await request(app)
      .post('/api/quizzes')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        title: 'Midterm — CS Fundamentals',
        description: 'Covers chapters 1-5',
        classId,
        duration: 60,
        passingMarks: 5,
        resultVisibility: 'submission',
        maxAttempts: 1
      });
    expect(res.status).toBe(201);
    expect(res.body.data?.quiz?._id).toBeDefined();
    expect(res.body.data.quiz.status).toBe('draft');
    quizId = res.body.data.quiz._id;
  });

  await test('Admin can list quizzes', async () => {
    const res = await request(app)
      .get('/api/quizzes')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data?.quizzes)).toBe(true);
    expect(res.body.data.quizzes.length).toBeGreaterThan(0);
  });

  await test('Teacher can get quiz by ID', async () => {
    const res = await request(app)
      .get(`/api/quizzes/${quizId}`)
      .set('Authorization', `Bearer ${teacherToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data?.quiz?.title).toBeDefined();
  });

  await test('Teacher can update quiz metadata', async () => {
    const res = await request(app)
      .patch(`/api/quizzes/${quizId}`)
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({ duration: 90, description: 'Updated description' });
    expect(res.status).toBe(200);
    expect(res.body.data?.quiz?.duration).toBe(90);
  });

  await test('Student CANNOT create a quiz (RBAC)', async () => {
    const res = await request(app)
      .post('/api/quizzes')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ title: 'Hack', classId, duration: 10 });
    expect(res.status).toBe(403);
  });

  // ── QUESTION MANAGEMENT ─────────────────────────────────────
  console.log('\n❓ QUESTION MANAGEMENT');

  await test('Teacher can set questions on a draft quiz', async () => {
    const res = await request(app)
      .put(`/api/quizzes/${quizId}/questions`)
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        questions: [
          {
            type: 'mcq',
            questionText: 'What does CPU stand for?',
            marks: 2,
            options: [
              { text: 'Central Processing Unit', isCorrect: true },
              { text: 'Central Program Unit', isCorrect: false },
              { text: 'Computer Personal Unit', isCorrect: false },
              { text: 'Control Processing Unit', isCorrect: false }
            ]
          },
          {
            type: 'true_false',
            questionText: 'RAM is volatile memory.',
            marks: 2,
            correctAnswer: 'true'
          },
          {
            type: 'comprehensive',
            questionText: 'Explain the Von Neumann architecture in 3-5 sentences.',
            marks: 6,
            modelAnswer: 'Von Neumann architecture consists of CPU, memory, and I/O...'
          }
        ]
      });
    expect(res.status).toBe(200);
    expect(res.body.data?.quiz?.questions?.length).toBe(3);
    // totalMarks should be auto-calculated (2+2+6=10)
    expect(res.body.data.quiz.totalMarks).toBe(10);
  });

  await test('MCQ with 0 correct options is rejected', async () => {
    const res = await request(app)
      .put(`/api/quizzes/${quizId}/questions`)
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        questions: [
          {
            type: 'mcq',
            questionText: 'Bad MCQ?',
            marks: 1,
            options: [
              { text: 'Option A', isCorrect: false },
              { text: 'Option B', isCorrect: false }
            ]
          }
        ]
      });
    expect(res.status).toBe(400);
  });

  // ── QUIZ LIFECYCLE ──────────────────────────────────────────
  console.log('\n🔄 QUIZ LIFECYCLE');

  await test('Student CANNOT see draft quiz', async () => {
    const res = await request(app)
      .get(`/api/quizzes/${quizId}`)
      .set('Authorization', `Bearer ${studentToken}`);
    expect(res.status).toBe(403);
  });

  await test('Teacher can publish a quiz', async () => {
    const res = await request(app)
      .post(`/api/quizzes/${quizId}/publish`)
      .set('Authorization', `Bearer ${teacherToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data?.quiz?.status).toBe('published');
  });

  await test('Student can see published quiz', async () => {
    const res = await request(app)
      .get(`/api/quizzes/${quizId}`)
      .set('Authorization', `Bearer ${studentToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data?.quiz?.status).toBe('published');
  });

  await test('Published quiz hides correct answers from student', async () => {
    const res = await request(app)
      .get(`/api/quizzes/${quizId}`)
      .set('Authorization', `Bearer ${studentToken}`);
    const quiz = res.body.data?.quiz;
    const mcq = quiz?.questions?.find(q => q.type === 'mcq');
    const tf = quiz?.questions?.find(q => q.type === 'true_false');
    // isCorrect field on options should be stripped
    const hasIsCorrect = mcq?.options?.some(o => 'isCorrect' in o);
    expect(hasIsCorrect).toBe(false);
    // correctAnswer on TF should be stripped
    expect(tf?.correctAnswer === undefined || tf?.correctAnswer === null).toBe(true);
  });

  await test('Cannot publish an already-published quiz', async () => {
    const res = await request(app)
      .post(`/api/quizzes/${quizId}/publish`)
      .set('Authorization', `Bearer ${teacherToken}`);
    expect(res.status).toBe(400);
  });

  // ── STUDENT ATTEMPT FLOW ────────────────────────────────────
  console.log('\n🎯 STUDENT ATTEMPT FLOW');

  let mcqQuestionId, tfQuestionId, compQuestionId, mcqOptionId;

  // Get quiz to extract question IDs
  await test('Setup: fetch quiz question IDs', async () => {
    const res = await request(app)
      .get(`/api/quizzes/${quizId}`)
      .set('Authorization', `Bearer ${teacherToken}`);
    const quiz = res.body.data?.quiz;
    const mcq = quiz?.questions?.find(q => q.type === 'mcq');
    const tf = quiz?.questions?.find(q => q.type === 'true_false');
    const comp = quiz?.questions?.find(q => q.type === 'comprehensive');
    mcqQuestionId = mcq?._id;
    tfQuestionId = tf?._id;
    compQuestionId = comp?._id;
    // Correct option is 'Central Processing Unit' — need to find by teacher view
    mcqOptionId = mcq?.options?.find(o => o.isCorrect)?._id;
    expect(mcqQuestionId).toBeDefined();
    expect(tfQuestionId).toBeDefined();
    expect(compQuestionId).toBeDefined();
    expect(mcqOptionId).toBeDefined();
  });

  await test('Student can start a quiz attempt', async () => {
    const res = await request(app)
      .post(`/api/quizzes/${quizId}/start`)
      .set('Authorization', `Bearer ${studentToken}`);
    expect(res.status).toBe(201);
    expect(res.body.data?.attempt?._id).toBeDefined();
    attemptId = res.body.data.attempt._id;
  });

  await test('Student can save progress (auto-save)', async () => {
    const res = await request(app)
      .patch(`/api/quizzes/attempts/${attemptId}/save`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        answers: [
          { questionId: mcqQuestionId, selectedOptionId: mcqOptionId },
          { questionId: tfQuestionId, selectedAnswer: 'true' }
        ]
      });
    expect(res.status).toBe(200);
    expect(res.body.data?.saved).toBe(true);
  });

  await test('Student can submit the quiz', async () => {
    const res = await request(app)
      .post(`/api/quizzes/attempts/${attemptId}/submit`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        answers: [
          { questionId: mcqQuestionId, selectedOptionId: mcqOptionId },
          { questionId: tfQuestionId, selectedAnswer: 'true' },
          { questionId: compQuestionId, writtenAnswer: 'Von Neumann architecture has CPU, memory, and control unit.' }
        ]
      });
    expect(res.status).toBe(200);
    const attempt = res.body.data?.attempt;
    expect(attempt?.status).toBe('pending_review'); // has comprehensive question
    expect(attempt?.autoGradedMarks).toBe(4); // 2 MCQ + 2 TF correct
  });

  await test('Student CANNOT start a second attempt (maxAttempts=1)', async () => {
    const res = await request(app)
      .post(`/api/quizzes/${quizId}/start`)
      .set('Authorization', `Bearer ${studentToken}`);
    expect(res.status).toBe(400);
  });

  // ── MANUAL GRADING ──────────────────────────────────────────
  console.log('\n✏️  MANUAL GRADING');

  await test('Teacher can grade comprehensive answer', async () => {
    const res = await request(app)
      .patch(`/api/quizzes/attempts/${attemptId}/grade/${compQuestionId}`)
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({ teacherMarks: 5, teacherFeedback: 'Good explanation, missing I/O details.' });
    expect(res.status).toBe(200);
    const attempt = res.body.data?.attempt;
    expect(attempt?.status).toBe('graded');
    expect(attempt?.obtainedMarks).toBe(9); // 4 auto + 5 manual
    expect(attempt?.percentage).toBe(90); // 9/10 * 100
  });

  await test('Teacher cannot award more than question max marks', async () => {
    // comprehensive max is 6; try to award 7
    const res = await request(app)
      .patch(`/api/quizzes/attempts/${attemptId}/grade/${compQuestionId}`)
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({ teacherMarks: 7 });
    expect(res.status).toBe(400);
  });

  // ── ATTEMPT QUERIES ─────────────────────────────────────────
  console.log('\n📊 ATTEMPT QUERIES');

  await test('Teacher can view all attempts for a quiz', async () => {
    const res = await request(app)
      .get(`/api/quizzes/${quizId}/attempts`)
      .set('Authorization', `Bearer ${teacherToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data?.attempts)).toBe(true);
    expect(res.body.data.attempts.length).toBeGreaterThan(0);
  });

  await test('Student can view their own attempt details', async () => {
    const res = await request(app)
      .get(`/api/quizzes/attempts/${attemptId}`)
      .set('Authorization', `Bearer ${studentToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data?.attempt?.status).toBe('graded');
  });

  await test('Student can view their attempts for a quiz', async () => {
    const res = await request(app)
      .get(`/api/quizzes/${quizId}/my-attempts`)
      .set('Authorization', `Bearer ${studentToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data?.attempts)).toBe(true);
  });

  // ── CLOSE QUIZ ──────────────────────────────────────────────
  console.log('\n🔒 QUIZ CLOSE');

  await test('Teacher can close a published quiz', async () => {
    const res = await request(app)
      .post(`/api/quizzes/${quizId}/close`)
      .set('Authorization', `Bearer ${teacherToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data?.quiz?.status).toBe('closed');
  });

  await test('Student cannot see closed quiz', async () => {
    const res = await request(app)
      .get(`/api/quizzes/${quizId}`)
      .set('Authorization', `Bearer ${studentToken}`);
    expect(res.status).toBe(403);
  });

  // ── SUMMARY ─────────────────────────────────────────────────
  console.log('\n══════════════════════════════════════════════');
  const total = passed + failed;
  console.log(`  Results: ${passed}/${total} passed`);
  if (failed > 0) {
    console.log(`  ⚠️  ${failed} test(s) FAILED`);
  } else {
    console.log('  🎉 ALL TESTS PASSED!');
  }
  console.log('══════════════════════════════════════════════\n');

  return failed;
}

(async () => {
  try {
    await setup();
    const failCount = await runTests();
    await disconnectDB();
    process.exit(failCount > 0 ? 1 : 0);
  } catch (err) {
    console.error('\n💥 Fatal test setup error:', err.message);
    console.error(err.stack);
    try { await disconnectDB(); } catch (_) {}
    process.exit(1);
  }
})();
