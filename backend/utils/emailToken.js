import crypto from "crypto";

/*
 * Email verification tokens.
 *
 * - The REAL token goes only into the link we email to the user.
 * - The database stores a SHA-256 HASH of it. If someone ever reads the
 *   database, they still can't build a working verification link.
 *
 * Register, resend and verify all use these two functions, so they always
 * hash the token the same way.
 */

// How long a verification link works: 24 hours
const TOKEN_LIFETIME_MS = 24 * 60 * 60 * 1000;

// Turn a real token into the hash that is saved in MongoDB
export const hashToken = (token) => {
    return crypto.createHash("sha256").update(token).digest("hex");
};

// Make a new random token (32 random bytes = 64 hex characters)
export const generateEmailVerificationToken = () => {
    const token = crypto.randomBytes(32).toString("hex");

    return {
        token,                                         // send this in the email
        hashedToken: hashToken(token),                 // save this in the database
        expiresAt: new Date(Date.now() + TOKEN_LIFETIME_MS),
    };
};
