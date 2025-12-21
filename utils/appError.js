class AppError extends Error {

    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith(4) ? 'fail' : 'error';
        this.isOperational = true; // neceserray to know it came from our code.
        Error.captureStackTrace(this, this.constructor); // not pollute the trace.
    }

}
module.exports = AppError;