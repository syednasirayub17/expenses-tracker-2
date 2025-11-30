import { useEffect, useState } from 'react';
import { getInvestments, getPortfolioSummary, addInvestment, deleteInvestment } from '../services/investmentApi';
import './InvestmentDashboard.css';

interface Investment {
    _id: string;
    type: 'mutual_fund' | 'stock' | 'crypto' | 'gold';
    name: string;
    symbol?: string;
    quantity: number;
    buyPrice: number;
    currentPrice: number;
    buyDate: string;
    platform?: string;
}

interface PortfolioSummary {
    totalInvestment: number;
    currentValue: number;
    totalGain: number;
    totalGainPercentage: number;
    byType: any;
}

const InvestmentDashboard = () => {
    const [investments, setInvestments] = useState<Investment[]>([]);
    const [summary, setSummary] = useState<PortfolioSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [filterType, setFilterType] = useState<string>('all');

    const [formData, setFormData] = useState({
        type: 'stock',
        name: '',
        symbol: '',
        quantity: '',
        buyPrice: '',
        currentPrice: '',
        buyDate: new Date().toISOString().split('T')[0],
        platform: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [investmentsData, summaryData] = await Promise.all([
                getInvestments(),
                getPortfolioSummary()
            ]);
            setInvestments(investmentsData);
            setSummary(summaryData);
        } catch (error) {
            console.error('Error loading investments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await addInvestment({
                ...formData,
                quantity: parseFloat(formData.quantity),
                buyPrice: parseFloat(formData.buyPrice),
                currentPrice: parseFloat(formData.currentPrice)
            });
            setShowForm(false);
            setFormData({
                type: 'stock',
                name: '',
                symbol: '',
                quantity: '',
                buyPrice: '',
                currentPrice: '',
                buyDate: new Date().toISOString().split('T')[0],
                platform: ''
            });
            loadData();
        } catch (error) {
            console.error('Error adding investment:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Delete this investment?')) {
            try {
                await deleteInvestment(id);
                loadData();
            } catch (error) {
                console.error('Error deleting investment:', error);
            }
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'stock': return '📈';
            case 'mutual_fund': return '📊';
            case 'crypto': return '₿';
            case 'gold': return '🪙';
            default: return '💰';
        }
    };

    const filteredInvestments = filterType === 'all'
        ? investments
        : investments.filter(inv => inv.type === filterType);

    if (loading) {
        return <div className="investment-loading">Loading investments...</div>;
    }

    return (
        <div className="investment-dashboard">
            <div className="investment-header">
                <h2>📊 Investment Portfolio</h2>
                <button className="btn-add" onClick={() => setShowForm(!showForm)}>
                    {showForm ? '✕ Cancel' : '+ Add Investment'}
                </button>
            </div>

            {summary && (
                <div className="portfolio-summary">
                    <div className="summary-card total">
                        <div className="summary-label">Total Investment</div>
                        <div className="summary-value">₹{summary.totalInvestment.toLocaleString()}</div>
                    </div>
                    <div className="summary-card current">
                        <div className="summary-label">Current Value</div>
                        <div className="summary-value">₹{summary.currentValue.toLocaleString()}</div>
                    </div>
                    <div className={`summary-card ${summary.totalGain >= 0 ? 'profit' : 'loss'}`}>
                        <div className="summary-label">Total Gain/Loss</div>
                        <div className="summary-value">
                            {summary.totalGain >= 0 ? '+' : ''}₹{summary.totalGain.toLocaleString()}
                            <span className="percentage">({summary.totalGainPercentage.toFixed(2)}%)</span>
                        </div>
                    </div>
                </div>
            )}

            {showForm && (
                <form className="investment-form" onSubmit={handleSubmit}>
                    <div className="form-row">
                        <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
                            <option value="stock">Stock</option>
                            <option value="mutual_fund">Mutual Fund</option>
                            <option value="crypto">Cryptocurrency</option>
                            <option value="gold">Gold</option>
                        </select>
                        <input
                            type="text"
                            placeholder="Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-row">
                        <input
                            type="text"
                            placeholder="Symbol (optional)"
                            value={formData.symbol}
                            onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                        />
                        <input
                            type="number"
                            step="0.001"
                            placeholder="Quantity"
                            value={formData.quantity}
                            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-row">
                        <input
                            type="number"
                            step="0.01"
                            placeholder="Buy Price"
                            value={formData.buyPrice}
                            onChange={(e) => setFormData({ ...formData, buyPrice: e.target.value })}
                            required
                        />
                        <input
                            type="number"
                            step="0.01"
                            placeholder="Current Price"
                            value={formData.currentPrice}
                            onChange={(e) => setFormData({ ...formData, currentPrice: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-row">
                        <input
                            type="date"
                            value={formData.buyDate}
                            onChange={(e) => setFormData({ ...formData, buyDate: e.target.value })}
                            required
                        />
                        <input
                            type="text"
                            placeholder="Platform (optional)"
                            value={formData.platform}
                            onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                        />
                    </div>
                    <button type="submit" className="btn-submit">Add Investment</button>
                </form>
            )}

            <div className="filter-tabs">
                {['all', 'stock', 'mutual_fund', 'crypto', 'gold'].map(type => (
                    <button
                        key={type}
                        className={`filter-tab ${filterType === type ? 'active' : ''}`}
                        onClick={() => setFilterType(type)}
                    >
                        {type === 'all' ? 'All' : type.replace('_', ' ')}
                    </button>
                ))}
            </div>

            <div className="investments-list">
                {filteredInvestments.length === 0 ? (
                    <p className="no-data">No investments yet. Add your first investment!</p>
                ) : (
                    filteredInvestments.map(inv => {
                        const investment = inv.quantity * inv.buyPrice;
                        const current = inv.quantity * inv.currentPrice;
                        const gain = current - investment;
                        const gainPercent = (gain / investment) * 100;

                        return (
                            <div key={inv._id} className="investment-card">
                                <div className="inv-header">
                                    <div className="inv-icon">{getTypeIcon(inv.type)}</div>
                                    <div className="inv-info">
                                        <h3>{inv.name}</h3>
                                        {inv.symbol && <span className="inv-symbol">{inv.symbol}</span>}
                                    </div>
                                    <button className="btn-delete" onClick={() => handleDelete(inv._id)}>🗑️</button>
                                </div>
                                <div className="inv-details">
                                    <div className="detail-row">
                                        <span>Quantity:</span>
                                        <span>{inv.quantity}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span>Buy Price:</span>
                                        <span>₹{inv.buyPrice.toLocaleString()}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span>Current Price:</span>
                                        <span>₹{inv.currentPrice.toLocaleString()}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span>Investment:</span>
                                        <span>₹{investment.toLocaleString()}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span>Current Value:</span>
                                        <span>₹{current.toLocaleString()}</span>
                                    </div>
                                    <div className={`detail-row ${gain >= 0 ? 'profit' : 'loss'}`}>
                                        <span>Gain/Loss:</span>
                                        <span>
                                            {gain >= 0 ? '+' : ''}₹{gain.toLocaleString()}
                                            ({gainPercent.toFixed(2)}%)
                                        </span>
                                    </div>
                                </div>
                                {inv.platform && <div className="inv-platform">📱 {inv.platform}</div>}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default InvestmentDashboard;
