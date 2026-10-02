import { rateLimit } from "express-rate-limit";

// Stops one person from spamming the "resend verification email" button.
// Each IP address can call the route 3 times every 15 minutes.
export const resendVerificationLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 3,                 // 3 requests per window, per IP
    standardHeaders: true,    // send RateLimit-* headers so the client knows the limit
    legacyHeaders: false,     // don't send the old X-RateLimit-* headers
    // Same JSON shape as the rest of the API, so the frontend can show `message`
    message: {
        message: "Too many requests. Please wait 15 minutes and try again.",
        success: false,
    },
});
