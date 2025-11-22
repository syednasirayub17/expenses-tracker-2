import express from 'express';
import { protect } from '../middleware/auth';
import {
    getBankAccounts,
    createBankAccount,
    updateBankAccount,
    deleteBankAccount,
    getCreditCards,
    createCreditCard,
    updateCreditCard,
    deleteCreditCard,
    getLoans,
    createLoan,
    updateLoan,
    deleteLoan,
    getBudgets,
    createBudget,
    updateBudget,
    deleteBudget,
    getTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
} from '../controllers/accountController';

const router = express.Router();

// Bank Accounts
router.get('/bank', protect, getBankAccounts);
router.post('/bank', protect, createBankAccount);
router.put('/bank/:id', protect, updateBankAccount);
router.delete('/bank/:id', protect, deleteBankAccount);

// Credit Cards
router.get('/creditcard', protect, getCreditCards);
router.post('/creditcard', protect, createCreditCard);
router.put('/creditcard/:id', protect, updateCreditCard);
router.delete('/creditcard/:id', protect, deleteCreditCard);

// Loans
router.get('/loan', protect, getLoans);
router.post('/loan', protect, createLoan);
router.put('/loan/:id', protect, updateLoan);
router.delete('/loan/:id', protect, deleteLoan);

// Budgets
router.get('/budget', protect, getBudgets);
router.post('/budget', protect, createBudget);
router.put('/budget/:id', protect, updateBudget);
router.delete('/budget/:id', protect, deleteBudget);

// Transactions
router.get('/transaction', protect, getTransactions);
router.post('/transaction', protect, createTransaction);
router.put('/transaction/:id', protect, updateTransaction);
router.delete('/transaction/:id', protect, deleteTransaction);

export default router;
