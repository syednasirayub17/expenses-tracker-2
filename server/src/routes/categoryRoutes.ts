import express, { Response } from 'express'
import Category from '../models/Category'
import { protect, AuthRequest } from '../middleware/auth'

const router = express.Router()

// Get all categories for the authenticated user
router.get('/', protect, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId

        // Find or create categories for this user
        let categories = await Category.findOne({ userId })

        if (!categories) {
            // Create default categories if none exist
            categories = await Category.create({
                userId,
                expense: ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Education', 'Other'],
                income: ['Salary', 'Business', 'Investment', 'Gift', 'Other'],
                payment: ['Credit Card Payment', 'Loan EMI', 'Other'],
            })
        }

        res.json({
            expense: categories.expense,
            income: categories.income,
            payment: categories.payment,
        })
    } catch (error: any) {
        console.error('Error fetching categories:', error)
        res.status(500).json({ error: error.message })
    }
})

// Add a category to a specific type
router.post('/:type', protect, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId
        const { type } = req.params
        const { category } = req.body

        if (!['expense', 'income', 'payment'].includes(type)) {
            return res.status(400).json({ error: 'Invalid category type' })
        }

        if (!category || typeof category !== 'string') {
            return res.status(400).json({ error: 'Category name is required' })
        }

        // Find or create categories for this user
        let categories = await Category.findOne({ userId })

        if (!categories) {
            categories = await Category.create({
                userId,
                expense: ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Education', 'Other'],
                income: ['Salary', 'Business', 'Investment', 'Gift', 'Other'],
                payment: ['Credit Card Payment', 'Loan EMI', 'Other'],
            })
        }

        // Add category if it doesn't already exist
        const categoryArray = categories[type as 'expense' | 'income' | 'payment']
        if (!categoryArray.includes(category)) {
            categoryArray.push(category)
            await categories.save()
        }

        res.json({
            expense: categories.expense,
            income: categories.income,
            payment: categories.payment,
        })
    } catch (error: any) {
        console.error('Error adding category:', error)
        res.status(500).json({ error: error.message })
    }
})

// Delete a category from a specific type
router.delete('/:type/:category', protect, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId
        const { type, category } = req.params

        if (!['expense', 'income', 'payment'].includes(type)) {
            return res.status(400).json({ error: 'Invalid category type' })
        }

        // Default categories that cannot be deleted
        const defaultCategories = {
            expense: ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Education', 'Other'],
            income: ['Salary', 'Business', 'Investment', 'Gift', 'Other'],
            payment: ['Credit Card Payment', 'Loan EMI', 'Other'],
        }

        // Check if trying to delete a default category
        if (defaultCategories[type as keyof typeof defaultCategories].includes(category)) {
            return res.status(400).json({ error: 'Cannot delete default categories' })
        }

        const categories = await Category.findOne({ userId })

        if (!categories) {
            return res.status(404).json({ error: 'Categories not found' })
        }

        // Remove category
        const categoryArray = categories[type as 'expense' | 'income' | 'payment']
        const index = categoryArray.indexOf(category)
        if (index > -1) {
            categoryArray.splice(index, 1)
            await categories.save()
        }

        res.json({
            expense: categories.expense,
            income: categories.income,
            payment: categories.payment,
        })
    } catch (error: any) {
        console.error('Error deleting category:', error)
        res.status(500).json({ error: error.message })
    }
})

export default router
