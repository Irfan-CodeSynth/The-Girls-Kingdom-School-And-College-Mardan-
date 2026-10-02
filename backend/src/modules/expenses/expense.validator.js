const { z } = require('zod');
const { EXPENSE_CATEGORY, PAYMENT_METHOD, EXPENSE_STATUS } = require('./expense.model');

const categoryEnum = z.enum(Object.values(EXPENSE_CATEGORY));
const paymentMethodEnum = z.enum(Object.values(PAYMENT_METHOD));
const statusEnum = z.enum(Object.values(EXPENSE_STATUS));

const createExpenseSchema = {
  body: z.object({
    title: z.string().min(2).max(200),
    category: categoryEnum,
    amount: z.number({ coerce: true }).min(1),
    expenseDate: z.string().min(1),
    billingMonth: z.string().regex(/^\d{4}-\d{2}$/, 'billingMonth must be YYYY-MM'),
    paymentMethod: paymentMethodEnum,
    paidTo: z.string().min(2).max(200),
    billReference: z.string().max(100).optional().default(''),
    status: statusEnum.optional().default('paid'),
    remarks: z.string().max(500).optional().default(''),
  }),
};

const updateExpenseSchema = {
  body: z.object({
    title: z.string().min(2).max(200).optional(),
    category: categoryEnum.optional(),
    amount: z.number({ coerce: true }).min(1).optional(),
    expenseDate: z.string().optional(),
    billingMonth: z.string().regex(/^\d{4}-\d{2}$/).optional(),
    paymentMethod: paymentMethodEnum.optional(),
    paidTo: z.string().min(2).max(200).optional(),
    billReference: z.string().max(100).optional(),
    status: statusEnum.optional(),
    remarks: z.string().max(500).optional(),
  }),
};

const idParamSchema = {
  params: z.object({
    id: z.string().min(1),
  }),
};

const summaryQuerySchema = {
  query: z.object({
    billingMonth: z.string().regex(/^\d{4}-\d{2}$/).optional(),
  }),
};

module.exports = {
  createExpenseSchema,
  updateExpenseSchema,
  idParamSchema,
  summaryQuerySchema,
};
