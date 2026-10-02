const { FeeChallan, CHALLAN_STATUS } = require('./feeChallan.model');
const FeeStructure = require('./feeStructure.model');
const FeePayment = require('./feePayment.model');
const Enrollment = require('../classes/enrollment.model');
const User = require('../users/user.model');
const ApiError = require('../../utils/ApiError');
const { ROLES, ENROLLMENT_STATUS } = require('../../utils/constants');

/**
 * Generate a unique challan number.
 */
const generateChallanNumber = (billingMonth, classCode, seq) => {
  const [year, month] = billingMonth.split('-');
  const padded = String(seq).padStart(4, '0');
  return `CHN-${year}${month}-${classCode.replace(/\s+/g, '').toUpperCase()}-${padded}`;
};

/**
 * Generate a unique receipt number.
 */
const generateReceiptNumber = async () => {
  const count = await FeePayment.countDocuments();
  return `RCP-${Date.now()}-${String(count + 1).padStart(4, '0')}`;
};

/**
 * Calculate the late surcharge for a challan.
 */
const calculateSurcharge = (dueDate, lateSurchargePerDay, totalFee) => {
  const now = new Date();
  if (now <= dueDate) return 0;
  const daysLate = Math.ceil((now - dueDate) / (1000 * 60 * 60 * 24));
  return Math.min(daysLate * lateSurchargePerDay, totalFee * 0.5); // cap at 50%
};

/**
 * Batch-generate monthly challans for a class.
 * Skips students who already have a challan for that month.
 */
const generateMonthlyChallans = async (classId, billingMonth, feeStructureId, adminId) => {
  // Verify fee structure
  const structure = await FeeStructure.findById(feeStructureId).populate('class', 'name code');
  if (!structure) throw ApiError.notFound('Fee structure not found.');

  // Get active enrollments for the class
  const enrollments = await Enrollment.find({
    class: classId,
    status: ENROLLMENT_STATUS.ACTIVE,
  }).populate('student');

  if (enrollments.length === 0) {
    throw ApiError.badRequest('No active students enrolled in this class.');
  }

  // Build due date from billing month + dueDayOfMonth
  const [year, month] = billingMonth.split('-').map(Number);
  const dueDate = new Date(year, month - 1, structure.dueDayOfMonth);

  const baseFee =
    structure.tuitionFee +
    structure.examFee +
    structure.libraryFee +
    structure.transportFee +
    structure.sportsFund +
    structure.computerFee;

  const results = { created: [], skipped: [] };
  let seq = await FeeChallan.countDocuments({ class: classId, billingMonth });

  for (const enrollment of enrollments) {
    const studentId = enrollment.student._id || enrollment.student;
    // Skip if already generated
    const existing = await FeeChallan.findOne({ student: studentId, billingMonth });
    if (existing) {
      results.skipped.push(studentId);
      continue;
    }

    seq += 1;
    const challanNumber = generateChallanNumber(billingMonth, structure.class.code, seq);

    const challan = await FeeChallan.create({
      challanNumber,
      student: studentId,
      class: classId,
      feeStructure: feeStructureId,
      billingMonth,
      dueDate,
      tuitionFee: structure.tuitionFee,
      admissionFee: structure.admissionFee,
      examFee: structure.examFee,
      libraryFee: structure.libraryFee,
      transportFee: structure.transportFee,
      sportsFund: structure.sportsFund,
      computerFee: structure.computerFee,
      lateSurcharge: 0,
      totalAmount: baseFee,
      status: CHALLAN_STATUS.UNPAID,
      generatedBy: adminId,
    });

    results.created.push(challan);
  }

  return {
    message: `Challans generated: ${results.created.length} created, ${results.skipped.length} already existed.`,
    created: results.created.length,
    skipped: results.skipped.length,
    challans: results.created,
  };
};

/**
 * Get all challans with filters.
 */
const getChallans = async ({
  classId,
  billingMonth,
  status,
  studentId,
  page = 1,
  limit = 50,
} = {}) => {
  const query = {};
  if (classId) query.class = classId;
  if (billingMonth) query.billingMonth = billingMonth;
  if (status) query.status = status;
  if (studentId) query.student = studentId;

  const skip = (page - 1) * limit;

  const [challans, total] = await Promise.all([
    FeeChallan.find(query)
      .populate('student', 'fullName email')
      .populate('class', 'name code')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    FeeChallan.countDocuments(query),
  ]);

  // Recalculate surcharge for each unpaid/overdue challan
  const now = new Date();
  const updatedChallans = challans.map((c) => {
    const obj = c.toJSON();
    if (c.status === CHALLAN_STATUS.UNPAID && now > c.dueDate) {
      obj.status = CHALLAN_STATUS.OVERDUE;
    }
    return obj;
  });

  return {
    challans: updatedChallans,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get a single challan by ID with full details.
 */
const getChallanById = async (id) => {
  const challan = await FeeChallan.findById(id)
    .populate('student', 'fullName email phone')
    .populate('class', 'name code academicYear')
    .populate('feeStructure')
    .populate('generatedBy', 'fullName')
    .populate('markedPaidBy', 'fullName');

  if (!challan) throw ApiError.notFound('Challan not found.');

  // Get payment history
  const payments = await FeePayment.find({ challan: id })
    .populate('recordedBy', 'fullName')
    .sort({ paidAt: -1 });

  return { challan, payments };
};

/**
 * Get challans for the currently authenticated student.
 */
const getMyChallan = async (studentId) => {
  const challans = await FeeChallan.find({ student: studentId })
    .populate('class', 'name code')
    .sort({ billingMonth: -1 });

  const now = new Date();
  const updated = challans.map((c) => {
    const obj = c.toJSON();
    if (c.status === CHALLAN_STATUS.UNPAID && now > c.dueDate) {
      obj.status = CHALLAN_STATUS.OVERDUE;
    }
    return obj;
  });

  const outstanding = updated.filter(
    (c) => c.status === CHALLAN_STATUS.UNPAID || c.status === CHALLAN_STATUS.OVERDUE
  );
  const totalOutstanding = outstanding.reduce(
    (sum, c) => sum + (c.totalAmount - c.paidAmount),
    0
  );

  return {
    challans: updated,
    summary: {
      total: updated.length,
      outstanding: outstanding.length,
      totalOutstandingAmount: totalOutstanding,
    },
  };
};

/**
 * Record a payment for a challan (admin only).
 */
const recordPayment = async (challanId, paymentData, adminId) => {
  const challan = await FeeChallan.findById(challanId);
  if (!challan) throw ApiError.notFound('Challan not found.');
  if (challan.status === CHALLAN_STATUS.PAID) {
    throw ApiError.conflict('This challan is already fully paid.');
  }
  if (challan.status === CHALLAN_STATUS.CANCELLED) {
    throw ApiError.badRequest('Cannot record payment for a cancelled challan.');
  }

  const { amount, paymentMethod, paymentReference, remarks } = paymentData;
  if (amount <= 0) throw ApiError.badRequest('Payment amount must be positive.');
  if (amount > challan.totalAmount - challan.paidAmount) {
    throw ApiError.badRequest('Payment exceeds the remaining balance.');
  }

  const receiptNumber = await generateReceiptNumber();

  const payment = await FeePayment.create({
    challan: challanId,
    student: challan.student,
    amount,
    paymentMethod,
    paymentReference,
    receiptNumber,
    paidAt: new Date(),
    remarks,
    recordedBy: adminId,
  });

  // Update challan
  challan.paidAmount += amount;
  challan.paymentMethod = paymentMethod;
  challan.paymentReference = paymentReference;
  challan.markedPaidBy = adminId;

  if (challan.paidAmount >= challan.totalAmount) {
    challan.status = CHALLAN_STATUS.PAID;
    challan.paidAt = new Date();
  } else {
    challan.status = CHALLAN_STATUS.PARTIAL;
  }

  await challan.save();

  return { challan, payment };
};

/**
 * Get fee summary stats for admin dashboard.
 */
const getFeeSummary = async ({ classId, billingMonth } = {}) => {
  const query = {};
  if (classId) query.class = classId;
  if (billingMonth) query.billingMonth = billingMonth;

  const [challans] = await Promise.all([FeeChallan.find(query)]);

  const total = challans.reduce((sum, c) => sum + c.totalAmount, 0);
  const collected = challans.reduce((sum, c) => sum + c.paidAmount, 0);
  const outstanding = total - collected;

  const now = new Date();
  const defaulters = challans.filter(
    (c) =>
      (c.status === CHALLAN_STATUS.UNPAID || c.status === CHALLAN_STATUS.PARTIAL) &&
      now > c.dueDate
  ).length;

  return {
    summary: {
      totalChallans: challans.length,
      totalReceivable: total,
      totalCollected: collected,
      totalOutstanding: outstanding,
      defaulters,
      paid: challans.filter((c) => c.status === CHALLAN_STATUS.PAID).length,
      unpaid: challans.filter((c) => c.status === CHALLAN_STATUS.UNPAID).length,
      overdue: challans.filter(
        (c) =>
          (c.status === CHALLAN_STATUS.UNPAID || c.status === CHALLAN_STATUS.PARTIAL) &&
          now > c.dueDate
      ).length,
    },
  };
};

/**
 * Cancel a challan.
 */
const cancelChallan = async (challanId, adminId) => {
  const challan = await FeeChallan.findById(challanId);
  if (!challan) throw ApiError.notFound('Challan not found.');
  if (challan.status === CHALLAN_STATUS.PAID) {
    throw ApiError.badRequest('Cannot cancel a paid challan.');
  }
  challan.status = CHALLAN_STATUS.CANCELLED;
  challan.markedPaidBy = adminId;
  await challan.save();
  return { challan };
};

module.exports = {
  generateMonthlyChallans,
  getChallans,
  getChallanById,
  getMyChallan,
  recordPayment,
  getFeeSummary,
  cancelChallan,
};
