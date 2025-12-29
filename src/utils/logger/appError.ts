class AppError extends Error {
  statusCode: number;
  status: string;
  constructor(message: string, statusCode: number, status: string) {
    super(message);
    this.statusCode = statusCode;
    this.status = status.startsWith("4") ? "fail" : "error";
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
