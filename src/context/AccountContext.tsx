import React, { createContext, useContext, useState, useEffect } from 'react'
import {
  BankAccount,
  CreditCard,
  Loan,
  Transaction,
  Budget,
  Savings,
  AccountReconciliation,
} from '../types'
import { useAuth } from './AuthContext'
import * as accountApi from '../services/accountApi'

interface AccountContextType {
  bankAccounts: BankAccount[]
  creditCards: CreditCard[]
  loans: Loan[]
  transactions: Transaction[]
  budgets: Budget[]
  savings: Savings[]
  reconciliations: AccountReconciliation[]
  categories: {
    expense: string[]
    income: string[]
    payment: string[]
  }

  // Bank Account methods
  addBankAccount: (account: Omit<BankAccount, 'id' | 'createdAt'>) => void
  updateBankAccount: (account: BankAccount) => void
  deleteBankAccount: (id: string) => void

  // Credit Card methods
  addCreditCard: (card: Omit<CreditCard, 'id' | 'createdAt' | 'currentBalance' | 'availableCredit'>) => void
  updateCreditCard: (card: CreditCard) => void
  deleteCreditCard: (id: string) => void

  // Loan methods
  addLoan: (loan: Omit<Loan, 'id' | 'createdAt' | 'remainingAmount' | 'remainingMonths'>) => void
  updateLoan: (loan: Loan) => void
  deleteLoan: (id: string) => void

  // Transaction methods
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void
  updateTransaction: (transaction: Transaction) => void
  deleteTransaction: (id: string) => void

  // Budget methods
  addBudget: (budget: Omit<Budget, 'id'>) => void
  updateBudget: (budget: Budget) => void
  deleteBudget: (id: string) => void

  // Savings methods
  addSavings: (savings: Omit<Savings, 'id'>) => void
  updateSavings: (savings: Savings) => void
  deleteSavings: (id: string) => void

  // Reconciliation methods
  addReconciliation: (reconciliation: Omit<AccountReconciliation, 'id'>) => void

  // Category methods
  addCategory: (type: 'expense' | 'income' | 'payment', category: string) => void
  deleteCategory: (type: 'expense' | 'income' | 'payment', category: string) => void
}

const AccountContext = createContext<AccountContextType | undefined>(undefined)

export const useAccount = () => {
  const context = useContext(AccountContext)
  if (!context) {
    throw new Error('useAccount must be used within an AccountProvider')
  }
  return context
}

// Helper function to get user-specific localStorage key
const getUserKey = (key: string, username: string | null): string => {
  if (!username) return key
  return `${key}_${username}`
}

// Helper function to load data from localStorage
const loadFromStorage = <T,>(key: string, defaultValue: T, username: string | null): T => {
  try {
    const userKey = getUserKey(key, username)
    const stored = localStorage.getItem(userKey)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed) && parsed.length >= 0) return parsed as T
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed as T
    }
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error)
  }
  return defaultValue
}

export const AccountProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth()
  const username = user?.username || null

  // Initialize state directly from localStorage
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])
  const [creditCards, setCreditCards] = useState<CreditCard[]>([])
  const [loans, setLoans] = useState<Loan[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [savings, setSavings] = useState<Savings[]>([])
  const [reconciliations, setReconciliations] = useState<AccountReconciliation[]>([])
  const [categories, setCategories] = useState<{
    expense: string[]
    income: string[]
    payment: string[]
  }>(() => {
    const defaultCategories = {
      expense: ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Education', 'Other'],
      income: ['Salary', 'Business', 'Investment', 'Gift', 'Other'],
      payment: ['Credit Card Payment', 'Loan EMI', 'Other'],
    }
    return defaultCategories
  })

  // Load user-specific data when user changes
  useEffect(() => {
    if (!username) {
      // Clear data when logged out
      setBankAccounts([])
      setCreditCards([])
      setLoans([])
      setTransactions([])
      setBudgets([])
      setSavings([])
      setReconciliations([])
      const defaultCategories = {
        expense: ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Education', 'Other'],
        income: ['Salary', 'Business', 'Investment', 'Gift', 'Other'],
        payment: ['Credit Card Payment', 'Loan EMI', 'Other'],
      }
      setCategories(defaultCategories)
      return
    }

    // Load user-specific data from API
    const loadDataFromAPI = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          console.warn('No auth token found, skipping API data load')
          return
        }

        // Load all data from API in parallel
        const [
          bankAccountsData,
          creditCardsData,
          loansData,
          transactionsData,
          budgetsData
        ] = await Promise.all([
          accountApi.getBankAccounts().catch(() => []),
          accountApi.getCreditCards().catch(() => []),
          accountApi.getLoans().catch(() => []),
          accountApi.getTransactions().catch(() => []),
          accountApi.getBudgets().catch(() => [])
        ])

        setBankAccounts(bankAccountsData)
        setCreditCards(creditCardsData)
        setLoans(loansData)
        setTransactions(transactionsData)
        setBudgets(budgetsData)

        console.log('Data loaded from API:', {
          bankAccounts: bankAccountsData.length,
          creditCards: creditCardsData.length,
          loans: loansData.length,
          transactions: transactionsData.length,
          budgets: budgetsData.length
        })
      } catch (error) {
        console.error('Error loading user data from API:', error)
        // Fallback to localStorage if API fails
        try {
          const userBankAccounts = loadFromStorage<BankAccount[]>('bankAccounts', [], username)
          const userCreditCards = loadFromStorage<CreditCard[]>('creditCards', [], username)
          const userLoans = loadFromStorage<Loan[]>('loans', [], username)
          const userTransactions = loadFromStorage<Transaction[]>('transactions', [], username)
          const userBudgets = loadFromStorage<Budget[]>('budgets', [], username)

          setBankAccounts(userBankAccounts)
          setCreditCards(userCreditCards)
          setLoans(userLoans)
          setTransactions(userTransactions)
          setBudgets(userBudgets)

          console.log('Loaded from localStorage as fallback')
        } catch (fallbackError) {
          console.error('Error loading from localStorage fallback:', fallbackError)
        }
      }
    }

    loadDataFromAPI()
  }, [username])

  // Note: Data is now saved to API, not localStorage
  // localStorage is only used as fallback for offline support

  useEffect(() => {
    if (username) {
      localStorage.setItem(getUserKey('savings', username), JSON.stringify(savings))
    }
  }, [savings, username])

  useEffect(() => {
    if (username) {
      localStorage.setItem(getUserKey('reconciliations', username), JSON.stringify(reconciliations))
    }
  }, [reconciliations, username])

  useEffect(() => {
    if (username) {
      localStorage.setItem(getUserKey('categories', username), JSON.stringify(categories))
    }
  }, [categories, username])

  // Bank Account methods
  const addBankAccount = (account: Omit<BankAccount, 'id' | 'createdAt'>) => {
    const newAccount: BankAccount = {
      ...account,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
    }
    setBankAccounts([...bankAccounts, newAccount])
    // Save to backend API
    accountApi.createBankAccount(newAccount).catch(err => {
      console.error('Failed to create bank account:', err)
      // Rollback on error
      setBankAccounts(bankAccounts)
    })
  }

  const updateBankAccount = (account: BankAccount) => {
    const updatedAccounts = bankAccounts.map((a) => (a.id === account.id ? account : a))
    setBankAccounts(updatedAccounts)
    // Save to backend API
    accountApi.updateBankAccount(account.id, account).catch(err => {
      console.error('Failed to update bank account:', err)
      // Rollback on error
      setBankAccounts(bankAccounts)
    })
  }

  const deleteBankAccount = (id: string) => {
    setBankAccounts(bankAccounts.filter((a) => a.id !== id))
    // Also delete related transactions
    setTransactions(transactions.filter((t) => !(t.accountId === id && t.accountType === 'bank')))
    // Save to backend API
    accountApi.deleteBankAccount(id).catch(err => {
      console.error('Failed to delete bank account:', err)
      // Rollback on error
      setBankAccounts(bankAccounts)
      setTransactions(transactions)
    })
  }

  // Credit Card methods
  const addCreditCard = (card: Omit<CreditCard, 'id' | 'createdAt' | 'currentBalance' | 'availableCredit'>) => {
    const newCard: CreditCard = {
      ...card,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      currentBalance: 0,
      availableCredit: card.limit,
    }
    const updatedCards = [...creditCards, newCard]
    setCreditCards(updatedCards)
    // Immediately save to localStorage
    if (username) {
      localStorage.setItem(getUserKey('creditCards', username), JSON.stringify(updatedCards))
    }
    // Sync to backend and Google Sheets
    accountApi.createCreditCard(newCard).catch(err => console.error('Failed to sync credit card:', err))
  }

  const updateCreditCard = (card: CreditCard) => {
    // When updating a card, recalculate available credit based on current balance
    const updatedCard = {
      ...card,
      availableCredit: card.limit - card.currentBalance
    }

    const updatedCards = creditCards.map((c) => (c.id === updatedCard.id ? updatedCard : c))
    setCreditCards(updatedCards)
    if (username) {
      localStorage.setItem(getUserKey('creditCards', username), JSON.stringify(updatedCards))
    }
    // Sync to backend and Google Sheets
    accountApi.updateCreditCard(updatedCard.id, updatedCard).catch(err => console.error('Failed to sync credit card:', err))
  }

  const deleteCreditCard = (id: string) => {
    const updatedCards = creditCards.filter((c) => c.id !== id)
    const updatedTransactions = transactions.filter((t) => !(t.accountId === id && t.accountType === 'creditCard'))
    setCreditCards(updatedCards)
    setTransactions(updatedTransactions)
    if (username) {
      localStorage.setItem(getUserKey('creditCards', username), JSON.stringify(updatedCards))
      localStorage.setItem(getUserKey('transactions', username), JSON.stringify(updatedTransactions))
    }
    // Sync to backend and Google Sheets
    accountApi.deleteCreditCard(id).catch(err => console.error('Failed to sync credit card deletion:', err))
  }

  // Loan methods
  const addLoan = (loan: Omit<Loan, 'id' | 'createdAt' | 'remainingAmount' | 'remainingMonths'>) => {
    const newLoan: Loan = {
      ...loan,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      remainingAmount: loan.principalAmount,
      remainingMonths: loan.tenureMonths,
    }
    const updatedLoans = [...loans, newLoan]
    setLoans(updatedLoans)
    // Immediately save to localStorage
    if (username) {
      localStorage.setItem(getUserKey('loans', username), JSON.stringify(updatedLoans))
    }
    // Sync to backend and Google Sheets
    accountApi.createLoan(newLoan).catch(err => console.error('Failed to sync loan:', err))
  }

  const updateLoan = (loan: Loan) => {
    const updatedLoans = loans.map((l) => (l.id === loan.id ? loan : l))
    setLoans(updatedLoans)
    if (username) {
      localStorage.setItem(getUserKey('loans', username), JSON.stringify(updatedLoans))
    }
    // Sync to backend and Google Sheets
    accountApi.updateLoan(loan.id, loan).catch(err => console.error('Failed to sync loan:', err))
  }

  const deleteLoan = (id: string) => {
    const updatedLoans = loans.filter((l) => l.id !== id)
    const updatedTransactions = transactions.filter((t) => !(t.accountId === id && t.accountType === 'loan'))
    setLoans(updatedLoans)
    setTransactions(updatedTransactions)
    if (username) {
      localStorage.setItem(getUserKey('loans', username), JSON.stringify(updatedLoans))
      localStorage.setItem(getUserKey('transactions', username), JSON.stringify(updatedTransactions))
    }
    // Sync to backend and Google Sheets
    accountApi.deleteLoan(id).catch(err => console.error('Failed to sync loan deletion:', err))
  }

  // Transaction methods
  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    }
    const updatedTransactions = [...transactions, newTransaction]
    setTransactions(updatedTransactions)
    if (username) {
      localStorage.setItem(getUserKey('transactions', username), JSON.stringify(updatedTransactions))
    }
    // Sync to backend and Google Sheets
    accountApi.createTransaction(newTransaction).catch(err => console.error('Failed to sync transaction:', err))

    // Update account balances
    if (transaction.accountType === 'bank') {
      const account = bankAccounts.find((a) => a.id === transaction.accountId)
      if (account) {
        const newBalance =
          transaction.type === 'income'
            ? account.balance + transaction.amount
            : account.balance - transaction.amount
        updateBankAccount({ ...account, balance: newBalance })
      }
    } else if (transaction.accountType === 'creditCard') {
      const card = creditCards.find((c) => c.id === transaction.accountId)
      if (card) {
        if (transaction.type === 'expense') {
          const newBalance = card.currentBalance + transaction.amount
          const newAvailableCredit = card.limit - newBalance
          updateCreditCard({
            ...card,
            currentBalance: newBalance,
            availableCredit: newAvailableCredit,
          })
        } else if (transaction.type === 'payment') {
          const newBalance = Math.max(0, card.currentBalance - transaction.amount)
          const newAvailableCredit = card.limit - newBalance
          updateCreditCard({
            ...card,
            currentBalance: newBalance,
            availableCredit: newAvailableCredit,
          })

          // Reconciliation: Deduct from linked bank account
          if (transaction.linkedAccountId) {
            const linkedAccount = bankAccounts.find((a) => a.id === transaction.linkedAccountId)
            if (linkedAccount) {
              const newBankBalance = linkedAccount.balance - transaction.amount
              updateBankAccount({ ...linkedAccount, balance: newBankBalance })
            }
          }
        }
      }
    } else if (transaction.accountType === 'loan') {
      const loan = loans.find((l) => l.id === transaction.accountId)
      if (loan && transaction.type === 'payment') {
        const newRemaining = Math.max(0, loan.remainingAmount - transaction.amount)
        const newRemainingMonths = Math.ceil((newRemaining / loan.principalAmount) * loan.tenureMonths)
        updateLoan({
          ...loan,
          remainingAmount: newRemaining,
          remainingMonths: newRemainingMonths,
        })

        // Reconciliation: Deduct from linked bank account
        if (transaction.linkedAccountId) {
          const linkedAccount = bankAccounts.find((a) => a.id === transaction.linkedAccountId)
          if (linkedAccount) {
            const newBankBalance = linkedAccount.balance - transaction.amount
            updateBankAccount({ ...linkedAccount, balance: newBankBalance })
          }
        }
      }
    }

    // Create reconciliation record for credit card payments and loan payments
    if (transaction.linkedAccountId &&
      ((transaction.accountType === 'creditCard' && transaction.type === 'payment') ||
        (transaction.accountType === 'loan' && transaction.type === 'payment'))) {
      const reconciliation: Omit<AccountReconciliation, 'id'> = {
        fromAccountId: transaction.linkedAccountId,
        fromAccountType: 'bank',
        toAccountId: transaction.accountId,
        toAccountType: transaction.accountType,
        amount: transaction.amount,
        date: transaction.date,
        description: `Payment from bank account to ${transaction.accountType === 'creditCard' ? 'credit card' : 'loan'}`,
      }
      const updatedReconciliations = [...reconciliations, { ...reconciliation, id: Date.now().toString() + Math.random().toString(36).substr(2, 9) }]
      setReconciliations(updatedReconciliations)
      if (username) {
        localStorage.setItem(getUserKey('reconciliations', username), JSON.stringify(updatedReconciliations))
      }
    }
  }

  const updateTransaction = (transaction: Transaction) => {
    const oldTransaction = transactions.find((t) => t.id === transaction.id)
    const updatedTransactions = transactions.map((t) => (t.id === transaction.id ? transaction : t))
    setTransactions(updatedTransactions)

    // Handle bank account balance adjustments when transaction is updated
    if (transaction.accountType === 'bank') {
      const account = bankAccounts.find((a) => a.id === transaction.accountId)
      if (account) {
        let newBalance = account.balance

        // If there was an old transaction, reverse its effect first
        if (oldTransaction) {
          if (oldTransaction.type === 'income') {
            newBalance = account.balance - oldTransaction.amount
          } else {
            newBalance = account.balance + oldTransaction.amount
          }
        }

        // Then apply the new transaction effect
        if (transaction.type === 'income') {
          newBalance = newBalance + transaction.amount
        } else {
          newBalance = newBalance - transaction.amount
        }

        updateBankAccount({ ...account, balance: newBalance })
      }
    }

    // Handle credit card balance adjustments when transaction is updated
    else if (transaction.accountType === 'creditCard') {
      const card = creditCards.find((c) => c.id === transaction.accountId)
      if (card) {
        let newBalance = card.currentBalance

        // If there was an old transaction, reverse its effect first
        if (oldTransaction) {
          if (oldTransaction.type === 'expense') {
            newBalance = Math.max(0, card.currentBalance - oldTransaction.amount)
          } else if (oldTransaction.type === 'payment') {
            newBalance = card.currentBalance + oldTransaction.amount
          }
        }

        // Then apply the new transaction effect
        if (transaction.type === 'expense') {
          newBalance = newBalance + transaction.amount
        } else if (transaction.type === 'payment') {
          newBalance = Math.max(0, newBalance - transaction.amount)
        }

        const newAvailableCredit = card.limit - newBalance
        updateCreditCard({
          ...card,
          currentBalance: newBalance,
          availableCredit: newAvailableCredit,
        })
      }
    }

    // Handle loan balance adjustments when transaction is updated
    else if (transaction.accountType === 'loan' && transaction.type === 'payment') {
      const loan = loans.find((l) => l.id === transaction.accountId)
      if (loan) {
        let newRemaining = loan.remainingAmount

        // If there was an old transaction, reverse its effect first
        if (oldTransaction && oldTransaction.type === 'payment') {
          newRemaining = loan.remainingAmount + oldTransaction.amount
        }

        // Then apply the new transaction effect
        newRemaining = Math.max(0, newRemaining - transaction.amount)
        const newRemainingMonths = Math.ceil((newRemaining / loan.principalAmount) * loan.tenureMonths)

        updateLoan({
          ...loan,
          remainingAmount: newRemaining,
          remainingMonths: newRemainingMonths,
        })

        // Reconciliation: Adjust linked bank account
        if (transaction.linkedAccountId) {
          const linkedAccount = bankAccounts.find((a) => a.id === transaction.linkedAccountId)
          if (linkedAccount) {
            let newBankBalance = linkedAccount.balance

            // Reverse old transaction effect
            if (oldTransaction && oldTransaction.linkedAccountId === transaction.linkedAccountId) {
              newBankBalance = linkedAccount.balance + oldTransaction.amount
            }

            // Apply new transaction effect
            newBankBalance = newBankBalance - transaction.amount
            updateBankAccount({ ...linkedAccount, balance: newBankBalance })
          }
        }
      }
    }

    // Immediately save to localStorage
    if (username) {
      localStorage.setItem(getUserKey('transactions', username), JSON.stringify(updatedTransactions))
    }
  }

  const deleteTransaction = async (id: string) => {
    const transactionToDelete = transactions.find((t) => t.id === id)
    const updatedTransactions = transactions.filter((t) => t.id !== id)
    setTransactions(updatedTransactions)

    // If this was a bank account transaction, recalculate the account balance
    if (transactionToDelete && transactionToDelete.accountType === 'bank') {
      const account = bankAccounts.find((a) => a.id === transactionToDelete.accountId)
      if (account) {
        let newBalance = account.balance

        // Reverse the transaction effect
        if (transactionToDelete.type === 'income') {
          newBalance = account.balance - transactionToDelete.amount
        } else {
          newBalance = account.balance + transactionToDelete.amount
        }

        updateBankAccount({ ...account, balance: newBalance })
      }
    }

    // If this was a credit card transaction, recalculate the card balance
    else if (transactionToDelete && transactionToDelete.accountType === 'creditCard') {
      const card = creditCards.find((c) => c.id === transactionToDelete.accountId)
      if (card) {
        let newBalance = card.currentBalance

        // Reverse the transaction effect
        if (transactionToDelete.type === 'expense') {
          newBalance = Math.max(0, card.currentBalance - transactionToDelete.amount)
        } else if (transactionToDelete.type === 'payment') {
          newBalance = card.currentBalance + transactionToDelete.amount
        }

        const newAvailableCredit = card.limit - newBalance
        updateCreditCard({
          ...card,
          currentBalance: newBalance,
          availableCredit: newAvailableCredit,
        })
      }
    }

    // If this was a loan payment transaction, recalculate the loan balance
    else if (transactionToDelete && transactionToDelete.accountType === 'loan' && transactionToDelete.type === 'payment') {
      const loan = loans.find((l) => l.id === transactionToDelete.accountId)
      if (loan) {
        let newRemaining = loan.remainingAmount

        // Reverse the transaction effect
        newRemaining = loan.remainingAmount + transactionToDelete.amount
        const newRemainingMonths = Math.ceil((newRemaining / loan.principalAmount) * loan.tenureMonths)

        updateLoan({
          ...loan,
          remainingAmount: newRemaining,
          remainingMonths: newRemainingMonths,
        })

        // Reconciliation: Refund to linked bank account
        if (transactionToDelete.linkedAccountId) {
          const linkedAccount = bankAccounts.find((a) => a.id === transactionToDelete.linkedAccountId)
          if (linkedAccount) {
            const newBankBalance = linkedAccount.balance + transactionToDelete.amount
            updateBankAccount({ ...linkedAccount, balance: newBankBalance })
          }
        }
      }
    }

    // Save to localStorage
    if (username) {
      localStorage.setItem(getUserKey('transactions', username), JSON.stringify(updatedTransactions))
    }

    // Delete from database via API
    try {
      await accountApi.deleteTransaction(id)
    } catch (error) {
      console.error('Error deleting transaction from database:', error)
      // Revert the local deletion if API call fails
      setTransactions(transactions)
      if (username) {
        localStorage.setItem(getUserKey('transactions', username), JSON.stringify(transactions))
      }
    }
  }

  // Budget methods
  const addBudget = (budget: Omit<Budget, 'id'>) => {
    const newBudget: Budget = {
      ...budget,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    }
    const updatedBudgets = [...budgets, newBudget]
    setBudgets(updatedBudgets)
    // Immediately save to localStorage
    if (username) {
      localStorage.setItem(getUserKey('budgets', username), JSON.stringify(updatedBudgets))
    }
    // Sync to backend and Google Sheets
    accountApi.createBudget(newBudget).catch(err => console.error('Failed to sync budget:', err))
  }

  const updateBudget = (budget: Budget) => {
    const updatedBudgets = budgets.map((b) => (b.id === budget.id ? budget : b))
    setBudgets(updatedBudgets)
    if (username) {
      localStorage.setItem(getUserKey('budgets', username), JSON.stringify(updatedBudgets))
    }
    // Sync to backend and Google Sheets
    accountApi.updateBudget(budget.id, budget).catch(err => console.error('Failed to sync budget:', err))
  }

  const deleteBudget = (id: string) => {
    const updatedBudgets = budgets.filter((b) => b.id !== id)
    setBudgets(updatedBudgets)
    if (username) {
      localStorage.setItem(getUserKey('budgets', username), JSON.stringify(updatedBudgets))
    }
    // Sync to backend and Google Sheets
    accountApi.deleteBudget(id).catch(err => console.error('Failed to sync budget deletion:', err))
  }

  // Savings methods
  const addSavings = (savingsItem: Omit<Savings, 'id'>) => {
    const newSavings: Savings = {
      ...savingsItem,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    }
    const updatedSavings = [...savings, newSavings]
    setSavings(updatedSavings)
    // Immediately save to localStorage
    if (username) {
      localStorage.setItem(getUserKey('savings', username), JSON.stringify(updatedSavings))
    }
  }

  const updateSavings = (savingsItem: Savings) => {
    const updatedSavings = savings.map((s) => (s.id === savingsItem.id ? savingsItem : s))
    setSavings(updatedSavings)
    if (username) {
      localStorage.setItem(getUserKey('savings', username), JSON.stringify(updatedSavings))
    }
  }

  const deleteSavings = (id: string) => {
    const updatedSavings = savings.filter((s) => s.id !== id)
    setSavings(updatedSavings)
    if (username) {
      localStorage.setItem(getUserKey('savings', username), JSON.stringify(updatedSavings))
    }
  }

  // Reconciliation methods
  const addReconciliation = (reconciliation: Omit<AccountReconciliation, 'id'>) => {
    const newReconciliation: AccountReconciliation = {
      ...reconciliation,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    }
    const updatedReconciliations = [...reconciliations, newReconciliation]
    setReconciliations(updatedReconciliations)
    if (username) {
      localStorage.setItem(getUserKey('reconciliations', username), JSON.stringify(updatedReconciliations))
    }
  }

  // Category methods
  const addCategory = (type: 'expense' | 'income' | 'payment', category: string) => {
    if (!categories[type].includes(category)) {
      const updatedCategories = {
        ...categories,
        [type]: [...categories[type], category],
      }
      setCategories(updatedCategories)
      // Immediately save to localStorage
      if (username) {
        localStorage.setItem(getUserKey('categories', username), JSON.stringify(updatedCategories))
      }
    }
  }

  const deleteCategory = (type: 'expense' | 'income' | 'payment', category: string) => {
    const defaultCategories = {
      expense: ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Education', 'Other'],
      income: ['Salary', 'Business', 'Investment', 'Gift', 'Other'],
      payment: ['Credit Card Payment', 'Loan EMI', 'Other'],
    }
    // Don't allow deleting default categories
    if (!defaultCategories[type].includes(category)) {
      const updatedCategories = {
        ...categories,
        [type]: categories[type].filter((c) => c !== category),
      }
      setCategories(updatedCategories)
      if (username) {
        localStorage.setItem(getUserKey('categories', username), JSON.stringify(updatedCategories))
      }
    }
  }

  return (
    <AccountContext.Provider
      value={{
        bankAccounts,
        creditCards,
        loans,
        transactions,
        budgets,
        savings,
        reconciliations,
        addBankAccount,
        updateBankAccount,
        deleteBankAccount,
        addCreditCard,
        updateCreditCard,
        deleteCreditCard,
        addLoan,
        updateLoan,
        deleteLoan,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addBudget,
        updateBudget,
        deleteBudget,
        addSavings,
        updateSavings,
        deleteSavings,
        addReconciliation,
        categories,
        addCategory,
        deleteCategory,
      }}
    >
      {children}
    </AccountContext.Provider>
  )
}

