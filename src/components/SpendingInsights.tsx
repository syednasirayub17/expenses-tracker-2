import { useEffect, useState } from 'react';
import { getInsights } from '../services/smartApi';
import { formatCurrency } from '../utils/currency';
import './SpendingInsights.css';

interface Insight {
    type: 'warning' | 'info' | 'success';
    message: string;
    category?: string;
    amount?: number;
}

interface MonthlyComparison {
    currentMonth: { total: number; month: string };
    lastMonth: { total: number; month: string };
    percentageChange: number;
    trend: 'up' | 'down' | 'stable';
}

interface CategoryBreakdown {
    category: string;
    amount: number;
    percentage: number;
    transactionCount: number;
}

const SpendingInsights = () => {
    const [insights, setInsights] = useState<Insight[]>([]);
    const [comparison, setComparison] = useState<MonthlyComparison | null>(null);
    const [breakdown, setBreakdown] = useState<CategoryBreakdown[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadInsights();
    }, []);

    const loadInsights = async () => {
        try {
            setLoading(true);
            const data = await getInsights();
            setInsights(data.insights || []);
            setComparison(data.comparison || null);
            setBreakdown(data.breakdown || []);
            setError('');
        } catch (err) {
            console.error('Error loading insights:', err);
            setError('Failed to load insights');
        } finally {
            setLoading(false);
        }
    };

    const getInsightIcon = (type: string) => {
        switch (type) {
            case 'warning': return '⚠️';
            case 'success': return '✅';
            default: return 'ℹ️';
        }
    };

    const getInsightClass = (type: string) => {
        return `insight-card insight-${type}`;
    };

    if (loading) {
        return <div className="insights-loading">Loading insights...</div>;
    }

    if (error) {
        return <div className="insights-error">{error}</div>;
    }

    return (
        <div className="spending-insights">
            <h3 className="insights-title">💡 Spending Insights</h3>

            {/* Monthly Comparison */}
            {comparison && (
                <div className="comparison-card">
                    <div className="comparison-header">
                        <span className="comparison-label">This Month vs Last Month</span>
                        <span className={`trend-badge trend-${comparison.trend}`}>
                            {comparison.trend === 'up' ? '📈' : comparison.trend === 'down' ? '📉' : '➡️'}
                            {Math.abs(comparison.percentageChange).toFixed(1)}%
                        </span>
                    </div>
                    <div className="comparison-amounts">
                        <div className="amount-item">
                            <span className="amount-label">{comparison.currentMonth.month}</span>
                            <span className="amount-value">{formatCurrency(comparison.currentMonth.total)}</span>
                        </div>
                        <div className="amount-divider">vs</div>
                        <div className="amount-item">
                            <span className="amount-label">{comparison.lastMonth.month}</span>
                            <span className="amount-value">{formatCurrency(comparison.lastMonth.total)}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Insights Cards */}
            {insights.length > 0 && (
                <div className="insights-grid">
                    {insights.map((insight, index) => (
                        <div key={index} className={getInsightClass(insight.type)}>
                            <span className="insight-icon">{getInsightIcon(insight.type)}</span>
                            <p className="insight-message">{insight.message}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Top Categories */}
            {breakdown.length > 0 && (
                <div className="breakdown-section">
                    <h4 className="breakdown-title">Top Spending Categories</h4>
                    <div className="breakdown-list">
                        {breakdown.slice(0, 5).map((item, index) => (
                            <div key={index} className="breakdown-item">
                                <div className="breakdown-info">
                                    <span className="breakdown-category">{item.category}</span>
                                    <span className="breakdown-count">{item.transactionCount} transactions</span>
                                </div>
                                <div className="breakdown-amount">
                                    <span className="amount">{formatCurrency(item.amount)}</span>
                                    <span className="percentage">{item.percentage}%</span>
                                </div>
                                <div className="breakdown-bar">
                                    <div
                                        className="breakdown-bar-fill"
                                        style={{ width: `${item.percentage}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {insights.length === 0 && breakdown.length === 0 && (
                <div className="no-insights">
                    <p>No insights available yet. Add more transactions to see personalized insights!</p>
                </div>
            )}
        </div>
    );
};

export default SpendingInsights;
