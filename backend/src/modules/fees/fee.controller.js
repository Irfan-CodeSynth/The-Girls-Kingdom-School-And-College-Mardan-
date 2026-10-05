const feeStructureService = require('./feeStructure.service');
const feeChallanService = require('./feeChallan.service');
const ApiResponse = require('../../utils/ApiResponse');

// Helper: extract user ID regardless of whether middleware sets id or _id
const getUserId = (req) => req.user.id || req.user._id;

// ─── Fee Structure Controllers ─────────────────────────────────

const upsertFeeStructure = async (req, res, next) => {
  try {
    const result = await feeStructureService.upsertFeeStructure(req.body, getUserId(req));
    return ApiResponse.success(res, result, 'Fee structure saved successfully', 200);
  } catch (err) { next(err); }
};

const getFeeStructures = async (req, res, next) => {
  try {
    const result = await feeStructureService.getFeeStructures(req.query);
    return ApiResponse.success(res, result, 'Fee structures retrieved successfully');
  } catch (err) { next(err); }
};

const getFeeStructureById = async (req, res, next) => {
  try {
    const result = await feeStructureService.getFeeStructureById(req.params.id);
    return ApiResponse.success(res, result, 'Fee structure retrieved');
  } catch (err) { next(err); }
};

const getFeeStructureByClass = async (req, res, next) => {
  try {
    const result = await feeStructureService.getFeeStructureByClass(
      req.params.classId,
      req.query.academicYear
    );
    return ApiResponse.success(res, result, 'Fee structure retrieved');
  } catch (err) { next(err); }
};

const deleteFeeStructure = async (req, res, next) => {
  try {
    const result = await feeStructureService.deleteFeeStructure(req.params.id);
    return ApiResponse.success(res, result, result.message);
  } catch (err) { next(err); }
};

// ─── Challan Controllers ───────────────────────────────────────

const generateChallans = async (req, res, next) => {
  try {
    const result = await feeChallanService.generateMonthlyChallans(
      req.body.classId,
      req.body.billingMonth,
      req.body.feeStructureId,
      getUserId(req)
    );
    return ApiResponse.success(res, result, result.message, 201);
  } catch (err) { next(err); }
};

const getChallans = async (req, res, next) => {
  try {
    const result = await feeChallanService.getChallans(req.query);
    return ApiResponse.success(res, result, 'Challans retrieved successfully');
  } catch (err) { next(err); }
};

const getChallanById = async (req, res, next) => {
  try {
    const result = await feeChallanService.getChallanById(req.params.id, getUserId(req), req.user.role);
    return ApiResponse.success(res, result, 'Challan retrieved');
  } catch (err) { next(err); }
};

const getMyChallan = async (req, res, next) => {
  try {
    const result = await feeChallanService.getMyChallan(getUserId(req));
    return ApiResponse.success(res, result, 'Your challans retrieved');
  } catch (err) { next(err); }
};

const recordPayment = async (req, res, next) => {
  try {
    const result = await feeChallanService.recordPayment(
      req.params.id,
      req.body,
      getUserId(req)
    );
    return ApiResponse.success(res, result, 'Payment recorded successfully');
  } catch (err) { next(err); }
};

const getFeeSummary = async (req, res, next) => {
  try {
    const result = await feeChallanService.getFeeSummary(req.query);
    return ApiResponse.success(res, result, 'Fee summary retrieved');
  } catch (err) { next(err); }
};

const cancelChallan = async (req, res, next) => {
  try {
    const result = await feeChallanService.cancelChallan(req.params.id, getUserId(req));
    return ApiResponse.success(res, result, 'Challan cancelled');
  } catch (err) { next(err); }
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
