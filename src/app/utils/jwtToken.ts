import { envVars } from "@/app/config/env";
import ApiError from "@/app/utils/ApiError";
import jwt, { SignOptions } from "jsonwebtoken"
import { Response } from "express";
import { IUser } from "../modules/user/User.model";
import { authRepository } from "../modules/auth/auth.repository";

export interface TokenPayload {
    userId: string;
    role: "user" | "admin";
  }

  export const generateAccessToken = (payload: TokenPayload): string => {

    return jwt.sign(payload, envVars.JWT_ACCESS_SECRET, {
        expiresIn: envVars.JWT_ACCESS_EXPIRES
    } as SignOptions)
  }
  export const generateRefreshToken = (payload: TokenPayload): string => {

    return jwt.sign(payload, envVars.JWT_REFRESH_SECRET, {
        expiresIn: envVars.JWT_REFRESH_EXPIRES
    } as SignOptions)
  }

  export const verifyAccessToken = (token: string): TokenPayload => {
    try {
      return jwt.verify(token, envVars.JWT_ACCESS_SECRET) as TokenPayload;
    } catch {
      throw ApiError.unauthorized("Invalid or expired access token");
    }
  };

  export const verifyRefreshToken = (token: string): TokenPayload => {
    try {
      return jwt.verify(token, envVars.JWT_REFRESH_SECRET) as TokenPayload;
    } catch {
      throw ApiError.unauthorized("Invalid or expired refresh token");
    }
  };

  export const setRefreshCookie = (res: Response, token: string): void => {
    res.cookie("refreshToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/api/v1/auth", // scope cookie to auth routes only
    });
  };
   
  export const clearRefreshCookie = (res: Response): void => {
    res.clearCookie("refreshToken", { path: "/api/v1/auth" });
  };


  // login-> call issueTokenpair -> get accesstoken in frontend and refreshtoken in cookie -> when accesstoekn expires it called refreshtoken

  export const issueTokenPair = async (
    user: IUser,
    res: Response
  ): Promise<{ accessToken: string }> => {
    const payload: TokenPayload = {
      userId: String(user._id),
      role: user.role,
    };
   
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);
   
    // Persist refresh token (rotation strategy: one token per user)saving it in DB
    await authRepository.saveRefreshToken(String(user._id), refreshToken);
   
    setRefreshCookie(res, refreshToken);
   
    return { accessToken };
  };