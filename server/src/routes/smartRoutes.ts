import express from 'express';
import { protect } from '../middleware/auth';
import categorizationService from '../services/categorizationService';
import analyticsService from '../services/analyticsService';

const router = express.Router();

/**
 * @route   POST /api/smart/suggest-category
 * @desc    Get category suggestion for transaction description
 * @access  Private
 */
router.post('/suggest-category', protect, async (req, res) => {
    try {
        const { description } = req.body;
        const username = (req as any).user.username;

        if (!description) {
            return res.status(400).json({ message: 'Description is required' });
        }

        const suggestion = await categorizationService.suggestCategory(description, username);

        res.json(suggestion || { message: 'No suggestion available' });
    } catch (error) {
        console.error('Error suggesting category:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * @route   GET /api/smart/insights
 * @desc    Get spending insights
 * @access  Private
 */
router.get('/insights', protect, async (req, res) => {
    try {
        const username = (req as any).user.username;

        const [insights, comparison, breakdown] = await Promise.all([
            analyticsService.getSpendingInsights(username),
            analyticsService.getMonthlyComparison(username),
            analyticsService.getCategoryBreakdown(username, 1)
        ]);

        res.json({
            insights,
            comparison,
            breakdown
        });
    } catch (error) {
        console.error('Error getting insights:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * @route   GET /api/smart/budget-suggestions
 * @desc    Get budget suggestions based on historical spending
 * @access  Private
 */
router.get('/budget-suggestions', protect, async (req, res) => {
    try {
        const username = (req as any).user.username;

        const suggestions = await analyticsService.suggestBudgets(username);

        res.json(suggestions);
    } catch (error) {
        console.error('Error getting budget suggestions:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * @route   GET /api/smart/category-breakdown
 * @desc    Get spending breakdown by category
 * @access  Private
 */
router.get('/category-breakdown', protect, async (req, res) => {
    try {
        const username = (req as any).user.username;
        const months = parseInt(req.query.months as string) || 1;

        const breakdown = await analyticsService.getCategoryBreakdown(username, months);

        res.json(breakdown);
    } catch (error) {
        console.error('Error getting category breakdown:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
