export type ValidationIssue = {
  path: string;
  message: string;
  code: string;
};

type HttpErrorOptions = {
  code?: string;
  issues?: ValidationIssue[];
};

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly options: HttpErrorOptions = {},
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export const isHttpError = (error: unknown): error is HttpError => {
  return error instanceof HttpError;
};

const defaultErrorCode = (status: number) => {
  if (status === 400) return "business_error";
  if (status === 401) return "unauthorized";
  if (status === 404) return "not_found";
  if (status >= 500) return "internal_error";
  return "http_error";
};

export const createErrorResponseBody = (
  status: number,
  message: string,
  options: HttpErrorOptions = {},
) => {
  return {
    code: options.code ?? defaultErrorCode(status),
    message,
    ...(options.issues?.length ? { issues: options.issues } : {}),
  };
};

export const getHttpErrorResponseBody = (error: HttpError) => {
  return createErrorResponseBody(error.status, error.message, error.options);
};
