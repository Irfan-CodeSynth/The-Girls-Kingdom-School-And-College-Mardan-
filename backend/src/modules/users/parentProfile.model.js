const mongoose = require('mongoose');

const parentProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    children: [
      {
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        relationship: {
          type: String,
          enum: ['father', 'mother', 'guardian'],
          default: 'guardian',
        },
        isPrimaryContact: {
          type: Boolean,
          default: true,
        },
      },
    ],
    cnic: { type: String, trim: true, default: '' },
    occupation: { type: String, trim: true, default: '' },
    emergencyContact: { type: String, trim: true, default: '' },
    address: { type: String, trim: true, default: '' },
  },
  {
    timestamps: true,
  }
);

parentProfileSchema.index({ 'children.student': 1 });

const ParentProfile = mongoose.model('ParentProfile', parentProfileSchema);
module.exports = ParentProfile;
