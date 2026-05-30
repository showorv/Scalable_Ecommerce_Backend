export interface PaginationMeta {
    page:       number;
    limit:      number;
    total:      number;
    totalPages: number;
    hasNext:    boolean;
    hasPrev:    boolean;
  }
  
  export class ApiResponse<T> {
    public readonly success: boolean;
    public readonly statusCode: number;
    public readonly message: string;
    public readonly data: T;
    public readonly pagination?: PaginationMeta;
  
    constructor(
      statusCode: number,
      message: string,
      data: T,
      pagination?: PaginationMeta
    ) {
      this.success    = statusCode < 400;
      this.statusCode = statusCode;
      this.message    = message;
      this.data       = data;
      if (pagination) this.pagination = pagination;
    }
  }