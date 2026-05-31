import passport from "passport";
import {
  Strategy as GoogleStrategy,
  Profile,
  VerifyCallback,
} from "passport-google-oauth20";
import { authService } from "../modules/auth/auth.service";
import { envVars } from "./env";


passport.use(
  new GoogleStrategy(
    {
      clientID: envVars.GOOGLE_CLIENT_ID as string,
      clientSecret: envVars.GOOGLE_CLIENT_SECRET as string,
      callbackURL: envVars.GOOGLE_CALLBACK_URL,
    },
    async (_accessToken: string, _refreshToken: string, profile: Profile, done: VerifyCallback) => {
      try {
        const user = await authService.handleGoogleCallback(profile);
        done(null, user);
      } catch (err) {
        done(err as Error);
      }
    }
  )
);

// No sessions — JWT is stateless, so we skip serialize/deserialize
// If you ever enable sessions, add passport.serializeUser / deserializeUser here

export default passport;