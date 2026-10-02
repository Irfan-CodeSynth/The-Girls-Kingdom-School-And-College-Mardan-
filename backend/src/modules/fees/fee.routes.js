const express = require('express');
const router = express.Router();
const feeController = require('./fee.controller');
const protect = require('../../middleware/auth');
const authorize = require('../../middleware/authorize');
const validate = require('../../middleware/validate');
const { ROLES } = require('../../utils/constants');
const {
  upsertFeeStructureSchema,
  generateChallansSchema,
  recordPaymentSchema,
} = require('./fee.validator');

// All fee routes require authentication
router.use(protect);

// ─── Student-accessible routes ─────────────────────────────────
// Students can view their own challans
router.get(
  '/challans/my',
  authorize(ROLES.STUDENT),
  feeController.getMyChallan
);

router.get(
  '/challans/:id',
  authorize(ROLES.STUDENT, ROLES.ADMIN),
  feeController.getChallanById
);

// ─── Admin-only routes ─────────────────────────────────────────
router.use(authorize(ROLES.ADMIN));

// Fee Structure management
router.post('/structures', validate(upsertFeeStructureSchema), feeController.upsertFeeStructure);
router.get('/structures', feeController.getFeeStructures);
router.get('/structures/class/:classId', feeController.getFeeStructureByClass);
router.get('/structures/:id', feeController.getFeeStructureById);
router.delete('/structures/:id', feeController.deleteFeeStructure);

// Challan management
router.post(
  '/challans/generate',
  validate(generateChallansSchema),
  feeController.generateChallans
);
router.get('/challans', feeController.getChallans);
router.post(
  '/challans/:id/pay',
  validate(recordPaymentSchema),
  feeController.recordPayment
);
router.post('/challans/:id/cancel', feeController.cancelChallan);

// Summary / analytics
router.get('/summary', feeController.getFeeSummary);

module.exports = router;
