const express = require('express');

const morgan = require('morgan');

// Error handling
const globalErrorHandler = require('./controllers/globalErrorHandler');
const AppError = require('./utilities/appError');

const app = express();

const usersRouter = require('./routes/userRoutes');

// To show HTML req for developer
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parser (parse the req.body)
app.use(express.json());

app.use('/api/v1/users', usersRouter);

// If above routes not found throw error
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// This will handle the error with err object in next(err_object) ex: next(new Error('something'))
app.use(globalErrorHandler);

module.exports = app;
