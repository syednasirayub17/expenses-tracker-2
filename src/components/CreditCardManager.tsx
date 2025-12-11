import { useState } from 'react'
import { useAccount } from '../context/AccountContext'
import { CreditCard, Transaction } from '../types'
import { formatCurrency } from '../utils/currency'
import CategoryManager from './CategoryManager'
import './CreditCardManager.css'

const CreditCardManager = () => {
  const { creditCards, bankAccounts, addCreditCard, updateCreditCard, deleteCreditCard, addTransaction, updateTransaction, transactions, deleteTransaction, categories: accountCategories } = useAccount()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isTransactionFormOpen, setIsTransactionFormOpen] = useState(false)
  const [selectedCard, setSelectedCard] = useState<CreditCard | null>(null)
  const [editingCard, setEditingCard] = useState<CreditCard | null>(null)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [showCategoryManager, setShowCategoryManager] = useState(false)
  const [categoryType, setCategoryType] = useState<'expense' | 'payment'>('expense')

  const handleAddCard = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const card: Omit<CreditCard, 'id' | 'createdAt' | 'currentBalance' | 'availableCredit'> = {
      name: formData.get('name') as string,
      cardNumber: formData.get('cardNumber') as string,
      bankName: formData.get('bankName') as string,
      limit: parseFloat(formData.get('limit') as string),
      dueDate: parseInt(formData.get('dueDate') as string),
      linkedBankAccountId: formData.get('linkedBankAccountId') as string || undefined,
    }
    if (editingCard) {
      updateCreditCard({ ...editingCard, ...card })
    } else {
      addCreditCard(card)
    }
    setIsFormOpen(false)
    setEditingCard(null)
    e.currentTarget.reset()
  }

  const handleAddTransaction = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedCard) return

    const formData = new FormData(e.currentTarget)
    const transactionType = formData.get('type') as 'expense' | 'payment'

    const transaction: Omit<Transaction, 'id'> = {
      accountId: selectedCard.id,
      accountType: 'creditCard',
      type: transactionType,
      amount: parseFloat(formData.get('amount') as string),
      category: formData.get('category') as string,
      date: formData.get('date') as string,
      description: formData.get('description') as string || undefined,
      linkedAccountId: transactionType === 'payment' ? formData.get('linkedAccountId') as string : undefined,
    }

    if (editingTransaction) {
      // Use updateTransaction instead of delete+add to prevent double processing
      updateTransaction({ ...transaction, id: editingTransaction.id })
      setEditingTransaction(null)
    } else {
      addTransaction(transaction)
    }
    e.currentTarget.reset()
  }

  const getCardTransactions = (cardId: string) => {
    return transactions.filter((t) => t.accountId === cardId && t.accountType === 'creditCard')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="credit-card-manager">
      <div className="manager-container">
        <div className="section-header">
          <h2>Credit Cards</h2>
          <button onClick={() => { setIsFormOpen(true); setEditingCard(null) }} className="add-button">
            + Add Credit Card
          </button>
        </div>

        <div className="cards-grid">
          {creditCards.length === 0 ? (
            <div className="no-cards">
              <p>No credit cards yet. Add one to get started!</p>
            </div>
          ) : (
            creditCards.map((card) => {
              const cardTransactions = getCardTransactions(card.id)
              const utilizationPercent = (card.currentBalance / card.limit) * 100
              return (
                <div key={card.id} className="card-card">
                  <div className="card-header">
                    <div className="card-header-info">
                      <h3>{card.name}</h3>
                      <p className="card-number">{card.cardNumber}</p>
                      <p className="bank-name">{card.bankName}</p>
                    </div>
                    <div className="card-stats">
                      <div className="stat-item">
                        <span className="stat-label">Limit</span>
                        <span className="stat-value">{formatCurrency(card.limit)}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Used</span>
                        <span className="stat-value used">{formatCurrency(card.currentBalance)}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Available</span>
                        <span className="stat-value available">{formatCurrency(card.availableCredit)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="utilization-bar">
                    <div className="utilization-fill" style={{ width: `${Math.min(utilizationPercent, 100)}%` }} />
                    <span className="utilization-text">{utilizationPercent.toFixed(1)}% Used</span>
                  </div>
                  <div className="card-actions">
                    <button onClick={() => { setSelectedCard(card); setIsTransactionFormOpen(true) }} className="action-button">
                      Add Transaction
                    </button>
                    <button onClick={() => { setEditingCard(card); setIsFormOpen(true) }} className="action-button secondary">
                      Edit
                    </button>
                    <button onClick={() => { if (window.confirm('Delete card?')) deleteCreditCard(card.id) }} className="action-button danger">
                      Delete
                    </button>
                  </div>
                  <div className="transactions-section">
                    <h4>Transactions</h4>
                    {cardTransactions.length === 0 ? (
                      <p className="no-transactions">No transactions yet</p>
                    ) : (
                      <div className="transactions-list">
                        {cardTransactions
                          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                          .map((transaction) => (
                            <div key={transaction.id} className="transaction-item">
                              <div className="transaction-info">
                                <span className={`transaction-type ${transaction.type}`}>{transaction.type}</span>
                                <span className="transaction-category">{transaction.category}</span>
                                <span className="transaction-date">{formatDate(transaction.date)}</span>
                              </div>
                              <div className="transaction-actions">
                                <div className={`transaction-amount ${transaction.type}`}>
                                  {transaction.type === 'payment' ? '+' : '-'}{formatCurrency(transaction.amount)}
                                </div>
                                <div className="transaction-buttons">
                                  <button
                                    onClick={() => {
                                      setEditingTransaction(transaction)
                                      setSelectedCard(card)
                                      setIsTransactionFormOpen(true)
                                    }}
                                    className="edit-transaction-btn"
                                    title="Edit Transaction"
                                  >
                                    ✏️
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (window.confirm('Delete this transaction?')) {
                                        deleteTransaction(transaction.id)
                                      }
                                    }}
                                    className="delete-transaction-btn"
                                    title="Delete Transaction"
                                  >
                                    🗑️
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {isFormOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{editingCard ? 'Edit' : 'Add'} Credit Card</h3>
            <form onSubmit={handleAddCard}>
              <div className="form-group">
                <label>Card Name *</label>
                <input name="name" defaultValue={editingCard?.name} required />
              </div>
              <div className="form-group">
                <label>Card Number *</label>
                <input name="cardNumber" defaultValue={editingCard?.cardNumber} required />
              </div>
              <div className="form-group">
                <label>Bank Name *</label>
                <input name="bankName" defaultValue={editingCard?.bankName} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Credit Limit *</label>
                  <input type="number" name="limit" step="0.01" defaultValue={editingCard?.limit} required />
                </div>
                <div className="form-group">
                  <label>Due Date (Day of Month) *</label>
                  <input type="number" name="dueDate" min="1" max="31" defaultValue={editingCard?.dueDate} required />
                </div>
              </div>
              <div className="form-group">
                <label>Linked Bank Account (for payments)</label>
                <select name="linkedBankAccountId" defaultValue={editingCard?.linkedBankAccountId}>
                  <option value="">None</option>
                  {bankAccounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>{acc.name} - {acc.bankName}</option>
                  ))}
                </select>
              </div>
              <div className="form-actions">
                <button type="button" onClick={() => { setIsFormOpen(false); setEditingCard(null) }}>Cancel</button>
                <button type="submit">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isTransactionFormOpen && selectedCard && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{editingTransaction ? 'Edit' : 'Add'} Transaction - {selectedCard?.name}</h3>
            <form onSubmit={handleAddTransaction}>
              <div className="form-group">
                <label>Type *</label>
                <select
                  name="type"
                  id="transaction-type-select"
                  defaultValue={editingTransaction?.type || 'expense'}
                  onChange={(e) => {
                    const type = e.target.value as 'expense' | 'payment'
                    const categorySelect = document.getElementById('category-select') as HTMLSelectElement
                    if (categorySelect) {
                      const typeCategories = type === 'expense' ? accountCategories.expense : accountCategories.payment
                      categorySelect.innerHTML = typeCategories.map(cat =>
                        `<option value="${cat}">${cat}</option>`
                      ).join('')
                      if (editingTransaction) {
                        categorySelect.value = editingTransaction.category
                      }
                    }
                  }}
                  required
                >
                  <option value="expense">Expense</option>
                  <option value="payment">Payment</option>
                </select>
              </div>
              <div className="form-group">
                <label>Category *</label>
                <div className="category-select-wrapper">
                  <select
                    name="category"
                    id="category-select"
                    defaultValue={editingTransaction?.category || accountCategories.expense[0]}
                    onChange={(e) => {
                      if (e.target.value === '__ADD_NEW__') {
                        e.target.value = editingTransaction?.category || accountCategories.expense[0]
                        const typeSelect = document.getElementById('transaction-type-select') as HTMLSelectElement
                        const type = typeSelect?.value as 'expense' | 'payment'
                        setCategoryType(type || 'expense')
                        setShowCategoryManager(true)
                      }
                    }}
                    required
                  >
                    {(editingTransaction ?
                      (editingTransaction.type === 'expense' ? accountCategories.expense :
                        accountCategories.payment) : accountCategories.expense).map((cat: string) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                    <option value="__ADD_NEW__" className="add-category-option">+ Add New Category</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      const typeSelect = document.getElementById('transaction-type-select') as HTMLSelectElement
                      const type = typeSelect?.value as 'expense' | 'payment'
                      setCategoryType(type || 'expense')
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
                <label>Amount *</label>
                <input type="number" name="amount" step="0.01" defaultValue={editingTransaction?.amount || ''} required />
              </div>
              <div className="form-group">
                <label>Date *</label>
                <input 
                  type="date" 
                  name="date" 
                  defaultValue={editingTransaction?.date ? editingTransaction.date.split('T')[0] : new Date().toISOString().split('T')[0]} 
                  required 
                />
              </div>
              {selectedCard.linkedBankAccountId && (
                <div className="form-group">
                  <label>Pay from Bank Account (for payments)</label>
                  <select name="linkedAccountId">
                    <option value="">None</option>
                    {bankAccounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>{acc.name} - {acc.bankName}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="form-group">
                <label>Description</label>
                <textarea name="description" rows={3} defaultValue={editingTransaction?.description || ''} />
              </div>
              <div className="form-actions">
                <button type="button" onClick={() => { setIsTransactionFormOpen(false); setEditingTransaction(null); setSelectedCard(null) }}>Cancel</button>
                <button type="submit">{editingTransaction ? 'Update' : 'Add'} Transaction</button>
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

export default CreditCardManager

