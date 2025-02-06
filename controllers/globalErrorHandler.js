const AppError = require('../utilities/appError');

// handle duplication errors while posting the data
const handleDuplicationErrorDB = (err) => {
  const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/);
  return new AppError(
    `Duplicate field value: ${value[0]}. Please use another value!`,
    400,
  );
};

// Handle validation errors from mongodb
const handleValidationErrorDB = (err) => {
  const message = Object.entries(err.errors)
    .map(([, val]) => val.properties.message)
    .join('. ');
  return new AppError(message, 400);
};

// Handle production errors
const handleDevelopementErrors = (res, err) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

// Handle development errors
const handleProductionErrors = (res, err) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      message: err.message,
      status: err.status,
    });
  } else {
    console.log('Error : ', err);
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong!',
    });
  }
};

module.exports = (err, req, res, next) => {
  // set default status code and status
  err.status = err.status || 'error';
  err.statusCode = err.statusCode || 500;

  if (process.env.NODE_ENV === 'development') {
    handleDevelopementErrors(res, err);
  } else {
    /* eslint-disable*/
    let error = { ...err };
    /* eslint-disable*/
    error.message = err.message;

    if (err.code === 11000) {
      error = handleDuplicationErrorDB(err);
    }
    if (err.name === 'ValidationError') {
      error = handleValidationErrorDB(err);
    }
    handleProductionErrors(res, error);
  }
};
