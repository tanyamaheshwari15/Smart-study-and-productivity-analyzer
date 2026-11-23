import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { connectDB } from "./config/db.js";
import routes from "./routes/index.js";
import { notFound } from "./middleware/notFound.js";
import { errorHandler } from "./middleware/errorHandler.js";

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();


// Middleware
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(express.json({ limit: "100kb" }));
app.use("/api", rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: "draft-7", legacyHeaders: false }));

// Allow the configured frontend origin in production, but permit any origin during
// local development (useful when Vite picks a different port like 5174).
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
const corsOptions =
  process.env.NODE_ENV === "production"
    ? { origin: frontendUrl, credentials: true }
    : { origin: true, credentials: true };

app.use(cors(corsOptions));

// Validate required production configuration.
if (!process.env.MONGODB_URI) {
  console.warn("MONGODB_URI is not set. Database-backed routes will not work until it is configured.");
}
if (process.env.NODE_ENV === "production" && !process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is required in production");
}

// Connect to MongoDB
await connectDB();

// Routes
app.use("/api", routes);

// 404 for unknown routes
app.use(notFound);

// Error handling middleware
// Centralized error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 Check health: http://localhost:${PORT}/api/health\n`);
});
