const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A User must have name'],
  },

  totalTasks: {
    type: Number,
    default: 0,
  },
  tasksCompleted: {
    type: Number,
    default: 0,
  },
  tasksRemaining: {
    type: Number,
    default: 0,
  },
  active: Boolean,
  password: {
    type: String,
  },
  email: {
    type: String,
    unique: true,
  },
  tasks: [
    {
      taskName: String,
      createdAt: {
        type: Date,
        default: Date.now(),
      },
      timeRequire: Number,
      isCompleted: Boolean,
    },
  ],
});

const User = mongoose.model('User', userSchema);

module.exports = User;
