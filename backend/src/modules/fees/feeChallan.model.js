const mongoose = require('mongoose');

const CHALLAN_STATUS = {
  UNPAID: 'unpaid',
  PAID: 'paid',
  PARTIAL: 'partial',
  OVERDUE: 'overdue',
  CANCELLED: 'cancelled',
};

/**
 * FeeChallan — one bank challan slip per student per billing month.
 * Generated in bulk by admin; paid by students at the bank.
 */
const feeChallanSchema = new mongoose.Schema(
  {
    challanNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },
    feeStructure: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FeeStructure',
      required: true,
    },
    billingMonth: {
      // Format: "YYYY-MM" e.g. "2026-10"
      type: String,
      required: true,
      match: [/^\d{4}-\d{2}$/, 'billingMonth must be in YYYY-MM format'],
    },
    dueDate: {
      type: Date,
      required: true,
    },
    // Snapshot of fee amounts at time of generation (immutable record)
    tuitionFee: { type: Number, default: 0 },
    admissionFee: { type: Number, default: 0 },
    examFee: { type: Number, default: 0 },
    libraryFee: { type: Number, default: 0 },
    transportFee: { type: Number, default: 0 },
    sportsFund: { type: Number, default: 0 },
    computerFee: { type: Number, default: 0 },
    lateSurcharge: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true, min: 0 },

    // Payment info
    paidAmount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: Object.values(CHALLAN_STATUS),
      default: CHALLAN_STATUS.UNPAID,
    },
    paidAt: { type: Date },
    paymentMethod: {
      type: String,
      enum: ['cash', 'bank_transfer', 'online', 'cheque'],
    },
    paymentReference: { type: String, trim: true },
    remarks: { type: String, maxlength: 500 },
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    markedPaidBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// One challan per student per month
feeChallanSchema.index({ student: 1, billingMonth: 1 }, { unique: true });
feeChallanSchema.index({ class: 1, billingMonth: 1 });
feeChallanSchema.index({ status: 1, dueDate: 1 });
feeChallanSchema.index({ student: 1, status: 1 });

const FeeChallan =
  mongoose.models.FeeChallan || mongoose.model('FeeChallan', feeChallanSchema);

module.exports = { FeeChallan, CHALLAN_STATUS };
