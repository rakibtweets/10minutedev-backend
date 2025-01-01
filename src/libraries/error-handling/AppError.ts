class AppError extends Error {
  public HTTPStatus: number;
  public isTrusted: boolean;
  public cause: Error | null;

  constructor(
    name: string,
    message: string,
    HTTPStatus: number = 500,
    isTrusted: boolean = true,
    cause: Error | null = null
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
    this.name = name;
    this.HTTPStatus = HTTPStatus;
    this.isTrusted = isTrusted;
    this.cause = cause;
    // console.log(this);
    // Setting the prototype explicitly to fix issues with instanceof
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message: string, cause: Error | null = null) {
    super('ValidationError', message, 400, true, cause);
  }
}

export { AppError, ValidationError };
