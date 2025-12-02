import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import BankAccount from '../models/BankAccount';
import CreditCard from '../models/CreditCard';
import Loan from '../models/Loan';
import Budget from '../models/Budget';
import Transaction from '../models/Transaction';
import googleSheets from '../services/googleSheets';

// ==================== BANK ACCOUNTS ====================

export const getBankAccounts = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        const accounts = await BankAccount.find({ userId });
        res.json(accounts);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const createBankAccount = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        const account = new BankAccount({ ...req.body, userId });
        await account.save();

        // Sync to Google Sheets (non-blocking - don't fail if this errors)
        googleSheets.syncBankAccount(account.toObject()).catch(err => {
            console.warn('⚠️ Google Sheets sync failed (non-critical):', err.message);
        });

        res.status(201).json(account);
    } catch (err: any) {
        console.error('❌ Create bank account error:', err);
        res.status(500).json({
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

export const updateBankAccount = async (req: AuthRequest, res: Response) => {
    try {
        const account = await BankAccount.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!account) return res.status(404).json({ message: 'Not found' });

        // Sync to Google Sheets (non-blocking)
        googleSheets.syncBankAccount(account.toObject()).catch(err => {
            console.warn('⚠️ Google Sheets sync failed:', err.message);
        });

        res.json(account);
    } catch (err: any) {
        console.error('❌ Update bank account error:', err);
        res.status(500).json({ message: 'Server error', error: process.env.NODE_ENV === 'development' ? err.message : undefined });
    }
};


export const deleteBankAccount = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        console.log('Deleting bank account:', { id, userId });

        // Verify account belongs to user before deleting
        const account = await BankAccount.findOne({ _id: id, userId });
        if (!account) {
            console.log('Account not found or unauthorized');
            return res.status(404).json({ message: 'Account not found or unauthorized' });
        }

        await BankAccount.findByIdAndDelete(id);
        console.log('✓ Bank account deleted successfully');
        res.json({ message: 'Deleted' });
    } catch (err: any) {
        console.error('❌ Delete bank account error:', err);
        res.status(500).json({
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};


// ==================== CREDIT CARDS ====================

export const getCreditCards = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        const cards = await CreditCard.find({ userId });
        res.json(cards);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const createCreditCard = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        const card = new CreditCard({ ...req.body, userId });
        await card.save();

        // Sync to Google Sheets
        googleSheets.syncCreditCard(card.toObject()).catch(err => console.warn("⚠️ Sheets sync failed:", err.message));

        res.status(201).json(card);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateCreditCard = async (req: AuthRequest, res: Response) => {
    try {
        const card = await CreditCard.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!card) return res.status(404).json({ message: 'Not found' });

        // Sync to Google Sheets
        googleSheets.syncCreditCard(card.toObject()).catch(err => console.warn("⚠️ Sheets sync failed:", err.message));

        res.json(card);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const deleteCreditCard = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        console.log('Deleting credit card:', { id, userId });

        // Verify card belongs to user before deleting
        const card = await CreditCard.findOne({ _id: id, userId });
        if (!card) {
            console.log('Credit card not found or unauthorized');
            return res.status(404).json({ message: 'Credit card not found or unauthorized' });
        }

        await CreditCard.findByIdAndDelete(id);
        console.log('✓ Credit card deleted successfully');
        res.json({ message: 'Deleted' });
    } catch (err: any) {
        console.error('❌ Delete credit card error:', err);
        res.status(500).json({
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

// ==================== LOANS ====================

export const getLoans = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        const loans = await Loan.find({ userId });
        res.json(loans);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const createLoan = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        const loan = new Loan({ ...req.body, userId });
        await loan.save();

        // Sync to Google Sheets
        googleSheets.syncLoan(loan.toObject()).catch(err => console.warn("⚠️ Sheets sync failed:", err.message));

        res.status(201).json(loan);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateLoan = async (req: AuthRequest, res: Response) => {
    try {
        const loan = await Loan.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!loan) return res.status(404).json({ message: 'Not found' });

        // Sync to Google Sheets
        googleSheets.syncLoan(loan.toObject()).catch(err => console.warn("⚠️ Sheets sync failed:", err.message));

        res.json(loan);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const deleteLoan = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        console.log('Deleting loan:', { id, userId });

        // Verify loan belongs to user before deleting
        const loan = await Loan.findOne({ _id: id, userId });
        if (!loan) {
            console.log('Loan not found or unauthorized');
            return res.status(404).json({ message: 'Loan not found or unauthorized' });
        }

        await Loan.findByIdAndDelete(id);
        console.log('✓ Loan deleted successfully');
        res.json({ message: 'Deleted' });
    } catch (err: any) {
        console.error('❌ Delete loan error:', err);
        res.status(500).json({
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

// ==================== BUDGETS ====================

export const getBudgets = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        const budgets = await Budget.find({ userId });
        res.json(budgets);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const createBudget = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        const budget = new Budget({ ...req.body, userId });
        await budget.save();

        // Sync to Google Sheets
        googleSheets.syncBudget(budget.toObject()).catch(err => console.warn("⚠️ Sheets sync failed:", err.message));

        res.status(201).json(budget);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateBudget = async (req: AuthRequest, res: Response) => {
    try {
        const budget = await Budget.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!budget) return res.status(404).json({ message: 'Not found' });

        // Sync to Google Sheets
        googleSheets.syncBudget(budget.toObject()).catch(err => console.warn("⚠️ Sheets sync failed:", err.message));

        res.json(budget);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const deleteBudget = async (req: AuthRequest, res: Response) => {
    try {
        const budget = await Budget.findByIdAndDelete(req.params.id);
        if (!budget) return res.status(404).json({ message: 'Not found' });
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// ==================== TRANSACTIONS ====================

export const getTransactions = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        const transactions = await Transaction.find({ userId }).sort({ date: -1 });
        res.json(transactions);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const createTransaction = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        const transaction = new Transaction({ ...req.body, userId });
        await transaction.save();

        // Sync to Google Sheets
        googleSheets.syncTransaction(transaction.toObject()).catch(err => console.warn("⚠️ Sheets sync failed:", err.message));

        res.status(201).json(transaction);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateTransaction = async (req: AuthRequest, res: Response) => {
    try {
        const transaction = await Transaction.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!transaction) return res.status(404).json({ message: 'Not found' });

        // Sync to Google Sheets
        googleSheets.syncTransaction(transaction.toObject()).catch(err => console.warn("⚠️ Sheets sync failed:", err.message));

        res.json(transaction);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const deleteTransaction = async (req: AuthRequest, res: Response) => {
    try {
        const transaction = await Transaction.findByIdAndDelete(req.params.id);
        if (!transaction) return res.status(404).json({ message: 'Not found' });
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};
