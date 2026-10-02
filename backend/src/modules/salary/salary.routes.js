const express = require('express');
const router = express.Router();
const salaryController = require('./salary.controller');
const protect = require('../../middleware/auth');
const authorize = require('../../middleware/authorize');
const validate = require('../../middleware/validate');
const { ROLES } = require('../../utils/constants');
const {
  upsertSalaryStructureSchema,
  generatePayrollSchema,
  adjustSlipSchema,
  disburseSlipSchema,
  bulkDisburseSchema,
} = require('./salary.validator');

router.use(protect);

// ─── Teacher Self-Service Routes ─────────────────────────────────
router.get('/my-structure', authorize(ROLES.TEACHER), salaryController.getMySalaryStructure);
router.get('/my-slips', authorize(ROLES.TEACHER), salaryController.getMySlips);
router.get('/slips/:id', authorize(ROLES.TEACHER, ROLES.ADMIN), salaryController.getSlipById);

// ─── Admin-Only Routes ────────────────────────────────────────────
router.use(authorize(ROLES.ADMIN));

// Salary Structure Management
router.post('/structures', validate(upsertSalaryStructureSchema), salaryController.upsertSalaryStructure);
router.get('/structures', salaryController.getSalaryStructures);
router.get('/structures/teacher/:teacherId', salaryController.getSalaryStructureByTeacher);
router.delete('/structures/:id', salaryController.deleteSalaryStructure);

// Payroll Slip Management
router.post('/generate', validate(generatePayrollSchema), salaryController.generatePayroll);
router.get('/slips', salaryController.getSlips);
router.patch('/slips/:id/adjust', validate(adjustSlipSchema), salaryController.adjustSlip);
router.post('/slips/:id/approve', salaryController.approveSlip);
router.post('/slips/:id/disburse', validate(disburseSlipSchema), salaryController.disburseSlip);
router.post('/slips/:id/cancel', salaryController.cancelSlip);
router.post('/bulk-disburse', validate(bulkDisburseSchema), salaryController.bulkDisburse);

// Analytics
router.get('/summary', salaryController.getPayrollSummary);
router.get('/bank-sheet', salaryController.getBankSheet);

module.exports = router;
