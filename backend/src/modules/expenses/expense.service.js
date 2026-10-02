const { Expense, EXPENSE_CATEGORY, EXPENSE_STATUS } = require('./expense.model');
const { SalarySlip } = require('../salary/salarySlip.model');
const FeePayment = require('../fees/feePayment.model');

// ─── Helper: Amount in Words ─────────────────────────────────────────────────
const ones = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen',
];
const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function numberToWords(num) {
  if (num === 0) return 'Zero';
  if (num < 0) return 'Minus ' + numberToWords(-num);
  if (num < 20) return ones[num];
  if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? ' ' + ones[num % 10] : '');
  if (num < 1000) return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 ? ' ' + numberToWords(num % 100) : '');
  if (num < 100000) return numberToWords(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 ? ' ' + numberToWords(num % 1000) : '');
  if (num < 10000000) return numberToWords(Math.floor(num / 100000)) + ' Lakh' + (num % 100000 ? ' ' + numberToWords(num % 100000) : '');
  return numberToWords(Math.floor(num / 10000000)) + ' Crore' + (num % 10000000 ? ' ' + numberToWords(num % 10000000) : '');
}

// ─── Generate Voucher Number ─────────────────────────────────────────────────
async function generateVoucherNumber(billingMonth) {
  // Format: PV-YYYYMM-NNNN
  const [year, month] = billingMonth.split('-');
  const seq = (await Expense.countDocuments({ billingMonth })) + 1;
  const padded = String(seq).padStart(4, '0');
  return `PV-${year}${month}-${padded}`;
}

// ─── Create Expense ──────────────────────────────────────────────────────────
async function createExpense(data, adminId) {
  const voucherNumber = await generateVoucherNumber(data.billingMonth);
  const expense = await Expense.create({
    ...data,
    voucherNumber,
    recordedBy: adminId,
  });
  return expense.populate('recordedBy', 'fullName email');
}

// ─── Get Expenses (with filters & pagination) ────────────────────────────────
async function getExpenses({ category, billingMonth, paymentMethod, status, search, page = 1, limit = 20 } = {}) {
  const filter = {};
  if (category) filter.category = category;
  if (billingMonth) filter.billingMonth = billingMonth;
  if (paymentMethod) filter.paymentMethod = paymentMethod;
  if (status) filter.status = status;
  if (search) {
    const re = new RegExp(search, 'i');
    filter.$or = [{ title: re }, { paidTo: re }, { voucherNumber: re }, { billReference: re }];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [expenses, total] = await Promise.all([
    Expense.find(filter)
      .sort({ expenseDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('recordedBy', 'fullName')
      .populate('approvedBy', 'fullName')
      .lean(),
    Expense.countDocuments(filter),
  ]);

  return {
    expenses,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / Number(limit)),
    },
  };
}

// ─── Get Expense By Id ───────────────────────────────────────────────────────
async function getExpenseById(id) {
  const expense = await Expense.findById(id)
    .populate('recordedBy', 'fullName email')
    .populate('approvedBy', 'fullName email')
    .lean();
  if (!expense) return null;
  return {
    ...expense,
    amountInWords: numberToWords(Math.round(expense.amount)) + ' Rupees Only',
  };
}

// ─── Update Expense ──────────────────────────────────────────────────────────
async function updateExpense(id, data) {
  const expense = await Expense.findById(id);
  if (!expense) return null;
  if (expense.status === EXPENSE_STATUS.CANCELLED) {
    throw new Error('Cannot edit a cancelled expense.');
  }
  Object.assign(expense, data);
  await expense.save();
  return expense.populate('recordedBy', 'fullName');
}

// ─── Cancel Expense ──────────────────────────────────────────────────────────
async function cancelExpense(id, adminId) {
  const expense = await Expense.findById(id);
  if (!expense) return null;
  if (expense.status === EXPENSE_STATUS.CANCELLED) {
    throw new Error('Expense is already cancelled.');
  }
  expense.status = EXPENSE_STATUS.CANCELLED;
  expense.approvedBy = adminId; // record who cancelled
  await expense.save();
  return expense;
}

// ─── Get Expense Summary ─────────────────────────────────────────────────────
async function getExpenseSummary({ billingMonth } = {}) {
  const filter = { status: { $ne: EXPENSE_STATUS.CANCELLED } };
  if (billingMonth) filter.billingMonth = billingMonth;

  const [summary] = await Expense.aggregate([
    { $match: filter },
    {
      $group: {
        _id: '$category',
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    {
      $group: {
        _id: null,
        grandTotal: { $sum: '$total' },
        categories: {
          $push: {
            category: '$_id',
            total: '$total',
            count: '$count',
          },
        },
        voucherCount: { $sum: '$count' },
      },
    },
    {
      $project: {
        _id: 0,
        grandTotal: 1,
        voucherCount: 1,
        categories: 1,
      },
    },
  ]);

  if (!summary) {
    return {
      grandTotal: 0,
      voucherCount: 0,
      categories: [],
    };
  }

  // Fill in zero-value categories
  const allCategories = Object.values(EXPENSE_CATEGORY);
  const catMap = {};
  summary.categories.forEach((c) => { catMap[c.category] = c; });
  summary.categories = allCategories.map((cat) => catMap[cat] || { category: cat, total: 0, count: 0 });

  // Find leading category
  const leadingCat = summary.categories.reduce((a, b) => (b.total > a.total ? b : a), { category: 'N/A', total: 0 });
  summary.leadingCategory = leadingCat.category;
  summary.billingMonth = billingMonth || null;

  return summary;
}

// ─── Get Financial Overview ──────────────────────────────────────────────────
async function getFinancialOverview({ billingMonth } = {}) {
  // Total active expenses
  const expenseFilter = { status: { $ne: EXPENSE_STATUS.CANCELLED } };
  if (billingMonth) expenseFilter.billingMonth = billingMonth;

  // Total salary disbursed — salarySlip status 'paid'
  const salaryFilter = { status: 'paid' };
  if (billingMonth) salaryFilter.billingMonth = billingMonth;

  // Total fee received — fee challans with status 'paid'
  const feeFilter = { status: 'paid' };
  if (billingMonth) {
    // billingMonth format YYYY-MM — match challans issued that month
    const [year, month] = billingMonth.split('-');
    const start = new Date(`${year}-${month}-01`);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);
    feeFilter.issueDate = { $gte: start, $lt: end };
  }

  const [expenseAgg, salaryAgg, feeAgg] = await Promise.all([
    Expense.aggregate([
      { $match: expenseFilter },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    SalarySlip.aggregate([
      { $match: salaryFilter },
      { $group: { _id: null, total: { $sum: '$netSalary' } } },
    ]),
    FeePayment
      ? FeePayment.aggregate([
          { $match: feeFilter },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ])
      : Promise.resolve([]),
  ]);

  const totalExpenses = expenseAgg[0]?.total || 0;
  const totalSalaries = salaryAgg[0]?.total || 0;
  const totalFeeIncome = feeAgg[0]?.total || 0;

  return {
    billingMonth: billingMonth || null,
    totalFeeIncome,
    totalSalaries,
    totalExpenses,
    totalOutflow: totalSalaries + totalExpenses,
    netCashFlow: totalFeeIncome - totalSalaries - totalExpenses,
  };
}

module.exports = {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  cancelExpense,
  getExpenseSummary,
  getFinancialOverview,
  numberToWords,
};
