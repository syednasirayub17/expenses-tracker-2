import Transaction from '../models/Transaction';

interface CategorySuggestion {
    category: string;
    confidence: number;
    reason: string;
}

// Common merchant keywords mapped to categories
const KEYWORD_MAPPINGS: Record<string, string> = {
    // Food & Dining
    'starbucks': 'Food',
    'mcdonalds': 'Food',
    'restaurant': 'Food',
    'cafe': 'Food',
    'pizza': 'Food',
    'grocery': 'Food',
    'supermarket': 'Food',
    'food': 'Food',

    // Transport
    'uber': 'Transport',
    'lyft': 'Transport',
    'taxi': 'Transport',
    'gas': 'Transport',
    'fuel': 'Transport',
    'parking': 'Transport',
    'metro': 'Transport',
    'bus': 'Transport',

    // Shopping
    'amazon': 'Shopping',
    'walmart': 'Shopping',
    'target': 'Shopping',
    'mall': 'Shopping',
    'store': 'Shopping',

    // Bills & Utilities
    'electric': 'Bills',
    'water': 'Bills',
    'internet': 'Bills',
    'phone': 'Bills',
    'netflix': 'Entertainment',
    'spotify': 'Entertainment',
    'gym': 'Health',
    'insurance': 'Bills',

    // Health
    'pharmacy': 'Health',
    'doctor': 'Health',
    'hospital': 'Health',
    'medical': 'Health',

    // Entertainment
    'movie': 'Entertainment',
    'cinema': 'Entertainment',
    'theater': 'Entertainment',
    'game': 'Entertainment',
};

class CategorizationService {
    /**
     * Suggest category based on transaction description
     */
    async suggestCategory(
        description: string,
        username: string
    ): Promise<CategorySuggestion | null> {
        const normalizedDesc = description.toLowerCase().trim();

        // 1. Check user's historical patterns (highest priority)
        const userPattern = await this.getUserPattern(normalizedDesc, username);
        if (userPattern) {
            return {
                category: userPattern.category,
                confidence: 0.9,
                reason: 'Based on your past transactions'
            };
        }

        // 2. Check keyword mappings
        const keywordMatch = this.matchKeywords(normalizedDesc);
        if (keywordMatch) {
            return {
                category: keywordMatch,
                confidence: 0.7,
                reason: 'Based on common patterns'
            };
        }

        // 3. No match found
        return null;
    }

    /**
     * Learn from user's categorization choice
     */
    async learnFromUser(
        description: string,
        category: string,
        username: string
    ): Promise<void> {
        // This will be called when user accepts/rejects a suggestion
        // Store the pattern for future use
        const normalizedDesc = description.toLowerCase().trim();

        // Extract key terms (words longer than 3 characters)
        const keyTerms = normalizedDesc
            .split(/\s+/)
            .filter(word => word.length > 3)
            .slice(0, 3); // Take first 3 significant words

        // In a real implementation, you'd store this in a UserCategoryPattern model
        // For now, we'll rely on the transaction history
    }

    /**
     * Find category from user's past transactions
     */
    private async getUserPattern(
        description: string,
        username: string
    ): Promise<{ category: string } | null> {
        try {
            // Find similar transactions by this user
            const similarTransactions = await Transaction.find({
                username,
                description: { $regex: description, $options: 'i' }
            })
                .sort({ date: -1 })
                .limit(5);

            if (similarTransactions.length === 0) {
                return null;
            }

            // Find most common category
            const categoryCounts: Record<string, number> = {};
            similarTransactions.forEach(t => {
                categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
            });

            const mostCommon = Object.entries(categoryCounts)
                .sort(([, a], [, b]) => b - a)[0];

            if (mostCommon && mostCommon[1] >= 2) {
                return { category: mostCommon[0] };
            }

            return null;
        } catch (error) {
            console.error('Error finding user pattern:', error);
            return null;
        }
    }

    /**
     * Match keywords in description
     */
    private matchKeywords(description: string): string | null {
        for (const [keyword, category] of Object.entries(KEYWORD_MAPPINGS)) {
            if (description.includes(keyword)) {
                return category;
            }
        }
        return null;
    }

    /**
     * Get categorization statistics for user
     */
    async getCategorizationStats(username: string): Promise<{
        totalTransactions: number;
        categorizedByAI: number;
        accuracy: number;
    }> {
        // This would track how many suggestions were accepted
        // For now, return placeholder
        return {
            totalTransactions: 0,
            categorizedByAI: 0,
            accuracy: 0
        };
    }
}

export default new CategorizationService();
