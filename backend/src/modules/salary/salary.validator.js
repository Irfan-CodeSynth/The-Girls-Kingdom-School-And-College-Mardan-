const { z } = require('zod');

const upsertSalaryStructureSchema = {
  body: z.object({
    teacherId: z.string().min(1, 'teacherId is required'),
    designation: z.string().min(1, 'designation is required'),
    department: z.string().min(1, 'department is required'),
    basicSalary: z.number().min(0),
    houseRentAllowance: z.number().min(0).default(0),
    medicalAllowance: z.number().min(0).default(0),
    transportAllowance: z.number().min(0).default(0),
    specialAllowance: z.number().min(0).default(0),
    taxDeduction: z.number().min(0).default(0),
    providentFund: z.number().min(0).default(0),
    eobiDeduction: z.number().min(0).default(0),
    bankName: z.string().default(''),
    accountTitle: z.string().default(''),
    accountNumber: z.string().default(''),
    iban: z.string().default(''),
  }),
};

const generatePayrollSchema = {
  body: z.object({
    billingMonth: z
      .string()
      .regex(/^\d{4}-\d{2}$/, 'billingMonth must be YYYY-MM format'),
    teacherIds: z.array(z.string()).optional(),
  }),
};

const adjustSlipSchema = {
  body: z.object({
    bonus: z.number().min(0).optional(),
    advanceDeduction: z.number().min(0).optional(),
    unpaidLeaves: z.number().min(0).optional(),
    totalWorkingDays: z.number().min(1).max(31).optional(),
    paidDays: z.number().min(0).optional(),
    remarks: z.string().max(500).optional(),
  }),
};

const disburseSlipSchema = {
  body: z.object({
    paymentMethod: z.enum(['bank_transfer', 'cash', 'cheque']),
    paymentReference: z.string().optional(),
    remarks: z.string().max(500).optional(),
  }),
};

const bulkDisburseSchema = {
  body: z.object({
    billingMonth: z.string().regex(/^\d{4}-\d{2}$/),
    paymentMethod: z.enum(['bank_transfer', 'cash', 'cheque']).default('bank_transfer'),
    paymentReference: z.string().optional(),
  }),
};

module.exports = {
  upsertSalaryStructureSchema,
  generatePayrollSchema,
  adjustSlipSchema,
  disburseSlipSchema,
  bulkDisburseSchema,
};
