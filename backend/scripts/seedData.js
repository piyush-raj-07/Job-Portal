import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "../models/user.model.js";
import { Company } from "../models/company.model.js";
import { Job } from "../models/job.model.js";
import { owners } from "./demoData.js";

/*
 * Adds demo data to the database:
 *   - 2 recruiters (already email-verified, so they can log in right away)
 *   - 1 company owned by each recruiter
 *   - 8 jobs per company (16 jobs in total)
 *
 * The users, companies and jobs themselves are in demoData.js.
 *
 * Run it with:
 *     cd backend
 *     npm run seed
 *
 * Locations, job types and experience levels use the exact values from the
 * filters on the Jobs page, so every filter has jobs to show.
 */

dotenv.config();

// Both demo recruiters use this password. Change it after logging in.
const DEMO_PASSWORD = "Recruiter@123";

const run = async () => {
    await mongoose.connect(process.env.MONGO_URL);

    // Stop if the demo recruiters already exist, so running twice doesn't make duplicates
    const emails = owners.map((owner) => owner.user.email);
    const alreadyThere = await User.findOne({ email: { $in: emails } });
    if (alreadyThere) {
        console.log(`Demo data already exists (${alreadyThere.email}). Nothing was added.`);
        await mongoose.disconnect();
        return;
    }

    const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10);
    let totalJobs = 0;

    for (const owner of owners) {
        // 1. The recruiter (marked verified, because no email link is sent for demo users)
        const user = await User.create({
            ...owner.user,
            password: hashedPassword,
            role: "recruiter",
            isEmailVerified: true,
        });

        // 2. The company this recruiter owns
        const company = await Company.create({
            ...owner.company,
            userId: user._id,
        });

        // 3. The jobs, posted by this recruiter for this company
        for (const job of owner.jobs) {
            await Job.create({
                ...job,
                company: company._id,
                created_by: user._id,
            });
            totalJobs++;
        }

        console.log(`Added ${user.email} -> ${company.name} with ${owner.jobs.length} jobs`);
    }

    console.log(`\nDone: ${owners.length} recruiters, ${owners.length} companies, ${totalJobs} jobs.`);
    console.log(`Log in as "Recruiter" with password: ${DEMO_PASSWORD}`);
    await mongoose.disconnect();
};

run().catch(async (error) => {
    console.error("Seeding failed:", error.message);
    await mongoose.disconnect();
    process.exit(1);
});
