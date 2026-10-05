const notificationService = require('./notification.service');
const ApiResponse = require('../../utils/ApiResponse');

const getMyNotifications = async (req, res, next) => {
  try {
    const result = await notificationService.getMyNotifications(req.user.id, req.query);
    return ApiResponse.success(res, result, 'Notifications retrieved successfully');
  } catch (err) { next(err); }
};

const getUnreadCount = async (req, res, next) => {
  try {
    const result = await notificationService.getUnreadCount(req.user.id);
    return ApiResponse.success(res, result, 'Unread count retrieved');
  } catch (err) { next(err); }
};

const markAsRead = async (req, res, next) => {
  try {
    const result = await notificationService.markAsRead(req.params.id, req.user.id);
    return ApiResponse.success(res, result, 'Notification marked as read');
  } catch (err) { next(err); }
};

const markAllAsRead = async (req, res, next) => {
  try {
    const result = await notificationService.markAllAsRead(req.user.id);
    return ApiResponse.success(res, result, 'All notifications marked as read');
  } catch (err) { next(err); }
};

const deleteNotification = async (req, res, next) => {
  try {
    const result = await notificationService.deleteNotification(req.params.id, req.user.id);
    return ApiResponse.success(res, result, 'Notification deleted');
  } catch (err) { next(err); }
};

module.exports = {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification
};
