import { useState } from 'react';
import './SecuritySettings.css';

const SecuritySettings = () => {
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

    return (
        <div className="security-settings">
            <h2>🔐 Security Settings</h2>

            <div className="settings-section">
                <h3>Two-Factor Authentication</h3>
                <p>Add an extra layer of security to your account</p>

                <div className="setting-item">
                    <div className="setting-info">
                        <strong>2FA Status</strong>
                        <span className={twoFactorEnabled ? 'status-enabled' : 'status-disabled'}>
                            {twoFactorEnabled ? '✓ Enabled' : '✗ Disabled'}
                        </span>
                    </div>
                    <button className="btn-toggle">
                        {twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                    </button>
                </div>

                <div className="info-box">
                    <p>📱 <strong>Coming Soon:</strong> Email OTP and Google Authenticator support</p>
                    <p>🔑 Backup codes for account recovery</p>
                </div>
            </div>

            <div className="settings-section">
                <h3>Password</h3>
                <button className="btn-secondary">Change Password</button>
            </div>

            <div className="settings-section">
                <h3>Activity Logs</h3>
                <p>View your recent account activity and active sessions</p>
                <button className="btn-secondary" onClick={() => window.location.href = '#/activity'}>
                    View Activity Logs
                </button>
            </div>
        </div>
    );
};

export default SecuritySettings;
