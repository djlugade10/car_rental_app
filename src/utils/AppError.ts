export class AppError extends Error {
  public readonly code: string;
  public readonly status: number;

  constructor(message: string, code: string, status: number = 500) {
    super(message);
    this.code = code;
    this.status = status;
    Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
  }
}
