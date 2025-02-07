const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const app = express();

const allowedOrigins = ['http://127.0.0.1:3000', 'http://localhost:3000'];

app.use(
  cors({
    // origin: '*', for all origins
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true, // 🔥 Important: Allows cookies
  }),
);

// To show HTML req for developer
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Error handling
const globalErrorHandler = require('./controllers/globalErrorHandler');
const AppError = require('./utilities/appError');

const usersRouter = require('./routes/userRoutes');

// Body parser (parse the req.body)
app.use(cookieParser());
app.use(express.json());

app.use('/api/v1/users', usersRouter);

// If above routes not found throw error
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// This will handle the error with err object in next(err_object) ex: next(new Error('something'))
app.use(globalErrorHandler);

module.exports = app;
