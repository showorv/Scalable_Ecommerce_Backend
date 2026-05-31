import ApiError from "@/app/utils/ApiError"
import User, { IUser } from "../user/User.model"
import { Response } from "express";
import { authRepository } from "./auth.repository"
import bcrypt from "bcryptjs";
import { clearRefreshCookie, issueTokenPair, verifyRefreshToken } from "@/app/utils/jwtToken";
export const authService = {
    async register(data: {
        name: string,
        email:string,
        password: string
    }): Promise<IUser> {

        const existing  = await authRepository.findByEmail(data.email) 

        if (existing) {
            throw ApiError.conflict("An account with this email already exists");
          }

          const passwordHash = await bcrypt.hash(data.password, 12);

          const user = await authRepository.create({
            name: data.name,
            email: data.email,
            passwordHash,
          });
       
          return user;
    },
    
  async login(
    email: string,
    password: string,
    res: Response
  ): Promise<{ accessToken: string; user: IUser }> {
    const user = await authRepository.findByEmail(email);
    if (!user) {
      // Timing-safe: run bcrypt even on miss to prevent user-enumeration
      await bcrypt.compare(password, "$2b$12$invalidhashpadding000000000000");
      throw ApiError.unauthorized("Invalid email or password");
    }
 
    const valid = await user.comparePassword(password);
    if (!valid) {
      throw ApiError.unauthorized("Invalid email or password");
    }
 
    const { accessToken } = await issueTokenPair(user, res);
    return { accessToken, user };
  },
 
  async logout(userId: string, res: Response): Promise<void> {
    await authRepository.clearRefreshToken(userId);
    clearRefreshCookie(res);
  },
 
  async refreshAccessToken(
    incomingToken: string | undefined,
    res: Response
  ): Promise<{ accessToken: string }> {
    if (!incomingToken) {
      throw ApiError.unauthorized("Refresh token missing");
    }
 
    const payload = verifyRefreshToken(incomingToken);
    const user = await authRepository.findByIdWithSensitive(payload.userId);
 
    if (!user || user.refreshToken !== incomingToken) {
      // Token reuse detected — clear stored token (security measure)
      if (user) await authRepository.clearRefreshToken(user.id);
      throw ApiError.unauthorized("Refresh token reuse detected");
    }
 
    return issueTokenPair(user, res);
  },

  async handleGoogleCallback(profile: {
    id: string;
    emails?: { value: string }[];
    displayName: string;
    photos?: { value: string }[];
  }): Promise<IUser> {
    const email = profile.emails?.[0]?.value;
    if (!email) throw ApiError.badRequest("Google account has no email");
 
    const user = await authRepository.upsertGoogleUser({
      googleId: profile.id,
      email,
      name: profile.displayName,
      avatar: profile.photos?.[0]?.value,
    });
 
    return user;
  }
}