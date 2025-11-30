import SharedWallet from '../models/SharedWallet';
import SharedTransaction from '../models/SharedTransaction';
import crypto from 'crypto';

interface SplitCalculation {
    userId: string;
    amount: number;
}

interface BalanceSummary {
    userId: string;
    balance: number; // Positive = owed to user, Negative = user owes
}

class SharedWalletService {
    /**
     * Generate unique invite code
     */
    generateInviteCode(): string {
        return crypto.randomBytes(4).toString('hex').toUpperCase();
    }

    /**
     * Calculate equal split
     */
    calculateEqualSplit(amount: number, memberCount: number): number {
        return Math.round((amount / memberCount) * 100) / 100;
    }

    /**
     * Calculate balances for a wallet
     */
    async calculateBalances(walletId: string): Promise<BalanceSummary[]> {
        const transactions = await SharedTransaction.find({ walletId });
        const balances: { [key: string]: number } = {};

        transactions.forEach(txn => {
            // Initialize balances
            if (!balances[txn.paidBy.toString()]) {
                balances[txn.paidBy.toString()] = 0;
            }

            txn.splits.forEach(split => {
                if (!balances[split.userId.toString()]) {
                    balances[split.userId.toString()] = 0;
                }

                // Person who paid gets credited
                if (txn.paidBy.toString() === split.userId.toString()) {
                    balances[txn.paidBy.toString()] += txn.amount - split.amount;
                } else {
                    // Person who owes gets debited
                    balances[split.userId.toString()] -= split.amount;
                    balances[txn.paidBy.toString()] += split.amount;
                }
            });
        });

        return Object.entries(balances).map(([userId, balance]) => ({
            userId,
            balance: Math.round(balance * 100) / 100
        }));
    }

    /**
     * Suggest settlement transactions to minimize number of transactions
     */
    suggestSettlements(balances: BalanceSummary[]): Array<{
        from: string;
        to: string;
        amount: number;
    }> {
        const settlements: Array<{ from: string; to: string; amount: number }> = [];
        const creditors = balances.filter(b => b.balance > 0).sort((a, b) => b.balance - a.balance);
        const debtors = balances.filter(b => b.balance < 0).sort((a, b) => a.balance - b.balance);

        let i = 0, j = 0;

        while (i < creditors.length && j < debtors.length) {
            const credit = creditors[i].balance;
            const debt = Math.abs(debtors[j].balance);
            const amount = Math.min(credit, debt);

            settlements.push({
                from: debtors[j].userId,
                to: creditors[i].userId,
                amount: Math.round(amount * 100) / 100
            });

            creditors[i].balance -= amount;
            debtors[j].balance += amount;

            if (creditors[i].balance === 0) i++;
            if (debtors[j].balance === 0) j++;
        }

        return settlements;
    }

    /**
     * Create splits for a transaction
     */
    createSplits(
        memberIds: string[],
        amount: number,
        splitType: 'equal' | 'custom' | 'percentage',
        customSplits?: { [userId: string]: number }
    ): SplitCalculation[] {
        if (splitType === 'equal') {
            const splitAmount = this.calculateEqualSplit(amount, memberIds.length);
            return memberIds.map(userId => ({
                userId,
                amount: splitAmount
            }));
        } else if (splitType === 'custom' && customSplits) {
            return Object.entries(customSplits).map(([userId, amount]) => ({
                userId,
                amount: Math.round(amount * 100) / 100
            }));
        } else if (splitType === 'percentage' && customSplits) {
            return Object.entries(customSplits).map(([userId, percentage]) => ({
                userId,
                amount: Math.round((amount * percentage / 100) * 100) / 100
            }));
        }

        return [];
    }
}

export default new SharedWalletService();
