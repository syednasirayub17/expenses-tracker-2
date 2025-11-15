import { useState } from 'react'
import { useAccount } from '../context/AccountContext'
import { Savings } from '../types'
import './SavingsManager.css'

const SavingsManager = () => {
  const { savings, bankAccounts, addSavings, updateSavings, deleteSavings } = useAccount()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingSavings, setEditingSavings] = useState<Savings | null>(null)

  const handleAddSavings = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const savingsItem: Omit<Savings, 'id'> = {
      name: formData.get('name') as string,
      targetAmount: parseFloat(formData.get('targetAmount') as string),
      currentAmount: parseFloat(formData.get('currentAmount') as string) || 0,
      targetDate: formData.get('targetDate') as string,
      description: formData.get('description') as string || undefined,
      linkedBankAccountId: formData.get('linkedBankAccountId') as string || undefined,
    }
    if (editingSavings) {
      updateSavings({ ...editingSavings, ...savingsItem })
    } else {
      addSavings(savingsItem)
    }
    setIsFormOpen(false)
    setEditingSavings(null)
    e.currentTarget.reset()
  }

  const getProgressPercentage = (savingsItem: Savings) => {
    return Math.min((savingsItem.currentAmount / savingsItem.targetAmount) * 100, 100)
  }

  const getDaysRemaining = (targetDate: string) => {
    const today = new Date()
    const target = new Date(targetDate)
    const diffTime = target.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getRequiredMonthlySavings = (savingsItem: Savings) => {
    const daysRemaining = getDaysRemaining(savingsItem.targetDate)
    const monthsRemaining = daysRemaining / 30
    const remainingAmount = savingsItem.targetAmount - savingsItem.currentAmount
    return monthsRemaining > 0 ? remainingAmount / monthsRemaining : 0
  }

  return (
    <div className="savings-manager">
      <div className="section-header">
        <h2>Savings Goals</h2>
        <button onClick={() => { setIsFormOpen(true); setEditingSavings(null) }} className="add-button">
          + Add Savings Goal
        </button>
      </div>

      {isFormOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{editingSavings ? 'Edit' : 'Add'} Savings Goal</h3>
            <form onSubmit={handleAddSavings}>
              <div className="form-group">
                <label>Goal Name *</label>
                <input name="name" defaultValue={editingSavings?.name} required placeholder="e.g., Vacation Fund" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Target Amount *</label>
                  <input type="number" name="targetAmount" step="0.01" defaultValue={editingSavings?.targetAmount} required />
                </div>
                <div className="form-group">
                  <label>Current Amount *</label>
                  <input type="number" name="currentAmount" step="0.01" defaultValue={editingSavings?.currentAmount || 0} required />
                </div>
              </div>
              <div className="form-group">
                <label>Target Date *</label>
                <input type="date" name="targetDate" defaultValue={editingSavings?.targetDate} required />
              </div>
              <div className="form-group">
                <label>Linked Bank Account (Optional)</label>
                <select name="linkedBankAccountId" defaultValue={editingSavings?.linkedBankAccountId}>
                  <option value="">None</option>
                  {bankAccounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>{acc.name} - {acc.bankName}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea name="description" rows={3} defaultValue={editingSavings?.description} />
              </div>
              <div className="form-actions">
                <button type="button" onClick={() => { setIsFormOpen(false); setEditingSavings(null) }}>Cancel</button>
                <button type="submit">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="savings-grid">
        {savings.length === 0 ? (
          <div className="no-savings">
            <p>No savings goals set. Create one to start tracking your progress!</p>
          </div>
        ) : (
          savings.map((savingsItem) => {
            const progress = getProgressPercentage(savingsItem)
            const remaining = savingsItem.targetAmount - savingsItem.currentAmount
            const daysRemaining = getDaysRemaining(savingsItem.targetDate)
            const requiredMonthly = getRequiredMonthlySavings(savingsItem)
            const isOnTrack = daysRemaining > 0 && requiredMonthly > 0

            return (
              <div key={savingsItem.id} className="savings-card">
                <div className="savings-header">
                  <h3>{savingsItem.name}</h3>
                  {savingsItem.linkedBankAccountId && (
                    <span className="linked-account">
                      Linked: {bankAccounts.find(a => a.id === savingsItem.linkedBankAccountId)?.name}
                    </span>
                  )}
                </div>
                <div className="savings-amounts">
                  <div className="amount-item">
                    <span className="amount-label">Current</span>
                    <span className="amount-value current">${savingsItem.currentAmount.toFixed(2)}</span>
                  </div>
                  <div className="amount-item">
                    <span className="amount-label">Target</span>
                    <span className="amount-value target">${savingsItem.targetAmount.toFixed(2)}</span>
                  </div>
                  <div className="amount-item">
                    <span className="amount-label">Remaining</span>
                    <span className="amount-value remaining">${remaining.toFixed(2)}</span>
                  </div>
                </div>
                <div className="savings-progress">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${progress}%` }} />
                  </div>
                  <span className="progress-text">{progress.toFixed(1)}%</span>
                </div>
                <div className="savings-details">
                  <p><strong>Target Date:</strong> {new Date(savingsItem.targetDate).toLocaleDateString()}</p>
                  <p><strong>Days Remaining:</strong> {daysRemaining > 0 ? daysRemaining : 'Past due'}</p>
                  {isOnTrack && (
                    <p><strong>Required Monthly:</strong> ${requiredMonthly.toFixed(2)}</p>
                  )}
                  {savingsItem.description && (
                    <p className="description">{savingsItem.description}</p>
                  )}
                </div>
                <div className="savings-actions">
                  <button onClick={() => { setEditingSavings(savingsItem); setIsFormOpen(true) }} className="action-button secondary">
                    Edit
                  </button>
                  <button onClick={() => { if (window.confirm('Delete savings goal?')) deleteSavings(savingsItem.id) }} className="action-button danger">
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

export default SavingsManager

