import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './DataCleanup.css';

const DataCleanup = () => {
    const { user } = useAuth();
    const [log, setLog] = useState<string[]>([]);
    const [cleaning, setCleaning] = useState(false);

    const addLog = (message: string) => {
        setLog(prev => [...prev, message]);
    };

    const cleanupData = () => {
        if (!user?.username) {
            alert('Please login first!');
            return;
        }

        setCleaning(true);
        setLog([]);
        addLog('🔧 Starting cleanup...');

        const username = user.username;
        let totalCleaned = 0;

        ['bankAccounts', 'creditCards', 'loans'].forEach(type => {
            const key = `${type}_${username}`;
            const items = JSON.parse(localStorage.getItem(key) || '[]');

            addLog(`Checking ${type}: ${items.length} items`);

            const validItems = items.filter((item: any) => {
                const isValid = item.id && item.id !== 'undefined' && item.id !== 'null';
                if (!isValid) {
                    addLog(`  ❌ Removing: ${item.name || 'Unknown'} (ID: ${item.id})`);
                }
                return isValid;
            });

            const cleaned = items.length - validItems.length;
            totalCleaned += cleaned;

            localStorage.setItem(key, JSON.stringify(validItems));
            addLog(`  ✓ ${type}: ${validItems.length} valid, ${cleaned} removed`);
        });

        addLog('');
        addLog(`✅ Cleanup complete! Removed ${totalCleaned} corrupted items.`);
        addLog('Please refresh the page now.');

        setCleaning(false);

        if (totalCleaned > 0) {
            setTimeout(() => {
                if (confirm(`Cleanup complete! Removed ${totalCleaned} corrupted account(s).\n\nRefresh the page now?`)) {
                    window.location.reload();
                }
            }, 1000);
        } else {
            alert('No corrupted accounts found. Your data is clean!');
        }
    };

    return (
        <div className="data-cleanup">
            <div className="cleanup-card">
                <h2>🔧 Data Cleanup Tool</h2>
                <p>This tool removes corrupted accounts with invalid IDs.</p>

                <button
                    onClick={cleanupData}
                    disabled={cleaning}
                    className="cleanup-button"
                >
                    {cleaning ? 'Cleaning...' : 'Clean Corrupted Accounts'}
                </button>

                {log.length > 0 && (
                    <div className="cleanup-log">
                        {log.map((line, i) => (
                            <div key={i}>{line}</div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DataCleanup;
