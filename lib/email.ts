// Simple email service for development
// In production, you would integrate with services like SendGrid, etc.

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  // In development, just log the email
  if (process.env.NODE_ENV === 'development') {
    console.log('\n📧 EMAIL SENT:');
    console.log('To:', options.to);
    console.log('Subject:', options.subject);
    console.log('HTML:', options.html);
    console.log('---\n');
    return;
  }

  // In production, implement actual email sending
  // Example with SendGrid:
  /*
  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
  
  await sgMail.send({
    to: options.to,
    from: process.env.FROM_EMAIL!,
    subject: options.subject,
    html: options.html,
    text: options.text,
  });
  */
  
  throw new Error('Email service not configured for production');
}

export function generatePasswordResetEmail(email: string, resetToken: string): EmailOptions {
  const resetUrl = `${process.env.NEXTAUTH_URL}/en/reset-password?token=${resetToken}`;
  
  return {
    to: email,
    subject: 'Reset Your Password - Bangladesh Election Commission',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #22c55e; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px; background: #f9f9f9; }
            .button { display: inline-block; background: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Bangladesh Election Commission</h1>
            </div>
            <div class="content">
              <h2>Password Reset Request</h2>
              <p>Hello,</p>
              <p>We received a request to reset your password for your Bangladesh Election Commission account.</p>
              <p>Click the button below to reset your password:</p>
              <a href="${resetUrl}" class="button">Reset Password</a>
              <p>Or copy and paste this link into your browser:</p>
              <p><a href="${resetUrl}">${resetUrl}</a></p>
              <p><strong>This link will expire in 15 minutes.</strong></p>
              <p>If you didn't request this password reset, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>This is an automated message from the Bangladesh Election Commission Portal.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      Password Reset Request - Bangladesh Election Commission
      
      Hello,
      
      We received a request to reset your password for your Bangladesh Election Commission account.
      
      Click the link below to reset your password:
      ${resetUrl}
      
      This link will expire in 15 minutes.
      
      If you didn't request this password reset, please ignore this email.
      
      ---
      Bangladesh Election Commission Portal
    `
  };
}
