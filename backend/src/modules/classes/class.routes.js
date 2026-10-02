const express = require('express');
const router = express.Router();
const classController = require('./class.controller');
const materialController = require('./material.controller');
const protect = require('../../middleware/auth');
const authorize = require('../../middleware/authorize');
const validate = require('../../middleware/validate');
const { ROLES } = require('../../utils/constants');
const {
  createClassSchema,
  updateClassSchema,
  enrollStudentSchema,
  assignTeacherSchema
} = require('./class.validator');
const { createMaterialSchema, updateMaterialSchema } = require('./material.validator');

// Protected for all authenticated users
router.use(protect);

// Specific role queries
router.get('/my-teacher-classes', authorize(ROLES.TEACHER, ROLES.ADMIN), classController.getMyClassesAsTeacher);
router.get('/my-student-class', authorize(ROLES.STUDENT), classController.getMyClassAsStudent);

// Class list and details (Admin, Teacher, Student can view)
router.get('/', classController.getClasses);
router.get('/:id', classController.getClassById);
router.get('/:id/students', authorize(ROLES.ADMIN, ROLES.TEACHER), classController.getClassStudents);
router.get('/:id/teachers', authorize(ROLES.ADMIN, ROLES.TEACHER), classController.getClassTeachers);

// Admin-only class management
router.post('/', authorize(ROLES.ADMIN), validate(createClassSchema), classController.createClass);
router.patch('/:id', authorize(ROLES.ADMIN), validate(updateClassSchema), classController.updateClass);

// Admin enrollment & assignment operations
router.post('/enroll', authorize(ROLES.ADMIN), validate(enrollStudentSchema), classController.enrollStudent);
router.delete('/enroll/:id', authorize(ROLES.ADMIN), classController.removeStudentEnrollment);

router.post('/assign-teacher', authorize(ROLES.ADMIN), validate(assignTeacherSchema), classController.assignTeacher);
router.delete('/assign-teacher/:id', authorize(ROLES.ADMIN), classController.removeTeacherAssignment);

// ── Stage 7: Course Materials ─────────────────────────────────────────────────
// GET  /classes/:id/materials         — Teacher (own), Admin (all), Student (published)
// POST /classes/:id/materials         — Teacher or Admin creates material
// PATCH /classes/:id/materials/:mid   — Teacher (own) or Admin updates
// DELETE /classes/:id/materials/:mid  — Teacher (own) or Admin deletes
router.get('/:id/materials',
  authorize(ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT),
  materialController.getClassMaterials
);
router.post('/:id/materials',
  authorize(ROLES.ADMIN, ROLES.TEACHER),
  validate(createMaterialSchema),
  materialController.createMaterial
);
router.patch('/:id/materials/:materialId',
  authorize(ROLES.ADMIN, ROLES.TEACHER),
  validate(updateMaterialSchema),
  materialController.updateMaterial
);
router.delete('/:id/materials/:materialId',
  authorize(ROLES.ADMIN, ROLES.TEACHER),
  materialController.deleteMaterial
);

const attendanceRoutes = require('./attendance.routes');
router.use('/:id/attendance', attendanceRoutes);

module.exports = router;

