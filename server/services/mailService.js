/**
 * Mail Service using ZeptoMail REST API with fallback to SMTP
 */

const nodemailer = require('nodemailer');

// Fallback SMTP Transporter (if Gmail/custom SMTP is configured)
let smtpTransporter = null;
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    smtpTransporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
}

/**
 * Send an email using ZeptoMail API (primary) or Nodemailer (fallback)
 * @param {Object} options
 * @param {string} options.to - Recipient email address
 * @param {string} [options.toName] - Recipient name
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @param {string} [options.text] - Plain text content
 */
async function sendMail({ to, toName = '', subject, html, text = '' }) {
    const zeptoApiKey = process.env.ZEPTOMAIL_API_KEY;
    const zeptoApiUrl = process.env.ZEPTOMAIL_API_URL || 'https://api.zeptomail.com/v1.1/email';
    const fromEmail = process.env.ZEPTOMAIL_FROM_EMAIL || 'noreply@nishantmunjal.com';
    const fromName = process.env.ZEPTOMAIL_FROM_NAME || 'CrowdSpark';

    // 1. Try ZeptoMail REST API
    if (zeptoApiKey) {
        try {
            const authHeader = zeptoApiKey.startsWith('Zoho-enczapikey')
                ? zeptoApiKey
                : `Zoho-enczapikey ${zeptoApiKey}`;

            const payload = {
                from: {
                    address: fromEmail,
                    name: fromName
                },
                to: [
                    {
                        email_address: {
                            address: to,
                            name: toName || to.split('@')[0]
                        }
                    }
                ],
                subject: subject,
                htmlbody: html
            };

            const response = await fetch(zeptoApiUrl, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': authHeader
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok) {
                console.log(`[MailService] ZeptoMail email sent successfully to ${to} (Request ID: ${data.request_id || 'N/A'})`);
                return { success: true, provider: 'zeptomail', data };
            } else {
                console.error(`[MailService] ZeptoMail API returned error (${response.status}):`, data);
                // Continue to SMTP fallback
            }
        } catch (zeptoErr) {
            console.error('[MailService] Failed to call ZeptoMail API:', zeptoErr.message);
            // Continue to SMTP fallback
        }
    }

    // 2. Try SMTP fallback if configured
    if (smtpTransporter) {
        try {
            const info = await smtpTransporter.sendMail({
                from: `"${fromName}" <${process.env.EMAIL_USER}>`,
                to,
                subject,
                html,
                text
            });
            console.log(`[MailService] SMTP email sent successfully to ${to} (Message ID: ${info.messageId})`);
            return { success: true, provider: 'smtp', info };
        } catch (smtpErr) {
            console.error('[MailService] Failed to send email via SMTP fallback:', smtpErr.message);
        }
    }

    // 3. Fallback: Log to console
    console.warn(`[MailService] No email provider succeeded for ${to}. Email Subject: ${subject}`);
    return { success: false, error: 'Email service unavailable' };
}

/**
 * Send OTP Verification Email
 */
async function sendOtpEmail(toEmail, toName, otp) {
    const subject = `${otp} is your CrowdSpark verification code`;
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>CrowdSpark Verification Code</title>
    </head>
    <body style="margin: 0; padding: 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #0f172a;">
      <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 36px 28px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
        
        <!-- Logo Badge -->
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #ffffff; font-weight: 800; font-size: 20px; padding: 8px 20px; border-radius: 10px; letter-spacing: -0.02em;">
            ⚡ CrowdSpark
          </div>
        </div>

        <!-- Heading -->
        <h1 style="font-size: 22px; font-weight: 800; color: #0f172a; text-align: center; margin: 0 0 10px 0;">
          Verify Your Email
        </h1>
        <p style="font-size: 15px; color: #475569; line-height: 1.6; text-align: center; margin: 0 0 24px 0;">
          Hi <strong>${toName || 'there'}</strong>, thank you for joining CrowdSpark! Use this 6-digit code to complete your signup:
        </p>

        <!-- OTP Display Box -->
        <div style="text-align: center; margin: 28px 0;">
          <div style="display: inline-block; font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #6366f1; background-color: #f1f5f9; padding: 14px 28px; border-radius: 12px; border: 2px dashed #cbd5e1; font-family: monospace;">
            ${otp}
          </div>
        </div>

        <!-- Expiration Notice -->
        <p style="font-size: 13px; color: #64748b; line-height: 1.5; text-align: center; margin: 0 0 20px 0;">
          ⏳ This verification code will expire in <strong>5 minutes</strong>.
        </p>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />

        <!-- Footer -->
        <p style="font-size: 12px; color: #94a3b8; line-height: 1.5; text-align: center; margin: 0;">
          If you didn't request this verification code, you can safely ignore this email.<br />
          &copy; ${new Date().getFullYear()} CrowdSpark. All rights reserved.
        </p>
      </div>
    </body>
    </html>
    `;

    return sendMail({
        to: toEmail,
        toName,
        subject,
        html
    });
}

module.exports = {
    sendMail,
    sendOtpEmail
};
