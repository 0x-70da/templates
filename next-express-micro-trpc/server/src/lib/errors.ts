export class AppError extends Error {
  public statusCode: number;
  public error: unknown;

  constructor(message: string, statusCode: number, error?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.error = error;
  }
}
