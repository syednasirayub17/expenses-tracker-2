import { useState } from 'react'
import { useAccount } from '../context/AccountContext'
import { formatCurrency } from '../utils/currency'
import './Reports.css'

const Reports = () => {
  const { transactions, bankAccounts, creditCards, loans } = useAccount()
  const [reportType, setReportType] = useState<'weekly' | 'monthly'>('monthly')
  const [selectedPeriod, setSelectedPeriod] = useState<string>(() => {
    const now = new Date()
    return reportType === 'monthly' 
      ? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
      : getWeekString(now)
  })

  function getWeekString(date: Date): string {
    const year = date.getFullYear()
    const startOfYear = new Date(year, 0, 1)
    const days = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000))
    const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7)
    return `${year}-W${String(weekNumber).padStart(2, '0')}`
  }

  function getDateRange(period: string, type: 'weekly' | 'monthly') {
    if (type === 'monthly') {
      const [year, month] = period.split('-').map(Number)
      return {
        start: new Date(year, month - 1, 1),
        end: new Date(year, month, 0, 23, 59, 59),
      }
    } else {
      const [year, week] = period.split('-W').map(Number)
      const startOfYear = new Date(year, 0, 1)
      const daysToAdd = (week - 1) * 7 - startOfYear.getDay()
      const start = new Date(year, 0, 1 + daysToAdd)
      const end = new Date(start)
      end.setDate(end.getDate() + 6)
      end.setHours(23, 59, 59)
      return { start, end }
    }
  }

  const getFilteredTransactions = () => {
    const { start, end } = getDateRange(selectedPeriod, reportType)
    return transactions.filter((t) => {
      const transactionDate = new Date(t.date)
      return transactionDate >= start && transactionDate <= end
    })
  }

  const filteredTransactions = getFilteredTransactions()

  const getExpensesByCategory = () => {
    const expenses = filteredTransactions.filter((t) => t.type === 'expense')
    const categoryMap: { [key: string]: number } = {}
    expenses.forEach((t) => {
      categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount
    })
    return Object.entries(categoryMap)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
  }

  const getExpensesByAccount = () => {
    const expenses = filteredTransactions.filter((t) => t.type === 'expense')
    const accountMap: { [key: string]: { name: string; amount: number; type: string } } = {}
    
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
        accountMap[t.accountId] = { name: accountName, amount: 0, type: t.accountType }
      }
      accountMap[t.accountId].amount += t.amount
    })
    
    return Object.values(accountMap).sort((a, b) => b.amount - a.amount)
  }

  const getTotalExpenses = () => {
    return filteredTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
  }

  const getTotalIncome = () => {
    return filteredTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
  }

  const getTotalPayments = () => {
    return filteredTransactions
      .filter((t) => t.type === 'payment')
      .reduce((sum, t) => sum + t.amount, 0)
  }

  const expensesByCategory = getExpensesByCategory()
  const expensesByAccount = getExpensesByAccount()
  const totalExpenses = getTotalExpenses()
  const totalIncome = getTotalIncome()
  const totalPayments = getTotalPayments()

  const generateMonthOptions = () => {
    const options = []
    const now = new Date()
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const label = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
      options.push({ value, label })
    }
    return options
  }

  const generateWeekOptions = () => {
    const options = []
    const now = new Date()
    for (let i = 0; i < 12; i++) {
      const date = new Date(now)
      date.setDate(date.getDate() - i * 7)
      const value = getWeekString(date)
      const { start } = getDateRange(value, 'weekly')
      const label = `Week ${value.split('-W')[1]} - ${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
      options.push({ value, label })
    }
    return options
  }

  return (
    <div className="reports">
      <div className="reports-header">
        <h2>Reports</h2>
        <div className="report-controls">
          <div className="report-type-toggle">
            <button
              className={reportType === 'monthly' ? 'active' : ''}
              onClick={() => {
                setReportType('monthly')
                const now = new Date()
                setSelectedPeriod(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`)
              }}
            >
              Monthly
            </button>
            <button
              className={reportType === 'weekly' ? 'active' : ''}
              onClick={() => {
                setReportType('weekly')
                setSelectedPeriod(getWeekString(new Date()))
              }}
            >
              Weekly
            </button>
          </div>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="period-select"
          >
            {(reportType === 'monthly' ? generateMonthOptions() : generateWeekOptions()).map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="reports-summary">
        <div className="summary-card">
          <div className="summary-icon">💰</div>
          <div className="summary-content">
            <p className="summary-label">Total Expenses</p>
            <p className="summary-value">{formatCurrency(totalExpenses)}</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon">📈</div>
          <div className="summary-content">
            <p className="summary-label">Total Income</p>
            <p className="summary-value income">{formatCurrency(totalIncome)}</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon">💳</div>
          <div className="summary-content">
            <p className="summary-label">Total Payments</p>
            <p className="summary-value">{formatCurrency(totalPayments)}</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon">📊</div>
          <div className="summary-content">
            <p className="summary-label">Net Balance</p>
            <p className={`summary-value ${totalIncome - totalExpenses >= 0 ? 'income' : 'expense'}`}>
              {formatCurrency(totalIncome - totalExpenses)}
            </p>
          </div>
        </div>
      </div>

      <div className="reports-charts">
        <div className="chart-section">
          <h3>Expenses by Category</h3>
          {expensesByCategory.length === 0 ? (
            <p className="no-data">No expenses in this period</p>
          ) : (
            <div className="category-chart">
              {expensesByCategory.map(({ category, amount }) => {
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

        <div className="chart-section">
          <h3>Expenses by Account</h3>
          {expensesByAccount.length === 0 ? (
            <p className="no-data">No expenses in this period</p>
          ) : (
            <div className="account-chart">
              {expensesByAccount.map(({ name, amount, type }) => (
                <div key={name} className="account-item">
                  <div className="account-info">
                    <span className="account-name">{name}</span>
                    <span className="account-type">{type}</span>
                  </div>
                  <span className="account-amount">{formatCurrency(amount)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Reports

