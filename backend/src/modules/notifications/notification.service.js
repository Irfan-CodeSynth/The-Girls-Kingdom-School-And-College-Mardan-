const Notification = require('./notification.model');
const { NOTIFICATION_TYPES } = require('../../utils/constants');

// ─────────────────────────────────────────────────────────────
//  Internal helper — fire-and-forget notification creator
// ─────────────────────────────────────────────────────────────

/**
 * Create one or more notifications. Fails silently so it never
 * breaks the calling action (quiz publish, enroll, grade, etc.)
 */
const createNotification = async ({ recipient, type, title, message, data = {} }) => {
  try {
    await Notification.create({ recipient, type, title, message, data });
  } catch (err) {
    console.error('[Notifications] Failed to create notification:', err.message);
  }
};

const createMany = async (notifications) => {
  try {
    if (!notifications.length) return;
    await Notification.insertMany(notifications, { ordered: false });
  } catch (err) {
    console.error('[Notifications] Failed to bulk-create notifications:', err.message);
  }
};

// ─────────────────────────────────────────────────────────────
//  Event helpers (called from other services)
// ─────────────────────────────────────────────────────────────

/**
 * Notify all enrolled students when a quiz is published.
 * @param {Object} quiz  - populated quiz doc (with class + teacher)
 * @param {Array}  studentIds - array of student user ObjectIds
 */
const notifyQuizPublished = async (quiz, studentIds) => {
  const notifications = studentIds.map(studentId => ({
    recipient: studentId,
    type: NOTIFICATION_TYPES.QUIZ_PUBLISHED,
    title: 'New Quiz Available',
    message: `"${quiz.title}" has been published for ${quiz.class?.name || 'your class'}. Duration: ${quiz.duration} min · ${quiz.totalMarks} marks.`,
    data: { quizId: quiz._id, classId: quiz.class?._id }
  }));
  await createMany(notifications);
};

/**
 * Notify a student when their quiz attempt is fully graded.
 * @param {Object} attempt - populated attempt doc (with quiz + student)
 */
const notifyQuizGraded = async (attempt) => {
  await createNotification({
    recipient: attempt.student._id || attempt.student,
    type: NOTIFICATION_TYPES.QUIZ_GRADED,
    title: 'Quiz Result Ready',
    message: `Your attempt for "${attempt.quiz?.title}" has been graded. You scored ${attempt.obtainedMarks}/${attempt.totalMarks} (${attempt.percentage}%).`,
    data: { quizId: attempt.quiz?._id || attempt.quiz, attemptId: attempt._id }
  });
};

/**
 * Notify a student when they are enrolled in a class.
 * @param {Object} enrollment - populated enrollment doc (with student + class)
 */
const notifyEnrollment = async (enrollment) => {
  await createNotification({
    recipient: enrollment.student._id || enrollment.student,
    type: NOTIFICATION_TYPES.ENROLLMENT,
    title: 'Class Enrollment',
    message: `You have been enrolled in "${enrollment.class?.name || 'a new class'}". Welcome to the class!`,
    data: { classId: enrollment.class?._id || enrollment.class }
  });
};

/**
 * Notify a student when they submit their quiz (acknowledgement).
 * @param {Object} attempt - populated attempt (with quiz + student)
 */
const notifyQuizSubmitted = async (attempt) => {
  await createNotification({
    recipient: attempt.student,
    type: NOTIFICATION_TYPES.RESULT_AVAILABLE,
    title: 'Quiz Submitted',
    message: `Your answers for "${attempt.quiz?.title}" have been submitted successfully. Results will be available after grading.`,
    data: { quizId: attempt.quiz?._id || attempt.quiz, attemptId: attempt._id }
  });
};

// ─────────────────────────────────────────────────────────────
//  CRUD — used by the notification API routes
// ─────────────────────────────────────────────────────────────

/**
 * Get paginated notifications for the logged-in user.
 */
const getMyNotifications = async (userId, { page = 1, limit = 20, unreadOnly = false } = {}) => {
  const filter = { recipient: userId };
  if (unreadOnly === 'true' || unreadOnly === true) filter.isRead = false;

  const skip = (Number(page) - 1) * Number(limit);

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Notification.countDocuments(filter),
    Notification.countDocuments({ recipient: userId, isRead: false })
  ]);

  return {
    notifications,
    unreadCount,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / Number(limit))
    }
  };
};

/**
 * Mark one notification as read.
 */
const markAsRead = async (notificationId, userId) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, recipient: userId },
    { isRead: true },
    { new: true }
  );
  if (!notification) {
    const { default: ApiError } = await import('../../utils/ApiError.js');
    throw ApiError.notFound('Notification not found.');
  }
  return { notification };
};

/**
 * Mark all of a user's notifications as read.
 */
const markAllAsRead = async (userId) => {
  const result = await Notification.updateMany(
    { recipient: userId, isRead: false },
    { isRead: true }
  );
  return { updated: result.modifiedCount };
};

/**
 * Delete a single notification.
 */
const deleteNotification = async (notificationId, userId) => {
  const notification = await Notification.findOneAndDelete({
    _id: notificationId,
    recipient: userId
  });
  if (!notification) {
    const ApiError = require('../../utils/ApiError');
    throw ApiError.notFound('Notification not found.');
  }
  return { deleted: true };
};

/**
 * Get unread count only (used for badge).
 */
const getUnreadCount = async (userId) => {
  const count = await Notification.countDocuments({ recipient: userId, isRead: false });
  return { unreadCount: count };
};

module.exports = {
  // Event helpers (called from other services)
  notifyQuizPublished,
  notifyQuizGraded,
  notifyEnrollment,
  notifyQuizSubmitted,
  // API CRUD
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount
};
