const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const connectDB = require('../src/config/db');
const User = require('../src/modules/users/user.model');
const { ROLES } = require('../src/utils/constants');

async function runStage1Tests() {
  console.log('=== RUNNING STAGE 1 VERIFICATION TESTS ===\n');
  await connectDB();

  // Clear previous test users if any
  await User.deleteMany({ email: { $in: ['student.test@gk.edu', 'teacher.test@gk.edu', 'admin.test@gk.edu'] } });

  let studentToken = '';
  let teacherToken = '';

  // 1. Student Registration
  console.log('Test 1: Student Registration (POST /api/auth/register/student)');
  const regStudentRes = await request(app)
    .post('/api/auth/register/student')
    .send({
      fullName: 'Fatima Zahra',
      email: 'student.test@gk.edu',
      password: 'Password@123',
      studentId: 'STU-TEST-001',
      phone: '+923001234567',
    });

  if (regStudentRes.status !== 201 || !regStudentRes.body.data.token) {
    throw new Error(`Student registration failed: ${JSON.stringify(regStudentRes.body)}`);
  }
  studentToken = regStudentRes.body.data.token;
  console.log('✓ Student registered successfully. User role:', regStudentRes.body.data.user.role);

  // 2. Duplicate Student Email Prevention
  console.log('\nTest 2: Duplicate Email Rejection (409 Conflict)');
  const dupEmailRes = await request(app)
    .post('/api/auth/register/student')
    .send({
      fullName: 'Duplicate Fatima',
      email: 'student.test@gk.edu',
      password: 'Password@123',
      studentId: 'STU-TEST-002',
    });

  if (dupEmailRes.status !== 409) {
    throw new Error(`Duplicate email was not rejected with 409! Received: ${dupEmailRes.status}`);
  }
  console.log('✓ Duplicate email blocked with 409 Conflict');

  // 3. Teacher Registration
  console.log('\nTest 3: Teacher Registration (POST /api/auth/register/teacher)');
  const regTeacherRes = await request(app)
    .post('/api/auth/register/teacher')
    .send({
      fullName: 'Dr. Maryam Khan',
      email: 'teacher.test@gk.edu',
      password: 'Password@123',
      teacherId: 'TCH-TEST-001',
      department: 'Department of Computer Science',
    });

  if (regTeacherRes.status !== 201 || !regTeacherRes.body.data.token) {
    throw new Error(`Teacher registration failed: ${JSON.stringify(regTeacherRes.body)}`);
  }
  teacherToken = regTeacherRes.body.data.token;
  console.log('✓ Teacher registered successfully. User role:', regTeacherRes.body.data.user.role);

  // 4. Student Login
  console.log('\nTest 4: Login with Valid Credentials (POST /api/auth/login)');
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'student.test@gk.edu',
      password: 'Password@123',
    });

  if (loginRes.status !== 200 || !loginRes.body.data.token) {
    throw new Error(`Login failed: ${JSON.stringify(loginRes.body)}`);
  }
  console.log('✓ Login successful, JWT token issued');

  // 5. Invalid Password Rejection
  console.log('\nTest 5: Login with Invalid Password (401 Unauthorized)');
  const badLoginRes = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'student.test@gk.edu',
      password: 'WrongPassword999!',
    });

  if (badLoginRes.status !== 401) {
    throw new Error(`Invalid password did not return 401! Received: ${badLoginRes.status}`);
  }
  console.log('✓ Invalid password correctly rejected with 401');

  // 6. Current Authenticated User (GET /api/auth/me)
  console.log('\nTest 6: Verify Current User (GET /api/auth/me)');
  const meRes = await request(app)
    .get('/api/auth/me')
    .set('Authorization', `Bearer ${studentToken}`);

  if (meRes.status !== 200 || meRes.body.data.user.email !== 'student.test@gk.edu') {
    throw new Error(`GET /api/auth/me failed: ${JSON.stringify(meRes.body)}`);
  }
  console.log('✓ Protected route verified identity:', meRes.body.data.user.fullName);

  // 7. Password Change
  console.log('\nTest 7: Change Password (PATCH /api/auth/change-password)');
  const changePassRes = await request(app)
    .patch('/api/auth/change-password')
    .set('Authorization', `Bearer ${studentToken}`)
    .send({
      currentPassword: 'Password@123',
      newPassword: 'NewSecurePassword@456',
      confirmPassword: 'NewSecurePassword@456',
    });

  if (changePassRes.status !== 200) {
    throw new Error(`Password change failed: ${JSON.stringify(changePassRes.body)}`);
  }
  console.log('✓ Password changed successfully');

  // 8. Re-login with new password
  console.log('\nTest 8: Re-login with New Password');
  const newLoginRes = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'student.test@gk.edu',
      password: 'NewSecurePassword@456',
    });

  if (newLoginRes.status !== 200) {
    throw new Error('Could not log in with newly updated password!');
  }
  console.log('✓ Re-authenticated with updated password');

  // 9. Old password must fail
  console.log('\nTest 9: Old Password No Longer Works');
  const oldLoginRes = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'student.test@gk.edu',
      password: 'Password@123',
    });

  if (oldLoginRes.status !== 401) {
    throw new Error('Old password still worked after change!');
  }
  console.log('✓ Old password revoked');

  console.log('\n========================================');
  console.log('ALL STAGE 1 VERIFICATION TESTS PASSED!');
  console.log('========================================\n');

  await mongoose.connection.close();
  process.exit(0);
}

runStage1Tests().catch((err) => {
  console.error('\n❌ STAGE 1 TEST SUITE FAILED:', err.message);
  process.exit(1);
});
