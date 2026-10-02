const mongoose = require('mongoose');
const { MATERIAL_CATEGORIES, VIDEO_PROVIDERS } = require('../../utils/constants');

const materialSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
      index: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      enum: Object.values(MATERIAL_CATEGORIES),
      required: true,
    },

    // ── Video-specific fields ──────────────────────────────────────
    video: {
      provider: {
        type: String,
        enum: Object.values(VIDEO_PROVIDERS),
      },
      // YouTube
      videoId: { type: String, trim: true },      // e.g. "dQw4w9WgXcQ"
      videoUrl: { type: String, trim: true },      // original URL pasted by teacher
      thumbnailUrl: { type: String, trim: true },  // auto-derived for YouTube

      // Cloudflare Stream (mock until activated)
      cloudflare: {
        uid: { type: String, trim: true },
        customerSubdomain: { type: String, trim: true },
        isMock: { type: Boolean, default: true },
      },

      // Vimeo (mock until activated)
      vimeo: {
        vimeoId: { type: String, trim: true },
        privacyHash: { type: String, trim: true },
        isMock: { type: Boolean, default: true },
      },

      durationMinutes: { type: Number, min: 0 },
    },

    // ── Document-specific fields ───────────────────────────────────
    document: {
      fileUrl: { type: String, trim: true },    // Google Drive / OneDrive share link or base64 data url / upload url
      fileName: { type: String, trim: true },
      fileType: { type: String, trim: true },   // pdf, docx, pptx, etc.
      fileSize: { type: Number },               // size in bytes
      fileSizeFormatted: { type: String, trim: true }, // e.g. "2.4 MB"
      isExternal: { type: Boolean, default: true },
    },

    isPublished: {
      type: Boolean,
      default: false,
      index: true,
    },

    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Compound index — students only ever query published materials per class
materialSchema.index({ class: 1, isPublished: 1, createdAt: -1 });

module.exports = mongoose.model('Material', materialSchema);
