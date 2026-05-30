class ApiError extends Error {
    public readonly statusCode: number;
    public readonly errors: unknown[];
    public readonly isOperational: boolean;
  
    constructor(
      statusCode: number,
      message: string,
      errors: unknown[] = [],
      stack?: string
    ) {
      super(message);
      this.statusCode    = statusCode;
      this.errors        = errors;
      this.isOperational = true;
  
      if (stack) {
        this.stack = stack;
      } else {
        Error.captureStackTrace(this, this.constructor);
      }
    }
  
  
    static badRequest(message = "Bad request", errors: unknown[] = []) {
      return new ApiError(400, message, errors);
    }
  
    static unauthorized(message = "Unauthorized") {
      return new ApiError(401, message);
    }
  
    static forbidden(message = "Forbidden") {
      return new ApiError(403, message);
    }
  
    static notFound(message = "Resource not found") {
      return new ApiError(404, message);
    }
  
    static conflict(message = "Conflict") {
      return new ApiError(409, message);
    }
  
    static tooManyRequests(message = "Too many requests") {
      return new ApiError(429, message);
    }
  
    static internal(message = "Internal server error") {
      return new ApiError(500, message);
    }
  }

  export default ApiError