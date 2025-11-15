import { Expense } from '../pages/Dashboard'
import './ExpenseSummary.css'

interface ExpenseSummaryProps {
  expenses: Expense[]
}

const ExpenseSummary = ({ expenses }: ExpenseSummaryProps) => {
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  
  const expensesByCategory = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount
    return acc
  }, {} as { [key: string]: number })

  const topCategory = Object.entries(expensesByCategory).reduce(
    (max, [category, amount]) => (amount > max.amount ? { category, amount } : max),
    { category: 'None', amount: 0 }
  )

  const thisMonthExpenses = expenses
    .filter((expense) => {
      const expenseDate = new Date(expense.date)
      const now = new Date()
      return (
        expenseDate.getMonth() === now.getMonth() &&
        expenseDate.getFullYear() === now.getFullYear()
      )
    })
    .reduce((sum, expense) => sum + expense.amount, 0)

  return (
    <div className="expense-summary">
      <h2>Summary</h2>
      <div className="summary-cards">
        <div className="summary-card">
          <div className="summary-card-icon">💰</div>
          <div className="summary-card-content">
            <p className="summary-card-label">Total Expenses</p>
            <p className="summary-card-value">${totalExpenses.toFixed(2)}</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-card-icon">📅</div>
          <div className="summary-card-content">
            <p className="summary-card-label">This Month</p>
            <p className="summary-card-value">${thisMonthExpenses.toFixed(2)}</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-card-icon">🏆</div>
          <div className="summary-card-content">
            <p className="summary-card-label">Top Category</p>
            <p className="summary-card-value">{topCategory.category}</p>
            <p className="summary-card-subvalue">${topCategory.amount.toFixed(2)}</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-card-icon">📊</div>
          <div className="summary-card-content">
            <p className="summary-card-label">Total Items</p>
            <p className="summary-card-value">{expenses.length}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExpenseSummary

