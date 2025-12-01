import { useState } from 'react';
import './TokenDebugger.css';

const TokenDebugger = () => {
    const [debugInfo, setDebugInfo] = useState<any>(null);

    const checkToken = () => {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const isAuthenticated = localStorage.getItem('isAuthenticated');

        const info = {
            hasToken: !!token,
            tokenLength: token?.length || 0,
            tokenPreview: token ? `${token.substring(0, 20)}...` : 'No token',
            user: user,
            isAuthenticated: isAuthenticated,
            allLocalStorageKeys: Object.keys(localStorage)
        };

        setDebugInfo(info);
        console.log('🔍 Token Debug Info:', info);
        console.log('Full token:', token);
    };

    const testAPICall = async () => {
        const token = localStorage.getItem('token');
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

        try {
            const response = await fetch(`${API_URL}/api/accounts/bank`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const result = {
                status: response.status,
                ok: response.ok,
                statusText: response.statusText,
                data: response.ok ? await response.json() : await response.text()
            };

            console.log('🧪 API Test Result:', result);
            alert(`API Test:\nStatus: ${result.status}\nOK: ${result.ok}\n\nCheck console for details`);
        } catch (err: any) {
            console.error('❌ API Test Error:', err);
            alert(`API Error: ${err.message}`);
        }
    };

    return (
        <div className="token-debugger">
            <div className="debug-card">
                <h2>🔍 Token Debugger</h2>
                <p>Check if authentication token is present and working</p>

                <div className="button-group">
                    <button onClick={checkToken} className="debug-button">
                        Check Token
                    </button>
                    <button onClick={testAPICall} className="debug-button secondary">
                        Test API Call
                    </button>
                </div>

                {debugInfo && (
                    <div className="debug-info">
                        <h3>Debug Information:</h3>
                        <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TokenDebugger;
