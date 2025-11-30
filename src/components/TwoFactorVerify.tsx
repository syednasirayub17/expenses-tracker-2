import { useState } from 'react';
import { verify2FA } from '../services/twoFactorApi';
import './TwoFactorVerify.css';

interface TwoFactorVerifyProps {
    userId: string;
    onSuccess: (token: string) => void;
    onCancel: () => void;
}

const TwoFactorVerify = ({ userId, onSuccess, onCancel }: TwoFactorVerifyProps) => {
    const [code, setCode] = useState('');
    const [useBackupCode, setUseBackupCode] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await verify2FA(userId, code, useBackupCode);
            if (result.verified) {
                // Generate token on backend after successful 2FA
                onSuccess(userId);
            }
        } catch (err: any) {
            setError(err.message || 'Invalid code');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="twofa-verify">
            <div className="verify-card">
                <h2>🔐 Two-Factor Authentication</h2>
                <p>Enter the 6-digit code from your authenticator app</p>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder={useBackupCode ? "Enter backup code" : "Enter 6-digit code"}
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        maxLength={useBackupCode ? 8 : 6}
                        autoFocus
                        required
                    />

                    <button type="submit" disabled={loading} className="btn-verify">
                        {loading ? 'Verifying...' : 'Verify'}
                    </button>

                    <button
                        type="button"
                        className="btn-backup"
                        onClick={() => {
                            setUseBackupCode(!useBackupCode);
                            setCode('');
                            setError('');
                        }}
                    >
                        {useBackupCode ? '← Use Authenticator Code' : 'Use Backup Code Instead'}
                    </button>

                    <button type="button" className="btn-cancel" onClick={onCancel}>
                        Cancel
                    </button>
                </form>
            </div>
        </div>
    );
};

export default TwoFactorVerify;
