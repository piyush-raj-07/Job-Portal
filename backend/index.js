import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import connectdb from "./utils/db.js";

import userRouter from "./routers/user.router.js";
import companyRouter from "./routers/company.router.js";
import jobRouter from "./routers/job.router.js";
import applicationRouter from "./routers/application.router.js";

dotenv.config();

const app = express();

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
