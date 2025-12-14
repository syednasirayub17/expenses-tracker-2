import { useAccount } from '../context/AccountContext'
import { formatCurrency } from '../utils/currency'
import PieChart from './PieChart'
import './DashboardOverview.css'

const DashboardOverview = () => {
  const { 
    bankAccounts, 
    creditCards, 
    loans, 
    transactions, 
    budgets, 
    savings,
    showCreditCardBalance,
    showLoanBalance,
    toggleCreditCardVisibility,
    toggleLoanVisibility
  } = useAccount()

  // Calculate total cash in hand
  const cashInHand = bankAccounts
    .filter((acc) => acc.accountType === 'cash')
    .reduce((sum, acc) => sum + acc.balance, 0)

  // Calculate total bank balance
  const totalBankBalance = bankAccounts
    .filter((acc) => acc.accountType !== 'cash')
    .reduce((sum, acc) => sum + acc.balance, 0)

  // Calculate total credit card debt (only if visible)
  const totalCreditCardDebt = showCreditCardBalance 
    ? creditCards.reduce((sum, card) => sum + card.currentBalance, 0)
    : 0

  // Calculate total loan remaining (only if visible)
  const totalLoanRemaining = showLoanBalance
    ? loans.reduce((sum, loan) => sum + loan.remainingAmount, 0)
    : 0

  // Calculate net worth (only includes visible balances)
  const netWorth = totalBankBalance + cashInHand - totalCreditCardDebt - totalLoanRemaining

  // Get current month transactions
  const now = new Date()
  const currentMonthTransactions = transactions.filter((t) => {
    const transactionDate = new Date(t.date)
    return (
      transactionDate.getMonth() === now.getMonth() &&
      transactionDate.getFullYear() === now.getFullYear()
    )
  })

  // Calculate monthly expenses by category
  const monthlyExpenses = currentMonthTransactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount
      return acc
    }, {} as { [key: string]: number })

  const expenseCategories = Object.entries(monthlyExpenses)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount)

  // Calculate monthly income
  const monthlyIncome = currentMonthTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  // Calculate monthly expenses total
  const monthlyExpensesTotal = currentMonthTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  // Calculate savings progress
  const totalSavingsTarget = savings.reduce((sum, s) => sum + s.targetAmount, 0)
  const totalSavingsCurrent = savings.reduce((sum, s) => sum + s.currentAmount, 0)
  const savingsProgress = totalSavingsTarget > 0 ? (totalSavingsCurrent / totalSavingsTarget) * 100 : 0

  // Budget status
  const activeBudgets = budgets.filter((b) => {
    const start = new Date(b.startDate)
    const end = b.endDate ? new Date(b.endDate) : new Date(start.getFullYear(), start.getMonth() + 1, 0)
    return now >= start && now <= end
  })

  const budgetStatus = activeBudgets.map((budget) => {
    const budgetExpenses = currentMonthTransactions
      .filter((t) => t.type === 'expense' && t.category === budget.category)
      .reduce((sum, t) => sum + t.amount, 0)
    return {
      category: budget.category,
      budget: budget.amount,
      spent: budgetExpenses,
      remaining: budget.amount - budgetExpenses,
      percentage: (budgetExpenses / budget.amount) * 100,
    }
  })

  return (
    <div className="dashboard-overview">
      <div className="overview-header">
        <h2>Dashboard Overview</h2>
        <div className="visibility-controls">
          <button 
            onClick={toggleCreditCardVisibility}
            className={`visibility-toggle ${showCreditCardBalance ? 'active' : 'inactive'}`}
            title={showCreditCardBalance ? 'Hide Credit Card Balance' : 'Show Credit Card Balance'}
          >
            💳 {showCreditCardBalance ? '👁️' : '👁️‍🗨️'}
          </button>
          <button 
            onClick={toggleLoanVisibility}
            className={`visibility-toggle ${showLoanBalance ? 'active' : 'inactive'}`}
            title={showLoanBalance ? 'Hide Loan Balance' : 'Show Loan Balance'}
          >
            📋 {showLoanBalance ? '👁️' : '👁️‍🗨️'}
          </button>
        </div>
      </div>



      <div className="overview-cards">
        <div className="overview-card primary">
          <div className="card-icon">💰</div>
          <div className="card-content">
            <p className="card-label">Net Worth</p>
            <p className={`card-value ${netWorth >= 0 ? 'positive' : 'negative'}`}>
              {formatCurrency(netWorth)}
            </p>
          </div>
        </div>

        <div className="overview-card">
          <div className="card-icon">💵</div>
          <div className="card-content">
            <p className="card-label">Cash in Hand</p>
            <p className="card-value">{formatCurrency(cashInHand)}</p>
          </div>
        </div>

        <div className="overview-card">
          <div className="card-icon">🏦</div>
          <div className="card-content">
            <p className="card-label">Bank Balance</p>
            <p className="card-value">{formatCurrency(totalBankBalance)}</p>
          </div>
        </div>

        {showCreditCardBalance && (
          <div className="overview-card">
            <div className="card-icon">💳</div>
            <div className="card-content">
              <p className="card-label">Credit Card Debt</p>
              <p className="card-value negative">{formatCurrency(totalCreditCardDebt)}</p>
            </div>
          </div>
        )}

        {showLoanBalance && (
          <div className="overview-card">
            <div className="card-icon">📋</div>
            <div className="card-content">
              <p className="card-label">Loan Remaining</p>
              <p className="card-value negative">{formatCurrency(totalLoanRemaining)}</p>
            </div>
          </div>
        )}

        <div className="overview-card">
          <div className="card-icon">📊</div>
          <div className="card-content">
            <p className="card-label">Monthly Income</p>
            <p className="card-value positive">{formatCurrency(monthlyIncome)}</p>
          </div>
        </div>

        <div className="overview-card">
          <div className="card-icon">💸</div>
          <div className="card-content">
            <p className="card-label">Monthly Expenses</p>
            <p className="card-value negative">{formatCurrency(monthlyExpensesTotal)}</p>
          </div>
        </div>

        <div className="overview-card">
          <div className="card-icon">🎯</div>
          <div className="card-content">
            <p className="card-label">Savings Progress</p>
            <p className="card-value">{savingsProgress.toFixed(1)}%</p>
          </div>
        </div>
      </div>

      <div className="overview-charts">
        <div className="chart-section expenses-3d">
          <h3>📊 Monthly Expenses by Category</h3>
          {expenseCategories.length > 0 ? (
            <PieChart data={expenseCategories} />
          ) : (
            <p className="no-data">No expenses this month</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default DashboardOverview

