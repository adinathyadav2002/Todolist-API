const dotEnv = require('dotenv');

const mongoose = require('mongoose');

// the order of files matter
dotEnv.config({ path: './config.env' });
const app = require('./app');

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`App running on port ${port}`);
});

const DBLink = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASEPASS,
);

mongoose.connect(DBLink, {});
