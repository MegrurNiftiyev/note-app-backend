const Note = require('../models/Note');
const {
  BadRequestError,
  NotFoundError,
} = require('../errors/customErrors');

const createNote = async ({ title, content, userId }) => {
  return Note.create({ title, content, user: userId });
};

const getNotesByUser = async (userId) => {
  return Note.find({ user: userId }).sort({ createdAt: -1 });
};

const getNoteById = async ({ noteId, userId }) => {
  const note = await Note.findOne({ _id: noteId, user: userId });

  if (!note) {
    throw new NotFoundError('Note not found');
  }

  return note;
};

const updateNoteById = async ({ noteId, userId, title, content }) => {
  if (title === undefined && content === undefined) {
    throw new BadRequestError('Note title or content is required');
  }

  const note = await Note.findOne({ _id: noteId, user: userId });

  if (!note) {
    throw new NotFoundError('Note not found');
  }

  if (title !== undefined) {
    note.title = title;
  }

  if (content !== undefined) {
    note.content = content;
  }

  await note.save();

  return note;
};

const deleteNoteById = async ({ noteId, userId }) => {
  const note = await Note.findOne({ _id: noteId, user: userId });

  if (!note) {
    throw new NotFoundError('Note not found');
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
