const Note = require('../models/Note');
const { ForbiddenError, NotFoundError } = require('../errors/customErrors');

const createNote = async ({ text, userId }) => {
  return Note.create({ text, user: userId });
};

const getNotesByUser = async (userId) => {
  return Note.find({ user: userId }).sort({ createdAt: -1 });
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
  deleteNoteById,
  deleteAllNotesByUser,
};
