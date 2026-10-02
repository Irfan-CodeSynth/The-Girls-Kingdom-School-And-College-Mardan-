const mongoose = require('mongoose');

const SLIP_STATUS = {
  DRAFT: 'draft',
  APPROVED: 'approved',
  PAID: 'paid',
  CANCELLED: 'cancelled',
};

/**
 * SalarySlip — immutable monthly payroll record per teacher.
 * Generated in bulk; stores a snapshot of all calculations
 * at the time of generation so edits to structures don't affect history.
 */
const salarySlipSchema = new mongoose.Schema(
  {
    slipNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    salaryStructure: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SalaryStructure',
      required: true,
    },
    billingMonth: {
      type: String,
      required: true,
      match: [/^\d{4}-\d{2}$/, 'billingMonth must be in YYYY-MM format'],
    },
    // ─── Attendance Meta ─────────────────────────────────────────
    totalWorkingDays: {
      type: Number,
      default: 30,
      min: 1,
    },
    paidDays: {
      type: Number,
      default: 30,
      min: 0,
    },
    unpaidLeaves: {
      type: Number,
      default: 0,
      min: 0,
    },
    // ─── Earnings Snapshot ───────────────────────────────────────
    basicSalary: { type: Number, default: 0 },
    houseRentAllowance: { type: Number, default: 0 },
    medicalAllowance: { type: Number, default: 0 },
    transportAllowance: { type: Number, default: 0 },
    specialAllowance: { type: Number, default: 0 },
    bonus: { type: Number, default: 0 },
    grossSalary: { type: Number, required: true },
    // ─── Deductions Snapshot ─────────────────────────────────────
    taxDeduction: { type: Number, default: 0 },
    providentFund: { type: Number, default: 0 },
    eobiDeduction: { type: Number, default: 0 },
    leaveDeductions: { type: Number, default: 0 },
    advanceDeduction: { type: Number, default: 0 },
    totalDeductions: { type: Number, required: true },
    // ─── Net Pay ─────────────────────────────────────────────────
    netSalary: { type: Number, required: true },
    // ─── Bank Details Snapshot ───────────────────────────────────
    bankName: { type: String, default: '' },
    accountTitle: { type: String, default: '' },
    accountNumber: { type: String, default: '' },
    iban: { type: String, default: '' },
    // ─── Payment Tracking ────────────────────────────────────────
    status: {
      type: String,
      enum: Object.values(SLIP_STATUS),
      default: SLIP_STATUS.DRAFT,
    },
    paidAt: { type: Date },
    paymentMethod: {
      type: String,
      enum: ['bank_transfer', 'cash', 'cheque'],
    },
    paymentReference: { type: String, trim: true },
    remarks: { type: String, maxlength: 500 },
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    disbursedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// One slip per teacher per month
salarySlipSchema.index({ teacher: 1, billingMonth: 1 }, { unique: true });
salarySlipSchema.index({ billingMonth: 1, status: 1 });
salarySlipSchema.index({ teacher: 1, status: 1 });

const SalarySlip =
  mongoose.models.SalarySlip || mongoose.model('SalarySlip', salarySlipSchema);

module.exports = { SalarySlip, SLIP_STATUS };
