import express from 'express';
import { protect, AuthRequest } from '../middleware/auth';
import User from '../models/User';
import twoFactorService from '../services/twoFactorService';

const router = express.Router();

/**
 * @route   POST /api/2fa/setup
 * @desc    Setup 2FA (generate secret and QR code)
 * @access  Private
 */
router.post('/setup', protect, async (req: AuthRequest, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.twoFactorEnabled) {
            return res.status(400).json({ message: '2FA is already enabled' });
        }

        // Generate TOTP secret
        const { secret, qrCode } = twoFactorService.generateTOTPSecret(user.username);
        const qrCodeImage = await twoFactorService.generateQRCode(qrCode);

        // Generate backup codes
        const backupCodes = twoFactorService.generateBackupCodes();
        const hashedBackupCodes = backupCodes.map(code =>
            twoFactorService.hashBackupCode(code)
        );

        // Store secret temporarily (will be confirmed after verification)
        user.twoFactorSecret = secret;
        user.twoFactorBackupCodes = hashedBackupCodes;
        await user.save();

        res.json({
            secret,
            qrCode: qrCodeImage,
            backupCodes // Send plain codes to user (only time they'll see them)
        });
    } catch (error) {
        console.error('Error setting up 2FA:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * @route   POST /api/2fa/verify-setup
 * @desc    Verify and enable 2FA
 * @access  Private
 */
router.post('/verify-setup', protect, async (req: AuthRequest, res) => {
    try {
        const { token } = req.body;
        const user = await User.findById(req.userId);

        if (!user || !user.twoFactorSecret) {
            return res.status(400).json({ message: 'No 2FA setup in progress' });
        }

        // Verify the token
        const isValid = twoFactorService.verifyTOTP(user.twoFactorSecret, token);

        if (!isValid) {
            return res.status(400).json({ message: 'Invalid verification code' });
        }

        // Enable 2FA
        user.twoFactorEnabled = true;
        await user.save();

        res.json({ message: '2FA enabled successfully' });
    } catch (error) {
        console.error('Error verifying 2FA setup:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * @route   POST /api/2fa/verify
 * @desc    Verify 2FA token during login
 * @access  Public (but requires userId in request)
 */
router.post('/verify', async (req, res) => {
    try {
        const { userId, token, isBackupCode } = req.body;
        const user = await User.findById(userId);

        if (!user || !user.twoFactorEnabled) {
            return res.status(400).json({ message: 'Invalid request' });
        }

        let isValid = false;

        if (isBackupCode) {
            // Verify backup code
            const codeIndex = user.twoFactorBackupCodes?.findIndex(hashedCode =>
                twoFactorService.verifyBackupCode(hashedCode, token)
            );

            if (codeIndex !== undefined && codeIndex !== -1) {
                isValid = true;
                // Remove used backup code
                user.twoFactorBackupCodes?.splice(codeIndex, 1);
                await user.save();
            }
        } else {
            // Verify TOTP
            isValid = twoFactorService.verifyTOTP(user.twoFactorSecret!, token);
        }

        if (!isValid) {
            return res.status(400).json({ message: 'Invalid verification code' });
        }

        res.json({ message: 'Verification successful', verified: true });
    } catch (error) {
        console.error('Error verifying 2FA:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * @route   POST /api/2fa/disable
 * @desc    Disable 2FA
 * @access  Private
 */
router.post('/disable', protect, async (req: AuthRequest, res) => {
    try {
        const { password } = req.body;
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify password before disabling
        const bcrypt = require('bcryptjs');
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        // Disable 2FA
        user.twoFactorEnabled = false;
        user.twoFactorSecret = undefined;
        user.twoFactorBackupCodes = undefined;
        await user.save();

        res.json({ message: '2FA disabled successfully' });
    } catch (error) {
        console.error('Error disabling 2FA:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * @route   GET /api/2fa/status
 * @desc    Get 2FA status
 * @access  Private
 */
router.get('/status', protect, async (req: AuthRequest, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            enabled: user.twoFactorEnabled || false,
            backupCodesCount: user.twoFactorBackupCodes?.length || 0
        });
    } catch (error) {
        console.error('Error getting 2FA status:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
