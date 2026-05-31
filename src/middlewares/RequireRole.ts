import ApiError from "@/app/utils/ApiError";
import { TokenPayload } from "@/app/utils/jwtToken";
import { Request, Response, NextFunction } from "express";


type Role = "user" | "admin";

/**
 * requireRole
 * -----------
 * Role-based access control. Must be used AFTER verifyToken.
 *
 * Usage:
 *   router.get("/dashboard", verifyToken, requireRole("admin"), handler)
 *   router.get("/orders",    verifyToken, requireRole("user", "admin"), handler)
 */
export const requireRole = (...allowedRoles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const user = req.user as TokenPayload | undefined;

    if (!user) {
      next(ApiError.unauthorized("Not authenticated"));
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      next(
        ApiError.forbidden(
          `Access denied. Required role: ${allowedRoles.join(" or ")}`
        )
      );
      return;
    }

    next();
  };
};