import { authRepository } from "@/app/modules/auth/auth.repository";
import ApiError from "@/app/utils/ApiError";
import { verifyAccessToken } from "@/app/utils/jwtToken";
import { Request, Response, NextFunction } from "express";


// Extend Express Request type to carry auth context


/**
 * verifyToken
 * -----------
 * Reads Bearer token from Authorization header, verifies its signature,
 * and attaches the decoded payload to req.user.
 *
 * Pair with populateUser (below) when you need the full user document.
 */
export const verifyToken = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    throw ApiError.unauthorized("No access token provided");
  }

  const token = authHeader.slice(7);
  const payload = verifyAccessToken(token); // throws ApiError on failure

  (req as any).user = payload;
  next();
};

/**
 * populateUser
 * ------------
 * Optional follow-on middleware. After verifyToken, fetches the full
 * user document from DB and attaches it to req.user.
 *
 * Use only on routes that actually need the full user object (e.g. GET /me).
 * Skipping it on other protected routes saves a DB query per request.
 */
export const populateUser = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user?.userId) {
    next(ApiError.unauthorized("Not authenticated"));
    return;
  }

  const user = await authRepository.findById(req.user.userId);
  if (!user) {
    next(ApiError.unauthorized("User no longer exists"));
    return;
  }

  // Overwrite the lean payload with the full Mongoose document
  req.user = user as any;
  next();
};