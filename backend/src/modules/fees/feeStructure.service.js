const FeeStructure = require('./feeStructure.model');
const ApiError = require('../../utils/ApiError');

/**
 * Create or update a fee structure for a class.
 */
const upsertFeeStructure = async (data, adminId) => {
  const { classId, academicYear, ...fees } = data;

  const existing = await FeeStructure.findOne({ class: classId, academicYear });
  if (existing) {
    Object.assign(existing, fees);
    existing.createdBy = adminId;
    await existing.save();
    return { feeStructure: existing };
  }

  const structure = await FeeStructure.create({
    class: classId,
    academicYear,
    ...fees,
    createdBy: adminId,
  });

  return { feeStructure: structure };
};

/**
 * Get all fee structures, optionally filtered by class.
 */
const getFeeStructures = async ({ classId, academicYear } = {}) => {
  const query = {};
  if (classId) query.class = classId;
  if (academicYear) query.academicYear = academicYear;

  const structures = await FeeStructure.find(query)
    .populate('class', 'name code')
    .populate('createdBy', 'fullName')
    .sort({ createdAt: -1 });

  return { feeStructures: structures };
};

/**
 * Get a single fee structure by ID.
 */
const getFeeStructureById = async (id) => {
  const structure = await FeeStructure.findById(id)
    .populate('class', 'name code')
    .populate('createdBy', 'fullName');

  if (!structure) throw ApiError.notFound('Fee structure not found.');
  return { feeStructure: structure };
};

/**
 * Get the active fee structure for a specific class.
 */
const getFeeStructureByClass = async (classId, academicYear) => {
  const query = { class: classId, isActive: true };
  if (academicYear) query.academicYear = academicYear;

  const structure = await FeeStructure.findOne(query).populate('class', 'name code');
  if (!structure) throw ApiError.notFound('No active fee structure found for this class.');
  return { feeStructure: structure };
};

/**
 * Delete a fee structure (soft-delete via isActive flag).
 */
const deleteFeeStructure = async (id) => {
  const structure = await FeeStructure.findById(id);
  if (!structure) throw ApiError.notFound('Fee structure not found.');
  structure.isActive = false;
  await structure.save();
  return { message: 'Fee structure deactivated.' };
};

module.exports = {
  upsertFeeStructure,
  getFeeStructures,
  getFeeStructureById,
  getFeeStructureByClass,
  deleteFeeStructure,
};
