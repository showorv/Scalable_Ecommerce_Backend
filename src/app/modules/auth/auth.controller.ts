

import { Request, Response } from "express";
import { authService,  } from "./auth.service";
import { registerSchema, loginSchema } from "./auth.validator";


import asyncHandler from "@/app/utils/AsyncHandler";
import { IUser } from "../user/User.model";
import { issueTokenPair } from "@/app/utils/jwtToken";
import { envVars } from "@/app/config/env";

// ─── Register ─────────────────────────────────────────────────────────────────

export const register = asyncHandler(async (req: Request, res: Response) => {
  const body = registerSchema.parse(req.body);

  const user = await authService.register(body);

  res.status(201).json({
    success: true,
    message: "user register successfully",
    data: user
})
});

// ─── Login ────────────────────────────────────────────────────────────────────

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = loginSchema.parse(req.body);

  const { accessToken, user } = await authService.login(email, password, res);

  res.status(201).json({
    success: true,
    message: "user loggedin successfully",
    data: {
        accessToken, user
    }
})
});



export const logout = asyncHandler(async (req: Request, res: Response) => {

  const userId = (req as any).user.userId as string;
  await authService.logout(userId, res);

  res.status(201).json({
    success: true,
    message: "user loggedout successfully",
    data: null
})
});



export const refreshToken = asyncHandler(
  async (req: Request, res: Response) => {
   
    const token: string | undefined =
      req.cookies?.refreshToken ?? req.body?.refreshToken;

    const { accessToken } = await authService.refreshAccessToken(token, res);

    res.status(201).json({
        success: true,
        message: "user refresh token get successfully",
        data: refreshToken
    })
  }
);



export const getMe = asyncHandler(async (req: Request, res: Response) => {

  const user = (req as any).user as IUser;
  res.status(201).json({
    success: true,
    message: "profile fetched",
    data: user
})
});



export const googleCallback = asyncHandler(
  async (req: Request, res: Response) => {
    // passport populates req.user after successful OAuth
    const user = ( req as any).user as IUser;
    if (!user) throw new Error("OAuth user missing");

    const { accessToken } = await issueTokenPair(user, res);

    // Redirect to frontend with token in query param
    // (frontend stores it in memory, never in localStorage)
    const clientUrl = envVars.CLIENT_URL ?? "http://localhost:5173";
    res.redirect(`${clientUrl}/auth/callback?token=${accessToken}`);
  }
);