const mongoose = require('mongoose');
const { NOTIFICATION_TYPES } = require('../../utils/constants');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: Object.values(NOTIFICATION_TYPES),
      required: true
    },
    title: { type: String, required: true, maxlength: 200 },
    message: { type: String, required: true, maxlength: 1000 },
    isRead: { type: Boolean, default: false, index: true },
    // Optional deep-link data
    data: {
      quizId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
      attemptId: { type: mongoose.Schema.Types.ObjectId, ref: 'Attempt' },
      classId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Class' }
    }
  },
  { timestamps: true }
);

// Compound index: fast per-user queries sorted by date
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
