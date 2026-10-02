const mongoose = require('mongoose');

/**
 * SalaryStructure — defines the recurring compensation package
 * assigned to each teacher/staff member. One active structure per teacher.
 */
const salaryStructureSchema = new mongoose.Schema(
  {
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    designation: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      required: true,
      trim: true,
    },
    // ─── Earnings ───────────────────────────────────────────────
    basicSalary: {
      type: Number,
      required: true,
      min: 0,
    },
    houseRentAllowance: {
      type: Number,
      default: 0,
      min: 0,
    },
    medicalAllowance: {
      type: Number,
      default: 0,
      min: 0,
    },
    transportAllowance: {
      type: Number,
      default: 0,
      min: 0,
    },
    specialAllowance: {
      type: Number,
      default: 0,
      min: 0,
    },
    // ─── Standard Deductions ────────────────────────────────────
    taxDeduction: {
      type: Number,
      default: 0,
      min: 0,
    },
    providentFund: {
      type: Number,
      default: 0,
      min: 0,
    },
    eobiDeduction: {
      type: Number,
      default: 0,
      min: 0,
    },
    // ─── Bank Details for Disbursement ──────────────────────────
    bankName: {
      type: String,
      default: '',
      trim: true,
    },
    accountTitle: {
      type: String,
      default: '',
      trim: true,
    },
    accountNumber: {
      type: String,
      default: '',
      trim: true,
    },
    iban: {
      type: String,
      default: '',
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

salaryStructureSchema.index({ teacher: 1, isActive: 1 });

// Virtuals for computed totals
salaryStructureSchema.virtual('grossSalary').get(function () {
  return (
    this.basicSalary +
    this.houseRentAllowance +
    this.medicalAllowance +
    this.transportAllowance +
    this.specialAllowance
  );
});

salaryStructureSchema.virtual('totalDeductions').get(function () {
  return this.taxDeduction + this.providentFund + this.eobiDeduction;
});

salaryStructureSchema.virtual('netSalary').get(function () {
  return this.grossSalary - this.totalDeductions;
});

salaryStructureSchema.set('toJSON', { virtuals: true });
salaryStructureSchema.set('toObject', { virtuals: true });

const SalaryStructure =
  mongoose.models.SalaryStructure ||
  mongoose.model('SalaryStructure', salaryStructureSchema);

module.exports = SalaryStructure;
