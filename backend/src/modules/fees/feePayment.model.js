const mongoose = require('mongoose');

/**
 * FeePayment — immutable audit log of every payment event.
 * Each time a challan is paid (or partially paid), a record is created here.
 */
const feePaymentSchema = new mongoose.Schema(
  {
    challan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FeeChallan',
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'bank_transfer', 'online', 'cheque'],
      required: true,
    },
    paymentReference: {
      type: String,
      trim: true,
    },
    receiptNumber: {
      type: String,
      unique: true,
      trim: true,
    },
    paidAt: {
      type: Date,
      default: Date.now,
    },
    remarks: {
      type: String,
      maxlength: 500,
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

feePaymentSchema.index({ challan: 1 });
feePaymentSchema.index({ student: 1, paidAt: -1 });

const FeePayment =
  mongoose.models.FeePayment || mongoose.model('FeePayment', feePaymentSchema);

module.exports = FeePayment;
