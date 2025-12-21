const mongoose = require('mongoose');
const dotenv = require('dotenv');

// on top before app 
process.on('uncaughtException', err => {
  console.log("Uncaugh Exception 💥 Shutting down...")
  console.log(err.name, err.message);
  process.exit(1); // exit with an error
})


dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(() => console.log('DB connection successful!'))

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

// can be at the end
process.on('unhandledRejection', err => {
  console.log("Unhandled Rejection 💥 Shutting down...")
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1); // exit with an error
  })
})
