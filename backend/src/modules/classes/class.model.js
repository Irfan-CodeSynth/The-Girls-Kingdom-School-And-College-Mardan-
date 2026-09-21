const mongoose = require('mongoose');
const { CLASS_STATUS } = require('../../utils/constants');

const classSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  description: { type: String, trim: true },
  academicYear: { type: String, required: true, trim: true },
  status: { type: String, enum: Object.values(CLASS_STATUS), default: CLASS_STATUS.ACTIVE }
}, {
  timestamps: true
});

classSchema.index({ status: 1, academicYear: 1 });

const Class = mongoose.model('Class', classSchema);
module.exports = Class;
