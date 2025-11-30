import { useEffect, useState } from 'react';
import { getActivityLogs, getActiveSessions, getFailedLoginAttempts } from '../services/activityApi';
import './ActivityLogs.css';

interface ActivityLog {
    _id: string;
    action: string;
    timestamp: string;
    ipAddress: string;
    device: string;
    browser: string;
    location?: {
        city?: string;
        country?: string;
    };
    success: boolean;
}

interface Session {
    device: string;
    browser: string;
    ipAddress: string;
    lastActive: string;
    location?: {
        city?: string;
        country?: string;
    };
}

const ActivityLogs = () => {
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [failedLogins, setFailedLogins] = useState(0);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'logs' | 'sessions'>('logs');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [logsData, sessionsData, failedData] = await Promise.all([
                getActivityLogs(50, 0),
                getActiveSessions(),
                getFailedLoginAttempts()
            ]);
            setLogs(logsData);
            setSessions(sessionsData);
            setFailedLogins(failedData.count);
        } catch (error) {
            console.error('Error loading activity data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getActionIcon = (action: string) => {
        switch (action) {
            case 'login': return '🔓';
            case 'logout': return '🔒';
            case 'failed_login': return '⚠️';
            case 'password_change': return '🔑';
            case 'transaction_add': return '➕';
            case 'transaction_delete': return '🗑️';
            case 'transaction_update': return '✏️';
            default: return '📝';
        }
    };

    const getActionLabel = (action: string) => {
        return action.split('_').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    };

    const getDeviceIcon = (device: string) => {
        const deviceLower = device.toLowerCase();
        if (deviceLower.includes('mobile')) return '📱';
        if (deviceLower.includes('tablet')) return '📱';
        return '💻';
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString();
    };

    if (loading) {
        return <div className="activity-loading">Loading activity...</div>;
    }

    return (
        <div className="activity-logs-container">
            <div className="activity-header">
                <h2>Security & Activity</h2>
                {failedLogins > 0 && (
                    <div className="failed-logins-badge">
                        ⚠️ {failedLogins} failed login{failedLogins > 1 ? 's' : ''} in last 24h
                    </div>
                )}
            </div>

            <div className="activity-tabs">
                <button
                    className={`tab ${activeTab === 'logs' ? 'active' : ''}`}
                    onClick={() => setActiveTab('logs')}
                >
                    Activity Logs ({logs.length})
                </button>
                <button
                    className={`tab ${activeTab === 'sessions' ? 'active' : ''}`}
                    onClick={() => setActiveTab('sessions')}
                >
                    Active Sessions ({sessions.length})
                </button>
            </div>

            {activeTab === 'logs' && (
                <div className="logs-list">
                    {logs.length === 0 ? (
                        <p className="no-data">No activity logs yet</p>
                    ) : (
                        logs.map((log) => (
                            <div key={log._id} className={`log-item ${!log.success ? 'failed' : ''}`}>
                                <div className="log-icon">{getActionIcon(log.action)}</div>
                                <div className="log-content">
                                    <div className="log-main">
                                        <span className="log-action">{getActionLabel(log.action)}</span>
                                        {!log.success && <span className="failed-badge">Failed</span>}
                                    </div>
                                    <div className="log-details">
                                        <span>{getDeviceIcon(log.device)} {log.device}</span>
                                        <span>•</span>
                                        <span>{log.browser}</span>
                                        {log.location?.city && (
                                            <>
                                                <span>•</span>
                                                <span>📍 {log.location.city}, {log.location.country}</span>
                                            </>
                                        )}
                                        <span>•</span>
                                        <span>{log.ipAddress}</span>
                                    </div>
                                </div>
                                <div className="log-time">{formatDate(log.timestamp)}</div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {activeTab === 'sessions' && (
                <div className="sessions-list">
                    {sessions.length === 0 ? (
                        <p className="no-data">No active sessions</p>
                    ) : (
                        sessions.map((session, index) => (
                            <div key={index} className="session-item">
                                <div className="session-icon">{getDeviceIcon(session.device)}</div>
                                <div className="session-content">
                                    <div className="session-main">
                                        <span className="session-device">{session.device} - {session.browser}</span>
                                    </div>
                                    <div className="session-details">
                                        {session.location?.city && (
                                            <span>📍 {session.location.city}, {session.location.country}</span>
                                        )}
                                        <span>•</span>
                                        <span>{session.ipAddress}</span>
                                        <span>•</span>
                                        <span>Last active: {formatDate(session.lastActive)}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default ActivityLogs;
