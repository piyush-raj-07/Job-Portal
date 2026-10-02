import dotenv from "dotenv";
import mongoose from "mongoose";
import { User } from "../models/user.model.js";

/*
 * Run this ONCE after adding email verification:
 *     cd backend
 *     npm run verify-existing-users
 *
 * Users who signed up before email verification existed don't have the
 * isEmailVerified field, so they would be locked out of login. This marks
 * those old accounts as verified. New signups are not touched, because
 * they always have isEmailVerified saved (false until they click the link).
 */

dotenv.config();

const run = async () => {
    await mongoose.connect(process.env.MONGO_URL);

    const result = await User.updateMany(
        { isEmailVerified: { $exists: false } },
        { $set: { isEmailVerified: true } }
    );

    console.log(`Done. Marked ${result.modifiedCount} existing user(s) as verified.`);
    await mongoose.disconnect();
};

run().catch(async (error) => {
    console.error("Script failed:", error);
    await mongoose.disconnect();
    process.exit(1);
});
