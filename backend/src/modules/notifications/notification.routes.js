const express = require('express');
const router = express.Router();
const notificationController = require('./notification.controller');
const protect = require('../../middleware/auth');

// All notification routes require authentication
router.use(protect);

// GET  /api/notifications          — list my notifications (paginated)
router.get('/', notificationController.getMyNotifications);

// GET  /api/notifications/unread-count  — badge count
router.get('/unread-count', notificationController.getUnreadCount);

// PATCH /api/notifications/mark-all-read — mark all as read
router.patch('/mark-all-read', notificationController.markAllAsRead);

// PATCH /api/notifications/:id/read — mark one as read
router.patch('/:id/read', notificationController.markAsRead);

// DELETE /api/notifications/:id — delete one
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;
