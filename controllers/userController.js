const User = require('../models/userModel');
const AppError = require('../utilities/appError');
const catchAsync = require('../utilities/catchAsync');

exports.getUsersData = async (req, res, next) => {
  const users = await User.find();

  if (!users) return next(new AppError('No users found!', 404));

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  });
};

exports.getUserData = catchAsync(async (req, res, next) => {
  const user = await User.find({ _id: req.params.id });

  if (!user) return next(new AppError('No user found with that Id', 404));

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

exports.addTask = catchAsync(async (req, res, next) => {
  const newTask = req.body;

  const user = await User.findById({ _id: req.user._id });

  user.tasks.push(newTask);

  // to turn off the validation before save the doc
  await user.save({ validateBeforeSave: false });

  res.status(201).json({
    status: 'success',
    data: {
      user,
    },
  });
});
