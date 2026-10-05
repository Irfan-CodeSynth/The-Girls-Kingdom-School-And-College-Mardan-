const salaryService = require('./salary.service');
const ApiResponse = require('../../utils/ApiResponse');

const getUserId = (req) => req.user.id || req.user._id;

// ─── Structure Controllers ───────────────────────────────────────
const upsertSalaryStructure = async (req, res, next) => {
  try {
    const result = await salaryService.upsertSalaryStructure(req.body, getUserId(req));
    return ApiResponse.success(res, result, 'Salary structure saved successfully');
  } catch (err) { next(err); }
};

const getSalaryStructures = async (req, res, next) => {
  try {
    const result = await salaryService.getSalaryStructures(req.query);
    return ApiResponse.success(res, result, 'Salary structures retrieved');
  } catch (err) { next(err); }
};

const getSalaryStructureByTeacher = async (req, res, next) => {
  try {
    const result = await salaryService.getSalaryStructureByTeacher(
      req.params.teacherId,
      getUserId(req),
      req.user.role
    );
    return ApiResponse.success(res, result, 'Salary structure retrieved');
  } catch (err) { next(err); }
};

const getMySalaryStructure = async (req, res, next) => {
  try {
    const result = await salaryService.getSalaryStructureByTeacher(
      getUserId(req),
      getUserId(req),
      req.user.role
    );
    return ApiResponse.success(res, result, 'Your salary structure retrieved');
  } catch (err) { next(err); }
};

const deleteSalaryStructure = async (req, res, next) => {
  try {
    const result = await salaryService.deleteSalaryStructure(req.params.id);
    return ApiResponse.success(res, result, result.message);
  } catch (err) { next(err); }
};

// ─── Slip Controllers ────────────────────────────────────────────
const generatePayroll = async (req, res, next) => {
  try {
    const result = await salaryService.generateMonthlyPayroll(
      req.body.billingMonth,
      getUserId(req),
      { teacherIds: req.body.teacherIds }
    );
    return ApiResponse.success(res, result, result.message, 201);
  } catch (err) { next(err); }
};

const getSlips = async (req, res, next) => {
  try {
    const result = await salaryService.getSlips(req.query);
    return ApiResponse.success(res, result, 'Salary slips retrieved');
  } catch (err) { next(err); }
};

const getSlipById = async (req, res, next) => {
  try {
    const result = await salaryService.getSlipById(
      req.params.id,
      getUserId(req),
      req.user.role
    );
    return ApiResponse.success(res, result, 'Salary slip retrieved');
  } catch (err) { next(err); }
};

const getMySlips = async (req, res, next) => {
  try {
    const result = await salaryService.getMySlips(getUserId(req));
    return ApiResponse.success(res, result, 'Your salary slips retrieved');
  } catch (err) { next(err); }
};

const adjustSlip = async (req, res, next) => {
  try {
    const result = await salaryService.adjustSlip(req.params.id, req.body, getUserId(req));
    return ApiResponse.success(res, result, 'Salary slip adjusted');
  } catch (err) { next(err); }
};

const approveSlip = async (req, res, next) => {
  try {
    const result = await salaryService.approveSlip(req.params.id, getUserId(req));
    return ApiResponse.success(res, result, 'Salary slip approved');
  } catch (err) { next(err); }
};

const disburseSlip = async (req, res, next) => {
  try {
    const result = await salaryService.disburseSlip(req.params.id, req.body, getUserId(req));
    return ApiResponse.success(res, result, 'Salary disbursed successfully');
  } catch (err) { next(err); }
};

const bulkDisburse = async (req, res, next) => {
  try {
    const result = await salaryService.bulkDisburse(
      req.body.billingMonth,
      req.body,
      getUserId(req)
    );
    return ApiResponse.success(res, result, result.message);
  } catch (err) { next(err); }
};

const cancelSlip = async (req, res, next) => {
  try {
    const result = await salaryService.cancelSlip(req.params.id, getUserId(req));
    return ApiResponse.success(res, result, 'Salary slip cancelled');
  } catch (err) { next(err); }
};

const getPayrollSummary = async (req, res, next) => {
  try {
    const result = await salaryService.getPayrollSummary(req.query);
    return ApiResponse.success(res, result, 'Payroll summary retrieved');
  } catch (err) { next(err); }
};

const getBankSheet = async (req, res, next) => {
  try {
    const result = await salaryService.getBankSheet(req.query.billingMonth);
    return ApiResponse.success(res, result, 'Bank sheet retrieved');
  } catch (err) { next(err); }
};

module.exports = {
  upsertSalaryStructure,
  getSalaryStructures,
  getSalaryStructureByTeacher,
  getMySalaryStructure,
  deleteSalaryStructure,
  generatePayroll,
  getSlips,
  getSlipById,
  getMySlips,
  adjustSlip,
  approveSlip,
  disburseSlip,
  bulkDisburse,
  cancelSlip,
  getPayrollSummary,
  getBankSheet,
};
