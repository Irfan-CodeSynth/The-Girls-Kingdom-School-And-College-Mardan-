/**
 * Stage 2 Integration Tests — Management Modules
 * Tests: Class, Student, Teacher Management, Enrollment, Teacher Assignment, RBAC
 *
 * Run: npm run test:stage2
 */
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const connectDB = require('../src/config/db');
const { disconnectDB } = require('../src/config/db');
const User = require('../src/modules/users/user.model');

const TS = Date.now();
const ADMIN_EMAIL = `admin_s2_${TS}@gkc.edu`;
const STUDENT_EMAIL = `student_s2_${TS}@gkc.edu`;
const TEACHER_EMAIL = `teacher_s2_${TS}@gkc.edu`;
const PASS = 'Test@12345!';

let adminToken, studentToken, teacherToken;
let studentUserId, teacherUserId;
let classId, enrollmentId, assignmentId;

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
    toBe(expected) {
      if (actual !== expected)
        throw new Error(`Expected ${JSON.stringify(actual)} to be ${JSON.stringify(expected)}`);
    },
    toBeGreaterThan(n) {
      if (!(actual > n))
        throw new Error(`Expected ${actual} to be greater than ${n}`);
    },
    toBeDefined() {
      if (actual === undefined || actual === null)
        throw new Error(`Expected value to be defined, got ${actual}`);
    },
  };
}

async function setup() {
  await connectDB();

  // Clean up any leftover test users
  await User.deleteMany({
    email: { $in: [ADMIN_EMAIL, STUDENT_EMAIL, TEACHER_EMAIL] },
  });

  // Create admin — let pre-save hook hash the password
  await User.create({
    fullName: 'Stage2 Admin',
    email: ADMIN_EMAIL,
    password: PASS,
    role: 'admin',
    isActive: true,
  });

  // Login admin
  const adminRes = await request(app).post('/api/auth/login').send({
    email: ADMIN_EMAIL,
    password: PASS,
  });
  adminToken = adminRes.body.data?.token;

  // Register student (studentId is required by validator)
  const stuRes = await request(app).post('/api/auth/register/student').send({
    fullName: 'Ayesha Siddiqui',
    email: STUDENT_EMAIL,
    password: PASS,
    studentId: `STU-S2-${TS}`,
  });
  studentUserId = stuRes.body.data?.user?._id;
  const stuLoginRes = await request(app).post('/api/auth/login').send({
    email: STUDENT_EMAIL,
    password: PASS,
  });
  studentToken = stuLoginRes.body.data?.token;

  // Register teacher (teacherId + department required by validator)
  const tchRes = await request(app).post('/api/auth/register/teacher').send({
    fullName: 'Dr. Fatima Malik',
    email: TEACHER_EMAIL,
    password: PASS,
    teacherId: `TCH-S2-${TS}`,
    department: 'Computer Science',
  });
  teacherUserId = tchRes.body.data?.user?._id;
  const tchLoginRes = await request(app).post('/api/auth/login').send({
    email: TEACHER_EMAIL,
    password: PASS,
  });
  teacherToken = tchLoginRes.body.data?.token;

  if (!adminToken) throw new Error('Admin login failed — check auth routes');
  if (!studentToken) throw new Error('Student login failed');
  if (!teacherToken) throw new Error('Teacher login failed');
}

async function runTests() {
  console.log('\n══════════════════════════════════════════════');
  console.log('  STAGE 2 — MANAGEMENT MODULE TESTS');
  console.log('══════════════════════════════════════════════\n');

  // ── CLASS MANAGEMENT ──
  console.log('📚 CLASS MANAGEMENT');

  await test('Admin can create a class', async () => {
    const res = await request(app)
      .post('/api/classes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'BS Computer Science — Semester 1',
        code: `CS-${TS.toString().slice(-8)}`,
        description: 'Foundation semester',
        academicYear: '2025-2026',
      });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data?.class?._id).toBeDefined();
    classId = res.body.data.class._id;
  });

  await test('Admin can list all classes', async () => {
    const res = await request(app)
      .get('/api/classes')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data?.classes)).toBe(true);
  });

  await test('Admin can get class by ID', async () => {
    const res = await request(app)
      .get(`/api/classes/${classId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data?.class?._id).toBeDefined();
  });

  await test('Admin can update a class', async () => {
    const res = await request(app)
      .patch(`/api/classes/${classId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ description: 'Updated description' });
    expect(res.status).toBe(200);
    expect(res.body.data?.class?.description).toBe('Updated description');
  });

  await test('Student CANNOT create a class (RBAC)', async () => {
    const res = await request(app)
      .post('/api/classes')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ name: 'Hack', code: 'HACK-001', academicYear: '2025-2026' });
    expect(res.status).toBe(403);
  });

  await test('Teacher CANNOT create a class (RBAC)', async () => {
    const res = await request(app)
      .post('/api/classes')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({ name: 'Hack', code: 'HACK-002', academicYear: '2025-2026' });
    expect(res.status).toBe(403);
  });

  // ── STUDENT MANAGEMENT ──
  console.log('\n👩‍🎓 STUDENT MANAGEMENT');

  await test('Admin can list students', async () => {
    const res = await request(app)
      .get('/api/students')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data?.students)).toBe(true);
    expect(res.body.data.students.length).toBeGreaterThan(0);
  });

  await test('Admin can get student by ID', async () => {
    const res = await request(app)
      .get(`/api/students/${studentUserId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data?.student).toBeDefined();
  });

  await test('Student CANNOT list all students (RBAC)', async () => {
    const res = await request(app)
      .get('/api/students')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(res.status).toBe(403);
  });

  // ── TEACHER MANAGEMENT ──
  console.log('\n👩‍🏫 TEACHER MANAGEMENT');

  await test('Admin can list teachers', async () => {
    const res = await request(app)
      .get('/api/teachers')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data?.teachers)).toBe(true);
    expect(res.body.data.teachers.length).toBeGreaterThan(0);
  });

  await test('Admin can get teacher by ID', async () => {
    const res = await request(app)
      .get(`/api/teachers/${teacherUserId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data?.teacher).toBeDefined();
  });

  await test('Teacher CANNOT list all teachers (RBAC)', async () => {
    const res = await request(app)
      .get('/api/teachers')
      .set('Authorization', `Bearer ${teacherToken}`);
    expect(res.status).toBe(403);
  });

  // ── ENROLLMENT ──
  console.log('\n📋 STUDENT ENROLLMENT');

  await test('Admin can enroll a student in a class', async () => {
    const res = await request(app)
      .post('/api/classes/enroll')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ studentId: studentUserId, classId });
    expect(res.status).toBe(201);
    expect(res.body.data?.enrollment).toBeDefined();
    enrollmentId = res.body.data.enrollment._id;
  });

  await test('Student can view their enrolled class', async () => {
    const res = await request(app)
      .get('/api/classes/my-student-class')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(res.status).toBe(200);
    // controller wraps as { class, enrollment }
    expect(res.body.data?.class).toBeDefined();
  });

  await test('Admin can view students in a class', async () => {
    const res = await request(app)
      .get(`/api/classes/${classId}/students`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data?.students)).toBe(true);
    expect(res.body.data.students.length).toBeGreaterThan(0);
  });

  await test('Student CANNOT enroll themselves (RBAC)', async () => {
    const res = await request(app)
      .post('/api/classes/enroll')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ studentId: studentUserId, classId });
    expect(res.status).toBe(403);
  });

  await test('Admin can remove student enrollment', async () => {
    const res = await request(app)
      .delete(`/api/classes/enroll/${enrollmentId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
  });

  // ── TEACHER ASSIGNMENT ──
  console.log('\n🔗 TEACHER ASSIGNMENT');

  await test('Admin can assign teacher to a class', async () => {
    const res = await request(app)
      .post('/api/classes/assign-teacher')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ teacherId: teacherUserId, classId });
    expect(res.status).toBe(201);
    expect(res.body.data?.assignment).toBeDefined();
    assignmentId = res.body.data.assignment._id;
  });

  await test('Teacher can view their assigned classes', async () => {
    const res = await request(app)
      .get('/api/classes/my-teacher-classes')
      .set('Authorization', `Bearer ${teacherToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data?.classes)).toBe(true);
    expect(res.body.data.classes.length).toBeGreaterThan(0);
  });

  await test('Admin can view teachers in a class', async () => {
    const res = await request(app)
      .get(`/api/classes/${classId}/teachers`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data?.teachers)).toBe(true);
    expect(res.body.data.teachers.length).toBeGreaterThan(0);
  });

  await test('Student CANNOT assign teachers (RBAC)', async () => {
    const res = await request(app)
      .post('/api/classes/assign-teacher')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ teacherId: teacherUserId, classId });
    expect(res.status).toBe(403);
  });

  await test('Admin can remove teacher assignment', async () => {
    const res = await request(app)
      .delete(`/api/classes/assign-teacher/${assignmentId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
  });

  // ── SUMMARY ──
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
    try { await disconnectDB(); } catch (_) {}
    process.exit(1);
  }
})();
