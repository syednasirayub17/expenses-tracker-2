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
import * as categoryApi from '../services/categoryApi'

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
  
  // Visibility settings
  showCreditCardBalance: boolean
  showLoanBalance: boolean
  toggleCreditCardVisibility: () => void
  toggleLoanVisibility: () => void

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
  
  // Visibility settings - load from localStorage
  const [showCreditCardBalance, setShowCreditCardBalance] = useState<boolean>(() => {
    const saved = localStorage.getItem(getUserKey('showCreditCardBalance', username))
    return saved !== null ? JSON.parse(saved) : true
  })
  const [showLoanBalance, setShowLoanBalance] = useState<boolean>(() => {
    const saved = localStorage.getItem(getUserKey('showLoanBalance', username))
    return saved !== null ? JSON.parse(saved) : true
  })
  
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
          console.warn('No auth token found, loading from localStorage only')
          // Load from localStorage when no token
          loadFromLocalStorage()
          return
        }

        console.log('Loading data from API...')

        // Load all data from API in parallel
        const [
          bankAccountsData,
          creditCardsData,
          loansData,
          transactionsData,
          budgetsData,
          categoriesData
        ] = await Promise.all([
          accountApi.getBankAccounts(),
          accountApi.getCreditCards(),
          accountApi.getLoans(),
          accountApi.getTransactions(),
          accountApi.getBudgets(),
          categoryApi.getCategories()
        ])

        // CRITICAL: Map MongoDB _id to frontend id
        const mapId = (item: any) => ({ ...item, id: item._id || item.id });

        const mappedBankAccounts = bankAccountsData.map(mapId);
        const mappedCreditCards = creditCardsData.map(mapId);
        const mappedLoans = loansData.map(mapId);
        const mappedBudgets = budgetsData.map(mapId);

        // CRITICAL FIX: Map transaction IDs AND update accountId references
        // This ensures transactions point to the correct MongoDB _id of accounts
        const idMapping: { [oldId: string]: string } = {}
        
        // Build mapping from old localStorage IDs to new MongoDB _ids
        const storedBankAccounts = localStorage.getItem(getUserKey('bankAccounts', username))
        const storedCreditCards = localStorage.getItem(getUserKey('creditCards', username))
        const storedLoans = localStorage.getItem(getUserKey('loans', username))

        if (storedBankAccounts) {
          try {
            const oldBanks = JSON.parse(storedBankAccounts)
            oldBanks.forEach((oldBank: any) => {
              const newBank = mappedBankAccounts.find((b: BankAccount) => 
                b.accountNumber === oldBank.accountNumber && b.name === oldBank.name
              )
              if (newBank && oldBank.id !== newBank.id) {
                idMapping[oldBank.id] = newBank.id
              }
            })
          } catch (err) {
            console.error('Error building bank account ID mapping:', err)
          }
        }

        if (storedCreditCards) {
          try {
            const oldCards = JSON.parse(storedCreditCards)
            oldCards.forEach((oldCard: any) => {
              const newCard = mappedCreditCards.find((c: CreditCard) => 
                c.cardNumber === oldCard.cardNumber && c.name === oldCard.name
              )
              if (newCard && oldCard.id !== newCard.id) {
                idMapping[oldCard.id] = newCard.id
              }
            })
          } catch (err) {
            console.error('Error building credit card ID mapping:', err)
          }
        }

        if (storedLoans) {
          try {
            const oldLoans = JSON.parse(storedLoans)
            oldLoans.forEach((oldLoan: any) => {
              const newLoan = mappedLoans.find((l: Loan) => 
                l.principalAmount === oldLoan.principalAmount && l.name === oldLoan.name
              )
              if (newLoan && oldLoan.id !== newLoan.id) {
                idMapping[oldLoan.id] = newLoan.id
              }
            })
          } catch (err) {
            console.error('Error building loan ID mapping:', err)
          }
        }

        // Map transactions and update accountId references
        const mappedTransactions = transactionsData.map((t: any) => {
          const mappedT = mapId(t)
          // Update accountId if we have a mapping
          if (idMapping[mappedT.accountId]) {
            mappedT.accountId = idMapping[mappedT.accountId]
          }
          // Update linkedAccountId if we have a mapping
          if (mappedT.linkedAccountId && idMapping[mappedT.linkedAccountId]) {
            mappedT.linkedAccountId = idMapping[mappedT.linkedAccountId]
          }
          return mappedT
        })

        console.log('✓ ID Migration completed:', {
          totalMappings: Object.keys(idMapping).length,
          mappings: idMapping
        })

        // Set state
        setBankAccounts(mappedBankAccounts)
        setCreditCards(mappedCreditCards)
        setLoans(mappedLoans)
        setTransactions(mappedTransactions)
        setBudgets(mappedBudgets)
        setCategories(categoriesData)

        // CRITICAL: Save API data to localStorage for offline access
        if (username) {
          localStorage.setItem(getUserKey('bankAccounts', username), JSON.stringify(mappedBankAccounts))
          localStorage.setItem(getUserKey('creditCards', username), JSON.stringify(mappedCreditCards))
          localStorage.setItem(getUserKey('loans', username), JSON.stringify(mappedLoans))
          localStorage.setItem(getUserKey('transactions', username), JSON.stringify(mappedTransactions))
          localStorage.setItem(getUserKey('budgets', username), JSON.stringify(mappedBudgets))
          localStorage.setItem(getUserKey('categories', username), JSON.stringify(categoriesData))
        }

        console.log('✓ Data loaded from API and saved to localStorage:', {
          bankAccounts: mappedBankAccounts.length,
          creditCards: mappedCreditCards.length,
          loans: mappedLoans.length,
          transactions: mappedTransactions.length,
          budgets: mappedBudgets.length,
          categories: `${categoriesData.expense.length} expense, ${categoriesData.income.length} income, ${categoriesData.payment.length} payment`
        })
      } catch (error) {
        console.error('❌ API failed, loading from localStorage:', error)
        // Only load from localStorage if API actually failed
        loadFromLocalStorage()
      }
    }

    // Helper function to load from localStorage
    const loadFromLocalStorage = () => {
      if (!username) return

      console.log('Loading data from localStorage...')

      const storedBankAccounts = localStorage.getItem(getUserKey('bankAccounts', username))
      const storedCreditCards = localStorage.getItem(getUserKey('creditCards', username))
      const storedLoans = localStorage.getItem(getUserKey('loans', username))
      const storedTransactions = localStorage.getItem(getUserKey('transactions', username))
      const storedBudgets = localStorage.getItem(getUserKey('budgets', username))
      const storedSavings = localStorage.getItem(getUserKey('savings', username))
      const storedCategories = localStorage.getItem(getUserKey('categories', username))

      // Validate and clean bank accounts
      if (storedBankAccounts) {
        try {
          const accounts = JSON.parse(storedBankAccounts)
          const validAccounts = accounts.filter((acc: any) =>
            acc && acc.id && acc.name && typeof acc.balance === 'number'
          )

          if (validAccounts.length !== accounts.length) {
            console.warn(`Removed ${accounts.length - validAccounts.length} corrupted bank accounts`)
            localStorage.setItem(getUserKey('bankAccounts', username), JSON.stringify(validAccounts))
          }

          setBankAccounts(validAccounts)
        } catch (err) {
          console.error('Error loading bank accounts:', err)
          setBankAccounts([])
        }
      }

      if (storedCreditCards) {
        try {
          const cards = JSON.parse(storedCreditCards)
          const validCards = cards.filter((card: any) =>
            card && card.id && card.name && typeof card.limit === 'number'
          )

          if (validCards.length !== cards.length) {
            console.warn(`Removed ${cards.length - validCards.length} corrupted credit cards`)
            localStorage.setItem(getUserKey('creditCards', username), JSON.stringify(validCards))
          }

          setCreditCards(validCards)
        } catch (err) {
          console.error('Error loading credit cards:', err)
          setCreditCards([])
        }
      }

      if (storedLoans) {
        try {
          setLoans(JSON.parse(storedLoans))
        } catch (err) {
          console.error('Error loading loans:', err)
          setLoans([])
        }
      }
      if (storedTransactions) {
        try {
          setTransactions(JSON.parse(storedTransactions))
        } catch (err) {
          console.error('Error loading transactions:', err)
          setTransactions([])
        }
      }
      if (storedBudgets) {
        try {
          setBudgets(JSON.parse(storedBudgets))
        } catch (err) {
          console.error('Error loading budgets:', err)
          setBudgets([])
        }
      }
      if (storedSavings) {
        try {
          setSavings(JSON.parse(storedSavings))
        } catch (err) {
          console.error('Error loading savings:', err)
          setSavings([])
        }
      }
      if (storedCategories) {
        try {
          setCategories(JSON.parse(storedCategories))
        } catch (err) {
          console.error('Error loading categories:', err)
          setCategories({
            expense: ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Education', 'Other'],
            income: ['Salary', 'Business', 'Investment', 'Gift', 'Other'],
            payment: ['Credit Card Payment', 'Loan EMI', 'Other'],
          })
        }
      }

      console.log('✓ Data loaded from localStorage')
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
  const addBankAccount = async (account: Omit<BankAccount, 'id' | 'createdAt'>) => {
    try {
      // Create account in backend first to get proper ID
      const createdAccount = await accountApi.createBankAccount({
        ...account,
        createdAt: new Date().toISOString()
      });

      // Backend returns _id, map it to id for frontend
      const newAccount: BankAccount = {
        ...createdAccount,
        id: createdAccount._id || createdAccount.id,
        createdAt: createdAccount.createdAt || new Date().toISOString()
      };

      setBankAccounts([...bankAccounts, newAccount]);

      // Save to localStorage
      if (username) {
        const updated = [...bankAccounts, newAccount];
        localStorage.setItem(getUserKey('bankAccounts', username), JSON.stringify(updated));
      }

      console.log('✓ Bank account created:', newAccount);
    } catch (err) {
      console.error('❌ Failed to create bank account:', err);
      alert('Failed to create account. Please try again.');
    }
  }

  const updateBankAccount = async (account: BankAccount) => {
    try {
      // Update in backend first
      await accountApi.updateBankAccount(account.id, account)
      
      // Then update local state
      const updatedAccounts = bankAccounts.map((a) => (a.id === account.id ? account : a))
      setBankAccounts(updatedAccounts)
      
      // Save to localStorage for offline support
      if (username) {
        localStorage.setItem(getUserKey('bankAccounts', username), JSON.stringify(updatedAccounts))
      }
      
      console.log('✓ Bank account updated:', account.id)
    } catch (err) {
      console.error('❌ Failed to update bank account:', err)
      alert('Failed to update account. Please try again.')
    }
  }

  const deleteBankAccount = async (id: string) => {
    // CRITICAL: Validate ID before deletion
    if (!id || id === 'undefined' || id === 'null') {
      console.error('❌ CRITICAL ERROR: Cannot delete account with invalid ID:', id)
      alert('Error: Cannot delete account - invalid ID.\n\nThis account may be corrupted. Please refresh the page.')
      return
    }

    console.log('Deleting account with ID:', id)

    // Immediately update UI and localStorage (local-first approach)
    const updatedAccounts = bankAccounts.filter((a) => a.id !== id)
    const updatedTransactions = transactions.filter((t) => !(t.accountId === id && t.accountType === 'bank'))

    setBankAccounts(updatedAccounts)
    setTransactions(updatedTransactions)

    // Save to localStorage immediately
    if (username) {
      localStorage.setItem(getUserKey('bankAccounts', username), JSON.stringify(updatedAccounts))
      localStorage.setItem(getUserKey('transactions', username), JSON.stringify(updatedTransactions))
    }

    // IMPORTANT: Try to sync deletion to backend
    // This is critical - if backend fails, data will come back on next login
    try {
      await accountApi.deleteBankAccount(id)
      console.log('✓ Account deleted from backend - deletion is permanent')
    } catch (err: any) {
      // Log error but don't rollback - deletion is already complete locally
      console.error('⚠️ CRITICAL: Failed to delete from backend:', err.message)
      console.warn('⚠️ Account will reappear on next login unless backend deletion succeeds')
      console.warn('⚠️ Account ID:', id)
      console.warn('⚠️ Token present:', localStorage.getItem('token') ? 'Yes' : 'No')

      // Show warning to user
      alert(
        '⚠️ Warning: Account deleted locally but backend sync failed.\n\n' +
        'The account may reappear when you login again.\n\n' +
        'Error: ' + (err.message || 'Unknown error') + '\n\n' +
        'Check console for details.'
      )
    }
  }

  // Credit Card methods
  const addCreditCard = async (card: Omit<CreditCard, 'id' | 'createdAt' | 'currentBalance' | 'availableCredit'>) => {
    try {
      // Create card in backend first to get proper ID
      const createdCard = await accountApi.createCreditCard({
        ...card,
        createdAt: new Date().toISOString(),
        currentBalance: 0,
        availableCredit: card.limit
      });

      // Backend returns _id, map it to id for frontend
      const newCard: CreditCard = {
        ...createdCard,
        id: createdCard._id || createdCard.id,
        createdAt: createdCard.createdAt || new Date().toISOString(),
        currentBalance: createdCard.currentBalance || 0,
        availableCredit: createdCard.availableCredit || card.limit
      };

      setCreditCards([...creditCards, newCard]);

      // Save to localStorage
      if (username) {
        const updated = [...creditCards, newCard];
        localStorage.setItem(getUserKey('creditCards', username), JSON.stringify(updated));
      }

      console.log('✓ Credit card created:', newCard);
    } catch (err) {
      console.error('❌ Failed to create credit card:', err);
      alert('Failed to create credit card. Please try again.');
    }
  }

  const updateCreditCard = async (card: CreditCard) => {
    try {
      // When updating a card, recalculate available credit based on current balance
      const updatedCard = {
        ...card,
        availableCredit: card.limit - card.currentBalance
      }

      // Update in backend first
      await accountApi.updateCreditCard(updatedCard.id, updatedCard)
      
      // Then update local state
      const updatedCards = creditCards.map((c) => (c.id === updatedCard.id ? updatedCard : c))
      setCreditCards(updatedCards)
      
      // Save to localStorage for offline support
      if (username) {
        localStorage.setItem(getUserKey('creditCards', username), JSON.stringify(updatedCards))
      }
      
      console.log('✓ Credit card updated:', updatedCard.id)
    } catch (err) {
      console.error('❌ Failed to update credit card:', err)
      alert('Failed to update credit card. Please try again.')
    }
  }

  const deleteCreditCard = async (id: string) => {
    try {
      // Delete from backend first
      await accountApi.deleteCreditCard(id)
      
      // Then update local state
      const updatedCards = creditCards.filter((c) => c.id !== id)
      const updatedTransactions = transactions.filter((t) => !(t.accountId === id && t.accountType === 'creditCard'))
      
      setCreditCards(updatedCards)
      setTransactions(updatedTransactions)
      
      // Update localStorage
      if (username) {
        localStorage.setItem(getUserKey('creditCards', username), JSON.stringify(updatedCards))
        localStorage.setItem(getUserKey('transactions', username), JSON.stringify(updatedTransactions))
      }
      
      console.log('✓ Credit card deleted:', id)
    } catch (err) {
      console.error('❌ Failed to delete credit card:', err)
      alert('Failed to delete credit card. Please try again.')
    }
  }

  // Loan methods
  const addLoan = async (loan: Omit<Loan, 'id' | 'createdAt' | 'remainingAmount' | 'remainingMonths' | 'totalEmisPaid'>) => {
    try {
      // Create loan in backend first to get proper ID
      const createdLoan = await accountApi.createLoan({
        ...loan,
        createdAt: new Date().toISOString(),
        remainingAmount: loan.principalAmount,
        remainingMonths: loan.tenureMonths,
        totalEmisPaid: 0
      });

      // Backend returns _id, map it to id for frontend
      const newLoan: Loan = {
        ...createdLoan,
        id: createdLoan._id || createdLoan.id,
        createdAt: createdLoan.createdAt || new Date().toISOString(),
        remainingAmount: createdLoan.remainingAmount || loan.principalAmount,
        remainingMonths: createdLoan.remainingMonths || loan.tenureMonths,
        totalEmisPaid: createdLoan.totalEmisPaid || 0
      };

      setLoans([...loans, newLoan]);

      // Save to localStorage
      if (username) {
        const updated = [...loans, newLoan];
        localStorage.setItem(getUserKey('loans', username), JSON.stringify(updated));
      }

      console.log('✓ Loan created:', newLoan);
    } catch (err) {
      console.error('❌ Failed to create loan:', err);
      alert('Failed to create loan. Please try again.');
    }
  }

  const updateLoan = async (loan: Loan) => {
    try {
      // Update in backend first
      await accountApi.updateLoan(loan.id, loan)
      
      // Then update local state
      const updatedLoans = loans.map((l) => (l.id === loan.id ? loan : l))
      setLoans(updatedLoans)
      
      // Save to localStorage for offline support
      if (username) {
        localStorage.setItem(getUserKey('loans', username), JSON.stringify(updatedLoans))
      }
      
      console.log('✓ Loan updated:', loan.id)
    } catch (err) {
      console.error('❌ Failed to update loan:', err)
      alert('Failed to update loan. Please try again.')
    }
  }

  const deleteLoan = async (id: string) => {
    try {
      // Delete from backend first
      await accountApi.deleteLoan(id)
      
      // Then update local state
      const updatedLoans = loans.filter((l) => l.id !== id)
      const updatedTransactions = transactions.filter((t) => !(t.accountId === id && t.accountType === 'loan'))
      
      setLoans(updatedLoans)
      setTransactions(updatedTransactions)
      
      // Update localStorage
      if (username) {
        localStorage.setItem(getUserKey('loans', username), JSON.stringify(updatedLoans))
        localStorage.setItem(getUserKey('transactions', username), JSON.stringify(updatedTransactions))
      }
      
      console.log('✓ Loan deleted:', id)
    } catch (err) {
      console.error('❌ Failed to delete loan:', err)
      alert('Failed to delete loan. Please try again.')
    }
  }

  // Transaction methods
  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    try {
      // Create transaction in backend first to get proper ID
      const createdTransaction = await accountApi.createTransaction(transaction);

      // Backend returns _id, map it to id for frontend
      const newTransaction: Transaction = {
        ...createdTransaction,
        id: createdTransaction._id || createdTransaction.id
      };

      const updatedTransactions = [...transactions, newTransaction];
      setTransactions(updatedTransactions);
      
      if (username) {
        localStorage.setItem(getUserKey('transactions', username), JSON.stringify(updatedTransactions));
      }

      console.log('✓ Transaction created:', newTransaction);

      // Update account balances
      if (transaction.accountType === 'bank') {
        const account = bankAccounts.find((a) => a.id === transaction.accountId)
        if (account) {
          // CRITICAL FIX: Skip balance update if this is part of a dual transaction
          // Self-transfers and linked payments are handled separately below
          const isDualTransaction = transaction.linkedAccountId && 
            (transaction.category === 'Bank Transfer' || 
             transaction.category === 'Credit Card Payment' ||
             transaction.category === 'Loan EMI')
          
          if (!isDualTransaction) {
            const newBalance =
              transaction.type === 'income'
                ? account.balance + transaction.amount
                : account.balance - transaction.amount
            updateBankAccount({ ...account, balance: parseFloat(newBalance.toFixed(2)) })
          }
        }
      } else if (transaction.accountType === 'creditCard') {
        const card = creditCards.find((c) => c.id === transaction.accountId)
        if (card) {
          if (transaction.type === 'expense') {
            const newBalance = card.currentBalance + transaction.amount
            const newAvailableCredit = card.limit - newBalance
            updateCreditCard({
              ...card,
              currentBalance: parseFloat(newBalance.toFixed(2)),
              availableCredit: parseFloat(newAvailableCredit.toFixed(2)),
            })
          } else if (transaction.type === 'payment') {
            const newBalance = Math.max(0, card.currentBalance - transaction.amount)
            const newAvailableCredit = card.limit - newBalance
            updateCreditCard({
              ...card,
              currentBalance: parseFloat(newBalance.toFixed(2)),
              availableCredit: parseFloat(newAvailableCredit.toFixed(2)),
            })

            // Reconciliation: Deduct from linked bank account (if manually entered payment)
            // NOTE: Dual transactions from BankAccountManager already handle both sides
            if (transaction.linkedAccountId) {
              const linkedAccount = bankAccounts.find((a) => a.id === transaction.linkedAccountId)
              if (linkedAccount) {
                const newBankBalance = linkedAccount.balance - transaction.amount
                updateBankAccount({ ...linkedAccount, balance: parseFloat(newBankBalance.toFixed(2)) })
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
            remainingAmount: parseFloat(newRemaining.toFixed(2)),
            remainingMonths: newRemainingMonths,
          })

          // Reconciliation: Deduct from linked bank account
          if (transaction.linkedAccountId) {
            const linkedAccount = bankAccounts.find((a) => a.id === transaction.linkedAccountId)
            if (linkedAccount) {
              const newBankBalance = linkedAccount.balance - transaction.amount
              updateBankAccount({ ...linkedAccount, balance: parseFloat(newBankBalance.toFixed(2)) })
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
          toAccountId: newTransaction.id,
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
    } catch (err) {
      console.error('❌ Failed to create transaction:', err);
      alert('Failed to create transaction. Please try again.');
    }
  }

  const updateTransaction = async (transaction: Transaction) => {
    try {
      // Update in backend first
      await accountApi.updateTransaction(transaction.id, transaction)
      
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

          await updateBankAccount({ ...account, balance: parseFloat(newBalance.toFixed(2)) })
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
          await updateCreditCard({
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

          await updateLoan({
            ...loan,
            remainingAmount: parseFloat(newRemaining.toFixed(2)),
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
              await updateBankAccount({ ...linkedAccount, balance: parseFloat(newBankBalance.toFixed(2)) })
            }
          }
        }
      }

      // Save to localStorage for offline support
      if (username) {
        localStorage.setItem(getUserKey('transactions', username), JSON.stringify(updatedTransactions))
      }
      
      console.log('✓ Transaction updated:', transaction.id)
    } catch (err) {
      console.error('❌ Failed to update transaction:', err)
      alert('Failed to update transaction. Please try again.')
    }
  }

  const deleteTransaction = async (id: string) => {
    try {
      const transactionToDelete = transactions.find((t) => t.id === id)
      
      // CRITICAL: Find and delete linked transaction (for dual transactions)
      let linkedTransactionId: string | null = null
      if (transactionToDelete?.linkedAccountId) {
        // Find the matching linked transaction
        const linkedTransaction = transactions.find(
          (t) =>
            t.id !== id &&
            t.linkedAccountId === transactionToDelete.accountId &&
            t.accountId === transactionToDelete.linkedAccountId &&
            t.amount === transactionToDelete.amount &&
            t.date === transactionToDelete.date
        )
        if (linkedTransaction) {
          linkedTransactionId = linkedTransaction.id
          // Delete linked transaction from backend
          await accountApi.deleteTransaction(linkedTransaction.id)
        }
      }
      
      // Delete main transaction from backend
      await accountApi.deleteTransaction(id)
      
      // Then update local state (remove both transactions)
      const updatedTransactions = transactions.filter(
        (t) => t.id !== id && t.id !== linkedTransactionId
      )
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

          await updateBankAccount({ ...account, balance: parseFloat(newBalance.toFixed(2)) })
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
          await updateCreditCard({
            ...card,
            currentBalance: parseFloat(newBalance.toFixed(2)),
            availableCredit: parseFloat(newAvailableCredit.toFixed(2)),
          })

          // CRITICAL FIX: Restore linked bank account balance for credit card payments
          if (transactionToDelete.type === 'payment' && transactionToDelete.linkedAccountId) {
            const linkedAccount = bankAccounts.find((a) => a.id === transactionToDelete.linkedAccountId)
            if (linkedAccount) {
              const newBankBalance = linkedAccount.balance + transactionToDelete.amount
              await updateBankAccount({ ...linkedAccount, balance: parseFloat(newBankBalance.toFixed(2)) })
            }
          }
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

          await updateLoan({
            ...loan,
            remainingAmount: parseFloat(newRemaining.toFixed(2)),
            remainingMonths: newRemainingMonths,
          })

          // Reconciliation: Refund to linked bank account
          if (transactionToDelete.linkedAccountId) {
            const linkedAccount = bankAccounts.find((a) => a.id === transactionToDelete.linkedAccountId)
            if (linkedAccount) {
              const newBankBalance = linkedAccount.balance + transactionToDelete.amount
              await updateBankAccount({ ...linkedAccount, balance: parseFloat(newBankBalance.toFixed(2)) })
            }
          }
        }
      }

      // Save to localStorage
      if (username) {
        localStorage.setItem(getUserKey('transactions', username), JSON.stringify(updatedTransactions))
      }
      
      console.log('✓ Transaction deleted:', id)
    } catch (error) {
      console.error('❌ Failed to delete transaction:', error)
      alert('Failed to delete transaction. Please try again.')
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
    // Note: Savings are stored in localStorage only, no backend API for savings yet
    // TODO: Add backend API for savings management
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
  const addCategory = async (type: 'expense' | 'income' | 'payment', category: string) => {
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
      // Sync to backend API
      try {
        await categoryApi.addCategory(type, category)
        console.log('✓ Category synced to backend:', category)
      } catch (err) {
        console.error('❌ Failed to sync category to backend:', err)
        // Keep local change even if backend fails
      }
    }
  }

  const deleteCategory = async (type: 'expense' | 'income' | 'payment', category: string) => {
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
      // Sync to backend API
      try {
        await categoryApi.deleteCategory(type, category)
        console.log('✓ Category deletion synced to backend:', category)
      } catch (err) {
        console.error('❌ Failed to sync category deletion to backend:', err)
        // Keep local change even if backend fails
      }
    }
  }

  // Visibility toggle functions
  const toggleCreditCardVisibility = () => {
    const newValue = !showCreditCardBalance
    setShowCreditCardBalance(newValue)
    if (username) {
      localStorage.setItem(getUserKey('showCreditCardBalance', username), JSON.stringify(newValue))
    }
  }

  const toggleLoanVisibility = () => {
    const newValue = !showLoanBalance
    setShowLoanBalance(newValue)
    if (username) {
      localStorage.setItem(getUserKey('showLoanBalance', username), JSON.stringify(newValue))
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
        showCreditCardBalance,
        showLoanBalance,
        toggleCreditCardVisibility,
        toggleLoanVisibility,
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

