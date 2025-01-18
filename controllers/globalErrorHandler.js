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
    handleProductionErrors(res, err);
  }
};
