import dotenv from "dotenv";

// Loaded here as well as in index.js because ES module bodies run before the
// importing file's own statements — without this, anything that reads
// process.env at import time would see an empty environment.
dotenv.config();

/*
 * One source of truth for the JWT secret.
 *
 * It was previously the literal "123@123", written out in user.controller.js
 * (sign) and auth.middleware.js (verify). Two copies of a secret is one copy
 * too many: change one and the two halves of auth silently disagree.
 * Everything now reads this constant.
 */

const DEV_FALLBACK = "123@123";

if (!process.env.SECRET_KEY) {
    console.warn(
        "[auth] SECRET_KEY is not set in .env — using the insecure development fallback. " +
        "Set SECRET_KEY before deploying."
    );
}

export const JWT_SECRET = process.env.SECRET_KEY || DEV_FALLBACK;

// Matches the expiry the login controller has always used.
export const JWT_EXPIRES_IN = "2d";
