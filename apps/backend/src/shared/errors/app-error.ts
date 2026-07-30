import type { JsonValue } from "../../types/json";

export interface AppErrorInput {
  statusCode: number;
  code: string;
  message: string;
  details?: JsonValue;
  isOperational?: boolean;
}

export class AppError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly details: JsonValue | undefined;
  readonly isOperational: boolean;

  constructor(input: AppErrorInput) {
    super(input.message);
    this.name = "AppError";
    this.statusCode = input.statusCode;
    this.code = input.code;
    this.details = input.details;
    this.isOperational = input.isOperational ?? true;
  }
}
