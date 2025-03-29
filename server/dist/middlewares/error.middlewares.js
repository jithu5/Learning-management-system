export class ApiError extends Error {
    statusCode;
    status;
    success;
    data;
    isOperational;
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
        this.success = false;
        this.data = null;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
export const AsyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
