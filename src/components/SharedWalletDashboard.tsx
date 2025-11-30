import { useEffect, useState } from 'react';
import { getWallets, createWallet, joinWallet } from '../services/walletApi';
import './SharedWalletDashboard.css';

interface Wallet {
    _id: string;
    name: string;
    description?: string;
    type: string;
    balance: number;
    members: any[];
    inviteCode: string;
}

const SharedWalletDashboard = () => {
    const [wallets, setWallets] = useState<Wallet[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showJoinForm, setShowJoinForm] = useState(false);

    const [createData, setCreateData] = useState({
        name: '',
        description: '',
        type: 'family'
    });

    const [joinCode, setJoinCode] = useState('');

    useEffect(() => {
        loadWallets();
    }, []);

    const loadWallets = async () => {
        try {
            setLoading(true);
            const data = await getWallets();
            setWallets(data);
        } catch (error) {
            console.error('Error loading wallets:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createWallet(createData);
            setShowCreateForm(false);
            setCreateData({ name: '', description: '', type: 'family' });
            loadWallets();
        } catch (error) {
            console.error('Error creating wallet:', error);
        }
    };

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await joinWallet(joinCode);
            setShowJoinForm(false);
            setJoinCode('');
            loadWallets();
        } catch (error) {
            console.error('Error joining wallet:', error);
            alert('Invalid invite code');
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'family': return '👨‍👩‍👧‍👦';
            case 'friends': return '👥';
            case 'trip': return '✈️';
            default: return '💰';
        }
    };

    if (loading) {
        return <div className="wallet-loading">Loading wallets...</div>;
    }

    return (
        <div className="shared-wallet-dashboard">
            <div className="wallet-header">
                <h2>👥 Shared Wallets</h2>
                <div className="header-actions">
                    <button className="btn-join" onClick={() => setShowJoinForm(!showJoinForm)}>
                        🔗 Join Wallet
                    </button>
                    <button className="btn-create" onClick={() => setShowCreateForm(!showCreateForm)}>
                        + Create Wallet
                    </button>
                </div>
            </div>

            {showCreateForm && (
                <form className="wallet-form" onSubmit={handleCreate}>
                    <h3>Create New Wallet</h3>
                    <input
                        type="text"
                        placeholder="Wallet Name"
                        value={createData.name}
                        onChange={(e) => setCreateData({ ...createData, name: e.target.value })}
                        required
                    />
                    <input
                        type="text"
                        placeholder="Description (optional)"
                        value={createData.description}
                        onChange={(e) => setCreateData({ ...createData, description: e.target.value })}
                    />
                    <select value={createData.type} onChange={(e) => setCreateData({ ...createData, type: e.target.value })}>
                        <option value="family">Family</option>
                        <option value="friends">Friends</option>
                        <option value="trip">Trip</option>
                        <option value="other">Other</option>
                    </select>
                    <button type="submit">Create Wallet</button>
                </form>
            )}

            {showJoinForm && (
                <form className="wallet-form join-form" onSubmit={handleJoin}>
                    <h3>Join Wallet</h3>
                    <input
                        type="text"
                        placeholder="Enter Invite Code"
                        value={joinCode}
                        onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                        required
                    />
                    <button type="submit">Join</button>
                </form>
            )}

            <div className="wallets-grid">
                {wallets.length === 0 ? (
                    <div className="no-wallets">
                        <p>No shared wallets yet!</p>
                        <p>Create a wallet or join one using an invite code.</p>
                    </div>
                ) : (
                    wallets.map(wallet => (
                        <div key={wallet._id} className="wallet-card" onClick={() => window.location.href = `#/wallet/${wallet._id}`}>
                            <div className="wallet-icon">{getTypeIcon(wallet.type)}</div>
                            <div className="wallet-info">
                                <h3>{wallet.name}</h3>
                                {wallet.description && <p className="wallet-desc">{wallet.description}</p>}
                                <div className="wallet-meta">
                                    <span className="wallet-type">{wallet.type}</span>
                                    <span className="wallet-members">{wallet.members.length} members</span>
                                </div>
                                <div className="wallet-balance">
                                    Balance: ₹{wallet.balance.toLocaleString()}
                                </div>
                                <div className="invite-code">
                                    <span>Invite Code:</span>
                                    <code>{wallet.inviteCode}</code>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default SharedWalletDashboard;
