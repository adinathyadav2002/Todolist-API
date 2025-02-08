const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { promisify } = require('util');

const sendMail = require('../utilities/email');
const User = require('../models/userModel');
const catchAsync = require('../utilities/catchAsync');
const AppError = require('../utilities/appError');

exports.protect = catchAsync(async (req, res, next) => {
  // 1) get jwt from header
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token)
    return next(
      new AppError('You are not logged in! Please log in to get access.'),
    );

  // 2) verify token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) check if the user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser)
    return next(
      new AppError('The user belonging to token no longer exists!', 401),
    );

  // 4) check if user has changed the password
  if (currentUser.checkPasswordChanged(decoded.iat))
    return next(
      new AppError('User recently changed password! Please login again.', 401),
    );

  // for us to use it in the next middlewares
  req.user = currentUser;
  next();
});

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    // HttpOnly flag set so it is not accessible by JavaScript on the client side.
    // The HttpOnly flag helps prevent XSS attacks.
    httpOnly: true,
    secure: true,
    sameSite: 'none',
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  newUser.password = undefined;

  res.status(200).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    return next(new AppError('Please provide email and password!', 400));

  const user = await User.findOne({ email: email }).select('+password');

  if (!user || !(await user.checkCorrectPassword(password, user.password))) {
    return next(new AppError('Please provide valid email or password!', 401));
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
    // secure: true, Only send the cookie over HTTPS, not HTTP
    // sameSite: 'None': Allow the cookie to be sent with cross-origin requests,
    // essential for different domains or ports
    // (like frontend and backend running on different ports during development).
    sameSite: 'none',
    secure: 'true',
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  user.password = undefined;

  res.status(200).json({
    status: 'success',
    token,
    data: {
      user: user,
    },
  });
};

exports.logOut = (req, res) => {
  // changed the value of jwt cookie to log out
  res.cookie('jwt', 'loggedOut', {
    expires: new Date(Date.now() + 10000),
    httpOnly: true,
    sameSite: 'none',
    secure: 'true',
  });

  res.status(200).json({ status: 'success' });
};

exports.forgotPassword = async (req, res, next) => {
  // 1) get user  from email
  const user = await User.findOne({ email: req.body.email });

  // 2) if there is no user send error to global error handler
  if (!user) return next(new AppError('There is no user with that email', 404));

  // 3) generate random token
  const resetToken = user.createPasswordResetToken();

  // 4) added passwordRestToken and passwordResetTokenExpires so save the document
  await user.save({ validateBeforeSave: false });

  // 3) send it to user's email
  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a patch request with your new password and passwordConfirm to ${resetURL}.\n If you don't forgot your password, Please ignore this mail.`;

  try {
    // this will send the mail
    await sendMail({
      email: user.email,
      subject: 'Your password reset token(Valid for 10 min)',
      text: message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
      message2: message,
    });
  } catch (err) {
    user.passwordResetExpires = undefined;
    user.passwordResetToken = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('There was error sending the email.Try again later!', 500),
    );
  }
};

exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) return next(new AppError('Token is invalid or Expired!', 400));

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  // save the changes to database
  await user.save();

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  const cookieOptions = {
    expiresIn: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  user.password = undefined;

  res.status(200).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
});
