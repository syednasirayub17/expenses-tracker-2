import { useState } from 'react'
import { useAccount } from '../context/AccountContext'
import { Budget, Transaction } from '../types'
import './BudgetManager.css'

const BudgetManager = () => {
  const { budgets, transactions, addBudget, updateBudget, deleteBudget } = useAccount()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null)

  const categories = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Education', 'Other']

  const handleAddBudget = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const budget: Omit<Budget, 'id'> = {
      category: formData.get('category') as string,
      amount: parseFloat(formData.get('amount') as string),
      period: (formData.get('period') as 'monthly' | 'weekly') || 'monthly',
      startDate: formData.get('startDate') as string,
      endDate: formData.get('endDate') as string || undefined,
    }
    if (editingBudget) {
      updateBudget({ ...editingBudget, ...budget })
    } else {
      addBudget(budget)
    }
    setIsFormOpen(false)
    setEditingBudget(null)
    e.currentTarget.reset()
  }

  const getBudgetSpent = (budget: Budget) => {
    const { start, end } = getBudgetPeriod(budget)
    return transactions
      .filter((t) => {
        const transactionDate = new Date(t.date)
        return (
          t.type === 'expense' &&
          t.category === budget.category &&
          transactionDate >= start &&
          transactionDate <= end
        )
      })
      .reduce((sum, t) => sum + t.amount, 0)
  }

  const getBudgetPeriod = (budget: Budget) => {
    const start = new Date(budget.startDate)
    let end: Date
    
    if (budget.endDate) {
      end = new Date(budget.endDate)
    } else if (budget.period === 'monthly') {
      end = new Date(start.getFullYear(), start.getMonth() + 1, 0, 23, 59, 59)
    } else {
      end = new Date(start)
      end.setDate(end.getDate() + 6)
      end.setHours(23, 59, 59)
    }
    
    return { start, end }
  }

  const getBudgetStatus = (budget: Budget) => {
    const spent = getBudgetSpent(budget)
    const remaining = budget.amount - spent
    const percentage = (spent / budget.amount) * 100
    
    if (percentage >= 100) return { status: 'exceeded', color: '#f44336' }
    if (percentage >= 80) return { status: 'warning', color: '#ff9800' }
    return { status: 'good', color: '#4caf50' }
  }

  return (
    <div className="budget-manager">
      <div className="section-header">
        <h2>Budget Management</h2>
        <button onClick={() => { setIsFormOpen(true); setEditingBudget(null) }} className="add-button">
          + Add Budget
        </button>
      </div>

      {isFormOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{editingBudget ? 'Edit' : 'Add'} Budget</h3>
            <form onSubmit={handleAddBudget}>
              <div className="form-group">
                <label>Category *</label>
                <select name="category" defaultValue={editingBudget?.category} required>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Amount *</label>
                  <input type="number" name="amount" step="0.01" defaultValue={editingBudget?.amount} required />
                </div>
                <div className="form-group">
                  <label>Period *</label>
                  <select name="period" defaultValue={editingBudget?.period} required>
                    <option value="monthly">Monthly</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Start Date *</label>
                  <input type="date" name="startDate" defaultValue={editingBudget?.startDate} required />
                </div>
                <div className="form-group">
                  <label>End Date (Optional)</label>
                  <input type="date" name="endDate" defaultValue={editingBudget?.endDate} />
                </div>
              </div>
              <div className="form-actions">
                <button type="button" onClick={() => { setIsFormOpen(false); setEditingBudget(null) }}>Cancel</button>
                <button type="submit">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="budgets-grid">
        {budgets.length === 0 ? (
          <div className="no-budgets">
            <p>No budgets set. Create one to track your spending!</p>
          </div>
        ) : (
          budgets.map((budget) => {
            const spent = getBudgetSpent(budget)
            const remaining = budget.amount - spent
            const percentage = Math.min((spent / budget.amount) * 100, 100)
            const status = getBudgetStatus(budget)
            const { start, end } = getBudgetPeriod(budget)

            return (
              <div key={budget.id} className="budget-card">
                <div className="budget-header">
                  <h3>{budget.category}</h3>
                  <span className={`budget-status ${status.status}`}>{status.status}</span>
                </div>
                <div className="budget-amounts">
                  <div className="amount-item">
                    <span className="amount-label">Budget</span>
                    <span className="amount-value">${budget.amount.toFixed(2)}</span>
                  </div>
                  <div className="amount-item">
                    <span className="amount-label">Spent</span>
                    <span className="amount-value spent">${spent.toFixed(2)}</span>
                  </div>
                  <div className="amount-item">
                    <span className="amount-label">Remaining</span>
                    <span className={`amount-value ${remaining >= 0 ? 'remaining' : 'exceeded'}`}>
                      ${Math.abs(remaining).toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="budget-progress">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${percentage}%`, backgroundColor: status.color }} />
                  </div>
                  <span className="progress-text">{percentage.toFixed(1)}%</span>
                </div>
                <div className="budget-period">
                  <p><strong>Period:</strong> {budget.period}</p>
                  <p><strong>From:</strong> {start.toLocaleDateString()}</p>
                  {budget.endDate && <p><strong>To:</strong> {end.toLocaleDateString()}</p>}
                </div>
                <div className="budget-actions">
                  <button onClick={() => { setEditingBudget(budget); setIsFormOpen(true) }} className="action-button secondary">
                    Edit
                  </button>
                  <button onClick={() => { if (window.confirm('Delete budget?')) deleteBudget(budget.id) }} className="action-button danger">
                    Delete
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default BudgetManager

