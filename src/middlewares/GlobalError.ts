import { Request, Response, NextFunction } from "express";

import mongoose from "mongoose";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { ZodError } from "zod";
import ApiError from "../app/utils/ApiError";





const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // ── Already a typed ApiError ────────────────────────────────────────────────
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success:    false,
      statusCode: err.statusCode,
      message:    err.message,
      errors:     err.errors,
    });
    return;
  }

  // ── Zod validation error ────────────────────────────────────────────────────
  if (err instanceof ZodError) {
    res.status(400).json({
      success:    false,
      statusCode: 400,
      message:    "Validation failed",
      errors:     err.errors.map((e) => ({
        field:   e.path.join("."),
        message: e.message,
      })),
    });
    return;
  }

  // ── Mongoose duplicate key ──────────────────────────────────────────────────
  if (
    err instanceof mongoose.mongo.MongoServerError &&
    err.code === 11000
  ) {
    const field = Object.keys(err.keyValue ?? {})[0] ?? "field";
    res.status(409).json({
      success:    false,
      statusCode: 409,
      message:    `${field} already exists`,
      errors:     [],
    });
    return;
  }

  // ── Mongoose cast error (invalid ObjectId) ──────────────────────────────────
  if (err instanceof mongoose.Error.CastError) {
    res.status(400).json({
      success:    false,
      statusCode: 400,
      message:    `Invalid ${err.path}: ${err.value}`,
      errors:     [],
    });
    return;
  }

  // ── JWT errors ──────────────────────────────────────────────────────────────
  if (err instanceof TokenExpiredError) {
    res.status(401).json({
      success:    false,
      statusCode: 401,
      message:    "Token expired",
      errors:     [],
    });
    return;
  }

  if (err instanceof JsonWebTokenError) {
    res.status(401).json({
      success:    false,
      statusCode: 401,
      message:    "Invalid token",
      errors:     [],
    });
    return;
  }

  // ── Fallback: unknown error ─────────────────────────────────────────────────
  console.error(" Unhandled error:", err);
  res.status(500).json({
    success:    false,
    statusCode: 500,
    message:    "Internal server error",
    errors:     [],
  });
};

export default errorHandler;