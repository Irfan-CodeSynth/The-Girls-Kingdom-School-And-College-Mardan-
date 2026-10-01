const materialService = require('./material.service');
const ApiResponse = require('../../utils/ApiResponse');
const { ROLES } = require('../../utils/constants');

const createMaterial = async (req, res, next) => {
  try {
    const { id: classId } = req.params;
    const userId = req.user.id || req.user._id;
    const role = req.user.role;
    const material = await materialService.createMaterial(classId, req.body, userId, role);
    res.status(201).json(ApiResponse.success(material, 'Material created successfully.'));
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
    res.json(ApiResponse.success(result));
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
    res.json(ApiResponse.success(updated, 'Material updated successfully.'));
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
    res.json(ApiResponse.success(result, 'Material deleted successfully.'));
  } catch (err) {
    next(err);
  }
};

module.exports = { createMaterial, getClassMaterials, updateMaterial, deleteMaterial };
