const AppError = require("../utils/appError");

// mongoose invalid path
const handleCastErrorDB = err => {
    const message = `Invlaid ${err.path} : ${err.value}`;
    return new AppError(message, 400);
}
// mongoose invalid validation (might be multiple incorrect values)
const handleValidationErrorDB = err => {
    const errors = Object.values(err.errors).map(error => error.message).join(', ')
    const message = `Invalid inputs : ${errors}`
    return new AppError(message, 400);
}
// duplicate fields
const handleDuplicateFieldsdB = err => {
    const val = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    const message = `Duplicate field value: ${val} , please use another value`
    return new AppError(message, 400)
}
const handleJWTInvalidToken = () => new AppError('Invalid Token ! Please log in again', 401)



module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error'

    // development
    if (process.env.NODE_ENV === 'development') {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
            stack: err.stack,
            error: err
        })
    }

    // production 
    else {
        let error = { ...err };
        if (error.name === 'CastError') error = handleCastErrorDB(error)
        if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
        if (error.code === 11000) error = handleDuplicateFieldsdB(error);
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') error = handleJWTInvalidToken();
        // production - operational (trusted known error)
        if (error.isOperational)
            res.status(error.statusCode).json({
                status: error.status,
                message: error.message
            })
        // production - non operational (unknown, unhandled)
        else {
            console.error("ERROR 💥", error);
            res.status(500).json({ status: "error", message: "something went wrong" })
        };
    }

}