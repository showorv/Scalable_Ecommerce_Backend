import cookieParser from "cookie-parser";
import { Router } from "express";
import rateLimit from "express-rate-limit";
import { getMe, googleCallback, login, logout, refreshToken, register } from "./auth.controller";
import { verifyToken } from "../../../middlewares/VerifyToken.middleware";
import passport from "passport";
import { envVars } from "../../config/env";



const router = Router()

const authLimiter = rateLimit({
    windowMs: 15*60*1000, //15mint
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message:{
        success: false,
        message: "Too many attempts. please try again after 15 mintues"
    },
    skipSuccessfulRequests: true //only count failed req
})

// slightly looser limiter
const refreshLimiter = rateLimit({

    windowMs: 15*60*1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message:{
        success: false,
        message: "Too many attempts. "
    },
})


router.use(cookieParser()) // needed for cookie in refresh token

router.post("/register" , authLimiter, register)
router.post("/login" , authLimiter, login)
router.post("/refresh-token" , refreshLimiter, refreshToken)


router.post("/logout" , verifyToken, logout)
router.get("/me" , verifyToken, getMe)


// google

router.get("/google", passport.authenticate("google", {
    scope: ["profile","email"],
    session: false
}))

router.get("/google/callback", passport.authenticate("google", {
    failureRedirect: `${envVars.CLIENT_URL}/login?error=oauth_failed`,
    session: false
}),
googleCallback
)


export const authRoutes = router