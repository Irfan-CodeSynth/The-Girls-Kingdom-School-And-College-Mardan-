const scheduleService = require('./schedule.service');

// ═══════════════════════════════════════════════════════════════
// TIMETABLE CONTROLLERS
// ═══════════════════════════════════════════════════════════════

const upsertTimetable = async (req, res, next) => {
  try {
    const { classId, academicYear, days, notes } = req.body;
    const timetable = await scheduleService.upsertTimetable({
      classId,
      academicYear,
      days,
      notes,
      userId: req.user._id,
    });
    res.status(200).json({ status: 'success', data: timetable, message: 'Timetable saved successfully' });
  } catch (err) {
    next(err);
  }
};

const getTimetableByClass = async (req, res, next) => {
  try {
    const timetable = await scheduleService.getTimetableByClass(req.params.classId);
    if (!timetable) {
      return res.status(200).json({ status: 'success', data: null, message: 'No timetable configured for this class yet' });
    }
    res.status(200).json({ status: 'success', data: timetable });
  } catch (err) {
    next(err);
  }
};

const getTeacherSchedule = async (req, res, next) => {
  try {
    const result = await scheduleService.getTeacherSchedule(req.user._id);
    res.status(200).json({ status: 'success', ...result });
  } catch (err) {
    next(err);
  }
};

const getStudentRoutine = async (req, res, next) => {
  try {
    const result = await scheduleService.getStudentRoutine(req.user._id);
    res.status(200).json({ status: 'success', ...result });
  } catch (err) {
    next(err);
  }
};

const checkConflict = async (req, res, next) => {
  try {
    const { classId, day, periodNumber, teacherId, room, excludeTimetableId } = req.query;
    const result = await scheduleService.checkConflict({
      classId,
      day,
      periodNumber,
      teacherId,
      room,
      excludeTimetableId,
    });
    res.status(200).json({ status: 'success', ...result });
  } catch (err) {
    next(err);
  }
};

// ═══════════════════════════════════════════════════════════════
// DATESHEET CONTROLLERS
// ═══════════════════════════════════════════════════════════════

const createDatesheet = async (req, res, next) => {
  try {
    const datesheet = await scheduleService.createDatesheet({
      data: req.body,
      userId: req.user._id,
    });
    res.status(201).json({ status: 'success', data: datesheet, message: 'Exam datesheet created successfully' });
  } catch (err) {
    next(err);
  }
};

const getDatesheets = async (req, res, next) => {
  try {
    const result = await scheduleService.getDatesheets(req.query);
    res.status(200).json({ status: 'success', ...result });
  } catch (err) {
    next(err);
  }
};

const getStudentExams = async (req, res, next) => {
  try {
    const result = await scheduleService.getStudentExams(req.user._id);
    res.status(200).json({ status: 'success', ...result });
  } catch (err) {
    next(err);
  }
};

const getDatesheetById = async (req, res, next) => {
  try {
    const datesheet = await scheduleService.getDatesheetById(req.params.id);
    res.status(200).json({ status: 'success', data: datesheet });
  } catch (err) {
    next(err);
  }
};

const updateDatesheet = async (req, res, next) => {
  try {
    const updated = await scheduleService.updateDatesheet(req.params.id, req.body);
    res.status(200).json({ status: 'success', data: updated, message: 'Datesheet updated successfully' });
  } catch (err) {
    next(err);
  }
};

const publishDatesheet = async (req, res, next) => {
  try {
    const datesheet = await scheduleService.publishDatesheet(req.params.id);
    res.status(200).json({ status: 'success', data: datesheet, message: 'Datesheet published and students notified' });
  } catch (err) {
    next(err);
  }
};

const deleteDatesheet = async (req, res, next) => {
  try {
    const result = await scheduleService.deleteDatesheet(req.params.id);
    res.status(200).json({ status: 'success', ...result });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  upsertTimetable,
  getTimetableByClass,
  getTeacherSchedule,
  getStudentRoutine,
  checkConflict,
  createDatesheet,
  getDatesheets,
  getDatesheetById,
  updateDatesheet,
  publishDatesheet,
  getStudentExams,
  deleteDatesheet,
};
