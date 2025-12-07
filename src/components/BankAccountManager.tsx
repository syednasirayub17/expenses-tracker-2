import { useState } from 'react'
import { useAccount } from '../context/AccountContext'
import { BankAccount, Transaction } from '../types'
import { formatCurrency } from '../utils/currency'
import CategoryManager from './CategoryManager'
import './BankAccountManager.css'

const BankAccountManager = () => {
  const { bankAccounts, addBankAccount, updateBankAccount, deleteBankAccount, addTransaction, updateTransaction, deleteTransaction, transactions, categories } = useAccount()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isTransactionFormOpen, setIsTransactionFormOpen] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null)
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [showCategoryManager, setShowCategoryManager] = useState(false)
  const [categoryType, setCategoryType] = useState<'expense' | 'income' | 'payment'>('expense')

  const handleAddAccount = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const account: Omit<BankAccount, 'id' | 'createdAt'> = {
      name: formData.get('name') as string,
      accountNumber: formData.get('accountNumber') as string,
      bankName: formData.get('bankName') as string,
      balance: parseFloat(formData.get('balance') as string) || 0,
      accountType: (formData.get('accountType') as 'savings' | 'current') || 'savings',
    }
    if (editingAccount) {
      updateBankAccount({ ...editingAccount, ...account })
    } else {
      addBankAccount(account)
    }
    setIsFormOpen(false)
    setEditingAccount(null)
    e.currentTarget.reset()
  }

  const handleAddTransaction = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedAccount) return

    const formData = new FormData(e.currentTarget)
    const transactionType = (formData.get('type') as 'expense' | 'payment' | 'income') || 'expense'
    
    if (editingTransaction) {
      const updatedTransaction: Transaction = {
        ...editingTransaction,
        type: transactionType,
        amount: parseFloat(formData.get('amount') as string),
        category: formData.get('category') as string,
        date: formData.get('date') as string,
        description: formData.get('description') as string || undefined,
      }
      updateTransaction(updatedTransaction)
      setEditingTransaction(null)
    } else {
      const transaction: Omit<Transaction, 'id'> = {
        accountId: selectedAccount.id,
        accountType: 'bank',
        type: transactionType,
        amount: parseFloat(formData.get('amount') as string),
        category: formData.get('category') as string,
        date: formData.get('date') as string,
        description: formData.get('description') as string || undefined,
      }
      addTransaction(transaction)
    }
    setIsTransactionFormOpen(false)
    setSelectedAccount(null)
    e.currentTarget.reset()
  }

  const getAccountTransactions = (accountId: string) => {
    return transactions.filter((t) => t.accountId === accountId && t.accountType === 'bank')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="bank-account-manager">
      <div className="section-header">
        <h2>Bank Accounts</h2>
        <button onClick={() => { setIsFormOpen(true); setEditingAccount(null) }} className="add-button">
          + Add Bank Account
        </button>
      </div>

      {isFormOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{editingAccount ? 'Edit' : 'Add'} Bank Account</h3>
            <form onSubmit={handleAddAccount}>
              <div className="form-group">
                <label>Account Name *</label>
                <input name="name" defaultValue={editingAccount?.name} required />
              </div>
              <div className="form-group">
                <label>Account Number *</label>
                <input name="accountNumber" defaultValue={editingAccount?.accountNumber} required />
              </div>
              <div className="form-group">
                <label>Bank Name *</label>
                <input name="bankName" defaultValue={editingAccount?.bankName} required />
              </div>
              <div className="form-row">
              <div className="form-group">
                <label>Account Type *</label>
                <select name="accountType" defaultValue={editingAccount?.accountType} required>
                  <option value="savings">Savings</option>
                  <option value="current">Current</option>
                  <option value="cash">Cash in Hand</option>
                </select>
              </div>
                <div className="form-group">
                  <label>Initial Balance *</label>
                  <input type="number" name="balance" step="0.01" defaultValue={editingAccount?.balance} required />
                </div>
              </div>
              <div className="form-actions">
                <button type="button" onClick={() => { setIsFormOpen(false); setEditingAccount(null) }}>Cancel</button>
                <button type="submit">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="accounts-grid">
        {bankAccounts.map((account) => {
          const accountTransactions = getAccountTransactions(account.id)
          return (
            <div key={account.id} className="account-card">
              <div className="account-header">
                <div>
                  <h3>{account.name}</h3>
                  <p className="account-number">{account.accountNumber}</p>
                  <p className="bank-name">{account.bankName}</p>
                </div>
                <div className="account-balance">
                  <span className="balance-label">Balance</span>
                  <span className="balance-amount">{formatCurrency(account.balance)}</span>
                </div>
              </div>
              <div className="account-actions">
                <button onClick={() => { setSelectedAccount(account); setIsTransactionFormOpen(true) }} className="action-button">
                  Add Transaction
                </button>
                <button onClick={() => { setEditingAccount(account); setIsFormOpen(true) }} className="action-button secondary">
                  Edit
                </button>
                <button onClick={() => { if (window.confirm('Delete account?')) deleteBankAccount(account.id) }} className="action-button danger">
                  Delete
                </button>
              </div>
              <div className="transactions-section">
                <h4>Day-wise Transactions</h4>
                {accountTransactions.length === 0 ? (
                  <p className="no-transactions">No transactions yet</p>
                ) : (
                  <div className="transactions-list">
                    {accountTransactions
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((transaction) => (
                        <div key={transaction.id} className="transaction-item">
                          <div className="transaction-info">
                            <span className={`transaction-type ${transaction.type}`}>{transaction.type}</span>
                            <span className="transaction-category">{transaction.category}</span>
                            <span className="transaction-date">{formatDate(transaction.date)}</span>
                            {transaction.description && (
                              <span className="transaction-description">{transaction.description}</span>
                            )}
                          </div>
                          <div className="transaction-actions">
                            <div className={`transaction-amount ${transaction.type}`}>
                              {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                            </div>
                            <div className="transaction-buttons">
                              <button
                                onClick={() => {
                                  setEditingTransaction(transaction)
                                  setSelectedAccount(account)
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
        })}
      </div>

      {isTransactionFormOpen && selectedAccount && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{editingTransaction ? 'Edit' : 'Add'} Transaction - {selectedAccount.name}</h3>
            <form onSubmit={handleAddTransaction}>
              <div className="form-group">
                <label>Type *</label>
                <select 
                  name="type" 
                  id="transaction-type-select"
                  defaultValue={editingTransaction?.type}
                  onChange={(e) => {
                    const type = e.target.value as 'expense' | 'income' | 'payment'
                    const categorySelect = document.getElementById('category-select') as HTMLSelectElement
                    if (categorySelect) {
                      const typeCategories = type === 'expense' ? categories.expense :
                                            type === 'income' ? categories.income :
                                            categories.payment
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
                  <option value="income">Income</option>
                  <option value="payment">Payment</option>
                </select>
              </div>
              <div className="form-group">
                <label>Category *</label>
                <div className="category-select-wrapper">
                  <select 
                    name="category" 
                    id="category-select" 
                    defaultValue={editingTransaction?.category} 
                    onChange={(e) => {
                      if (e.target.value === '__ADD_NEW__') {
                        e.target.value = editingTransaction?.category || categories.expense[0]
                        const typeSelect = document.getElementById('transaction-type-select') as HTMLSelectElement
                        const type = typeSelect?.value as 'expense' | 'income' | 'payment'
                        setCategoryType(type || 'expense')
                        setShowCategoryManager(true)
                      }
                    }}
                    required
                  >
                    {(editingTransaction ? 
                      (editingTransaction.type === 'expense' ? categories.expense :
                       editingTransaction.type === 'income' ? categories.income :
                       categories.payment) : categories.expense).map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                    <option value="__ADD_NEW__" className="add-category-option">+ Add New Category</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      const typeSelect = document.getElementById('transaction-type-select') as HTMLSelectElement
                      const type = typeSelect?.value as 'expense' | 'income' | 'payment'
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
                <input type="number" name="amount" step="0.01" defaultValue={editingTransaction?.amount} required />
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
              <div className="form-group">
                <label>Description</label>
                <textarea name="description" rows={3} defaultValue={editingTransaction?.description} />
              </div>
              <div className="form-actions">
                <button type="button" onClick={() => { setIsTransactionFormOpen(false); setSelectedAccount(null); setEditingTransaction(null) }}>Cancel</button>
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

export default BankAccountManager

