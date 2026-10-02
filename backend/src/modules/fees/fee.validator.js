const { z } = require('zod');

const upsertFeeStructureSchema = {
  body: z.object({
    classId: z.string().min(1, 'classId is required'),
    academicYear: z.string().min(4, 'academicYear is required'),
    tuitionFee: z.number().min(0).default(0),
    admissionFee: z.number().min(0).default(0),
    examFee: z.number().min(0).default(0),
    libraryFee: z.number().min(0).default(0),
    transportFee: z.number().min(0).default(0),
    sportsFund: z.number().min(0).default(0),
    computerFee: z.number().min(0).default(0),
    lateSurchargePerDay: z.number().min(0).default(0),
    dueDayOfMonth: z.number().min(1).max(28).default(10),
  }),
};

const generateChallansSchema = {
  body: z.object({
    classId: z.string().min(1, 'classId is required'),
    billingMonth: z
      .string()
      .regex(/^\d{4}-\d{2}$/, 'billingMonth must be in YYYY-MM format'),
    feeStructureId: z.string().min(1, 'feeStructureId is required'),
  }),
};

const recordPaymentSchema = {
  body: z.object({
    amount: z.number().positive('Amount must be positive'),
    paymentMethod: z.enum(['cash', 'bank_transfer', 'online', 'cheque']),
    paymentReference: z.string().optional(),
    remarks: z.string().max(500).optional(),
  }),
};

module.exports = {
  upsertFeeStructureSchema,
  generateChallansSchema,
  recordPaymentSchema,
};
