const noteService = require('../services/noteService');
const catchAsync = require('../utils/catchAsync');

const createNote = catchAsync(async (req, res) => {
  const note = await noteService.createNote({
    text: req.body.text,
    userId: req.user._id,
  });

  res.status(201).json({
    status: 'success',
    data: { note },
  });
});

const getNotes = catchAsync(async (req, res) => {
  const notes = await noteService.getNotesByUser(req.user._id);

  res.status(200).json({
    status: 'success',
    results: notes.length,
    data: { notes },
  });
});

const getNote = catchAsync(async (req, res) => {
  const note = await noteService.getNoteById({
    noteId: req.params.id,
    userId: req.user._id,
  });

  res.status(200).json({
    status: 'success',
    data: { note },
  });
});

const updateNote = catchAsync(async (req, res) => {
  const note = await noteService.updateNoteById({
    noteId: req.params.id,
    userId: req.user._id,
    text: req.body.text,
  });

  res.status(200).json({
    status: 'success',
    data: { note },
  });
});

const deleteNote = catchAsync(async (req, res) => {
  await noteService.deleteNoteById({
    noteId: req.params.id,
    userId: req.user._id,
  });

  res.status(204).send();
});

const deleteAllNotes = catchAsync(async (req, res) => {
  const result = await noteService.deleteAllNotesByUser(req.user._id);

  res.status(200).json({
    status: 'success',
    data: { deletedCount: result.deletedCount },
  });
});

module.exports = {
  createNote,
  getNotes,
  getNote,
  updateNote,
  deleteNote,
  deleteAllNotes,
};
