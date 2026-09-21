const User = require('../src/modules/users/user.model');
const StudentProfile = require('../src/modules/users/studentProfile.model');
const TeacherProfile = require('../src/modules/users/teacherProfile.model');
const Class = require('../src/modules/classes/class.model');
const Enrollment = require('../src/modules/classes/enrollment.model');
const TeacherAssignment = require('../src/modules/classes/teacherAssignment.model');
const Quiz = require('../src/modules/quizzes/quiz.model');
const { ROLES, ENROLLMENT_STATUS, QUIZ_STATUS, QUESTION_TYPES } = require('../src/utils/constants');

const seedInitialDataIfEmpty = async () => {
  try {
    const studentCount = await User.countDocuments({ role: ROLES.STUDENT });
    const teacherCount = await User.countDocuments({ role: ROLES.TEACHER });
    const classCount = await Class.countDocuments();

    if (studentCount > 0 && teacherCount > 0 && classCount > 0) {
      return; // Already populated
    }

    console.log('Seeding initial demo data (Faculty, Student, Class, Quiz)...');

    // 1. Teacher
    let teacher = await User.findOne({ role: ROLES.TEACHER });
    if (!teacher) {
      teacher = await User.create({
        fullName: 'Sir Tariq Mehmood',
        email: 'teacher@girlskingdom.edu',
        password: 'Teacher@123456',
        role: ROLES.TEACHER,
        phone: '+92-301-9876543',
        isActive: true
      });
      await TeacherProfile.findOneAndUpdate(
        { user: teacher._id },
        { user: teacher._id, teacherId: 'TCH-001', department: 'Computer Science' },
        { upsert: true }
      );
      console.log('  ✓ Seeded Faculty: Sir Tariq Mehmood (teacher@girlskingdom.edu / Teacher@123456)');
    }

    // 2. Student
    let student = await User.findOne({ role: ROLES.STUDENT });
    if (!student) {
      student = await User.create({
        fullName: 'Ayesha Khan',
        email: 'ayesha@girlskingdom.edu',
        password: 'Student@123456',
        role: ROLES.STUDENT,
        phone: '+92-300-1234567',
        isActive: true
      });
      await StudentProfile.findOneAndUpdate(
        { user: student._id },
        { user: student._id, studentId: 'GKC-2026-001' },
        { upsert: true }
      );
      console.log('  ✓ Seeded Student: Ayesha Khan (ayesha@girlskingdom.edu / Student@123456)');
    }

    // 3. Class
    let classObj = await Class.findOne({ code: 'CS-101' });
    if (!classObj) {
      classObj = await Class.create({
        name: 'Computer Science - Class 11',
        code: 'CS-101',
        description: 'Higher Secondary Computer Science Fundamentals',
        academicYear: '2025-2026',
        status: 'active'
      });
      console.log('  ✓ Seeded Class: Computer Science - Class 11 (CS-101)');
    }

    // 4. Assign Teacher to Class
    const existingAssignment = await TeacherAssignment.findOne({
      teacher: teacher._id,
      class: classObj._id,
      status: 'active'
    });
    if (!existingAssignment) {
      await TeacherAssignment.create({
        teacher: teacher._id,
        class: classObj._id,
        status: 'active'
      });
      console.log('  ✓ Assigned Sir Tariq Mehmood to CS-101');
    }

    // 5. Enroll Student into Class
    const existingEnrollment = await Enrollment.findOne({
      student: student._id,
      class: classObj._id,
      status: ENROLLMENT_STATUS.ACTIVE
    });
    if (!existingEnrollment) {
      await Enrollment.create({
        student: student._id,
        class: classObj._id,
        status: ENROLLMENT_STATUS.ACTIVE
      });
      console.log('  ✓ Enrolled Ayesha Khan in CS-101');
    }

    // 6. Quiz
    const existingQuiz = await Quiz.findOne({ class: classObj._id });
    if (!existingQuiz) {
      await Quiz.create({
        title: 'Define Computer & Fundamentals',
        description: 'First assessment covering computer hardware, CPU, and memory concepts.',
        class: classObj._id,
        teacher: teacher._id,
        duration: 20,
        totalMarks: 10,
        passingMarks: 5,
        maxAttempts: 1,
        status: QUIZ_STATUS.PUBLISHED,
        questions: [
          {
            questionText: 'What does CPU stand for?',
            type: QUESTION_TYPES.MCQ,
            marks: 5,
            options: [
              { text: 'Central Processing Unit', isCorrect: true },
              { text: 'Central Process Unit', isCorrect: false },
              { text: 'Computer Personal Unit', isCorrect: false },
              { text: 'Control Processing Unit', isCorrect: false }
            ]
          },
          {
            questionText: 'RAM is a non-volatile memory.',
            type: QUESTION_TYPES.TRUE_FALSE,
            marks: 5,
            correctAnswer: 'false'
          }
        ]
      });
      console.log('  ✓ Seeded Quiz: Define Computer & Fundamentals');
    }
  } catch (err) {
    console.warn('Initial seed notice:', err.message);
  }
};

module.exports = seedInitialDataIfEmpty;
