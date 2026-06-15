const Note = require('../models/Note');
const {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} = require('../errors/customErrors');

const createNote = async ({ text, userId }) => {
  return Note.create({ text, user: userId });
};

const getNotesByUser = async (userId) => {
  return Note.find({ user: userId }).sort({ createdAt: -1 });
};

const getNoteById = async ({ noteId, userId }) => {
  const note = await Note.findById(noteId);

  if (!note) {
    throw new NotFoundError('Note not found');
  }

  if (!note.user.equals(userId)) {
    throw new ForbiddenError('You are not allowed to access this note');
  }

  return note;
};

const updateNoteById = async ({ noteId, userId, text }) => {
  if (text === undefined) {
    throw new BadRequestError('Note text is required');
  }

  const note = await Note.findById(noteId);

  if (!note) {
    throw new NotFoundError('Note not found');
  }

  if (!note.user.equals(userId)) {
    throw new ForbiddenError('You are not allowed to update this note');
  }

  note.text = text;
  await note.save();

  return note;
};

const deleteNoteById = async ({ noteId, userId }) => {
  const note = await Note.findById(noteId);

  if (!note) {
    throw new NotFoundError('Note not found');
  }

  if (!note.user.equals(userId)) {
    throw new ForbiddenError('You are not allowed to delete this note');
  }

  await note.deleteOne();
  return note;
};

const deleteAllNotesByUser = async (userId) => {
  return Note.deleteMany({ user: userId });
};

module.exports = {
  createNote,
  getNotesByUser,
  getNoteById,
  updateNoteById,
  deleteNoteById,
  deleteAllNotesByUser,
};
