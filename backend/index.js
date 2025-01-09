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

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const corsOptions = {
    origin: "http://localhost:5173", // Corrected origin URL
    credentials: true,
};
app.use(cors(corsOptions));

// Routes
app.use("/api/v1/user", userRouter);
app.use("/api/v1/company",companyRouter);
app.use("/api/v1/job", jobRouter);
app.use("/api/v1/application", applicationRouter);

// Port
const PORT = process.env.PORT || 3000;




// Start Server
const startServer = async () => {
    try {
        await connectdb(); // Connect to the database
        console.log("Database connected successfully");

        app.listen(PORT, () => {
            console.log(`Server is running on Port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to connect to the database:", error);
        process.exit(1); // Exit process on database connection failure
    }
};

startServer();
