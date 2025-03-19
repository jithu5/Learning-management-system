export class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.success = false;
    this.data = null;
    this.isOperational = true; // isOperational
    Error.captureStackTrace(this, this.constructor);
  }
}

export const AsyncHandler = (fn) => {
  return (req, res, next) => {
    try {
      fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};
