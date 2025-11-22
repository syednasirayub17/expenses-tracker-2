export interface Expense {
  id: string
  title: string
  amount: number
  category: string
  date: string
  description?: string
}

export interface Transaction {
  id: string
  accountId: string
  accountType: 'bank' | 'creditCard' | 'loan'
  type: 'expense' | 'payment' | 'income'
  amount: number
  category: string
  date: string
  description?: string
  linkedAccountId?: string // For credit card payments and loan EMIs
  tags?: string[] // Tags for transactions
  isRecurring?: boolean
  recurringId?: string
  splitCategories?: { category: string; amount: number; percentage: number }[]
}

export interface BankAccount {
  id: string
  name: string
  accountNumber: string
  bankName: string
  balance: number
  accountType: 'savings' | 'current' | 'cash'
  createdAt: string
}

export interface CreditCard {
  id: string
  name: string
  cardNumber: string
  bankName: string
  limit: number
  currentBalance: number
  availableCredit: number
  dueDate: number // Day of month
  createdAt: string
  linkedBankAccountId?: string
}

export interface Loan {
  id: string
  name: string
  loanType: string
  principalAmount: number
  remainingAmount: number
  interestRate: number
  emiAmount: number
  emiDate: number // Day of month
  tenureMonths: number
  remainingMonths: number
  createdAt: string
  linkedBankAccountId?: string
  paymentMode: 'auto' | 'manual'
}

export interface Budget {
  id: string
  category: string
  amount: number
  period: 'monthly' | 'weekly'
  startDate: string
  endDate?: string
}

export interface Savings {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  targetDate: string
  description?: string
  linkedBankAccountId?: string
}

export interface AccountReconciliation {
  id: string
  fromAccountId: string
  fromAccountType: 'bank' | 'creditCard' | 'loan'
  toAccountId: string
  toAccountType: 'bank' | 'creditCard' | 'loan'
  amount: number
  date: string
  description: string
}

export interface RecurringTransaction {
  id: string
  accountId: string
  accountType: 'bank' | 'creditCard' | 'loan'
  type: 'expense' | 'payment' | 'income'
  amount: number
  category: string
  description?: string
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
  startDate: string
  endDate?: string
  nextDueDate: string
  isActive: boolean
  linkedAccountId?: string
  tags?: string[]
}

export interface Notification {
  id: string
  type: 'reminder' | 'alert' | 'warning' | 'info'
  title: string
  message: string
  date: string
  isRead: boolean
  actionType?: 'bill' | 'budget' | 'loan' | 'goal'
  actionId?: string
}

export interface UserPreferences {
  currency: string
  currencySymbol: string
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD'
  theme: 'light' | 'dark'
  notifications: boolean
  emailNotifications: boolean
  budgetAlerts: boolean
  reminderDays: number
}

export interface DayBookEntry {
  id: string
  _id?: string
  date: string
  notes: string
  transactions: string[]
}
