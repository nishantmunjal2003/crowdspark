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
 * Send OTP Verification Email (for signup or login)
 */
async function sendOtpEmail(toEmail, toName, otp, type = 'signup') {
    const isLogin = type === 'login';
    const subject = isLogin 
        ? `${otp} is your CrowdSpark sign-in code` 
        : `${otp} is your CrowdSpark verification code`;
    const heading = isLogin ? 'Sign In to CrowdSpark' : 'Verify Your Email';
    const message = isLogin
        ? `Hi <strong>${toName || 'there'}</strong>, use this 6-digit code to securely sign in to your CrowdSpark account:`
        : `Hi <strong>${toName || 'there'}</strong>, thank you for joining CrowdSpark! Use this 6-digit code to complete your signup:`;

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
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
          ${heading}
        </h1>
        <p style="font-size: 15px; color: #475569; line-height: 1.6; text-align: center; margin: 0 0 24px 0;">
          ${message}
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

/**
 * Send Welcome Email to newly registered users
 */
async function sendWelcomeEmail(toEmail, toName) {
    const firstName = (toName || 'there').split(' ')[0];
    const subject = `Welcome to CrowdSpark, ${firstName}! 🎉 Spark live engagement`;
    const appUrl = process.env.CLIENT_URL || 'https://crowdspark.nishantmunjal.com';

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to CrowdSpark</title>
    </head>
    <body style="margin: 0; padding: 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #0f172a;">
      <div style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 40px 32px; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);">
        
        <!-- Logo Badge -->
        <div style="text-align: center; margin-bottom: 28px;">
          <div style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #ffffff; font-weight: 800; font-size: 22px; padding: 10px 24px; border-radius: 12px; letter-spacing: -0.02em; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);">
            ⚡ CrowdSpark
          </div>
        </div>

        <!-- Heading -->
        <h1 style="font-size: 24px; font-weight: 800; color: #0f172a; text-align: center; margin: 0 0 12px 0; letter-spacing: -0.02em;">
          Welcome aboard, ${firstName}! 🎉
        </h1>
        <p style="font-size: 15px; color: #475569; line-height: 1.6; text-align: center; margin: 0 0 28px 0;">
          Your CrowdSpark account is active and ready. You now have everything you need to create, host, and analyze interactive quizzes and live polls.
        </p>

        <!-- Feature Highlights Card -->
        <div style="background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; padding: 20px; margin-bottom: 28px;">
          <div style="font-size: 14px; font-weight: 700; color: #1e293b; margin-bottom: 14px; text-transform: uppercase; letter-spacing: 0.05em;">
            🚀 What you can do with CrowdSpark:
          </div>

          <div style="display: flex; margin-bottom: 12px;">
            <div style="font-size: 18px; margin-right: 12px; line-height: 1.4;">🎯</div>
            <div style="font-size: 14px; color: #334155; line-height: 1.5;">
              <strong>Create or AI-Generate Quizzes:</strong> Build custom quizzes in seconds or let our AI generate questions on any topic.
            </div>
          </div>

          <div style="display: flex; margin-bottom: 12px;">
            <div style="font-size: 18px; margin-right: 12px; line-height: 1.4;">👥</div>
            <div style="font-size: 14px; color: #334155; line-height: 1.5;">
              <strong>Host Live Interactive Sessions:</strong> Share your 6-character game PIN with participants on any phone or laptop (no login required for players).
            </div>
          </div>

          <div style="display: flex; margin-bottom: 12px;">
            <div style="font-size: 18px; margin-right: 12px; line-height: 1.4;">📊</div>
            <div style="font-size: 14px; color: #334155; line-height: 1.5;">
              <strong>Track & Download Full Reports:</strong> Inspect participant names, timestamps, scores, and export detailed CSV reports with one click.
            </div>
          </div>

          <div style="display: flex;">
            <div style="font-size: 18px; margin-right: 12px; line-height: 1.4;">👑</div>
            <div style="font-size: 14px; color: #334155; line-height: 1.5;">
              <strong>1 Year Free Pro Access:</strong> You get complete access to all pro features 100% free during our launch!
            </div>
          </div>
        </div>

        <!-- CTA Button -->
        <div style="text-align: center; margin: 32px 0;">
          <a href="${appUrl}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #ffffff; text-decoration: none; font-weight: 700; font-size: 16px; padding: 14px 32px; border-radius: 10px; box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);">
            Go to Your Dashboard &rarr;
          </a>
        </div>

        <p style="font-size: 13px; color: #64748b; line-height: 1.6; text-align: center; margin: 0 0 24px 0;">
          Need help getting started or have questions? Just reply to this email or reach out to our team at any time.
        </p>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />

        <!-- Footer -->
        <p style="font-size: 12px; color: #94a3b8; line-height: 1.5; text-align: center; margin: 0;">
          You received this email because you created an account on <a href="${appUrl}" style="color: #6366f1; text-decoration: none;">CrowdSpark</a>.<br />
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

/**
 * Notify Admin of a new Token Request
 */
async function sendTokenRequestAdminNotification(adminEmail, { userName, userEmail, tokensRequested, amount, note }) {
    const subject = `⚡ New Token Request: ${userName} requested ${tokensRequested} AI Tokens ($${amount})`;
    const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin: 0; padding: 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; color: #0f172a;">
      <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 32px 24px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <div style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #ffffff; font-weight: 800; font-size: 18px; padding: 6px 16px; border-radius: 8px;">
            ⚡ CrowdSpark Admin Alert
          </div>
        </div>
        <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 800; text-align: center;">New AI Token Request</h2>
        <p style="font-size: 15px; color: #475569; margin: 0 0 20px 0;">
          A user has requested additional AI tokens for their account:
        </p>
        <div style="background-color: #f1f5f9; border-radius: 10px; padding: 16px; margin-bottom: 24px;">
          <div style="margin-bottom: 8px;"><strong>User:</strong> ${userName} (${userEmail})</div>
          <div style="margin-bottom: 8px;"><strong>Tokens Requested:</strong> ⚡ ${tokensRequested} Tokens</div>
          <div style="margin-bottom: 8px;"><strong>Price / Package:</strong> $${amount}</div>
          ${note ? `<div><strong>Note:</strong> ${note}</div>` : ''}
        </div>
        <div style="text-align: center;">
          <a href="https://crowdspark.nishantmunjal.com/admin" style="display: inline-block; background: #6366f1; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 15px; padding: 12px 28px; border-radius: 8px;">
            Review in Admin Dashboard &rarr;
          </a>
        </div>
      </div>
    </body>
    </html>
    `;

    return sendMail({
        to: adminEmail,
        subject,
        html
    });
}

/**
 * Notify User that their Token Request has been approved
 */
async function sendTokenApprovedNotification(userEmail, userName, tokensCredited) {
    const subject = `🎉 Your ${tokensCredited} AI Tokens have been credited!`;
    const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin: 0; padding: 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; color: #0f172a;">
      <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 32px 24px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <div style="display: inline-block; background: linear-gradient(135deg, #10b981, #059669); color: #ffffff; font-weight: 800; font-size: 18px; padding: 6px 16px; border-radius: 8px;">
            ⚡ CrowdSpark Tokens
          </div>
        </div>
        <h2 style="margin: 0 0 12px 0; font-size: 22px; font-weight: 800; text-align: center; color: #0f172a;">Tokens Credited!</h2>
        <p style="font-size: 15px; color: #475569; line-height: 1.6; text-align: center; margin: 0 0 20px 0;">
          Hi <strong>${userName}</strong>, your request for <strong>${tokensCredited} AI Tokens</strong> has been approved and added to your balance.
        </p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="https://crowdspark.nishantmunjal.com/dashboard" style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #ffffff; text-decoration: none; font-weight: 700; font-size: 15px; padding: 12px 28px; border-radius: 8px;">
            Generate AI Quizzes Now &rarr;
          </a>
        </div>
      </div>
    </body>
    </html>
    `;

    return sendMail({
        to: userEmail,
        toName: userName,
        subject,
        html
    });
}

/**
 * Notify User that their Token Request could not be approved / was rejected
 */
async function sendTokenRejectedNotification(userEmail, userName, tokensRequested, reason = '') {
    const subject = `Update regarding your CrowdSpark AI Tokens request`;
    const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin: 0; padding: 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; color: #0f172a;">
      <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 32px 24px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <div style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #ffffff; font-weight: 800; font-size: 18px; padding: 6px 16px; border-radius: 8px;">
            ⚡ CrowdSpark Tokens
          </div>
        </div>
        <h2 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 800; text-align: center; color: #0f172a;">Token Request Update</h2>
        <p style="font-size: 15px; color: #475569; line-height: 1.6; text-align: center; margin: 0 0 20px 0;">
          Hi <strong>${userName}</strong>, thank you for your interest in expanding your AI Question generation quota.
        </p>
        <div style="background-color: #f1f5f9; border-radius: 10px; padding: 16px; margin-bottom: 20px;">
          <div style="margin-bottom: 6px;"><strong>Request:</strong> ⚡ ${tokensRequested || 50} AI Tokens</div>
          <div style="margin-bottom: 6px;"><strong>Status:</strong> Unable to process / Declined</div>
          ${reason ? `<div style="margin-top: 8px; color: #334155;"><strong>Reason / Note from Admin:</strong><br/><span style="font-style: italic;">${reason}</span></div>` : ''}
        </div>
        <p style="font-size: 14px; color: #64748b; line-height: 1.6; text-align: center; margin: 0 0 24px 0;">
          If you believe this was in error, or if you need assistance with custom token packages for your institution, please feel free to reply directly to this email.
        </p>
        <div style="text-align: center;">
          <a href="https://crowdspark.nishantmunjal.com/dashboard" style="display: inline-block; background: #6366f1; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 15px; padding: 12px 28px; border-radius: 8px;">
            Go to Your Dashboard &rarr;
          </a>
        </div>
      </div>
    </body>
    </html>
    `;

    return sendMail({
        to: userEmail,
        toName: userName,
        subject,
        html
    });
}

module.exports = {
    sendMail,
    sendOtpEmail,
    sendWelcomeEmail,
    sendTokenRequestAdminNotification,
    sendTokenApprovedNotification,
    sendTokenRejectedNotification
};
