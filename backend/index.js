import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import connectdb from "./utils/db.js";

import userRouter from "./routers/user.router.js";
import companyRouter from "./routers/company.router.js";
import jobRouter from "./routers/job.router.js";
import applicationRouter from "./routers/application.router.js";
import resumeRouter from "./routers/resume.router.js";

dotenv.config();

const app = express();

// Hosts like Render/Railway put one proxy in front of the app. This tells
// Express to read the real visitor IP from that proxy, which the rate
// limiter needs; otherwise every visitor looks like the same IP.
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

// ---------- Middleware ----------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.CLIENT_URL, // frontend URL (Vercel)
    credentials: true,
  })
);

// ---------- Health Check ----------
app.get("/", (req, res) => {
  res.send("Job Portal Backend is Running 🚀");
});

// ---------- Routes ----------
app.use("/api/v1/user", userRouter);
app.use("/api/v1/company", companyRouter);
app.use("/api/v1/job", jobRouter);
app.use("/api/v1/application", applicationRouter);
app.use("/api/v1/resume", resumeRouter);

// ---------- Error Handler ----------
// Anything a route throws without catching lands here. Without it Express
// answers with an HTML page containing a stack trace: unparseable by the
// client (which reads error.response.data.message) and a leak of internal
// paths. Declared after the routes, which is the only place Express looks
// for it.
app.use((err, req, res, next) => {
  console.error("Unhandled error:", req.method, req.originalUrl, err);

  if (res.headersSent) return next(err);

  return res.status(err.status || 500).json({
    message: err.expose ? err.message : "Internal server error",
    success: false,
  });
});

// ---------- Port ----------
const PORT = process.env.PORT || 5000;

// ---------- Start Server ----------
const startServer = async () => {
  try {
    await connectdb();
    console.log("Database connected successfully");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
};

startServer();
