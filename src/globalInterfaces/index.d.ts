import { JwtPayload } from "jsonwebtoken";

export interface AuthPayload extends JwtPayload {
  _id: string;
  email: string;
  role: "user" | "admin";
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload  
    }
  }
}

export {};