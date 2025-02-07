const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

// const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    trim: true,
    required: [true, 'A User must have name'],
    // allow only capital, small letters and spaces in name string
    validate: {
      validator: function (val) {
        return !val.split('').some((letter) => {
          if (
            (letter >= 'A' && letter <= 'Z') ||
            (letter >= 'a' && letter <= 'z') ||
            letter === ' '
          )
            return false;
          return true;
        });
      },
      message: 'User name must only contain characters',
    },
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
  photo: {
    type: String,
    default: 'default.jpg',
  },
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  password: {
    type: String,
    required: [true, 'Please enter password!'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm password!'],
    validate: {
      // we get current
      validator: function (val) {
        return this.password === val;
      },
      message: 'Password and confirm password must be same!',
    },
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    required: [true, 'Please enter your mail.'],
    validate: [validator.isEmail, 'Please provide valid Email!'],
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  tasks: [
    {
      title: {
        type: String,
        required: [true, 'A Task must have title'],
      },
      description: String,
      createdAt: {
        type: Date,
        default: Date.now(),
      },
      timeRequired: Number,
      status: {
        type: String,
        enum: ['completed', 'in-progress', 'pending'],
        default: 'pending',
      },
      priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'low',
      },
      completedAt: Date,
      dueDate: {
        type: Date,
        default: Date.now(),
      },
    },
  ],
});

// query middleware to remove the accounts which
// are not active from results
userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

// document middleware to encrypt password using bcrypt with salt of 12
userSchema.pre('save', async function (next) {
  // in document middleware this points to current document

  // isModified and isNew are used to track the changes in document
  if (!this.isModified('password')) next();

  this.password = await bcrypt.hash(this.password, 12);

  this.passwordConfirm = undefined;

  next();
});

// document middleware to add passwordChangedAt field before saving the doc.
userSchema.pre('save', function (next) {
  if (!this.isModified('password')) return next();

  // because hashing the password using bcrypt takes time
  this.passwordChangedAt = Date.now() - 1000;

  next();
});

userSchema.methods.checkCorrectPassword = async (
  candidatePassword,
  userPassword,
) => await bcrypt.compare(candidatePassword, userPassword);

// instance method
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

userSchema.methods.checkPasswordChanged = function (jwtTimestamp) {
  if (this.passwordChangedAt) {
    // convert it into minutes
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );
    return jwtTimestamp < changedTimestamp;
  }
  return false;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
