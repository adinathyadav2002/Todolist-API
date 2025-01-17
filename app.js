const express = require('express');

const morgan = require('morgan');

// const User = require('./models/userModel');

const app = express();

const usersRouter = require('./routes/userRoutes');

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());

app.use('/api/v1/users', usersRouter);

// app.get('/', async (req, res) => {
//   const users = await User.find();
//   res.status(200).json({
//     data: users,
//   });
// });

module.exports = app;
