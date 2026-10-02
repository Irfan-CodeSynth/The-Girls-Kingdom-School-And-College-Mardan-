const feeStructureService = require('./feeStructure.service');
const feeChallanService = require('./feeChallan.service');
const ApiResponse = require('../../utils/ApiResponse');

// Helper: extract user ID regardless of whether middleware sets id or _id
const getUserId = (req) => req.user.id || req.user._id;

// ─── Fee Structure Controllers ─────────────────────────────────

const upsertFeeStructure = async (req, res) => {
  const result = await feeStructureService.upsertFeeStructure(req.body, getUserId(req));
  return ApiResponse.success(res, result, 'Fee structure saved successfully', 200);
};

const getFeeStructures = async (req, res) => {
  const result = await feeStructureService.getFeeStructures(req.query);
  return ApiResponse.success(res, result, 'Fee structures retrieved successfully');
};

const getFeeStructureById = async (req, res) => {
  const result = await feeStructureService.getFeeStructureById(req.params.id);
  return ApiResponse.success(res, result, 'Fee structure retrieved');
};

const getFeeStructureByClass = async (req, res) => {
  const result = await feeStructureService.getFeeStructureByClass(
    req.params.classId,
    req.query.academicYear
  );
  return ApiResponse.success(res, result, 'Fee structure retrieved');
};

const deleteFeeStructure = async (req, res) => {
  const result = await feeStructureService.deleteFeeStructure(req.params.id);
  return ApiResponse.success(res, result, result.message);
};

// ─── Challan Controllers ───────────────────────────────────────

const generateChallans = async (req, res) => {
  const result = await feeChallanService.generateMonthlyChallans(
    req.body.classId,
    req.body.billingMonth,
    req.body.feeStructureId,
    getUserId(req)
  );
  return ApiResponse.success(res, result, result.message, 201);
};

const getChallans = async (req, res) => {
  const result = await feeChallanService.getChallans(req.query);
  return ApiResponse.success(res, result, 'Challans retrieved successfully');
};

const getChallanById = async (req, res) => {
  const result = await feeChallanService.getChallanById(req.params.id);
  return ApiResponse.success(res, result, 'Challan retrieved');
};

const getMyChallan = async (req, res) => {
  const result = await feeChallanService.getMyChallan(getUserId(req));
  return ApiResponse.success(res, result, 'Your challans retrieved');
};

const recordPayment = async (req, res) => {
  const result = await feeChallanService.recordPayment(
    req.params.id,
    req.body,
    getUserId(req)
  );
  return ApiResponse.success(res, result, 'Payment recorded successfully');
};

const getFeeSummary = async (req, res) => {
  const result = await feeChallanService.getFeeSummary(req.query);
  return ApiResponse.success(res, result, 'Fee summary retrieved');
};

const cancelChallan = async (req, res) => {
  const result = await feeChallanService.cancelChallan(req.params.id, getUserId(req));
  return ApiResponse.success(res, result, 'Challan cancelled');
};

module.exports = {
  upsertFeeStructure,
  getFeeStructures,
  getFeeStructureById,
  getFeeStructureByClass,
  deleteFeeStructure,
  generateChallans,
  getChallans,
  getChallanById,
  getMyChallan,
  recordPayment,
  getFeeSummary,
  cancelChallan,
};
