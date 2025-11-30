import express from 'express';
import { protect, AuthRequest } from '../middleware/auth';
import SharedWallet from '../models/SharedWallet';
import SharedTransaction from '../models/SharedTransaction';
import sharedWalletService from '../services/sharedWalletService';

const router = express.Router();

// Get user's shared wallets
router.get('/', protect, async (req: AuthRequest, res) => {
    try {
        const wallets = await SharedWallet.find({
            'members.userId': req.userId
        }).populate('members.userId', 'username email');

        res.json(wallets);
    } catch (error) {
        console.error('Error fetching wallets:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create shared wallet
router.post('/', protect, async (req: AuthRequest, res) => {
    try {
        const { name, description, type } = req.body;
        const inviteCode = sharedWalletService.generateInviteCode();

        const wallet = await SharedWallet.create({
            name,
            description,
            type,
            createdBy: req.userId,
            members: [{
                userId: req.userId,
                role: 'admin',
                joinedAt: new Date()
            }],
            inviteCode
        });

        res.status(201).json(wallet);
    } catch (error) {
        console.error('Error creating wallet:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Join wallet via invite code
router.post('/join', protect, async (req: AuthRequest, res) => {
    try {
        const { inviteCode } = req.body;

        const wallet = await SharedWallet.findOne({ inviteCode });
        if (!wallet) {
            return res.status(404).json({ message: 'Invalid invite code' });
        }

        // Check if already a member
        const isMember = wallet.members.some(m => m.userId.toString() === req.userId);
        if (isMember) {
            return res.status(400).json({ message: 'Already a member' });
        }

        wallet.members.push({
            userId: req.userId as any,
            role: 'member',
            joinedAt: new Date()
        });

        await wallet.save();
        res.json(wallet);
    } catch (error) {
        console.error('Error joining wallet:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get wallet transactions
router.get('/:id/transactions', protect, async (req: AuthRequest, res) => {
    try {
        const transactions = await SharedTransaction.find({
            walletId: req.params.id
        }).populate('paidBy', 'username').sort({ date: -1 });

        res.json(transactions);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add shared transaction
router.post('/:id/transactions', protect, async (req: AuthRequest, res) => {
    try {
        const { title, amount, category, type, splitType, customSplits } = req.body;

        const wallet = await SharedWallet.findById(req.params.id);
        if (!wallet) {
            return res.status(404).json({ message: 'Wallet not found' });
        }

        const memberIds = wallet.members.map(m => m.userId.toString());
        const splits = sharedWalletService.createSplits(
            memberIds,
            amount,
            splitType,
            customSplits
        );

        const transaction = await SharedTransaction.create({
            walletId: req.params.id,
            title,
            amount,
            category,
            type,
            paidBy: req.userId,
            splitType,
            splits: splits.map(s => ({
                userId: s.userId,
                amount: s.amount,
                paid: s.userId === req.userId
            })),
            date: new Date()
        });

        res.status(201).json(transaction);
    } catch (error) {
        console.error('Error creating transaction:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get wallet balances
router.get('/:id/balances', protect, async (req: AuthRequest, res) => {
    try {
        const balances = await sharedWalletService.calculateBalances(req.params.id);
        const settlements = sharedWalletService.suggestSettlements(balances);

        res.json({ balances, settlements });
    } catch (error) {
        console.error('Error calculating balances:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Record settlement
router.post('/:id/settle', protect, async (req: AuthRequest, res) => {
    try {
        const { amount, toUserId } = req.body;

        const transaction = await SharedTransaction.create({
            walletId: req.params.id,
            title: 'Settlement',
            amount,
            category: 'Settlement',
            type: 'settlement',
            paidBy: req.userId,
            splitType: 'custom',
            splits: [
                { userId: req.userId, amount, paid: true },
                { userId: toUserId, amount, paid: true }
            ],
            date: new Date()
        });

        res.status(201).json(transaction);
    } catch (error) {
        console.error('Error recording settlement:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
