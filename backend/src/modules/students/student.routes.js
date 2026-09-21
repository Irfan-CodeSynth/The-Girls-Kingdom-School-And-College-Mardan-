const express = require('express');
const router = express.Router();
const studentController = require('./student.controller');
const protect = require('../../middleware/auth');
const authorize = require('../../middleware/authorize');
const validate = require('../../middleware/validate');
const { ROLES } = require('../../utils/constants');
const { updateStudentSchema } = require('./student.validator');

router.use(protect);
router.use(authorize(ROLES.ADMIN));

router.get('/', studentController.getStudents);
router.get('/:id', studentController.getStudentById);
router.patch('/:id', validate(updateStudentSchema), studentController.updateStudent);

module.exports = router;
