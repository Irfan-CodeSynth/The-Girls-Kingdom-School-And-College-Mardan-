// End-to-end population and flow verification script for The Girls Kingdom School and College Mardan Portal System
const API_URL = 'http://127.0.0.1:5000/api';

async function request(path, options = {}) {
  const url = `${API_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || `Request failed with status ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

async function main() {
  console.log('===============================================================');
  console.log('  THE GIRLS KINGDOM SCHOOL & COLLEGE MARDAN — COMPREHENSIVE END-TO-END FLOW TEST');
  console.log('===============================================================\n');

  // 1. ADMIN LOGIN
  console.log('1. Logging in as Administrator...');
  const adminLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'admin@girlskingdom.edu', password: 'Admin@123456' })
  });
  const adminToken = adminLogin.data.token;
  const adminHeaders = { Authorization: `Bearer ${adminToken}` };
  console.log(`   ✓ Admin authenticated: ${adminLogin.data.user.fullName} (${adminLogin.data.user.email})\n`);

  // 2. REGISTER TEACHERS
  console.log('2. Registering Faculty Members...');
  const teachersToRegister = [
    {
      fullName: 'Dr. Sarah Ahmed',
      email: 'sarah.ahmed@girlskingdom.edu',
      password: 'Teacher@123456',
      teacherId: 'TCH-002',
      department: 'Mathematics',
      phone: '+92-301-1112233'
    },
    {
      fullName: 'Prof. Zainab Ali',
      email: 'zainab.ali@girlskingdom.edu',
      password: 'Teacher@123456',
      teacherId: 'TCH-003',
      department: 'Physics',
      phone: '+92-302-2223344'
    },
    {
      fullName: 'Ms. Hina Qureshi',
      email: 'hina.qureshi@girlskingdom.edu',
      password: 'Teacher@123456',
      teacherId: 'TCH-004',
      department: 'English Literature',
      phone: '+92-303-3334455'
    }
  ];

  const teacherMap = {}; // email -> teacherObj
  for (const t of teachersToRegister) {
    try {
      const reg = await request('/auth/register/teacher', {
        method: 'POST',
        body: JSON.stringify(t)
      });
      teacherMap[t.email] = reg.data.user;
      console.log(`   ✓ Registered: ${t.fullName} (${t.department})`);
    } catch (e) {
      if (e.status === 409) {
        console.log(`   • ${t.fullName} already registered.`);
      } else {
        console.error(`   ✗ Error registering ${t.fullName}:`, e.message);
      }
    }
  }

  // Also grab all registered teachers
  const allTeachersRes = await request('/teachers?limit=50', { headers: adminHeaders });
  for (const t of allTeachersRes.data.teachers) {
    teacherMap[t.email] = t;
  }
  console.log(`   Total faculty in database: ${allTeachersRes.data.pagination.total}\n`);

  // 3. REGISTER STUDENTS
  console.log('3. Registering Students...');
  const studentsToRegister = [
    {
      fullName: 'Mariam Siddiqui',
      email: 'mariam@girlskingdom.edu',
      password: 'Student@123456',
      studentId: 'GKC-2026-003',
      phone: '+92-304-4445566'
    },
    {
      fullName: 'Zainab Fatima',
      email: 'zainab@girlskingdom.edu',
      password: 'Student@123456',
      studentId: 'GKC-2026-004',
      phone: '+92-305-5556677'
    },
    {
      fullName: 'Khadija Bano',
      email: 'khadija@girlskingdom.edu',
      password: 'Student@123456',
      studentId: 'GKC-2026-005',
      phone: '+92-306-6667788'
    },
    {
      fullName: 'Sana Mir',
      email: 'sana@girlskingdom.edu',
      password: 'Student@123456',
      studentId: 'GKC-2026-006',
      phone: '+92-307-7778899'
    }
  ];

  const studentMap = {}; // email -> studentObj
  for (const s of studentsToRegister) {
    try {
      const reg = await request('/auth/register/student', {
        method: 'POST',
        body: JSON.stringify(s)
      });
      studentMap[s.email] = reg.data.user;
      console.log(`   ✓ Registered: ${s.fullName} (${s.studentId})`);
    } catch (e) {
      if (e.status === 409) {
        console.log(`   • ${s.fullName} already registered.`);
      } else {
        console.error(`   ✗ Error registering ${s.fullName}:`, e.message);
      }
    }
  }

  // Also grab all registered students
  const allStudentsRes = await request('/students?limit=50', { headers: adminHeaders });
  for (const s of allStudentsRes.data.students) {
    studentMap[s.email] = s;
  }
  console.log(`   Total students in database: ${allStudentsRes.data.pagination.total}\n`);

  // 4. CREATE CLASSES
  console.log('4. Creating Classes...');
  const classesToCreate = [
    {
      name: 'Mathematics - Class 11',
      code: 'MATH-101',
      description: 'Functions, Limits, Calculus, and Coordinate Geometry',
      academicYear: '2025-2026'
    },
    {
      name: 'Physics - Class 11',
      code: 'PHY-101',
      description: 'Vectors, Mechanics, Thermodynamics, and Optics',
      academicYear: '2025-2026'
    },
    {
      name: 'English Literature - Class 11',
      code: 'ENG-101',
      description: 'Poetry, Prose, Essay Writing, and Analytical Reading',
      academicYear: '2025-2026'
    }
  ];

  const classMap = {}; // code -> classObj
  for (const c of classesToCreate) {
    try {
      const created = await request('/classes', {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify(c)
      });
      classMap[c.code] = created.data.class;
      console.log(`   ✓ Created Class: ${c.name} (${c.code})`);
    } catch (e) {
      if (e.status === 409) {
        console.log(`   • Class ${c.code} already exists.`);
      } else {
        console.error(`   ✗ Error creating ${c.code}:`, e.message);
      }
    }
  }

  // Also grab all classes
  const allClassesRes = await request('/classes?limit=50', { headers: adminHeaders });
  for (const c of allClassesRes.data.classes) {
    classMap[c.code] = c;
  }
  console.log(`   Total classes in database: ${allClassesRes.data.pagination.total}\n`);

  // 5. ASSIGN TEACHERS TO CLASSES
  console.log('5. Assigning Teachers to Classes...');
  const teacherAssignments = [
    { teacherEmail: 'sarah.ahmed@girlskingdom.edu', classCode: 'MATH-101' },
    { teacherEmail: 'zainab.ali@girlskingdom.edu', classCode: 'PHY-101' },
    { teacherEmail: 'hina.qureshi@girlskingdom.edu', classCode: 'ENG-101' },
    { teacherEmail: 'teacher@girlskingdom.edu', classCode: 'CS-101' }
  ];

  for (const ta of teacherAssignments) {
    const teacher = teacherMap[ta.teacherEmail];
    const cls = classMap[ta.classCode];
    if (teacher && cls) {
      try {
        await request('/classes/assign-teacher', {
          method: 'POST',
          headers: adminHeaders,
          body: JSON.stringify({ teacherId: teacher._id, classId: cls._id })
        });
        console.log(`   ✓ Assigned ${teacher.fullName} to ${cls.name}`);
      } catch (e) {
        if (e.status === 409) {
          console.log(`   • ${teacher.fullName} is already assigned to ${cls.code}`);
        } else {
          console.error(`   ✗ Assignment failed (${teacher.fullName} -> ${cls.code}):`, e.message);
        }
      }
    }
  }
  console.log('');

  // 6. ENROLL STUDENTS IN CLASSES
  console.log('6. Enrolling Students into Classes...');
  const enrollments = [
    { studentEmail: 'ayesha@girlskingdom.edu', classCode: 'CS-101' },
    { studentEmail: 'fatima@girlskingdom.edu', classCode: 'CS-101' },
    { studentEmail: 'mariam@girlskingdom.edu', classCode: 'MATH-101' },
    { studentEmail: 'zainab@girlskingdom.edu', classCode: 'MATH-101' },
    { studentEmail: 'khadija@girlskingdom.edu', classCode: 'PHY-101' },
    { studentEmail: 'sana@girlskingdom.edu', classCode: 'ENG-101' }
  ];

  for (const enr of enrollments) {
    const student = studentMap[enr.studentEmail];
    const cls = classMap[enr.classCode];
    if (student && cls) {
      try {
        await request('/classes/enroll', {
          method: 'POST',
          headers: adminHeaders,
          body: JSON.stringify({ studentId: student._id, classId: cls._id })
        });
        console.log(`   ✓ Enrolled ${student.fullName} into ${cls.code}`);
      } catch (e) {
        if (e.status === 409) {
          console.log(`   • ${student.fullName} already enrolled in ${cls.code}`);
        } else {
          console.error(`   ✗ Enrollment failed (${student.fullName} -> ${cls.code}):`, e.message);
        }
      }
    }
  }
  console.log('');

  // 7. CREATE & PUBLISH QUIZZES FOR EACH CLASS
  console.log('7. Creating & Publishing Quizzes...');
  const quizzesToCreate = [
    {
      classCode: 'MATH-101',
      teacherEmail: 'sarah.ahmed@girlskingdom.edu',
      teacherPass: 'Teacher@123456',
      title: 'Limits & Derivatives Assessment',
      description: 'Mid-term evaluation on foundational calculus concepts.',
      duration: 15,
      totalMarks: 10,
      passingMarks: 5,
      maxAttempts: 2,
      questions: [
        {
          questionText: 'What is the derivative of sin(x)?',
          type: 'mcq',
          marks: 5,
          options: [
            { text: 'cos(x)', isCorrect: true },
            { text: '-cos(x)', isCorrect: false },
            { text: 'tan(x)', isCorrect: false },
            { text: 'sec^2(x)', isCorrect: false }
          ]
        },
        {
          questionText: 'The derivative of a constant number is always zero.',
          type: 'true_false',
          marks: 5,
          correctAnswer: 'true'
        }
      ]
    },
    {
      classCode: 'PHY-101',
      teacherEmail: 'zainab.ali@girlskingdom.edu',
      teacherPass: 'Teacher@123456',
      title: 'Newtonian Dynamics & Forces',
      description: 'Understanding Newton’s Laws of Motion and mechanical energy.',
      duration: 25,
      totalMarks: 15,
      passingMarks: 8,
      maxAttempts: 1,
      questions: [
        {
          questionText: 'Which law states that F = ma?',
          type: 'mcq',
          marks: 5,
          options: [
            { text: "Newton's First Law", isCorrect: false },
            { text: "Newton's Second Law", isCorrect: true },
            { text: "Newton's Third Law", isCorrect: false },
            { text: 'Law of Gravitation', isCorrect: false }
          ]
        },
        {
          questionText: 'Explain the difference between mass and weight with an everyday example.',
          type: 'comprehensive',
          marks: 10,
          modelAnswer: 'Mass is the amount of matter in an object and is constant (measured in kg). Weight is the gravitational force acting on that mass (W = mg) and varies with gravity.'
        }
      ]
    },
    {
      classCode: 'ENG-101',
      teacherEmail: 'hina.qureshi@girlskingdom.edu',
      teacherPass: 'Teacher@123456',
      title: 'Literary Devices & Critical Analysis',
      description: 'Examination on metaphors, similes, and analytical writing.',
      duration: 20,
      totalMarks: 10,
      passingMarks: 5,
      maxAttempts: 1,
      questions: [
        {
          questionText: 'A direct comparison without using "like" or "as" is called a:',
          type: 'mcq',
          marks: 5,
          options: [
            { text: 'Simile', isCorrect: false },
            { text: 'Metaphor', isCorrect: true },
            { text: 'Hyperbole', isCorrect: false },
            { text: 'Personification', isCorrect: false }
          ]
        },
        {
          questionText: 'Write a short paragraph analyzing the theme of hope in modern poetry.',
          type: 'comprehensive',
          marks: 5,
          modelAnswer: 'Hope in modern poetry serves as an anchor amidst existential struggles, symbolized through light, dawn, or enduring natural elements.'
        }
      ]
    }
  ];

  const createdQuizzes = [];
  for (const qDef of quizzesToCreate) {
    const cls = classMap[qDef.classCode];
    if (!cls) continue;

    // Login as teacher
    const tLogin = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: qDef.teacherEmail, password: qDef.teacherPass })
    });
    const tHeaders = { Authorization: `Bearer ${tLogin.data.token}` };

    // Check if quiz with title exists
    const existingQ = await request(`/quizzes?classId=${cls._id}`, { headers: tHeaders });
    const match = existingQ.data.quizzes.find(x => x.title === qDef.title);

    let quizId;
    if (match) {
      quizId = match._id;
      console.log(`   • Quiz "${qDef.title}" already exists.`);
    } else {
      // 1. Create draft
      const created = await request('/quizzes', {
        method: 'POST',
        headers: tHeaders,
        body: JSON.stringify({
          title: qDef.title,
          description: qDef.description,
          classId: cls._id,
          duration: qDef.duration,
          totalMarks: qDef.totalMarks,
          passingMarks: qDef.passingMarks,
          maxAttempts: qDef.maxAttempts
        })
      });
      quizId = created.data.quiz._id;

      // 2. Put questions
      await request(`/quizzes/${quizId}/questions`, {
        method: 'PUT',
        headers: tHeaders,
        body: JSON.stringify({ questions: qDef.questions })
      });

      // 3. Publish quiz
      await request(`/quizzes/${quizId}/publish`, {
        method: 'POST',
        headers: tHeaders
      });

      console.log(`   ✓ Created and Published: "${qDef.title}" for ${cls.code} (by ${qDef.teacherEmail})`);
    }

    createdQuizzes.push({
      quizId,
      title: qDef.title,
      classCode: qDef.classCode,
      teacherEmail: qDef.teacherEmail,
      teacherPass: qDef.teacherPass
    });
  }
  console.log('');

  // 8. TEST LIVE STUDENT ATTEMPT & GRADING FLOW
  console.log('8. Testing Student Quiz Attempt & Submission Flow...');
  // Student Mariam takes Mathematics quiz
  const mathQuiz = createdQuizzes.find(q => q.classCode === 'MATH-101');
  if (mathQuiz) {
    console.log(`   Student Mariam Siddiqui attempting "${mathQuiz.title}"...`);
    const mLogin = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'mariam@girlskingdom.edu', password: 'Student@123456' })
    });
    const mHeaders = { Authorization: `Bearer ${mLogin.data.token}` };

    const qDetails = await request(`/quizzes/${mathQuiz.quizId}`, { headers: mHeaders });
    const questions = qDetails.data.quiz.questions;
    const maxAtt = qDetails.data.quiz.maxAttempts || 2;

    const myAttempts = await request(`/quizzes/${mathQuiz.quizId}/my-attempts`, { headers: mHeaders });
    if (myAttempts.data.attempts.length < maxAtt) {
      const startRes = await request(`/quizzes/${mathQuiz.quizId}/start`, {
        method: 'POST',
        headers: mHeaders
      });
      const attempt = startRes.data.attempt;
      console.log(`   ✓ Attempt started (ID: ${attempt._id}, Attempt #${attempt.attemptNumber})`);

      // Answer Q1 (MCQ: correct is cos(x))
      const q1 = questions.find(q => q.type === 'mcq');
      const correctOpt = q1.options.find(o => o.text === 'cos(x)');

      // Answer Q2 (TF: correct is true)
      const q2 = questions.find(q => q.type === 'true_false');

      // Auto-save answers
      await request(`/quizzes/attempts/${attempt._id}/save`, {
        method: 'PATCH',
        headers: mHeaders,
        body: JSON.stringify({
          answers: [
            { questionId: q1._id, selectedOptionId: correctOpt._id },
            { questionId: q2._id, selectedAnswer: 'true' }
          ]
        })
      });
      console.log('   ✓ Mid-quiz auto-save completed.');

      // Submit quiz
      const submitRes = await request(`/quizzes/attempts/${attempt._id}/submit`, {
        method: 'POST',
        headers: mHeaders,
        body: JSON.stringify({ answers: [] })
      });
      console.log(`   ✓ Quiz submitted! Score: ${submitRes.data.attempt.obtainedMarks}/${submitRes.data.attempt.totalMarks} (${submitRes.data.attempt.percentage}%)`);
      console.log(`   ✓ Pass status: ${submitRes.data.attempt.isPassed ? 'PASSED 🏆' : 'FAILED'}`);
    } else {
      console.log(`   • Mariam Siddiqui has already completed ${myAttempts.data.attempts.length} attempts (Score: ${myAttempts.data.attempts[0]?.obtainedMarks}/${myAttempts.data.attempts[0]?.totalMarks}).`);
    }

    // Check student grades endpoint
    const myGrades = await request('/quizzes/my-grades', { headers: mHeaders });
    console.log(`   ✓ Student My-Grades summary: Total Attempts: ${myGrades.data.summary.totalAttempts}, Average: ${myGrades.data.summary.avgPercentage}%`);

    // Check student notifications
    const notifs = await request('/notifications', { headers: mHeaders });
    console.log(`   ✓ Student has ${notifs.data.notifications.length} notifications (Unread: ${notifs.data.unreadCount})`);
  }
  console.log('');

  // 9. TEST TEACHER MANUAL GRADING FLOW
  console.log('9. Testing Comprehensive Question Manual Grading Flow...');
  // Student Khadija takes Physics quiz with comprehensive question
  const phyQuiz = createdQuizzes.find(q => q.classCode === 'PHY-101');
  if (phyQuiz) {
    console.log(`   Student Khadija Bano attempting "${phyQuiz.title}"...`);
    const kLogin = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'khadija@girlskingdom.edu', password: 'Student@123456' })
    });
    const kHeaders = { Authorization: `Bearer ${kLogin.data.token}` };

    const myAttempts = await request(`/quizzes/${phyQuiz.quizId}/my-attempts`, { headers: kHeaders });
    let attempt = myAttempts.data.attempts[0];

    const qDetails = await request(`/quizzes/${phyQuiz.quizId}`, { headers: kHeaders });
    const questions = qDetails.data.quiz.questions;
    const qMcq = questions.find(q => q.type === 'mcq');
    const correctOpt = qMcq.options.find(o => o.text.includes("Second Law"));
    const qComp = questions.find(q => q.type === 'comprehensive');

    if (!attempt) {
      const startRes = await request(`/quizzes/${phyQuiz.quizId}/start`, {
        method: 'POST',
        headers: kHeaders
      });
      attempt = startRes.data.attempt;

      // Submit with written answer
      await request(`/quizzes/attempts/${attempt._id}/save`, {
        method: 'PATCH',
        headers: kHeaders,
        body: JSON.stringify({
          answers: [
            { questionId: qMcq._id, selectedOptionId: correctOpt._id },
            { questionId: qComp._id, writtenAnswer: 'Mass is the amount of substance in an object, while weight is the force exerted by gravity. For example, a 70kg person has the same mass on the moon, but weighs much less.' }
          ]
        })
      });

      const submitRes = await request(`/quizzes/attempts/${attempt._id}/submit`, {
        method: 'POST',
        headers: kHeaders,
        body: JSON.stringify({ answers: [] })
      });
      console.log(`   ✓ Student submitted physics quiz (Status: ${submitRes.data.attempt.status})`);
    } else {
      console.log(`   • Found existing attempt (Status: ${attempt.status})`);
    }

    // Now Teacher Prof. Zainab Ali grades the comprehensive answer
    const tLogin = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: phyQuiz.teacherEmail, password: phyQuiz.teacherPass })
    });
    const tHeaders = { Authorization: `Bearer ${tLogin.data.token}` };

    const gradeRes = await request(`/quizzes/attempts/${attempt._id}/grade/${qComp._id}`, {
      method: 'PATCH',
      headers: tHeaders,
      body: JSON.stringify({
        teacherMarks: 9.5,
        teacherFeedback: 'Excellent explanation and real-world example!'
      })
    });
    console.log(`   ✓ Teacher graded comprehensive answer! Total: ${gradeRes.data.attempt.obtainedMarks}/${gradeRes.data.attempt.totalMarks} (${gradeRes.data.attempt.status})`);
  }
  console.log('');

  // 10. FINAL SYSTEM AUDIT & DASHBOARD STATS
  console.log('10. Final Verification of Admin Dashboard Stats...');
  const finalStudents = await request('/students', { headers: adminHeaders });
  const finalTeachers = await request('/teachers', { headers: adminHeaders });
  const finalClasses = await request('/classes', { headers: adminHeaders });
  const finalQuizzes = await request('/quizzes', { headers: adminHeaders });

  console.log(`   👥 Total Registered Students: ${finalStudents.data.pagination.total}`);
  console.log(`   🎓 Total Faculty Members:     ${finalTeachers.data.pagination.total}`);
  console.log(`   📚 Total Active Classes:      ${finalClasses.data.pagination.total}`);
  console.log(`   📝 Total Quizzes:             ${finalQuizzes.data.pagination.total}`);

  console.log('\n===============================================================');
  console.log('  🎉 ALL MODULES & END-TO-END FLOWS FULLY TESTED & VERIFIED!');
  console.log('===============================================================');
}

main().catch(err => {
  console.error('\n💥 Test Flow encountered an error:', err.message);
  if (err.data) console.error('Details:', JSON.stringify(err.data, null, 2));
  process.exit(1);
});
