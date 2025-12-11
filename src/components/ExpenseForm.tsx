import { useState, useEffect } from 'react'
import { Expense } from '../types'
import { suggestCategory } from '../services/smartApi'
import './ExpenseForm.css'

interface ExpenseFormProps {
  expense?: Expense | null
  onSave: (expense: Expense) => void
  onCancel: () => void
}

const categories = [
  'Food',
  'Transport',
  'Shopping',
  'Bills',
  'Entertainment',
  'Health',
  'Education',
  'Other',
]

const ExpenseForm = ({ expense, onSave, onCancel }: ExpenseFormProps) => {
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState(categories[0])
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [description, setDescription] = useState('')
  const [suggestedCategory, setSuggestedCategory] = useState<string | null>(null)
  const [loadingSuggestion, setLoadingSuggestion] = useState(false)

  useEffect(() => {
    if (expense) {
      setTitle(expense.title)
      setAmount(expense.amount.toString())
      setCategory(expense.category)
      setDate(expense.date.split('T')[0])
      setDescription(expense.description || '')
    }
  }, [expense])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!title || !amount || !category || !date) {
      alert('Please fill in all required fields')
      return
    }

    const expenseData: Expense = {
      id: expense?.id || Date.now().toString(),
      title,
      amount: parseFloat(amount),
      category,
      date,
      description: description || undefined,
    }

    onSave(expenseData)
  }

  const handleGetSuggestion = async () => {
    if (!description.trim()) {
      alert('Please enter a description first')
      return
    }

    try {
      setLoadingSuggestion(true)
      const result = await suggestCategory(description)
      if (result && result.category) {
        setSuggestedCategory(result.category)
        setCategory(result.category)
      } else {
        alert('No suggestion available for this description')
      }
    } catch (error) {
      console.error('Error getting suggestion:', error)
    } finally {
      setLoadingSuggestion(false)
    }
  }

  return (
    <div className="expense-form-overlay">
      <div className="expense-form-card">
        <h2>{expense ? 'Edit Expense' : 'Add New Expense'}</h2>
        <form onSubmit={handleSubmit} className="expense-form">
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g., Grocery Shopping"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="amount">Amount *</label>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                min="0"
                step="0.01"
                placeholder="0.00"
              />
            </div>

            <div className="form-group">
              <div className="category-header">
                <label htmlFor="category">Category *</label>
                {description && (
                  <button
                    type="button"
                    onClick={handleGetSuggestion}
                    className="suggest-button"
                    disabled={loadingSuggestion}
                  >
                    {loadingSuggestion ? '...' : '✨ Smart Suggest'}
                  </button>
                )}
              </div>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {suggestedCategory && (
                <span className="suggestion-hint">💡 Suggested: {suggestedCategory}</span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="date">Date *</label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Optional description..."
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={onCancel} className="cancel-button">
              Cancel
            </button>
            <button type="submit" className="save-button">
              {expense ? 'Update' : 'Add'} Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ExpenseForm

