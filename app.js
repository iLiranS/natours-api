const express = require('express');
const morgan = require('morgan');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController')
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const hpp = require('hpp')

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes')

const app = express();

// 1) GLOBAL MIDDLEWARES

// 1.1) security related
app.use(helmet())
const limiter = rateLimit({
  max: 100, // 100 requests
  windowMs: 60 * 60 * 1000, // 1 hour
  message: "Too many requests from this IP! try again later"
})
app.use('/api', limiter)

// development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// body parser
app.use(express.json({ limit: '10kb' })); // max 10kb sent in body

// Sanitization against NoSQL query injection and xss
app.use(mongoSanitize())
app.use(xss())
// parameter pollution
app.use(hpp({
  whitelist: ['duration', 'ratingsQuantity', 'ratingsAverage', 'maxGroupSize', 'difficulty', 'price']
}))

// serving static files
app.use(express.static(`${__dirname}/public`));

// testing ^_^
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 3) ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter)

app.all('*', (req, res, next) => {
  next(new AppError(`${req.originalUrl} not found`, 404));
});

//error handler middleware
app.use(globalErrorHandler)
module.exports = app;
