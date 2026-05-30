import "dotenv/config";
import app from "./app";


import connectDB from "./app/config/db";
import redis from "./app/config/redis";

const PORT = parseInt(process.env.PORT ?? "5000", 10);

const startServer = async (): Promise<void> => {
  try {
   
    await connectDB();

    
    await redis.ping();

   
    const server = app.listen(PORT, () => {
      console.log(
        ` Server running in ${process.env.NODE_ENV} mode on http://localhost:${PORT}`
      );
    });

    // Graceful shutdown
    const shutdown = async (signal: string): Promise<void> => {
      console.log(`\n ${signal} received — shutting down gracefully`);
      server.close(async () => {
        await redis.quit();
        console.log("Redis disconnected");
        process.exit(0);
      });

      // Force exit after 10 s if connections hang
      setTimeout(() => {
        console.error(" Forced shutdown after timeout");
        process.exit(1);
      }, 10_000);
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT",  () => shutdown("SIGINT"));

    // ── Unhandled rejections / exceptions ─────────────────────────────────────
    process.on("unhandledRejection", (reason) => {
      console.error(" Unhandled Rejection:", reason);
      server.close(() => process.exit(1));
    });

    process.on("uncaughtException", (error) => {
      console.error("Uncaught Exception:", error);
      process.exit(1);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();