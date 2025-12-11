import { Expense } from '../types'
import { formatCurrency } from '../utils/currency'
import './ExpenseList.css'

interface ExpenseListProps {
  expenses: Expense[]
  onEdit: (expense: Expense) => void
  onDelete: (id: string) => void
}

const ExpenseList = ({ expenses, onEdit, onDelete }: ExpenseListProps) => {
  if (expenses.length === 0) {
    return (
      <div className="expense-list-empty">
        <p>No expenses yet. Add your first expense to get started!</p>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      Food: '#FF6B6B',
      Transport: '#4ECDC4',
      Shopping: '#45B7D1',
      Bills: '#FFA07A',
      Entertainment: '#98D8C8',
      Health: '#F7DC6F',
      Education: '#BB8FCE',
      Other: '#95A5A6',
    }
    return colors[category] || '#95A5A6'
  }

  return (
    <div className="expense-list">
      <h2>Your Expenses</h2>
      <div className="expense-items">
        {expenses
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .map((expense) => (
            <div key={expense.id} className="expense-item">
              <div className="expense-item-header">
                <div className="expense-category-badge" style={{ backgroundColor: getCategoryColor(expense.category) }}>
                  {expense.category}
                </div>
                <div className="expense-amount">{formatCurrency(expense.amount)}</div>
              </div>
              <div className="expense-item-body">
                <h3 className="expense-title">{expense.title}</h3>
                {expense.description && (
                  <p className="expense-description">{expense.description}</p>
                )}
                <p className="expense-date">{formatDate(expense.date)}</p>
              </div>
              <div className="expense-item-actions">
                <button
                  onClick={() => onEdit(expense)}
                  className="edit-button"
                  aria-label="Edit expense"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(expense.id)}
                  className="delete-button"
                  aria-label="Delete expense"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}

export default ExpenseList

