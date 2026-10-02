const mongoose = require('mongoose');

const EXPENSE_CATEGORY = {
  UTILITIES: 'utilities',
  MAINTENANCE: 'maintenance',
  SUPPLIES: 'supplies',
  TRANSPORT: 'transport',
  CAMPUS_RENT: 'campus_rent',
  EVENTS_SPORTS: 'events_sports',
  LAB_LIBRARY: 'lab_library',
  PETTY_CASH: 'petty_cash',
  OTHER: 'other',
};

const PAYMENT_METHOD = {
  CASH: 'cash',
  BANK_TRANSFER: 'bank_transfer',
  CHEQUE: 'cheque',
};

const EXPENSE_STATUS = {
  PAID: 'paid',
  PENDING_APPROVAL: 'pending_approval',
  CANCELLED: 'cancelled',
};

const expenseSchema = new mongoose.Schema(
  {
    voucherNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: Object.values(EXPENSE_CATEGORY),
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    expenseDate: {
      type: Date,
      required: true,
    },
    billingMonth: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}$/,
    },
    paymentMethod: {
      type: String,
      enum: Object.values(PAYMENT_METHOD),
      required: true,
    },
    paidTo: {
      type: String,
      required: true,
      trim: true,
    },
    billReference: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: Object.values(EXPENSE_STATUS),
      default: EXPENSE_STATUS.PAID,
    },
    remarks: {
      type: String,
      trim: true,
      default: '',
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for common queries
expenseSchema.index({ billingMonth: 1 });
expenseSchema.index({ category: 1 });
expenseSchema.index({ status: 1 });
expenseSchema.index({ expenseDate: -1 });
expenseSchema.index({ billingMonth: 1, category: 1 });

module.exports = {
  Expense: mongoose.models.Expense || mongoose.model('Expense', expenseSchema),
  EXPENSE_CATEGORY,
  PAYMENT_METHOD,
  EXPENSE_STATUS,
};
