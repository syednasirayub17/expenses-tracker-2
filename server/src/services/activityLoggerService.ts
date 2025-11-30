import { Request } from 'express';
import ActivityLog from '../models/ActivityLog';
import UAParser from 'ua-parser-js';

interface LocationData {
    city?: string;
    region?: string;
    country?: string;
}

class ActivityLoggerService {
    /**
     * Parse user agent to extract device and browser info
     */
    private parseUserAgent(userAgent: string): { device: string; browser: string } {
        const parser = new UAParser(userAgent);
        const result = parser.getResult();

        const device = result.device.type
            ? result.device.type.charAt(0).toUpperCase() + result.device.type.slice(1)
            : 'Desktop';

        const browser = result.browser.name || 'Unknown';

        return { device, browser };
    }

    /**
     * Get location from IP address using ipapi.co
     */
    private async getLocationFromIP(ip: string): Promise<LocationData> {
        // Skip for localhost/private IPs
        if (ip === '::1' || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
            return { city: 'Local', country: 'Local' };
        }

        try {
            const response = await fetch(`https://ipapi.co/${ip}/json/`);
            const data = await response.json();

            return {
                city: data.city,
                region: data.region,
                country: data.country_name
            };
        } catch (error) {
            console.error('Error fetching location:', error);
            return {};
        }
    }

    /**
     * Get client IP address from request
     */
    private getClientIP(req: Request): string {
        const forwarded = req.headers['x-forwarded-for'];
        if (typeof forwarded === 'string') {
            return forwarded.split(',')[0].trim();
        }
        return req.ip || req.connection.remoteAddress || '0.0.0.0';
    }

    /**
     * Log user activity
     */
    async logActivity(
        userId: string,
        action: string,
        req: Request,
        success: boolean = true,
        metadata?: any
    ): Promise<void> {
        try {
            const ipAddress = this.getClientIP(req);
            const userAgent = req.headers['user-agent'] || 'Unknown';
            const { device, browser } = this.parseUserAgent(userAgent);
            const location = await this.getLocationFromIP(ipAddress);

            await ActivityLog.create({
                userId,
                action,
                timestamp: new Date(),
                ipAddress,
                userAgent,
                device,
                browser,
                location,
                success,
                metadata
            });
        } catch (error) {
            console.error('Error logging activity:', error);
            // Don't throw - activity logging should not break the main flow
        }
    }

    /**
     * Get user's activity logs
     */
    async getUserLogs(
        userId: string,
        limit: number = 50,
        skip: number = 0
    ) {
        return ActivityLog.find({ userId })
            .sort({ timestamp: -1 })
            .limit(limit)
            .skip(skip)
            .lean();
    }

    /**
     * Get recent failed login attempts
     */
    async getFailedLoginAttempts(
        userId: string,
        since: Date = new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
    ) {
        return ActivityLog.find({
            userId,
            action: 'failed_login',
            timestamp: { $gte: since }
        }).countDocuments();
    }

    /**
     * Get active sessions (recent logins)
     */
    async getActiveSessions(userId: string) {
        const sessions = await ActivityLog.aggregate([
            {
                $match: {
                    userId: new (require('mongoose').Types.ObjectId)(userId),
                    action: 'login',
                    success: true
                }
            },
            {
                $sort: { timestamp: -1 }
            },
            {
                $group: {
                    _id: {
                        device: '$device',
                        browser: '$browser',
                        ipAddress: '$ipAddress'
                    },
                    lastActive: { $first: '$timestamp' },
                    location: { $first: '$location' }
                }
            },
            {
                $limit: 10
            }
        ]);

        return sessions.map(session => ({
            device: session._id.device,
            browser: session._id.browser,
            ipAddress: session._id.ipAddress,
            lastActive: session.lastActive,
            location: session.location
        }));
    }
}

export default new ActivityLoggerService();
