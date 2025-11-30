import Transaction from '../models/Transaction';
import Budget from '../models/Budget';

interface MonthlyComparison {
    currentMonth: {
        total: number;
        month: string;
    };
    lastMonth: {
        total: number;
        month: string;
    };
    percentageChange: number;
    trend: 'up' | 'down' | 'stable';
}

interface CategoryBreakdown {
    category: string;
    amount: number;
    percentage: number;
    transactionCount: number;
}

interface SpendingInsight {
    type: 'warning' | 'info' | 'success';
    message: string;
    category?: string;
    amount?: number;
}

class AnalyticsService {
    /**
     * Compare current month spending with last month
     */
    async getMonthlyComparison(username: string): Promise<MonthlyComparison> {
        const now = new Date();
        const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

        const [currentMonthTransactions, lastMonthTransactions] = await Promise.all([
            Transaction.find({
                username,
                type: 'expense',
                date: { $gte: currentMonthStart }
            }),
            Transaction.find({
                username,
                type: 'expense',
                date: { $gte: lastMonthStart, $lte: lastMonthEnd }
            })
        ]);

        const currentTotal = currentMonthTransactions.reduce((sum, t) => sum + t.amount, 0);
        const lastTotal = lastMonthTransactions.reduce((sum, t) => sum + t.amount, 0);

        const percentageChange = lastTotal > 0
            ? ((currentTotal - lastTotal) / lastTotal) * 100
            : 0;

        let trend: 'up' | 'down' | 'stable' = 'stable';
        if (Math.abs(percentageChange) < 5) {
            trend = 'stable';
        } else if (percentageChange > 0) {
            trend = 'up';
        } else {
            trend = 'down';
        }

        return {
            currentMonth: {
                total: currentTotal,
                month: currentMonthStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
            },
            lastMonth: {
                total: lastTotal,
                month: lastMonthStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
            },
            percentageChange: Math.round(percentageChange * 10) / 10,
            trend
        };
    }

    /**
     * Get spending breakdown by category
     */
    async getCategoryBreakdown(username: string, months: number = 1): Promise<CategoryBreakdown[]> {
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - months);

        const transactions = await Transaction.find({
            username,
            type: 'expense',
            date: { $gte: startDate }
        });

        const categoryTotals: Record<string, { amount: number; count: number }> = {};
        let totalAmount = 0;

        transactions.forEach(t => {
            if (!categoryTotals[t.category]) {
                categoryTotals[t.category] = { amount: 0, count: 0 };
            }
            categoryTotals[t.category].amount += t.amount;
            categoryTotals[t.category].count += 1;
            totalAmount += t.amount;
        });

        const breakdown: CategoryBreakdown[] = Object.entries(categoryTotals)
            .map(([category, data]) => ({
                category,
                amount: Math.round(data.amount * 100) / 100,
                percentage: Math.round((data.amount / totalAmount) * 100 * 10) / 10,
                transactionCount: data.count
            }))
            .sort((a, b) => b.amount - a.amount);

        return breakdown;
    }

    /**
     * Generate spending insights
     */
    async getSpendingInsights(username: string): Promise<SpendingInsight[]> {
        const insights: SpendingInsight[] = [];

        // 1. Monthly comparison insight
        const comparison = await this.getMonthlyComparison(username);
        if (comparison.trend === 'up' && Math.abs(comparison.percentageChange) > 10) {
            insights.push({
                type: 'warning',
                message: `You're spending ${Math.abs(comparison.percentageChange).toFixed(1)}% more this month ($${comparison.currentMonth.total.toFixed(0)} vs $${comparison.lastMonth.total.toFixed(0)})`,
                amount: comparison.currentMonth.total
            });
        } else if (comparison.trend === 'down') {
            insights.push({
                type: 'success',
                message: `Great job! You're spending ${Math.abs(comparison.percentageChange).toFixed(1)}% less this month`,
                amount: comparison.currentMonth.total
            });
        }

        // 2. Budget alerts
        const budgetAlerts = await this.checkBudgetAlerts(username);
        insights.push(...budgetAlerts);

        // 3. Top spending category
        const breakdown = await this.getCategoryBreakdown(username, 1);
        if (breakdown.length > 0) {
            insights.push({
                type: 'info',
                message: `Top spending category: ${breakdown[0].category} ($${breakdown[0].amount.toFixed(0)}, ${breakdown[0].percentage}% of total)`,
                category: breakdown[0].category,
                amount: breakdown[0].amount
            });
        }

        // 4. Detect unusual spending
        const unusualSpending = await this.detectUnusualSpending(username);
        insights.push(...unusualSpending);

        return insights;
    }

    /**
     * Check budget alerts
     */
    private async checkBudgetAlerts(username: string): Promise<SpendingInsight[]> {
        const insights: SpendingInsight[] = [];
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        const budgets = await Budget.find({ username });
        const transactions = await Transaction.find({
            username,
            type: 'expense',
            date: { $gte: monthStart }
        });

        for (const budget of budgets) {
            const spent = transactions
                .filter(t => t.category === budget.category)
                .reduce((sum, t) => sum + t.amount, 0);

            const percentage = (spent / budget.amount) * 100;

            if (percentage >= 90) {
                insights.push({
                    type: 'warning',
                    message: `Budget alert: ${budget.category} is ${percentage.toFixed(0)}% used ($${spent.toFixed(0)} of $${budget.amount})`,
                    category: budget.category,
                    amount: spent
                });
            } else if (percentage >= 75) {
                insights.push({
                    type: 'info',
                    message: `${budget.category} budget is ${percentage.toFixed(0)}% used`,
                    category: budget.category,
                    amount: spent
                });
            }
        }

        return insights;
    }

    /**
     * Detect unusual spending patterns
     */
    private async detectUnusualSpending(username: string): Promise<SpendingInsight[]> {
        const insights: SpendingInsight[] = [];

        // Compare current month with 3-month average
        const now = new Date();
        const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);

        const [currentMonth, lastThreeMonths] = await Promise.all([
            Transaction.find({
                username,
                type: 'expense',
                date: { $gte: currentMonthStart }
            }),
            Transaction.find({
                username,
                type: 'expense',
                date: { $gte: threeMonthsAgo, $lt: currentMonthStart }
            })
        ]);

        // Group by category
        const currentByCategory: Record<string, number> = {};
        const avgByCategory: Record<string, number> = {};

        currentMonth.forEach(t => {
            currentByCategory[t.category] = (currentByCategory[t.category] || 0) + t.amount;
        });

        lastThreeMonths.forEach(t => {
            avgByCategory[t.category] = (avgByCategory[t.category] || 0) + t.amount;
        });

        // Calculate averages and detect spikes
        Object.keys(avgByCategory).forEach(category => {
            avgByCategory[category] = avgByCategory[category] / 3; // 3-month average
        });

        Object.entries(currentByCategory).forEach(([category, current]) => {
            const avg = avgByCategory[category] || 0;
            if (avg > 0) {
                const increase = ((current - avg) / avg) * 100;
                if (increase > 50) {
                    insights.push({
                        type: 'warning',
                        message: `Unusual spending: ${category} is ${increase.toFixed(0)}% higher than usual ($${current.toFixed(0)} vs avg $${avg.toFixed(0)})`,
                        category,
                        amount: current
                    });
                }
            }
        });

        return insights;
    }

    /**
     * Suggest budgets based on historical spending
     */
    async suggestBudgets(username: string): Promise<Array<{ category: string; suggestedAmount: number; reason: string }>> {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const transactions = await Transaction.find({
            username,
            type: 'expense',
            date: { $gte: sixMonthsAgo }
        });

        const categoryTotals: Record<string, number[]> = {};

        // Group by category and month
        transactions.forEach(t => {
            const monthKey = `${t.date.getFullYear()}-${t.date.getMonth()}`;
            if (!categoryTotals[t.category]) {
                categoryTotals[t.category] = [];
            }
            const existing = categoryTotals[t.category].find((_, i) => i === parseInt(monthKey.split('-')[1]));
            if (!existing) {
                categoryTotals[t.category].push(t.amount);
            } else {
                categoryTotals[t.category][parseInt(monthKey.split('-')[1])] += t.amount;
            }
        });

        const suggestions = Object.entries(categoryTotals).map(([category, amounts]) => {
            const avg = amounts.reduce((sum, a) => sum + a, 0) / amounts.length;
            const buffer = avg * 0.15; // 15% buffer
            const suggested = Math.ceil((avg + buffer) / 50) * 50; // Round to nearest $50

            return {
                category,
                suggestedAmount: suggested,
                reason: `Based on 6-month average of $${avg.toFixed(0)} + 15% buffer`
            };
        });

        return suggestions.sort((a, b) => b.suggestedAmount - a.suggestedAmount);
    }
}

export default new AnalyticsService();
