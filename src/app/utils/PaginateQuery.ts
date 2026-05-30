import { Request } from "express";
import { PaginationMeta } from "./ApiResponse";

export interface PaginationOptions {
  page:  number;
  limit: number;
  skip:  number;
}

/** Parse ?page=1&limit=20 from the query string with safe defaults */
export const getPaginationOptions = (req: Request): PaginationOptions => {
  const page  = Math.max(1, parseInt(req.query.page  as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
  const skip  = (page - 1) * limit;
  return { page, limit, skip };
};

/** Build the pagination meta block for ApiResponse */
export const buildPaginationMeta = (
  total: number,
  { page, limit }: PaginationOptions
): PaginationMeta => {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
};