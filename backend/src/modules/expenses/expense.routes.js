const express = require('express');
const protect = require('../../middleware/auth');
const authorize = require('../../middleware/authorize');
const validate = require('../../middleware/validate');
const { ROLES } = require('../../utils/constants');
const controller = require('./expense.controller');
const {
  createExpenseSchema,
  updateExpenseSchema,
  idParamSchema,
  summaryQuerySchema,
} = require('./expense.validator');

const router = express.Router();

// All expense routes — Admin only
router.use(protect);
router.use(authorize(ROLES.ADMIN));

// Aggregate / summary routes (before /:id to avoid conflict)
router.get('/summary', validate(summaryQuerySchema), controller.getExpenseSummary);
router.get('/financial-overview', validate(summaryQuerySchema), controller.getFinancialOverview);

// CRUD
router.post('/', validate(createExpenseSchema), controller.createExpense);
router.get('/', controller.getExpenses);
router.get('/:id', validate(idParamSchema), controller.getExpenseById);
router.put('/:id', validate(idParamSchema), controller.updateExpense);
router.patch('/:id/cancel', validate(idParamSchema), controller.cancelExpense);

module.exports = router;
