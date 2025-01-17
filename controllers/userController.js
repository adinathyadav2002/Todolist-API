const User = require('../models/userModel');

exports.getUsersData = async (req, res) => {
  const users = await User.find();

  res.status(200).json({
    status: 'success',
    data: {
      users,
    },
  });
};

exports.getUserData = async (req, res) => {
  const user = await User.find({ _id: req.params.id });

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
};
