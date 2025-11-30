import { useEffect, useState } from 'react';
import { setup2FA, verifySetup, disable2FA, get2FAStatus } from '../services/twoFactorApi';
import './SecuritySettings.css';

const SecuritySettings = () => {
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
    const [backupCodesCount, setBackupCodesCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [showSetup, setShowSetup] = useState(false);
    const [qrCode, setQrCode] = useState('');
    const [backupCodes, setBackupCodes] = useState<string[]>([]);
    const [verifyToken, setVerifyToken] = useState('');
    const [disablePassword, setDisablePassword] = useState('');
    const [showDisable, setShowDisable] = useState(false);

    useEffect(() => {
        loadStatus();
    }, []);

    const loadStatus = async () => {
        try {
            const status = await get2FAStatus();
            setTwoFactorEnabled(status.enabled);
            setBackupCodesCount(status.backupCodesCount);
        } catch (error) {
            console.error('Error loading 2FA status:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSetup = async () => {
        try {
            const data = await setup2FA();
            setQrCode(data.qrCode);
            setBackupCodes(data.backupCodes);
            setShowSetup(true);
        } catch (error: any) {
            alert(error.message || 'Failed to setup 2FA');
        }
    };

    const handleVerifySetup = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await verifySetup(verifyToken);
            alert('2FA enabled successfully!');
            setShowSetup(false);
            setVerifyToken('');
            loadStatus();
        } catch (error: any) {
            alert(error.message || 'Invalid verification code');
        }
    };

    const handleDisable = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await disable2FA(disablePassword);
            alert('2FA disabled successfully');
            setShowDisable(false);
            setDisablePassword('');
            loadStatus();
        } catch (error: any) {
            alert(error.message || 'Failed to disable 2FA');
        }
    };

    if (loading) {
        return <div className="security-loading">Loading...</div>;
    }

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
                    {!twoFactorEnabled ? (
                        <button className="btn-toggle" onClick={handleSetup}>
                            Enable 2FA
                        </button>
                    ) : (
                        <button className="btn-toggle btn-danger" onClick={() => setShowDisable(true)}>
                            Disable 2FA
                        </button>
                    )}
                </div>

                {twoFactorEnabled && (
                    <div className="info-box">
                        <p>✅ Two-factor authentication is active</p>
                        <p>🔑 Backup codes remaining: {backupCodesCount}</p>
                    </div>
                )}

                {showSetup && (
                    <div className="setup-modal">
                        <div className="setup-content">
                            <h3>Setup Google Authenticator</h3>

                            <div className="setup-step">
                                <h4>Step 1: Scan QR Code</h4>
                                <p>Scan this QR code with Google Authenticator app</p>
                                {qrCode && <img src={qrCode} alt="QR Code" className="qr-code" />}
                            </div>

                            <div className="setup-step">
                                <h4>Step 2: Save Backup Codes</h4>
                                <p className="warning">⚠️ Save these codes in a safe place. You won't see them again!</p>
                                <div className="backup-codes">
                                    {backupCodes.map((code, index) => (
                                        <code key={index}>{code}</code>
                                    ))}
                                </div>
                                <button
                                    className="btn-copy"
                                    onClick={() => {
                                        navigator.clipboard.writeText(backupCodes.join('\n'));
                                        alert('Backup codes copied!');
                                    }}
                                >
                                    📋 Copy All Codes
                                </button>
                            </div>

                            <div className="setup-step">
                                <h4>Step 3: Verify</h4>
                                <form onSubmit={handleVerifySetup}>
                                    <input
                                        type="text"
                                        placeholder="Enter 6-digit code"
                                        value={verifyToken}
                                        onChange={(e) => setVerifyToken(e.target.value)}
                                        maxLength={6}
                                        required
                                    />
                                    <div className="button-group">
                                        <button type="submit" className="btn-primary">Verify & Enable</button>
                                        <button type="button" className="btn-secondary" onClick={() => setShowSetup(false)}>
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {showDisable && (
                    <div className="setup-modal">
                        <div className="setup-content">
                            <h3>Disable 2FA</h3>
                            <p>Enter your password to disable two-factor authentication</p>
                            <form onSubmit={handleDisable}>
                                <input
                                    type="password"
                                    placeholder="Enter your password"
                                    value={disablePassword}
                                    onChange={(e) => setDisablePassword(e.target.value)}
                                    required
                                />
                                <div className="button-group">
                                    <button type="submit" className="btn-danger">Disable 2FA</button>
                                    <button type="button" className="btn-secondary" onClick={() => setShowDisable(false)}>
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
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
