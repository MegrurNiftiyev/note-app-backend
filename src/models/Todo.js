const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: [true, 'Todo description is required'],
      trim: true,
      maxlength: [500, 'Todo description must be at most 500 characters long'],
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.user;
        return ret;
      },
    },
  }
);

module.exports = mongoose.model('Todo', todoSchema);
