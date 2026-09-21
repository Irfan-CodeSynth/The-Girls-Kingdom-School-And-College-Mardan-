const notificationService = require('./notification.service');
const ApiResponse = require('../../utils/ApiResponse');
const ApiError = require('../../utils/ApiError');

const getMyNotifications = async (req, res) => {
  const result = await notificationService.getMyNotifications(req.user.id, req.query);
  return ApiResponse.success(res, result, 'Notifications retrieved successfully');
};

const getUnreadCount = async (req, res) => {
  const result = await notificationService.getUnreadCount(req.user.id);
  return ApiResponse.success(res, result, 'Unread count retrieved');
};

const markAsRead = async (req, res) => {
  const result = await notificationService.markAsRead(req.params.id, req.user.id);
  return ApiResponse.success(res, result, 'Notification marked as read');
};

const markAllAsRead = async (req, res) => {
  const result = await notificationService.markAllAsRead(req.user.id);
  return ApiResponse.success(res, result, 'All notifications marked as read');
};

const deleteNotification = async (req, res) => {
  const result = await notificationService.deleteNotification(req.params.id, req.user.id);
  return ApiResponse.success(res, result, 'Notification deleted');
};

module.exports = {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification
};
