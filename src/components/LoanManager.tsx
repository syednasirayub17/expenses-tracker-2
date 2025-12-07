import { useState } from 'react'
import { useAccount } from '../context/AccountContext'
import { Loan, Transaction } from '../types'
import CategoryManager from './CategoryManager'
import './LoanManager.css'

const LoanManager = () => {
  const { loans, bankAccounts, addLoan, updateLoan, deleteLoan, addTransaction, transactions, categories: accountCategories } = useAccount()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isEMIFormOpen, setIsEMIFormOpen] = useState(false)
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null)
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null)
  const [showCategoryManager, setShowCategoryManager] = useState(false)
  const [categoryType, setCategoryType] = useState<'payment'>('payment')

  const handleAddLoan = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const totalPaidEMIs = parseInt(formData.get('totalPaidEMIs') as string) || 0
    const loan: Omit<Loan, 'id' | 'createdAt' | 'remainingAmount' | 'remainingMonths'> = {
      name: formData.get('name') as string,
      loanType: formData.get('loanType') as string,
      principalAmount: parseFloat(formData.get('principalAmount') as string),
      interestRate: parseFloat(formData.get('interestRate') as string),
      emiAmount: parseFloat(formData.get('emiAmount') as string),
      emiDate: parseInt(formData.get('emiDate') as string),
      tenureMonths: parseInt(formData.get('tenureMonths') as string),
      linkedBankAccountId: formData.get('linkedBankAccountId') as string || undefined,
      paymentMode: (formData.get('paymentMode') as 'auto' | 'manual') || 'manual',
      totalPaidEMIs: totalPaidEMIs,
      emiHistory: [],
    }
    if (editingLoan) {
      updateLoan({ ...editingLoan, ...loan })
    } else {
      addLoan(loan)
    }
    setIsFormOpen(false)
    setEditingLoan(null)
    e.currentTarget.reset()
  }

  const handlePayEMI = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedLoan) return

    const formData = new FormData(e.currentTarget)
    const emiAmount = parseFloat(formData.get('emiAmount') as string) || selectedLoan.emiAmount

    const transaction: Omit<Transaction, 'id'> = {
      accountId: selectedLoan.id,
      accountType: 'loan',
      type: 'payment',
      amount: emiAmount,
      category: formData.get('category') as string || 'EMI Payment',
      date: formData.get('date') as string || new Date().toISOString().split('T')[0],
      description: `EMI Payment for ${selectedLoan.name}`,
      linkedAccountId: formData.get('linkedAccountId') as string || selectedLoan.linkedBankAccountId,
    }
    addTransaction(transaction)

    // Update loan remaining amount and increment paid EMIs
    const newRemaining = Math.max(0, selectedLoan.remainingAmount - emiAmount)
    const newRemainingMonths = Math.max(0, selectedLoan.remainingMonths - 1)
    const newTotalPaidEMIs = (selectedLoan.totalPaidEMIs || 0) + 1
    
    updateLoan({
      ...selectedLoan,
      remainingAmount: newRemaining,
      remainingMonths: newRemainingMonths,
      totalPaidEMIs: newTotalPaidEMIs,
    })

    setIsEMIFormOpen(false)
    e.currentTarget.reset()
  }

  const getLoanTransactions = (loanId: string) => {
    return transactions.filter((t) => t.accountId === loanId && t.accountType === 'loan')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="loan-manager">
      <div className="section-header">
        <h2>Loan Accounts</h2>
        <button onClick={() => { setIsFormOpen(true); setEditingLoan(null) }} className="add-button">
          + Add Loan Account
        </button>
      </div>

      {isFormOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{editingLoan ? 'Edit' : 'Add'} Loan Account</h3>
            <form onSubmit={handleAddLoan}>
              <div className="form-group">
                <label>Loan Name *</label>
                <input name="name" defaultValue={editingLoan?.name} required />
              </div>
              <div className="form-group">
                <label>Loan Type *</label>
                <input name="loanType" placeholder="e.g., Home Loan, Car Loan" defaultValue={editingLoan?.loanType} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Principal Amount *</label>
                  <input type="number" name="principalAmount" step="0.01" defaultValue={editingLoan?.principalAmount} required />
                </div>
                <div className="form-group">
                  <label>Interest Rate (%) *</label>
                  <input type="number" name="interestRate" step="0.01" defaultValue={editingLoan?.interestRate} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>EMI Amount *</label>
                  <input type="number" name="emiAmount" step="0.01" defaultValue={editingLoan?.emiAmount} required />
                </div>
                <div className="form-group">
                  <label>EMI Date (Day of Month) *</label>
                  <input type="number" name="emiDate" min="1" max="31" defaultValue={editingLoan?.emiDate} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Tenure (Months) *</label>
                  <input type="number" name="tenureMonths" defaultValue={editingLoan?.tenureMonths} required />
                </div>
                <div className="form-group">
                  <label>Total Paid EMIs (so far)</label>
                  <input 
                    type="number" 
                    name="totalPaidEMIs" 
                    min="0"
                    defaultValue={editingLoan?.totalPaidEMIs || 0} 
                    placeholder="0"
                  />
                  <small style={{color: '#666', fontSize: '12px', marginTop: '4px', display: 'block'}}>How many EMIs have you already paid?</small>
                </div>
              </div>
              <div className="form-group">
                <label>Payment Mode *</label>
                <select name="paymentMode" defaultValue={editingLoan?.paymentMode} required>
                  <option value="auto">Auto (Auto-debit)</option>
                  <option value="manual">Manual</option>
                </select>
              </div>
              <div className="form-group">
                <label>Linked Bank Account (for EMI payments)</label>
                <select name="linkedBankAccountId" defaultValue={editingLoan?.linkedBankAccountId}>
                  <option value="">None</option>
                  {bankAccounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>{acc.name} - {acc.bankName}</option>
                  ))}
                </select>
              </div>
              <div className="form-actions">
                <button type="button" onClick={() => { setIsFormOpen(false); setEditingLoan(null) }}>Cancel</button>
                <button type="submit">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="loans-grid">
        {loans.map((loan) => {
          const loanTransactions = getLoanTransactions(loan.id)
          const paidAmount = loan.principalAmount - loan.remainingAmount
          const paidPercent = (paidAmount / loan.principalAmount) * 100
          return (
            <div key={loan.id} className="loan-card">
              <div className="loan-header">
                <div>
                  <h3>{loan.name}</h3>
                  <p className="loan-type">{loan.loanType}</p>
                </div>
                <div className="loan-stats">
                  <div className="stat-item">
                    <span className="stat-label">Principal</span>
                    <span className="stat-value">${loan.principalAmount.toFixed(2)}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Remaining</span>
                    <span className="stat-value remaining">${loan.remainingAmount.toFixed(2)}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">EMI</span>
                    <span className="stat-value">${loan.emiAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <div className="loan-progress">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${paidPercent}%` }} />
                </div>
                <div className="progress-info">
                  <span>{paidPercent.toFixed(1)}% Paid</span>
                  <span>{loan.remainingMonths} months remaining</span>
                </div>
                {loan.totalPaidEMIs !== undefined && loan.totalPaidEMIs > 0 && (
                  <div className="emi-progress-info">
                    <span className="emi-count">📊 {loan.totalPaidEMIs} / {loan.tenureMonths} EMIs Paid</span>
                  </div>
                )}
              </div>
              <div className="loan-details">
                <p><strong>Interest Rate:</strong> {loan.interestRate}%</p>
                <p><strong>EMI Date:</strong> {loan.emiDate}th of each month</p>
                <p><strong>Payment Mode:</strong> {loan.paymentMode === 'auto' ? 'Auto-debit' : 'Manual'}</p>
                {loan.linkedBankAccountId && (
                  <p><strong>Linked Account:</strong> {bankAccounts.find(a => a.id === loan.linkedBankAccountId)?.name}</p>
                )}
              </div>
              <div className="loan-actions">
                <button onClick={() => { setSelectedLoan(loan); setIsEMIFormOpen(true) }} className="action-button">
                  Pay EMI
                </button>
                <button onClick={() => { setEditingLoan(loan); setIsFormOpen(true) }} className="action-button secondary">
                  Edit
                </button>
                <button onClick={() => { if (window.confirm('Delete loan?')) deleteLoan(loan.id) }} className="action-button danger">
                  Delete
                </button>
              </div>
              <div className="transactions-section">
                <h4>EMI Payment History</h4>
                {loanTransactions.length === 0 ? (
                  <p className="no-transactions">No payments yet</p>
                ) : (
                  <div className="transactions-list">
                    {loanTransactions
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((transaction) => (
                        <div key={transaction.id} className="transaction-item">
                          <div className="transaction-info">
                            <span className="transaction-type payment">EMI Payment</span>
                            <span className="transaction-date">{formatDate(transaction.date)}</span>
                            {transaction.linkedAccountId && (
                              <span className="transaction-linked">From: {bankAccounts.find(a => a.id === transaction.linkedAccountId)?.name}</span>
                            )}
                          </div>
                          <div className="transaction-amount payment">-${transaction.amount.toFixed(2)}</div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {isEMIFormOpen && selectedLoan && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Pay EMI - {selectedLoan.name}</h3>
            <form onSubmit={handlePayEMI}>
              <div className="form-group">
                <label>EMI Amount *</label>
                <input type="number" name="emiAmount" step="0.01" defaultValue={selectedLoan.emiAmount} required />
              </div>
              <div className="form-group">
                <label>Payment Date *</label>
                <input type="date" name="date" defaultValue={new Date().toISOString().split('T')[0]} required />
              </div>
              <div className="form-group">
                <label>Category *</label>
                <div className="category-select-wrapper">
                  <select
                    name="category"
                    defaultValue="EMI Payment"
                    required
                  >
                    {accountCategories.payment.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                    <option value="EMI Payment">EMI Payment</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      setCategoryType('payment')
                      setShowCategoryManager(true)
                    }}
                    className="add-category-btn"
                    title="Manage Categories"
                  >
                    ⚙️
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label>Pay from Bank Account *</label>
                <select name="linkedAccountId" defaultValue={selectedLoan.linkedBankAccountId} required>
                  <option value="">Select Account</option>
                  {bankAccounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>{acc.name} - ${acc.balance.toFixed(2)}</option>
                  ))}
                </select>
              </div>
              <div className="form-actions">
                <button type="button" onClick={() => { setIsEMIFormOpen(false); setSelectedLoan(null) }}>Cancel</button>
                <button type="submit">Pay EMI</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCategoryManager && (
        <CategoryManager
          categoryType={categoryType}
          onClose={() => setShowCategoryManager(false)}
          onSelect={(category) => {
            const select = document.querySelector(`select[name="category"]`) as HTMLSelectElement
            if (select) {
              select.value = category
            }
            setShowCategoryManager(false)
          }}
        />
      )}
    </div>
  )
}

export default LoanManager

