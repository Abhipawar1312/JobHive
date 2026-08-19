import nodemailer from "nodemailer";
import sgMail from "@sendgrid/mail";
import { MailtrapClient } from "mailtrap";
import dotenv from "dotenv";
dotenv.config();

if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export const sender = {
    email: "hello@demomailtrap.co",
    name: "JobHive Portal",
};

const getMailtrapClient = () => {
    if (process.env.MAILTRAP_API_TOKEN) {
        return new MailtrapClient({
            token: process.env.MAILTRAP_API_TOKEN,
        });
    }
    return null;
};

const createTransporter = () => {
    const host = process.env.MAILTRAP_SMTP_HOST || process.env.SMTP_HOST;
    const port = process.env.MAILTRAP_SMTP_PORT || process.env.SMTP_PORT || 2525;
    const user = process.env.MAILTRAP_SMTP_USER || process.env.SMTP_USER;
    const pass = process.env.MAILTRAP_SMTP_PASS || process.env.SMTP_PASS;

    if (host && user && pass) {
        return nodemailer.createTransport({
            host,
            port: Number(port),
            auth: {
                user,
                pass,
            },
        });
    }

    if (process.env.MAIL_USER && process.env.MAIL_PASS) {
        return nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            },
        });
    }

    return null;
};

export const sendEmail = async ({ to, subject, html, text }) => {
    // 1. SendGrid Real Email Delivery (same as QuickBite)
    if (process.env.SENDGRID_API_KEY) {
        try {
            const senderEmail = process.env.SENDGRID_SENDER_EMAIL || "abhipawar131202@gmail.com";
            const msg = {
                to,
                from: {
                    email: senderEmail,
                    name: "JobHive Team",
                },
                subject,
                text: text || subject,
                html,
            };
            await sgMail.send(msg);
            console.log(`✅ [SendGrid] Real email sent to: ${to}`);
            return { success: true, provider: "sendgrid" };
        } catch (sgError) {
            console.error("❌ SendGrid error, checking other providers:", sgError.response?.body || sgError.message);
        }
    }

    // 2. Mailtrap Official Sending API Client (hello@demomailtrap.co)
    const mailtrapClient = getMailtrapClient();
    if (mailtrapClient) {
        try {
            await mailtrapClient.send({
                from: sender,
                to: [{ email: to }],
                subject,
                html,
                text: text || subject,
            });
            console.log(`✅ [Mailtrap API Client] Email sent to: ${to}`);
            return { success: true, provider: "mailtrap-client" };
        } catch (mtErr) {
            console.error("❌ Mailtrap Client error, checking SMTP fallback:", mtErr.message);
        }
    }

    // 2. SMTP Transport (Mailtrap or Gmail)
    try {
        const transporter = createTransporter();
        const from = process.env.MAIL_FROM || '"JobHive Portal" <no-reply@jobhive.com>';

        if (!transporter) {
            console.log(`\n📧 [EMAIL SIMULATION (Configure SMTP or SendGrid in .env to send real emails)]`);
            console.log(`To: ${to}`);
            console.log(`Subject: ${subject}`);
            console.log(`Content: ${text || subject}\n`);
            return { success: true, simulated: true };
        }

        const info = await transporter.sendMail({
            from,
            to,
            subject,
            text,
            html,
        });

        console.log(`📧 [Mailtrap/SMTP] Email sent to ${to}: ${info.messageId}`);
        return { success: true, messageId: info.messageId, provider: "smtp" };
    } catch (error) {
        console.error("❌ Error sending email via SMTP:", error.message);
        return { success: false, error: error.message };
    }
};

// Template: Password Reset OTP
export const sendPasswordResetEmail = async (email, otpCode) => {
    const subject = "Password Reset Code - JobHive";
    const html = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 500px; margin: auto; padding: 25px; border-radius: 12px; border: 1px solid #e2e8f0; background: #ffffff;">
            <div style="text-align: center; margin-bottom: 20px;">
                <h2 style="color: #6a38c2; margin: 0;">JobHive</h2>
                <p style="color: #64748b; font-size: 14px;">Password Reset Request</p>
            </div>
            <p style="color: #334155; font-size: 15px;">Hello,</p>
            <p style="color: #334155; font-size: 14px;">You requested to reset your password. Use the verification code below to complete the reset process. This code is valid for <strong>15 minutes</strong>.</p>
            <div style="text-align: center; margin: 30px 0;">
                <span style="display: inline-block; font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #6a38c2; background: #f3e8ff; padding: 12px 24px; border-radius: 8px; border: 1px dashed #a855f7;">
                    ${otpCode}
                </span>
            </div>
            <p style="color: #94a3b8; font-size: 13px;">If you did not request this, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 20px 0;" />
            <p style="color: #cbd5e1; font-size: 12px; text-align: center;">&copy; ${new Date().getFullYear()} JobHive Portal. All rights reserved.</p>
        </div>
    `;
    return sendEmail({ to: email, subject, html, text: `Your password reset code is: ${otpCode}` });
};

// Template: Application Submitted Confirmation
export const sendApplicationConfirmationEmail = async (candidateEmail, candidateName, jobTitle, companyName) => {
    const subject = `Application Received: ${jobTitle} at ${companyName}`;
    const html = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 550px; margin: auto; padding: 25px; border-radius: 12px; border: 1px solid #e2e8f0; background: #ffffff;">
            <div style="text-align: center; margin-bottom: 20px;">
                <h2 style="color: #6a38c2; margin: 0;">JobHive</h2>
                <p style="color: #10b981; font-weight: 600; font-size: 14px;">Application Submitted Successfully</p>
            </div>
            <p style="color: #334155; font-size: 15px;">Hi <strong>${candidateName}</strong>,</p>
            <p style="color: #334155; font-size: 14px;">Your application for <strong>${jobTitle}</strong> at <strong>${companyName}</strong> has been successfully received by the recruitment team.</p>
            <div style="background: #f8fafc; border-left: 4px solid #6a38c2; padding: 14px 18px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0; color: #475569; font-size: 14px;"><strong>Job:</strong> ${jobTitle}</p>
                <p style="margin: 6px 0 0; color: #475569; font-size: 14px;"><strong>Company:</strong> ${companyName}</p>
                <p style="margin: 6px 0 0; color: #475569; font-size: 14px;"><strong>Current Status:</strong> <span style="color: #f59e0b; font-weight: 600;">Pending Review</span></p>
            </div>
            <p style="color: #64748b; font-size: 13px;">You can track your application status anytime from your JobHive dashboard.</p>
            <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 20px 0;" />
            <p style="color: #cbd5e1; font-size: 12px; text-align: center;">&copy; ${new Date().getFullYear()} JobHive Portal. All rights reserved.</p>
        </div>
    `;
    return sendEmail({ to: candidateEmail, subject, html, text: `Your application for ${jobTitle} at ${companyName} has been submitted.` });
};

// Template: Status Update / Interview Invitation
export const sendStatusUpdateEmail = async (candidateEmail, candidateName, jobTitle, companyName, status, interviewDetails = null) => {
    let statusLabel = status.toUpperCase();
    let badgeColor = "#6b7280";
    if (status === "shortlisted") badgeColor = "#3b82f6";
    if (status === "interview") badgeColor = "#8b5cf6";
    if (status === "accepted") badgeColor = "#10b981";
    if (status === "rejected") badgeColor = "#ef4444";

    const subject = `Update on your application: ${jobTitle} at ${companyName} (${statusLabel})`;

    let interviewHtml = "";
    if (status === "interview" && interviewDetails) {
        interviewHtml = `
            <div style="background: #faf5ff; border: 1px solid #d8b4fe; border-radius: 8px; padding: 16px; margin: 20px 0;">
                <h4 style="color: #6b21a8; margin: 0 0 10px 0;">📅 Interview Details</h4>
                ${interviewDetails.date ? `<p style="margin: 4px 0; color: #374151; font-size: 14px;"><strong>Date & Time:</strong> ${new Date(interviewDetails.date).toLocaleString()}</p>` : ''}
                ${interviewDetails.meetingUrl ? `<p style="margin: 4px 0; color: #374151; font-size: 14px;"><strong>Meeting Link:</strong> <a href="${interviewDetails.meetingUrl}" style="color: #6a38c2; font-weight: 600;">Join Meeting</a></p>` : ''}
                ${interviewDetails.notes ? `<p style="margin: 4px 0; color: #374151; font-size: 14px;"><strong>Notes:</strong> ${interviewDetails.notes}</p>` : ''}
            </div>
        `;
    }

    const html = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 550px; margin: auto; padding: 25px; border-radius: 12px; border: 1px solid #e2e8f0; background: #ffffff;">
            <div style="text-align: center; margin-bottom: 20px;">
                <h2 style="color: #6a38c2; margin: 0;">JobHive</h2>
                <p style="color: #64748b; font-size: 14px;">Application Status Update</p>
            </div>
            <p style="color: #334155; font-size: 15px;">Hi <strong>${candidateName}</strong>,</p>
            <p style="color: #334155; font-size: 14px;">The status of your application for <strong>${jobTitle}</strong> at <strong>${companyName}</strong> has been updated:</p>
            
            <div style="text-align: center; margin: 25px 0;">
                <span style="display: inline-block; font-size: 16px; font-weight: 700; color: #ffffff; background: ${badgeColor}; padding: 8px 20px; border-radius: 20px; text-transform: uppercase;">
                    ${statusLabel}
                </span>
            </div>

            ${interviewHtml}

            <p style="color: #64748b; font-size: 13px;">Log in to your JobHive dashboard to see full details and next steps.</p>
            <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 20px 0;" />
            <p style="color: #cbd5e1; font-size: 12px; text-align: center;">&copy; ${new Date().getFullYear()} JobHive Portal. All rights reserved.</p>
        </div>
    `;

    return sendEmail({ to: candidateEmail, subject, html, text: `Your application for ${jobTitle} at ${companyName} has been updated to: ${statusLabel}` });
};

// Template: Offline Chat Message Notification
export const sendOfflineMessageNotificationEmail = async (recipientEmail, recipientName, senderName, messageText, jobTitle = "") => {
    const subject = `💬 New Message from ${senderName} on JobHive`;
    const html = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 550px; margin: auto; padding: 25px; border-radius: 12px; border: 1px solid #e2e8f0; background: #ffffff;">
            <div style="text-align: center; margin-bottom: 20px;">
                <h2 style="color: #6a38c2; margin: 0;">JobHive</h2>
                <p style="color: #64748b; font-size: 14px;">Direct Message Notification</p>
            </div>
            <p style="color: #334155; font-size: 15px;">Hi <strong>${recipientName || "there"}</strong>,</p>
            <p style="color: #334155; font-size: 14px;"><strong>${senderName}</strong> ${jobTitle ? `(regarding <strong>${jobTitle}</strong>)` : ""} sent you a message on JobHive while you were offline:</p>
            
            <div style="background: #f8fafc; border-left: 4px solid #6a38c2; border-radius: 8px; padding: 14px 18px; margin: 18px 0; color: #334155; font-size: 14px; font-style: italic;">
                "${messageText}"
            </div>

            <div style="text-align: center; margin: 24px 0;">
                <a href="${process.env.FRONTEND_URL || "http://localhost:5173"}/profile" style="display: inline-block; background: #6a38c2; color: #ffffff; padding: 10px 24px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 13px;">
                    View & Reply on JobHive
                </a>
            </div>

            <p style="color: #64748b; font-size: 12px;">You received this notification because you were offline when the message was sent.</p>
            <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 20px 0;" />
            <p style="color: #cbd5e1; font-size: 12px; text-align: center;">&copy; ${new Date().getFullYear()} JobHive Portal. All rights reserved.</p>
        </div>
    `;

    return sendEmail({ to: recipientEmail, subject, html, text: `New message from ${senderName}: ${messageText}` });
};
