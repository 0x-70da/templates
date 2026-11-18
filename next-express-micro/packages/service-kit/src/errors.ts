export class AppError extends Error {
  public readonly statusCode: number;
  public readonly error: unknown;

  constructor(message: string, statusCode: number, error?: unknown) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.error = error;
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message = "Service unavailable", error?: unknown) {
    super(message, 503, error);
  }
}

export class GatewayTimeoutError extends AppError {
  constructor(message = "Gateway timeout", error?: unknown) {
    super(message, 504, error);
  }
}
