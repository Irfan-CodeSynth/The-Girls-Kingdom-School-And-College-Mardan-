const SalaryStructure = require('./salaryStructure.model');
const { SalarySlip, SLIP_STATUS } = require('./salarySlip.model');
const User = require('../users/user.model');
const TeacherProfile = require('../users/teacherProfile.model');
const ApiError = require('../../utils/ApiError');
const { ROLES } = require('../../utils/constants');

// ─── Helpers ────────────────────────────────────────────────────

/** Format YYYY-MM + short teacherId into a unique slip number */
const generateSlipNumber = (billingMonth, shortId, seq) => {
  const [year, month] = billingMonth.split('-');
  const padded = String(seq).padStart(4, '0');
  return `SLP-${year}${month}-${shortId.toUpperCase()}-${padded}`;
};

/** Convert a number to words (PKR purpose, simplified up to crores) */
const numberToWords = (num) => {
  if (!num || num === 0) return 'Zero Rupees Only';
  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen',
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const convert = (n) => {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
    if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + convert(n % 100) : '');
    if (n < 100000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 !== 0 ? ' ' + convert(n % 1000) : '');
    if (n < 10000000) return convert(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 !== 0 ? ' ' + convert(n % 100000) : '');
    return convert(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 !== 0 ? ' ' + convert(n % 10000000) : '');
  };
  return convert(Math.round(num)) + ' Rupees Only';
};

// ─── Salary Structure CRUD ───────────────────────────────────────

const upsertSalaryStructure = async (data, adminId) => {
  const { teacherId, ...structureData } = data;

  // Verify teacher exists
  const teacher = await User.findOne({ _id: teacherId, role: ROLES.TEACHER });
  if (!teacher) throw ApiError.notFound('Teacher not found.');

  const existing = await SalaryStructure.findOne({ teacher: teacherId });
  let structure;
  if (existing) {
    Object.assign(existing, structureData, { updatedBy: adminId });
    structure = await existing.save();
  } else {
    structure = await SalaryStructure.create({
      teacher: teacherId,
      ...structureData,
      updatedBy: adminId,
    });
  }
  await structure.populate('teacher', 'fullName email');
  return { salaryStructure: structure };
};

const getSalaryStructures = async ({ search, department, page = 1, limit = 100 } = {}) => {
  const structures = await SalaryStructure.find({ isActive: true })
    .populate('teacher', 'fullName email')
    .populate('updatedBy', 'fullName')
    .sort({ createdAt: -1 });

  // Filter by search or department in memory (profiles are denormalized into structures)
  let filtered = structures;
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (s) =>
        s.teacher?.fullName?.toLowerCase().includes(q) ||
        s.teacher?.email?.toLowerCase().includes(q) ||
        s.designation?.toLowerCase().includes(q)
    );
  }
  if (department) {
    filtered = filtered.filter(
      (s) => s.department?.toLowerCase() === department.toLowerCase()
    );
  }

  return { salaryStructures: filtered };
};

const getSalaryStructureByTeacher = async (teacherId, requestingUserId, requestingRole) => {
  // Teachers can only view their own structure
  if (requestingRole === ROLES.TEACHER && String(teacherId) !== String(requestingUserId)) {
    throw ApiError.forbidden('You can only view your own salary structure.');
  }
  const structure = await SalaryStructure.findOne({ teacher: teacherId, isActive: true })
    .populate('teacher', 'fullName email')
    .populate('updatedBy', 'fullName');
  if (!structure) throw ApiError.notFound('No salary structure found for this teacher.');
  return { salaryStructure: structure };
};

const deleteSalaryStructure = async (id) => {
  const structure = await SalaryStructure.findById(id);
  if (!structure) throw ApiError.notFound('Salary structure not found.');
  structure.isActive = false;
  await structure.save();
  return { message: 'Salary structure deactivated.' };
};

// ─── Salary Slip Operations ─────────────────────────────────────

/**
 * Batch-generate monthly salary slips for all teachers
 * who have an active salary structure.
 */
const generateMonthlyPayroll = async (billingMonth, adminId, { teacherIds } = {}) => {
  const query = { isActive: true };
  if (teacherIds && teacherIds.length > 0) {
    query.teacher = { $in: teacherIds };
  }

  const structures = await SalaryStructure.find(query).populate('teacher', 'fullName email');
  if (structures.length === 0) {
    throw ApiError.badRequest('No active salary structures found.');
  }

  const results = { created: [], skipped: [] };
  let seq = await SalarySlip.countDocuments({ billingMonth });

  for (const structure of structures) {
    const teacher = structure.teacher;
    const teacherIdStr = teacher._id.toString();

    // Skip if already generated
    const existing = await SalarySlip.findOne({
      teacher: teacher._id,
      billingMonth,
    });
    if (existing) {
      results.skipped.push(teacherIdStr);
      continue;
    }

    seq += 1;
    // Get a short ID from teacherId profile
    const profile = await TeacherProfile.findOne({ user: teacher._id });
    const shortId = (profile?.teacherId || teacherIdStr.slice(-6)).replace(/\s+/g, '');
    const slipNumber = generateSlipNumber(billingMonth, shortId, seq);

    const grossSalary =
      structure.basicSalary +
      structure.houseRentAllowance +
      structure.medicalAllowance +
      structure.transportAllowance +
      structure.specialAllowance;

    const totalDeductions =
      structure.taxDeduction + structure.providentFund + structure.eobiDeduction;

    const netSalary = grossSalary - totalDeductions;

    const slip = await SalarySlip.create({
      slipNumber,
      teacher: teacher._id,
      salaryStructure: structure._id,
      billingMonth,
      totalWorkingDays: 30,
      paidDays: 30,
      unpaidLeaves: 0,
      basicSalary: structure.basicSalary,
      houseRentAllowance: structure.houseRentAllowance,
      medicalAllowance: structure.medicalAllowance,
      transportAllowance: structure.transportAllowance,
      specialAllowance: structure.specialAllowance,
      bonus: 0,
      grossSalary,
      taxDeduction: structure.taxDeduction,
      providentFund: structure.providentFund,
      eobiDeduction: structure.eobiDeduction,
      leaveDeductions: 0,
      advanceDeduction: 0,
      totalDeductions,
      netSalary,
      bankName: structure.bankName,
      accountTitle: structure.accountTitle,
      accountNumber: structure.accountNumber,
      iban: structure.iban,
      status: SLIP_STATUS.DRAFT,
      generatedBy: adminId,
    });

    results.created.push(slip);
  }

  return {
    message: `Payroll generated: ${results.created.length} created, ${results.skipped.length} already existed.`,
    created: results.created.length,
    skipped: results.skipped.length,
  };
};

const getSlips = async ({ billingMonth, status, teacherId, page = 1, limit = 100 } = {}) => {
  const query = {};
  if (billingMonth) query.billingMonth = billingMonth;
  if (status) query.status = status;
  if (teacherId) query.teacher = teacherId;

  const skip = (page - 1) * limit;
  const [slips, total] = await Promise.all([
    SalarySlip.find(query)
      .populate('teacher', 'fullName email')
      .populate('generatedBy', 'fullName')
      .populate('disbursedBy', 'fullName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    SalarySlip.countDocuments(query),
  ]);

  return {
    slips,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / limit),
    },
  };
};

const getSlipById = async (id, requestingUserId, requestingRole) => {
  const slip = await SalarySlip.findById(id)
    .populate('teacher', 'fullName email phone')
    .populate('salaryStructure')
    .populate('generatedBy', 'fullName')
    .populate('disbursedBy', 'fullName');

  if (!slip) throw ApiError.notFound('Salary slip not found.');

  // Teachers can only view their own slip
  if (
    requestingRole === ROLES.TEACHER &&
    String(slip.teacher._id) !== String(requestingUserId)
  ) {
    throw ApiError.forbidden('Access denied.');
  }

  const amountInWords = numberToWords(slip.netSalary);
  return { slip, amountInWords };
};

const getMySlips = async (teacherId) => {
  const slips = await SalarySlip.find({ teacher: teacherId })
    .populate('teacher', 'fullName email')
    .sort({ billingMonth: -1 });

  const totalPaid = slips
    .filter((s) => s.status === SLIP_STATUS.PAID)
    .reduce((sum, s) => sum + s.netSalary, 0);

  return { slips, totalPaid };
};

const adjustSlip = async (id, data, adminId) => {
  const slip = await SalarySlip.findById(id);
  if (!slip) throw ApiError.notFound('Salary slip not found.');
  if (slip.status === SLIP_STATUS.PAID) {
    throw ApiError.badRequest('Cannot edit a paid slip.');
  }
  if (slip.status === SLIP_STATUS.CANCELLED) {
    throw ApiError.badRequest('Cannot edit a cancelled slip.');
  }

  const { bonus, advanceDeduction, unpaidLeaves, remarks, totalWorkingDays, paidDays } = data;

  if (bonus !== undefined) slip.bonus = Number(bonus);
  if (advanceDeduction !== undefined) slip.advanceDeduction = Number(advanceDeduction);
  if (unpaidLeaves !== undefined) {
    slip.unpaidLeaves = Number(unpaidLeaves);
    // Recalculate leave deduction: perDayRate * unpaidLeaves
    const perDay = slip.basicSalary / (totalWorkingDays || slip.totalWorkingDays || 30);
    slip.leaveDeductions = Math.round(perDay * Number(unpaidLeaves));
  }
  if (totalWorkingDays !== undefined) slip.totalWorkingDays = Number(totalWorkingDays);
  if (paidDays !== undefined) slip.paidDays = Number(paidDays);
  if (remarks !== undefined) slip.remarks = remarks;

  // Recalculate totals
  slip.grossSalary =
    slip.basicSalary +
    slip.houseRentAllowance +
    slip.medicalAllowance +
    slip.transportAllowance +
    slip.specialAllowance +
    slip.bonus;

  slip.totalDeductions =
    slip.taxDeduction +
    slip.providentFund +
    slip.eobiDeduction +
    slip.leaveDeductions +
    slip.advanceDeduction;

  slip.netSalary = slip.grossSalary - slip.totalDeductions;

  await slip.save();
  return { slip };
};

const approveSlip = async (id, adminId) => {
  const slip = await SalarySlip.findById(id);
  if (!slip) throw ApiError.notFound('Salary slip not found.');
  if (slip.status !== SLIP_STATUS.DRAFT) {
    throw ApiError.badRequest('Only draft slips can be approved.');
  }
  slip.status = SLIP_STATUS.APPROVED;
  await slip.save();
  return { slip };
};

const disburseSlip = async (id, data, adminId) => {
  const slip = await SalarySlip.findById(id);
  if (!slip) throw ApiError.notFound('Salary slip not found.');
  if (slip.status === SLIP_STATUS.PAID) {
    throw ApiError.conflict('This slip is already marked as paid.');
  }
  if (slip.status === SLIP_STATUS.CANCELLED) {
    throw ApiError.badRequest('Cannot disburse a cancelled slip.');
  }

  const { paymentMethod, paymentReference, remarks } = data;
  slip.status = SLIP_STATUS.PAID;
  slip.paidAt = new Date();
  slip.paymentMethod = paymentMethod;
  slip.paymentReference = paymentReference;
  if (remarks) slip.remarks = remarks;
  slip.disbursedBy = adminId;

  await slip.save();
  return { slip };
};

const bulkDisburse = async (billingMonth, data, adminId) => {
  const { paymentMethod, paymentReference } = data;
  const slips = await SalarySlip.find({
    billingMonth,
    status: SLIP_STATUS.APPROVED,
  });

  let count = 0;
  for (const slip of slips) {
    slip.status = SLIP_STATUS.PAID;
    slip.paidAt = new Date();
    slip.paymentMethod = paymentMethod || 'bank_transfer';
    slip.paymentReference = paymentReference || '';
    slip.disbursedBy = adminId;
    await slip.save();
    count++;
  }

  return {
    message: `${count} salary slip(s) marked as paid.`,
    disbursed: count,
  };
};

const cancelSlip = async (id, adminId) => {
  const slip = await SalarySlip.findById(id);
  if (!slip) throw ApiError.notFound('Salary slip not found.');
  if (slip.status === SLIP_STATUS.PAID) {
    throw ApiError.badRequest('Cannot cancel a paid slip.');
  }
  slip.status = SLIP_STATUS.CANCELLED;
  await slip.save();
  return { slip };
};

const getPayrollSummary = async ({ billingMonth } = {}) => {
  const query = {};
  if (billingMonth) query.billingMonth = billingMonth;

  const slips = await SalarySlip.find(query);

  const totalPayroll = slips.reduce((sum, s) => sum + s.netSalary, 0);
  const totalPaid = slips
    .filter((s) => s.status === SLIP_STATUS.PAID)
    .reduce((sum, s) => sum + s.netSalary, 0);
  const totalPending = totalPayroll - totalPaid;

  return {
    summary: {
      totalSlips: slips.length,
      totalPayroll,
      totalPaid,
      totalPending,
      draft: slips.filter((s) => s.status === SLIP_STATUS.DRAFT).length,
      approved: slips.filter((s) => s.status === SLIP_STATUS.APPROVED).length,
      paid: slips.filter((s) => s.status === SLIP_STATUS.PAID).length,
      cancelled: slips.filter((s) => s.status === SLIP_STATUS.CANCELLED).length,
    },
  };
};

/** Generate bank disbursement sheet (list of all approved/paid slips with bank details) */
const getBankSheet = async (billingMonth) => {
  const query = { billingMonth };
  const slips = await SalarySlip.find(query)
    .populate('teacher', 'fullName email')
    .sort({ createdAt: 1 });

  const sheet = slips.map((s, idx) => ({
    sno: idx + 1,
    slipNumber: s.slipNumber,
    teacherName: s.teacher?.fullName || '—',
    bankName: s.bankName || '—',
    accountTitle: s.accountTitle || '—',
    accountNumber: s.accountNumber || '—',
    iban: s.iban || '—',
    netSalary: s.netSalary,
    status: s.status,
  }));

  const total = slips.reduce((sum, s) => sum + s.netSalary, 0);
  return { sheet, total, month: billingMonth };
};

module.exports = {
  upsertSalaryStructure,
  getSalaryStructures,
  getSalaryStructureByTeacher,
  deleteSalaryStructure,
  generateMonthlyPayroll,
  getSlips,
  getSlipById,
  getMySlips,
  adjustSlip,
  approveSlip,
  disburseSlip,
  bulkDisburse,
  cancelSlip,
  getPayrollSummary,
  getBankSheet,
  numberToWords,
};
