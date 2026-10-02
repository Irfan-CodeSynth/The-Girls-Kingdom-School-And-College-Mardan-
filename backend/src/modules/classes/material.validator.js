const { z } = require('zod');
const { MATERIAL_CATEGORIES, VIDEO_PROVIDERS } = require('../../utils/constants');

const videoSchema = z.object({
  provider: z.enum(Object.values(VIDEO_PROVIDERS)),
  videoUrl: z.string().trim().optional(),
  durationMinutes: z.number().min(0).optional(),
  cloudflare: z.object({
    uid: z.string().optional(),
    customerSubdomain: z.string().optional(),
  }).optional(),
  vimeo: z.object({
    vimeoId: z.string().optional(),
    privacyHash: z.string().optional(),
  }).optional(),
}).optional();

const documentSchema = z.object({
  fileUrl: z.string().min(1, 'Document URL or file content is required'),
  fileName: z.string().min(1).max(200).optional(),
  fileType: z.string().max(50).optional(),
  fileSize: z.number().optional(),
  fileSizeFormatted: z.string().max(50).optional(),
  isExternal: z.boolean().optional(),
}).optional();

const createMaterialSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200),
  description: z.string().trim().max(1000).optional(),
  category: z.enum(Object.values(MATERIAL_CATEGORIES), {
    errorMap: () => ({ message: 'Invalid material category' }),
  }),
  isPublished: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
  video: videoSchema,
  document: documentSchema,
});

const updateMaterialSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(1000).optional(),
  category: z.enum(Object.values(MATERIAL_CATEGORIES)).optional(),
  isPublished: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
  video: videoSchema,
  document: documentSchema,
});

module.exports = { createMaterialSchema, updateMaterialSchema };
