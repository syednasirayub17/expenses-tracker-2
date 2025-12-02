import { useState, useEffect } from 'react'
import { useAccount } from '../context/AccountContext'
import { useTheme } from '../context/ThemeContext'
import { formatCurrency } from '../utils/currency'
import './AdvancedReports.css'

type WidgetType = 'category-chart' | 'account-chart' | 'summary-stats' | 'trend-analysis' | 'spending-heatmap' | 'geographic-view'

interface Widget {
    id: string
    type: WidgetType
    title: string
}

interface DashboardWidget extends Widget {
    position: number
}

const AdvancedReports = () => {
    const { transactions, bankAccounts, creditCards, loans } = useAccount()
    const { theme, toggleTheme } = useTheme()
    const [dashboardWidgets, setDashboardWidgets] = useState<DashboardWidget[]>([])
    const [draggedWidget, setDraggedWidget] = useState<WidgetType | null>(null)

    // Load saved dashboard layout from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('dashboard-layout')
        if (saved) {
            try {
                setDashboardWidgets(JSON.parse(saved))
            } catch (err) {
                console.error('Failed to load dashboard layout:', err)
            }
        }
    }, [])

    // Save dashboard layout to localStorage
    useEffect(() => {
        if (dashboardWidgets.length > 0) {
            localStorage.setItem('dashboard-layout', JSON.stringify(dashboardWidgets))
        }
    }, [dashboardWidgets])

    const widgetPalette: Widget[] = [
        { id: 'category-chart', type: 'category-chart', title: 'Category Chart' },
        { id: 'account-chart', type: 'account-chart', title: 'Account Chart' },
        { id: 'summary-stats', type: 'summary-stats', title: 'Summary Stats' },
        { id: 'trend-analysis', type: 'trend-analysis', title: 'Trend Analysis' },
        { id: 'spending-heatmap', type: 'spending-heatmap', title: 'Spending Heatmap' },
        { id: 'geographic-view', type: 'geographic-view', title: 'Geographic View' },
    ]

    const handleDragStart = (widgetType: WidgetType) => {
        setDraggedWidget(widgetType)
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        if (draggedWidget) {
            const widget = widgetPalette.find(w => w.type === draggedWidget)
            if (widget && !dashboardWidgets.find(w => w.type === draggedWidget)) {
                const newWidget: DashboardWidget = {
                    ...widget,
                    id: `${widget.type}-${Date.now()}`,
                    position: dashboardWidgets.length,
                }
                setDashboardWidgets([...dashboardWidgets, newWidget])
            }
            setDraggedWidget(null)
        }
    }

    const removeWidget = (id: string) => {
        setDashboardWidgets(dashboardWidgets.filter(w => w.id !== id))
    }

    const clearDashboard = () => {
        if (window.confirm('Clear all widgets from dashboard?')) {
            setDashboardWidgets([])
            localStorage.removeItem('dashboard-layout')
        }
    }

    // Calculate statistics
    const getExpensesByCategory = () => {
        const expenses = transactions.filter((t) => t.type === 'expense')
        const categoryMap: { [key: string]: number } = {}
        expenses.forEach((t) => {
            categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount
        })
        return Object.entries(categoryMap)
            .map(([category, amount]) => ({ category, amount }))
            .sort((a, b) => b.amount - a.amount)
    }

    const getExpensesByAccount = () => {
        const expenses = transactions.filter((t) => t.type === 'expense')
        const accountMap: { [key: string]: { name: string; amount: number } } = {}

        expenses.forEach((t) => {
            let accountName = 'Unknown'
            if (t.accountType === 'bank') {
                const acc = bankAccounts.find((a) => a.id === t.accountId)
                accountName = acc ? acc.name : 'Unknown Bank'
            } else if (t.accountType === 'creditCard') {
                const card = creditCards.find((c) => c.id === t.accountId)
                accountName = card ? card.name : 'Unknown Card'
            } else if (t.accountType === 'loan') {
                const loan = loans.find((l) => l.id === t.accountId)
                accountName = loan ? loan.name : 'Unknown Loan'
            }

            if (!accountMap[t.accountId]) {
                accountMap[t.accountId] = { name: accountName, amount: 0 }
            }
            accountMap[t.accountId].amount += t.amount
        })

        return Object.values(accountMap).sort((a, b) => b.amount - a.amount)
    }

    const getTotalExpenses = () => transactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
    const getTotalIncome = () => transactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
    const getTotalPayments = () => transactions.filter((t) => t.type === 'payment').reduce((sum, t) => sum + t.amount, 0)

    const getTrendData = () => {
        const last6Months = []
        const now = new Date()

        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
            const monthTransactions = transactions.filter((t) => {
                const transactionDate = new Date(t.date)
                return transactionDate.getMonth() === date.getMonth() &&
                    transactionDate.getFullYear() === date.getFullYear()
            })

            const expenses = monthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
            const income = monthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)

            last6Months.push({
                month: date.toLocaleDateString('en-US', { month: 'short' }),
                expenses,
                income,
            })
        }

        return last6Months
    }

    const getSpendingHeatmap = () => {
        const last30Days = []
        const now = new Date()

        for (let i = 29; i >= 0; i--) {
            const date = new Date(now)
            date.setDate(date.getDate() - i)
            const dateStr = date.toISOString().split('T')[0]

            const dayExpenses = transactions
                .filter(t => t.type === 'expense' && t.date.startsWith(dateStr))
                .reduce((sum, t) => sum + t.amount, 0)

            last30Days.push({
                date: dateStr,
                day: date.getDate(),
                amount: dayExpenses,
            })
        }

        const maxAmount = Math.max(...last30Days.map(d => d.amount), 1)
        return last30Days.map(d => ({
            ...d,
            intensity: d.amount / maxAmount,
        }))
    }

    const renderWidget = (widget: DashboardWidget) => {
        const expensesByCategory = getExpensesByCategory()
        const expensesByAccount = getExpensesByAccount()
        const totalExpenses = getTotalExpenses()
        const totalIncome = getTotalIncome()
        const totalPayments = getTotalPayments()
        const trendData = getTrendData()
        const heatmapData = getSpendingHeatmap()

        switch (widget.type) {
            case 'category-chart':
                return (
                    <div className="widget-content">
                        <h3>Expenses by Category</h3>
                        {expensesByCategory.length === 0 ? (
                            <p className="no-data">No expense data available</p>
                        ) : (
                            <div className="category-chart">
                                {expensesByCategory.slice(0, 5).map(({ category, amount }) => {
                                    const percentage = (amount / totalExpenses) * 100
                                    return (
                                        <div key={category} className="category-item">
                                            <div className="category-header">
                                                <span className="category-name">{category}</span>
                                                <span className="category-amount">{formatCurrency(amount)}</span>
                                            </div>
                                            <div className="category-bar">
                                                <div className="category-bar-fill" style={{ width: `${percentage}%` }} />
                                            </div>
                                            <span className="category-percentage">{percentage.toFixed(1)}%</span>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                )

            case 'account-chart':
                return (
                    <div className="widget-content">
                        <h3>Expenses by Account</h3>
                        {expensesByAccount.length === 0 ? (
                            <p className="no-data">No expense data available</p>
                        ) : (
                            <div className="account-chart">
                                {expensesByAccount.slice(0, 5).map(({ name, amount }) => (
                                    <div key={name} className="account-item">
                                        <span className="account-name">{name}</span>
                                        <span className="account-amount">{formatCurrency(amount)}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )

            case 'summary-stats':
                return (
                    <div className="widget-content">
                        <h3>Financial Summary</h3>
                        <div className="summary-stats">
                            <div className="stat-card">
                                <div className="stat-icon">💰</div>
                                <div className="stat-info">
                                    <p className="stat-label">Total Expenses</p>
                                    <p className="stat-value">{formatCurrency(totalExpenses)}</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">📈</div>
                                <div className="stat-info">
                                    <p className="stat-label">Total Income</p>
                                    <p className="stat-value income">{formatCurrency(totalIncome)}</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">💳</div>
                                <div className="stat-info">
                                    <p className="stat-label">Total Payments</p>
                                    <p className="stat-value">{formatCurrency(totalPayments)}</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">📊</div>
                                <div className="stat-info">
                                    <p className="stat-label">Net Balance</p>
                                    <p className={`stat-value ${totalIncome - totalExpenses >= 0 ? 'income' : 'expense'}`}>
                                        {formatCurrency(totalIncome - totalExpenses)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )

            case 'trend-analysis':
                return (
                    <div className="widget-content">
                        <h3>6-Month Trend</h3>
                        <div className="trend-chart">
                            {trendData.map((data, index) => {
                                const maxValue = Math.max(...trendData.map(d => Math.max(d.expenses, d.income)))
                                const expenseHeight = (data.expenses / maxValue) * 100
                                const incomeHeight = (data.income / maxValue) * 100

                                return (
                                    <div key={index} className="trend-bar-group">
                                        <div className="trend-bars">
                                            <div className="trend-bar expense" style={{ height: `${expenseHeight}%` }} title={`Expenses: ${formatCurrency(data.expenses)}`} />
                                            <div className="trend-bar income" style={{ height: `${incomeHeight}%` }} title={`Income: ${formatCurrency(data.income)}`} />
                                        </div>
                                        <span className="trend-label">{data.month}</span>
                                    </div>
                                )
                            })}
                        </div>
                        <div className="trend-legend">
                            <span className="legend-item"><span className="legend-color expense"></span> Expenses</span>
                            <span className="legend-item"><span className="legend-color income"></span> Income</span>
                        </div>
                    </div>
                )

            case 'spending-heatmap':
                return (
                    <div className="widget-content">
                        <h3>30-Day Spending Heatmap</h3>
                        <div className="heatmap-grid">
                            {heatmapData.map((data, index) => (
                                <div
                                    key={index}
                                    className="heatmap-cell"
                                    style={{
                                        backgroundColor: `rgba(239, 68, 68, ${data.intensity * 0.8})`,
                                    }}
                                    title={`${data.date}: ${formatCurrency(data.amount)}`}
                                >
                                    <span className="heatmap-day">{data.day}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )

            case 'geographic-view':
                return (
                    <div className="widget-content">
                        <h3>Geographic View</h3>
                        <div className="geographic-placeholder">
                            <div className="placeholder-icon">🗺️</div>
                            <p>Geographic spending visualization</p>
                            <p className="placeholder-note">Coming soon - Location-based expense tracking</p>
                        </div>
                    </div>
                )

            default:
                return <div className="widget-content">Unknown widget type</div>
        }
    }

    return (
        <div className="advanced-reports">
            <div className="reports-header">
                <div className="header-left">
                    <h2>Advanced Reports</h2>
                    <p className="header-subtitle">Build custom dashboards with drag-and-drop widgets</p>
                </div>
                <div className="header-right">
                    <label className="theme-toggle">
                        <input
                            type="checkbox"
                            checked={theme === 'dark'}
                            onChange={toggleTheme}
                        />
                        <span className="toggle-slider"></span>
                        <span className="toggle-label">{theme === 'dark' ? '🌙' : '☀️'}</span>
                    </label>
                </div>
            </div>

            <div className="reports-layout">
                <div className="widget-palette">
                    <h3>Widget Palette</h3>
                    <p className="palette-description">Drag widgets to dashboard</p>
                    <div className="palette-grid">
                        {widgetPalette.map((widget) => (
                            <div
                                key={widget.id}
                                className={`palette-widget ${dashboardWidgets.find(w => w.type === widget.type) ? 'added' : ''}`}
                                draggable
                                onDragStart={() => handleDragStart(widget.type)}
                            >
                                <div className="palette-widget-icon">
                                    {widget.type === 'category-chart' && '📊'}
                                    {widget.type === 'account-chart' && '🏦'}
                                    {widget.type === 'summary-stats' && '📈'}
                                    {widget.type === 'trend-analysis' && '📉'}
                                    {widget.type === 'spending-heatmap' && '🔥'}
                                    {widget.type === 'geographic-view' && '🗺️'}
                                </div>
                                <span className="palette-widget-title">{widget.title}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="dashboard-preview">
                    <div className="dashboard-header">
                        <h3>Dashboard Preview</h3>
                        {dashboardWidgets.length > 0 && (
                            <button onClick={clearDashboard} className="clear-button">
                                Clear All
                            </button>
                        )}
                    </div>
                    <div
                        className="dashboard-drop-zone"
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                    >
                        {dashboardWidgets.length === 0 ? (
                            <div className="empty-dashboard">
                                <div className="empty-icon">📊</div>
                                <p>Drag widgets here to build your dashboard</p>
                            </div>
                        ) : (
                            <div className="dashboard-widgets">
                                {dashboardWidgets.map((widget) => (
                                    <div key={widget.id} className="dashboard-widget">
                                        <div className="widget-header">
                                            <h4>{widget.title}</h4>
                                            <button
                                                onClick={() => removeWidget(widget.id)}
                                                className="remove-widget"
                                                title="Remove widget"
                                            >
                                                ×
                                            </button>
                                        </div>
                                        {renderWidget(widget)}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="year-comparison-section">
                <h3>Year-over-Year Comparison</h3>
                <div className="comparison-placeholder">
                    <div className="placeholder-icon">📅</div>
                    <p>Compare spending patterns across years</p>
                    <p className="placeholder-note">UI ready - Data integration coming soon</p>
                </div>
            </div>
        </div>
    )
}

export default AdvancedReports
