import Investment from '../models/Investment';
import GoldPrice from '../models/GoldPrice';

interface PortfolioSummary {
    totalInvestment: number;
    currentValue: number;
    totalGain: number;
    totalGainPercentage: number;
    byType: {
        [key: string]: {
            investment: number;
            currentValue: number;
            gain: number;
            gainPercentage: number;
        };
    };
}

class InvestmentService {
    /**
     * Get portfolio summary for a user
     */
    async getPortfolioSummary(userId: string): Promise<PortfolioSummary> {
        const investments = await Investment.find({ userId });

        let totalInvestment = 0;
        let currentValue = 0;
        const byType: any = {};

        investments.forEach(inv => {
            const investment = inv.quantity * inv.buyPrice;
            const current = inv.quantity * inv.currentPrice;
            const gain = current - investment;

            totalInvestment += investment;
            currentValue += current;

            if (!byType[inv.type]) {
                byType[inv.type] = {
                    investment: 0,
                    currentValue: 0,
                    gain: 0,
                    gainPercentage: 0
                };
            }

            byType[inv.type].investment += investment;
            byType[inv.type].currentValue += current;
            byType[inv.type].gain += gain;
        });

        // Calculate percentages
        Object.keys(byType).forEach(type => {
            byType[type].gainPercentage = byType[type].investment > 0
                ? (byType[type].gain / byType[type].investment) * 100
                : 0;
        });

        const totalGain = currentValue - totalInvestment;
        const totalGainPercentage = totalInvestment > 0
            ? (totalGain / totalInvestment) * 100
            : 0;

        return {
            totalInvestment: Math.round(totalInvestment * 100) / 100,
            currentValue: Math.round(currentValue * 100) / 100,
            totalGain: Math.round(totalGain * 100) / 100,
            totalGainPercentage: Math.round(totalGainPercentage * 100) / 100,
            byType
        };
    }

    /**
     * Update gold price
     */
    async updateGoldPrice(pricePerGram: number, source: string = 'manual'): Promise<void> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        await GoldPrice.findOneAndUpdate(
            { date: today },
            { pricePerGram, source, date: today },
            { upsert: true, new: true }
        );

        // Update all gold investments with new price
        await Investment.updateMany(
            { type: 'gold' },
            { currentPrice: pricePerGram, lastUpdated: new Date() }
        );
    }

    /**
     * Get current gold price
     */
    async getCurrentGoldPrice(): Promise<number> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const goldPrice = await GoldPrice.findOne({ date: today });
        return goldPrice?.pricePerGram || 0;
    }

    /**
     * Get gold price history
     */
    async getGoldPriceHistory(days: number = 30) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        return GoldPrice.find({
            date: { $gte: startDate }
        }).sort({ date: 1 });
    }

    /**
     * Update stock/crypto prices (placeholder for API integration)
     */
    async updatePrices(userId: string): Promise<void> {
        // TODO: Integrate with Yahoo Finance API for stocks
        // TODO: Integrate with CoinGecko API for crypto
        // TODO: Integrate with AMFI API for mutual funds

        // For now, this is a placeholder
        console.log('Price update triggered for user:', userId);
    }
}

export default new InvestmentService();
