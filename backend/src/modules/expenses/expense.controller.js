const expenseService = require('./expense.service');
const ApiResponse = require('../../utils/ApiResponse');
const ApiError = require('../../utils/ApiError');

const getUserId = (req) => req.user.id || req.user._id;

// POST /api/expenses
const createExpense = async (req, res, next) => {
  try {
    const expense = await expenseService.createExpense(req.body, getUserId(req));
    return ApiResponse.success(res, expense, 'Expense recorded successfully', 201);
  } catch (err) {
    return next(ApiError.badRequest(err.message));
  }
};

// GET /api/expenses
const getExpenses = async (req, res, next) => {
  try {
    const { category, billingMonth, paymentMethod, status, search, page, limit } = req.query;
    const result = await expenseService.getExpenses({
      category,
      billingMonth,
      paymentMethod,
      status,
      search,
      page,
      limit,
    });
    return ApiResponse.success(res, result, 'Expenses retrieved successfully');
  } catch (err) {
    return next(err);
  }
};

// GET /api/expenses/:id
const getExpenseById = async (req, res, next) => {
  try {
    const expense = await expenseService.getExpenseById(req.params.id);
    if (!expense) return next(ApiError.notFound('Expense not found'));
    return ApiResponse.success(res, expense, 'Expense retrieved successfully');
  } catch (err) {
    return next(err);
  }
};

// PUT /api/expenses/:id
const updateExpense = async (req, res, next) => {
  try {
    const expense = await expenseService.updateExpense(req.params.id, req.body);
    if (!expense) return next(ApiError.notFound('Expense not found'));
    return ApiResponse.success(res, expense, 'Expense updated successfully');
  } catch (err) {
    return next(ApiError.badRequest(err.message));
  }
};

// DELETE /api/expenses/:id/cancel
const cancelExpense = async (req, res, next) => {
  try {
    const expense = await expenseService.cancelExpense(req.params.id, getUserId(req));
    if (!expense) return next(ApiError.notFound('Expense not found'));
    return ApiResponse.success(res, expense, 'Expense cancelled successfully');
  } catch (err) {
    return next(ApiError.badRequest(err.message));
  }
};

// GET /api/expenses/summary
const getExpenseSummary = async (req, res, next) => {
  try {
    const { billingMonth } = req.query;
    const summary = await expenseService.getExpenseSummary({ billingMonth });
    return ApiResponse.success(res, summary, 'Expense summary retrieved successfully');
  } catch (err) {
    return next(err);
  }
};

// GET /api/expenses/financial-overview
const getFinancialOverview = async (req, res, next) => {
  try {
    const { billingMonth } = req.query;
    const overview = await expenseService.getFinancialOverview({ billingMonth });
    return ApiResponse.success(res, overview, 'Financial overview retrieved successfully');
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  cancelExpense,
  getExpenseSummary,
  getFinancialOverview,
};
