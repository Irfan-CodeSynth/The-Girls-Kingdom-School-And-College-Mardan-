const materialService = require('./material.service');
const ApiResponse = require('../../utils/ApiResponse');
const { ROLES } = require('../../utils/constants');

const createMaterial = async (req, res, next) => {
  try {
    const { id: classId } = req.params;
    const userId = req.user.id || req.user._id;
    const role = req.user.role;
    const material = await materialService.createMaterial(classId, req.body, userId, role);
    return ApiResponse.created(res, { material }, 'Material created successfully.');
  } catch (err) {
    next(err);
  }
};

const getClassMaterials = async (req, res, next) => {
  try {
    const { id: classId } = req.params;
    const userId = req.user.id || req.user._id;
    const role = req.user.role;
    const result = await materialService.getClassMaterials(classId, userId, role, req.query);
    return ApiResponse.success(res, result, 'Materials retrieved successfully.');
  } catch (err) {
    next(err);
  }
};

const updateMaterial = async (req, res, next) => {
  try {
    const { id: classId, materialId } = req.params;
    const userId = req.user.id || req.user._id;
    const role = req.user.role;
    const updated = await materialService.updateMaterial(classId, materialId, req.body, userId, role);
    return ApiResponse.success(res, { material: updated }, 'Material updated successfully.');
  } catch (err) {
    next(err);
  }
};

const deleteMaterial = async (req, res, next) => {
  try {
    const { id: classId, materialId } = req.params;
    const userId = req.user.id || req.user._id;
    const role = req.user.role;
    const result = await materialService.deleteMaterial(classId, materialId, userId, role);
    return ApiResponse.success(res, result, 'Material deleted successfully.');
  } catch (err) {
    next(err);
  }
};

module.exports = { createMaterial, getClassMaterials, updateMaterial, deleteMaterial };
