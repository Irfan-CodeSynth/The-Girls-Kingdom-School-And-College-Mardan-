const Material = require('./material.model');
const Enrollment = require('./enrollment.model');
const ApiError = require('../../utils/ApiError');
const { ROLES, MATERIAL_CATEGORIES, VIDEO_PROVIDERS, ENROLLMENT_STATUS } = require('../../utils/constants');
const { isTeacherAuthorizedForClass } = require('./class.service');
const notificationService = require('../notifications/notification.service');

// ─────────────────────────────────────────────────────────────
//  YouTube URL parser
//  Handles: youtu.be/ID, watch?v=ID, embed/ID, shorts/ID
// ─────────────────────────────────────────────────────────────
const parseYouTubeId = (url) => {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?(?:.*&)?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([A-Za-z0-9_-]{11})/,
    /^([A-Za-z0-9_-]{11})$/, // raw video ID
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

// ─────────────────────────────────────────────────────────────
//  Create a new material
// ─────────────────────────────────────────────────────────────
const createMaterial = async (classId, data, userId, userRole) => {
  // Teachers must be assigned to the class
  if (userRole === ROLES.TEACHER) {
    const authorized = await isTeacherAuthorizedForClass(userId, classId);
    if (!authorized) {
      throw ApiError.forbidden('You are not assigned to this class.');
    }
  }

  const payload = {
    class: classId,
    teacher: userId,
    title: data.title,
    description: data.description,
    category: data.category,
    isPublished: data.isPublished ?? false,
    order: data.order ?? 0,
  };

  // ── Video payload ──────────────────────────────────────────
  if (data.video) {
    payload.video = { provider: data.video.provider };

    if (data.video.provider === VIDEO_PROVIDERS.YOUTUBE) {
      const videoId = parseYouTubeId(data.video.videoUrl);
      if (!videoId) {
        throw ApiError.badRequest('Invalid YouTube URL. Please paste a valid YouTube video link.');
      }
      payload.video.videoId = videoId;
      payload.video.videoUrl = data.video.videoUrl;
      payload.video.thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      payload.video.durationMinutes = data.video.durationMinutes;
    }

    if (data.video.provider === VIDEO_PROVIDERS.CLOUDFLARE) {
      payload.video.cloudflare = {
        uid: data.video.cloudflare?.uid || '',
        customerSubdomain: data.video.cloudflare?.customerSubdomain || '',
        isMock: true,
      };
    }

    if (data.video.provider === VIDEO_PROVIDERS.VIMEO) {
      payload.video.vimeo = {
        vimeoId: data.video.vimeo?.vimeoId || '',
        privacyHash: data.video.vimeo?.privacyHash || '',
        isMock: true,
      };
    }
  }

  // ── Document payload ───────────────────────────────────────
  if (data.document) {
    const isDataUri = typeof data.document.fileUrl === 'string' && data.document.fileUrl.startsWith('data:');
    payload.document = {
      fileUrl: data.document.fileUrl,
      fileName: data.document.fileName,
      fileType: data.document.fileType,
      fileSize: data.document.fileSize,
      fileSizeFormatted: data.document.fileSizeFormatted,
      isExternal: data.document.isExternal !== undefined ? Boolean(data.document.isExternal) : !isDataUri,
    };
  }

  const material = await Material.create(payload);

  // Fire-and-forget: notify enrolled students if publishing immediately
  if (material.isPublished) {
    setImmediate(async () => {
      try {
        const enrollments = await Enrollment.find({
          class: classId,
          status: ENROLLMENT_STATUS.ACTIVE,
        }).select('student');
        const studentIds = enrollments.map((e) => e.student);
        await notificationService.notifyNewMaterial(classId, material.title, studentIds);
      } catch (err) {
        console.error('[Notifications] notifyNewMaterial error:', err.message);
      }
    });
  }

  return material;
};

// ─────────────────────────────────────────────────────────────
//  Get materials for a class
// ─────────────────────────────────────────────────────────────
const getClassMaterials = async (classId, userId, userRole, query = {}) => {
  const filter = { class: classId };

  // Students only see published materials
  if (userRole === ROLES.STUDENT) {
    filter.isPublished = true;
  }

  // Teachers see only their own materials (unless admin)
  if (userRole === ROLES.TEACHER) {
    filter.teacher = userId;
  }

  if (query.category) {
    filter.category = query.category;
  }

  const materials = await Material.find(filter)
    .populate('teacher', 'fullName email profilePhoto')
    .sort({ order: 1, createdAt: -1 })
    .lean();

  return { materials };
};

// ─────────────────────────────────────────────────────────────
//  Update a material
// ─────────────────────────────────────────────────────────────
const updateMaterial = async (classId, materialId, data, userId, userRole) => {
  const material = await Material.findOne({ _id: materialId, class: classId });
  if (!material) throw ApiError.notFound('Material not found.');

  // Teachers can only edit their own materials
  if (userRole === ROLES.TEACHER && material.teacher.toString() !== userId.toString()) {
    throw ApiError.forbidden('You can only edit your own materials.');
  }

  const wasUnpublished = !material.isPublished;

  Object.assign(material, {
    title: data.title ?? material.title,
    description: data.description ?? material.description,
    category: data.category ?? material.category,
    isPublished: data.isPublished ?? material.isPublished,
    order: data.order ?? material.order,
  });

  if (data.video) {
    if (!material.video) material.video = {};
    material.video.provider = data.video.provider ?? material.video.provider;

    if (data.video.videoUrl && data.video.provider === VIDEO_PROVIDERS.YOUTUBE) {
      const videoId = parseYouTubeId(data.video.videoUrl);
      if (!videoId) throw ApiError.badRequest('Invalid YouTube URL.');
      material.video.videoId = videoId;
      material.video.videoUrl = data.video.videoUrl;
      material.video.thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    }
    if (data.video.durationMinutes != null) {
      material.video.durationMinutes = data.video.durationMinutes;
    }
  }

  if (data.document) {
    if (!material.document) material.document = {};
    if (data.document.fileUrl !== undefined) material.document.fileUrl = data.document.fileUrl;
    if (data.document.fileName !== undefined) material.document.fileName = data.document.fileName;
    if (data.document.fileType !== undefined) material.document.fileType = data.document.fileType;
    if (data.document.fileSize !== undefined) material.document.fileSize = data.document.fileSize;
    if (data.document.fileSizeFormatted !== undefined) material.document.fileSizeFormatted = data.document.fileSizeFormatted;
    if (data.document.isExternal !== undefined) {
      material.document.isExternal = Boolean(data.document.isExternal);
    } else if (data.document.fileUrl) {
      material.document.isExternal = !data.document.fileUrl.startsWith('data:');
    }
  }

  await material.save();

  // Notify students if newly published in this update
  if (wasUnpublished && material.isPublished) {
    setImmediate(async () => {
      try {
        const enrollments = await Enrollment.find({
          class: classId,
          status: ENROLLMENT_STATUS.ACTIVE,
        }).select('student');
        const studentIds = enrollments.map((e) => e.student);
        await notificationService.notifyNewMaterial(classId, material.title, studentIds);
      } catch (err) {
        console.error('[Notifications] notifyNewMaterial (update) error:', err.message);
      }
    });
  }

  return material;
};

// ─────────────────────────────────────────────────────────────
//  Delete a material
// ─────────────────────────────────────────────────────────────
const deleteMaterial = async (classId, materialId, userId, userRole) => {
  const material = await Material.findOne({ _id: materialId, class: classId });
  if (!material) throw ApiError.notFound('Material not found.');

  if (userRole === ROLES.TEACHER && material.teacher.toString() !== userId.toString()) {
    throw ApiError.forbidden('You can only delete your own materials.');
  }

  await material.deleteOne();
  return { deleted: true };
};

module.exports = {
  createMaterial,
  getClassMaterials,
  updateMaterial,
  deleteMaterial,
  parseYouTubeId,
};
