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
    console.log('Verifying & seeding demo credentials (Faculty, Student, Class, Quiz)...');

    // 1. Teacher
    const teacherEmail = 'teacher@girlskingdom.edu';
    const teacherPass = 'Teacher@123456';
    let teacher = await User.findOne({ email: teacherEmail }).select('+password');
    if (!teacher) {
      teacher = await User.create({
        fullName: 'Sir Tariq Mehmood',
        email: teacherEmail,
        password: teacherPass,
        role: ROLES.TEACHER,
        phone: '+92-301-9876543',
        isActive: true
      });
      console.log('  ✓ Seeded Faculty: Sir Tariq Mehmood (teacher@girlskingdom.edu / Teacher@123456)');
    } else {
      const match = await teacher.comparePassword(teacherPass);
      if (!match || !teacher.isActive) {
        teacher.password = teacherPass;
        teacher.isActive = true;
        await teacher.save();
        console.log('  ✓ Resynced Teacher password & active state: teacher@girlskingdom.edu');
      }
    }
    await TeacherProfile.findOneAndUpdate(
      { user: teacher._id },
      { user: teacher._id, teacherId: 'TCH-001', department: 'Computer Science' },
      { upsert: true }
    );

    // 2. Student
    const studentEmail = 'ayesha@girlskingdom.edu';
    const studentPass = 'Student@123456';
    let student = await User.findOne({ email: studentEmail }).select('+password');
    if (!student) {
      student = await User.create({
        fullName: 'Ayesha Khan',
        email: studentEmail,
        password: studentPass,
        role: ROLES.STUDENT,
        phone: '+92-300-1234567',
        isActive: true
      });
      console.log('  ✓ Seeded Student: Ayesha Khan (ayesha@girlskingdom.edu / Student@123456)');
    } else {
      const match = await student.comparePassword(studentPass);
      if (!match || !student.isActive) {
        student.password = studentPass;
        student.isActive = true;
        await student.save();
        console.log('  ✓ Resynced Student password & active state: ayesha@girlskingdom.edu');
      }
    }
    await StudentProfile.findOneAndUpdate(
      { user: student._id },
      { user: student._id, studentId: 'GKC-2026-001' },
      { upsert: true }
    );

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
    await Enrollment.findOneAndUpdate(
      { student: student._id },
      { student: student._id, class: classObj._id, status: ENROLLMENT_STATUS.ACTIVE },
      { upsert: true, new: true }
    );
    console.log('  ✓ Enrolled Ayesha Khan in CS-101');

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

    // 7. Seed Sample Weekly Timetable
    const Timetable = require('../src/modules/schedule/timetable.model');
    const existingTimetable = await Timetable.findOne({ class: classObj._id });
    if (!existingTimetable) {
      const daysList = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const defaultPeriods = [
        { periodNumber: 1, startTime: '08:00 AM', endTime: '08:45 AM', subject: 'Computer Science', teacher: teacher._id, room: 'Lab 1', isBreak: false },
        { periodNumber: 2, startTime: '08:45 AM', endTime: '09:30 AM', subject: 'Mathematics', teacher: null, room: 'Room 101', isBreak: false },
        { periodNumber: 3, startTime: '09:30 AM', endTime: '10:15 AM', subject: 'English Language', teacher: null, room: 'Room 101', isBreak: false },
        { periodNumber: 4, startTime: '10:15 AM', endTime: '10:30 AM', subject: 'Morning Assembly & Break', teacher: null, room: 'Courtyard', isBreak: true },
        { periodNumber: 5, startTime: '10:30 AM', endTime: '11:15 AM', subject: 'Physics', teacher: null, room: 'Physics Lab', isBreak: false },
        { periodNumber: 6, startTime: '11:15 AM', endTime: '12:00 PM', subject: 'Chemistry', teacher: null, room: 'Chemistry Lab', isBreak: false },
        { periodNumber: 7, startTime: '12:00 PM', endTime: '12:30 PM', subject: 'Lunch & Prayer Break', teacher: null, room: 'Cafeteria / Mosque', isBreak: true },
        { periodNumber: 8, startTime: '12:30 PM', endTime: '01:15 PM', subject: 'Pak Studies & Civics', teacher: null, room: 'Room 101', isBreak: false },
      ];

      await Timetable.create({
        class: classObj._id,
        academicYear: '2025-2026',
        days: daysList.map(d => ({ day: d, periods: defaultPeriods })),
        isActive: true,
        notes: 'Standard morning shift schedule for Intermediate Part-I'
      });
      console.log('  ✓ Seeded Weekly Timetable: CS-101 (Monday–Saturday, 8 Periods)');
    }

    // 8. Seed Sample Exam Datesheet
    const ExamDatesheet = require('../src/modules/schedule/datesheet.model');
    const existingDatesheet = await ExamDatesheet.findOne({ class: classObj._id });
    if (!existingDatesheet) {
      await ExamDatesheet.create({
        title: 'Mid-Term Examinations — Autumn 2026',
        examType: 'midterm',
        class: classObj._id,
        academicYear: '2025-2026',
        startDate: new Date('2026-10-15'),
        endDate: new Date('2026-10-23'),
        status: 'published',
        generalInstructions: `1. Students must arrive at the examination hall at least 20 minutes prior to paper commencement.\n2. Official Student ID Card and Roll Number Slip must be displayed on the desk.\n3. Mobile phones, smartwatches, and unauthorized notes are strictly prohibited.\n4. Standard scientific calculators (non-programmable) are allowed for Physics & Mathematics only.`,
        entries: [
          { subject: 'Computer Science', examDate: new Date('2026-10-15'), day: 'Thursday', startTime: '09:00 AM', endTime: '12:00 PM', room: 'Computer Lab 1', invigilator: teacher._id, totalMarks: 100, passingMarks: 40, syllabus: 'Units 1-4: Architecture, OS, Algorithms' },
          { subject: 'Mathematics', examDate: new Date('2026-10-17'), day: 'Saturday', startTime: '09:00 AM', endTime: '12:00 PM', room: 'Main Examination Hall', invigilator: null, totalMarks: 100, passingMarks: 40, syllabus: 'Matrices, Quadratic Equations, Trigonometry' },
          { subject: 'English Compulsory', examDate: new Date('2026-10-19'), day: 'Monday', startTime: '09:00 AM', endTime: '12:00 PM', room: 'Hall A', invigilator: null, totalMarks: 100, passingMarks: 40, syllabus: 'Essay Writing, Grammar, Comprehension' },
          { subject: 'Physics', examDate: new Date('2026-10-21'), day: 'Wednesday', startTime: '09:00 AM', endTime: '12:00 PM', room: 'Hall B', invigilator: null, totalMarks: 100, passingMarks: 40, syllabus: 'Mechanics, Vectors, Thermodynamics' },
          { subject: 'Pakistan Studies', examDate: new Date('2026-10-23'), day: 'Friday', startTime: '09:00 AM', endTime: '11:00 AM', room: 'Room 101', invigilator: null, totalMarks: 50, passingMarks: 20, syllabus: 'Ideology of Pakistan, Constitution 1973' },
        ]
      });
      console.log('  ✓ Seeded Exam Datesheet: Mid-Term Examinations — Autumn 2026');
    }
  } catch (err) {
    console.warn('Initial seed notice:', err.message);
  }
};

module.exports = seedInitialDataIfEmpty;
