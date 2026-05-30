import "dotenv/config";
import express, { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import mongoSanitize from "express-mongo-sanitize";
import compression from "compression";
import rateLimit from "express-rate-limit";
import errorHandler from "./middlewares/GlobalError";


const app: Application = express();

//security handles
app.use(helmet());


app.use(
  cors({
    origin:      process.env.CLIENT_URL ?? "http://localhost:3000",
    credentials: true,
    methods:     ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })
);


app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// sanitize against nosql
app.use(mongoSanitize());

//Compression
app.use(compression());

//HTTP request logger
if (process.env.NODE_ENV !== "test") {
  app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
}

//global rate limiter 
const globalLimiter = rateLimit({
  windowMs:         15 * 60 * 1000, 
  max:              300,
  standardHeaders:  true,
  legacyHeaders:    false,
  message:          { success: false, message: "Too many requests, slow down." },
});
app.use("/api", globalLimiter);

//health
app.get("/health", (_req: Request, res: Response) => {
  res.json({
    status:    "ok",
    timestamp: new Date().toISOString(),
    env:       process.env.NODE_ENV,
  });
});

// ── API routes (registered here as modules are built) ────────────────────────
// import authRoutes    from "./modules/auth/auth.routes";
// import productRoutes from "./modules/product/product.routes";
// app.use("/api/v1/auth",    authRoutes);
// app.use("/api/v1/products", productRoutes);
// ... add more as you build each module

// not found
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

//global error
app.use(errorHandler);

export default app;