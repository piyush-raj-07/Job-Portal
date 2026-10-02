import nodemailer from "nodemailer";

// Makes text safe to put inside HTML. Without this, someone could sign up
// with a "name" like <a href="...">Click here</a> and we would email that
// link to whatever address they typed in.
const escapeHtml = (text = "") => {
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
};

// Sends one email using the SMTP settings from .env
export const sendEmail = async ({ to, subject, text, html }) => {
    // Read the settings here, not at the top of the file: index.js loads .env
    // AFTER its imports run, so at import time process.env is still empty.
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM } = process.env;

    // No SMTP settings yet? In development, print the email in the terminal
    // so the whole flow can still be tested. In production, fail loudly.
    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
        if (process.env.NODE_ENV === "production") {
            throw new Error("Email is not configured. Set SMTP_HOST, SMTP_USER and SMTP_PASS in .env");
        }

        console.log("\n[email] SMTP is not set up in .env, so this email was NOT sent.");
        console.log(`[email] To: ${to}`);
        console.log(`[email] Subject: ${subject}`);
        console.log(`[email] ${text}\n`);
        return;
    }

    const port = Number(SMTP_PORT) || 587;

    const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: port,
        secure: port === 465, // 465 = SSL from the start, 587 = upgrades to TLS (STARTTLS)
        auth: {
            user: SMTP_USER,
            pass: SMTP_PASS,
        },
    });

    const info = await transporter.sendMail({
        from: EMAIL_FROM || SMTP_USER,
        to,
        subject,
        text, // plain-text version for email apps that don't show HTML
        html,
    });

    // Only Ethereal (fake test inbox) gives a preview link. For Gmail etc. this is false.
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
        console.log(`[email] Preview this email at: ${previewUrl}`);
    }
};

// Builds and sends the "verify your email" message
export const sendVerificationEmail = async (user, token) => {
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

    // The link opens the React page, which then calls the backend API
    const verifyUrl = `${clientUrl}/verify-email?token=${token}`;

    const text =
        `Hi ${user.fullname},\n\n` +
        `Please verify your email for Job Portal by opening this link:\n${verifyUrl}\n\n` +
        `This link expires in 24 hours. If you didn't create an account, you can ignore this email.`;

    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; color: #0f172a;">
            <h2 style="color: #2563eb;">Verify your email</h2>
            <p>Hi ${escapeHtml(user.fullname)},</p>
            <p>Thanks for signing up for Job Portal. Click the button below to verify your email address.</p>
            <p style="text-align: center; margin: 32px 0;">
                <a href="${verifyUrl}"
                   style="background: #2563eb; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                    Verify Email
                </a>
            </p>
            <p style="font-size: 13px; color: #64748b;">
                Or copy this link into your browser:<br />
                <a href="${verifyUrl}">${verifyUrl}</a>
            </p>
            <p style="font-size: 13px; color: #64748b;">
                This link expires in 24 hours. If you didn't create an account, you can ignore this email.
            </p>
        </div>
    `;

    await sendEmail({
        to: user.email,
        subject: "Verify your email - Job Portal",
        text,
        html,
    });
};

// Tells an applicant that their application was accepted or rejected.
// status must be "accepted" or "rejected".
export const sendApplicationStatusEmail = async ({ applicant, jobTitle, companyName, status }) => {
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const isAccepted = status === "accepted";

    // Job title and company name are typed by recruiters, so escape them for HTML too
    const safeName = escapeHtml(applicant.fullname);
    const safeJob = escapeHtml(jobTitle);
    const safeCompany = escapeHtml(companyName);

    // Different wording and button for each status
    let subject, message, buttonText, buttonUrl;

    if (isAccepted) {
        subject = `Your application for ${jobTitle} was accepted!`;
        message =
            `Congratulations! Your application for ${jobTitle} at ${companyName} has been accepted. ` +
            `The recruiter will contact you soon with the next steps.`;
        buttonText = "View my applications";
        buttonUrl = `${clientUrl}/profile`;
    } else {
        subject = `Update on your application for ${jobTitle}`;
        message =
            `Thank you for applying for ${jobTitle} at ${companyName}. ` +
            `After careful review, the recruiter has decided to move forward with other candidates this time. ` +
            `Please don't be discouraged - new jobs are posted every day.`;
        buttonText = "Browse more jobs";
        buttonUrl = `${clientUrl}/jobs`;
    }

    const text = `Hi ${applicant.fullname},\n\n${message}\n\n${buttonText}: ${buttonUrl}\n\n- Job Portal`;

    // Same message for the HTML version, but with the escaped values
    const htmlMessage = isAccepted
        ? `Congratulations! Your application for <strong>${safeJob}</strong> at <strong>${safeCompany}</strong> has been accepted. The recruiter will contact you soon with the next steps.`
        : `Thank you for applying for <strong>${safeJob}</strong> at <strong>${safeCompany}</strong>. After careful review, the recruiter has decided to move forward with other candidates this time. Please don't be discouraged - new jobs are posted every day.`;

    const color = isAccepted ? "#16a34a" : "#2563eb"; // green for accepted, blue otherwise

    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; color: #0f172a;">
            <h2 style="color: ${color};">${isAccepted ? "Application accepted 🎉" : "Application update"}</h2>
            <p>Hi ${safeName},</p>
            <p>${htmlMessage}</p>
            <p style="text-align: center; margin: 32px 0;">
                <a href="${buttonUrl}"
                   style="background: ${color}; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                    ${buttonText}
                </a>
            </p>
            <p style="font-size: 13px; color: #64748b;">- Job Portal</p>
        </div>
    `;

    await sendEmail({
        to: applicant.email,
        subject,
        text,
        html,
    });
};
