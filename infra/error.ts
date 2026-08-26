interface IErrorJSON {
  name: string;
  message: string;
  action: string;
  status_code: number;
}

interface IBaseError {
  name: string;
  message: string;
  action: string;
  statusCode: number;
  toJSON(): IErrorJSON;
}

export class InternalServerError extends Error implements IBaseError {
  action: string;
  statusCode: number;

  constructor({ cause, statusCode }: { cause?: unknown; statusCode?: number }) {
    super("An unexpected internal error occurred.", {
      cause,
    });
    this.name = "InternalServerError";
    this.action = "Contact support.";
    this.statusCode = statusCode || 500;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}

export class ServiceError extends Error implements IBaseError {
  action: string;
  statusCode: number;

  constructor({ cause, message }: { cause?: unknown; message?: string }) {
    super(message || "Service unavailable at the moment.", {
      cause,
    });
    this.name = "ServiceError";
    this.action = "Check if the service is available.";
    this.statusCode = 503;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}

export class MethodNotAllowedError extends Error implements IBaseError {
  action: string;
  statusCode: number;

  constructor() {
    super("Method not allowed for this endpoint.");
    this.name = "MethodNotAllowedError";
    this.action = "Check if the HTTP method sent is valid for this endpoint.";
    this.statusCode = 405;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}

export class ValidationError extends Error implements IBaseError {
  action: string;
  statusCode: number;

  constructor({
    cause,
    message,
    action,
  }: {
    cause?: unknown;
    message?: string;
    action?: string;
  }) {
    super(message || "A validation error occurred.", {
      cause,
    });
    this.name = "ValidationError";
    this.action = action || "Adjust the data and try again.";
    this.statusCode = 400;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}

export class NotFoundError extends Error implements IBaseError {
  action: string;
  statusCode: number;

  constructor({
    cause,
    message,
    action,
  }: {
    cause?: unknown;
    message?: string;
    action?: string;
  }) {
    super(message || "Could not find this resource in the system.", {
      cause,
    });
    this.name = "NotFoundError";
    this.action = action || "Check if the parameters in the query are correct.";
    this.statusCode = 404;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}

export class UnauthorizedError extends Error implements IBaseError {
  action: string;
  statusCode: number;

  constructor({
    cause,
    message,
    action,
  }: {
    cause?: unknown;
    message?: string;
    action?: string;
  }) {
    super(message || "User not authenticated.", {
      cause,
    });
    this.name = "UnauthorizedError";
    this.action = action || "Log in again to continue.";
    this.statusCode = 401;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}
