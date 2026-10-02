const mongoose = require('mongoose');

/**
 * FeeStructure — defines the monthly fee template for a class.
 * Only one active structure per class at a time.
 */
const feeStructureSchema = new mongoose.Schema(
  {
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },
    academicYear: {
      type: String,
      required: true,
      trim: true,
    },
    tuitionFee: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    admissionFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    examFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    libraryFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    transportFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    sportsFund: {
      type: Number,
      default: 0,
      min: 0,
    },
    computerFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    lateSurchargePerDay: {
      type: Number,
      default: 0,
      min: 0,
    },
    dueDayOfMonth: {
      type: Number,
      default: 10,
      min: 1,
      max: 28,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// Only one active structure per class per academic year
feeStructureSchema.index({ class: 1, academicYear: 1 }, { unique: true });
feeStructureSchema.index({ class: 1, isActive: 1 });

// Virtual: total monthly fee
feeStructureSchema.virtual('totalMonthlyFee').get(function () {
  return (
    this.tuitionFee +
    this.examFee +
    this.libraryFee +
    this.transportFee +
    this.sportsFund +
    this.computerFee
  );
});

feeStructureSchema.set('toJSON', { virtuals: true });
feeStructureSchema.set('toObject', { virtuals: true });

const FeeStructure =
  mongoose.models.FeeStructure || mongoose.model('FeeStructure', feeStructureSchema);

module.exports = FeeStructure;
