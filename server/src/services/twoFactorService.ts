import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

class TwoFactorService {
    private transporter: any;

    constructor() {
        // Configure email transporter (using Gmail as example)
        // In production, use environment variables
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER || 'your-email@gmail.com',
                pass: process.env.EMAIL_PASSWORD || 'your-app-password'
            }
        });
    }

    /**
     * Generate TOTP secret for Google Authenticator
     */
    generateTOTPSecret(username: string): { secret: string; qrCode: string } {
        const secret = speakeasy.generateSecret({
            name: `Expenses Tracker (${username})`,
            issuer: 'Expenses Tracker'
        });

        return {
            secret: secret.base32,
            qrCode: secret.otpauth_url || ''
        };
    }

    /**
     * Generate QR code image
     */
    async generateQRCode(otpAuthUrl: string): Promise<string> {
        try {
            const qrCodeDataUrl = await QRCode.toDataURL(otpAuthUrl);
            return qrCodeDataUrl;
        } catch (error) {
            console.error('Error generating QR code:', error);
            throw new Error('Failed to generate QR code');
        }
    }

    /**
     * Verify TOTP token
     */
    verifyTOTP(secret: string, token: string): boolean {
        return speakeasy.totp.verify({
            secret,
            encoding: 'base32',
            token,
            window: 2 // Allow 2 time steps before/after
        });
    }

    /**
     * Generate backup codes
     */
    generateBackupCodes(count: number = 10): string[] {
        const codes: string[] = [];
        for (let i = 0; i < count; i++) {
            const code = crypto.randomBytes(4).toString('hex').toUpperCase();
            codes.push(code);
        }
        return codes;
    }

    /**
     * Generate email OTP
     */
    generateEmailOTP(): { otp: string; expiresAt: Date } {
        const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        return { otp, expiresAt };
    }

    /**
     * Send email OTP
     */
    async sendEmailOTP(email: string, otp: string): Promise<void> {
        const mailOptions = {
            from: process.env.EMAIL_USER || 'noreply@expensestracker.com',
            to: email,
            subject: 'Your Login Verification Code',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #667eea;">Expenses Tracker</h2>
          <p>Your verification code is:</p>
          <h1 style="background: #f0f0f0; padding: 20px; text-align: center; letter-spacing: 5px; font-size: 32px;">
            ${otp}
          </h1>
          <p>This code will expire in 10 minutes.</p>
          <p style="color: #666; font-size: 14px;">
            If you didn't request this code, please ignore this email.
          </p>
        </div>
      `
        };

        try {
            await this.transporter.sendMail(mailOptions);
        } catch (error) {
            console.error('Error sending email:', error);
            throw new Error('Failed to send email OTP');
        }
    }

    /**
     * Verify email OTP
     */
    verifyEmailOTP(storedOTP: string, providedOTP: string, expiresAt: Date): boolean {
        if (new Date() > expiresAt) {
            return false; // OTP expired
        }
        return storedOTP === providedOTP;
    }

    /**
     * Hash backup code for storage
     */
    hashBackupCode(code: string): string {
        return crypto.createHash('sha256').update(code).digest('hex');
    }

    /**
     * Verify backup code
     */
    verifyBackupCode(hashedCode: string, providedCode: string): boolean {
        const providedHash = this.hashBackupCode(providedCode);
        return hashedCode === providedHash;
    }
}

export default new TwoFactorService();
