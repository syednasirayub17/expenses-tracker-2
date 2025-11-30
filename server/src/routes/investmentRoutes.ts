import express from 'express';
import { protect, AuthRequest } from '../middleware/auth';
import Investment from '../models/Investment';
import investmentService from '../services/investmentService';

const router = express.Router();

// Get all investments
router.get('/', protect, async (req: AuthRequest, res) => {
  try {
    const investments = await Investment.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(investments);
  } catch (error) {
    console.error('Error fetching investments:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get portfolio summary
router.get('/portfolio', protect, async (req: AuthRequest, res) => {
  try {
    const summary = await investmentService.getPortfolioSummary(req.userId!);
    res.json(summary);
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add investment
router.post('/', protect, async (req: AuthRequest, res) => {
  try {
    const investment = await Investment.create({
      ...req.body,
      userId: req.userId
    });
    res.status(201).json(investment);
  } catch (error) {
    console.error('Error creating investment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update investment
router.put('/:id', protect, async (req: AuthRequest, res) => {
  try {
    const investment = await Investment.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { ...req.body, lastUpdated: new Date() },
      { new: true }
    );

    if (!investment) {
      return res.status(404).json({ message: 'Investment not found' });
    }

    res.json(investment);
  } catch (error) {
    console.error('Error updating investment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete investment
router.delete('/:id', protect, async (req: AuthRequest, res) => {
  try {
    const investment = await Investment.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!investment) {
      return res.status(404).json({ message: 'Investment not found' });
    }

    res.json({ message: 'Investment deleted' });
  } catch (error) {
    console.error('Error deleting investment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current gold price
router.get('/gold/price', protect, async (req: AuthRequest, res) => {
  try {
    const price = await investmentService.getCurrentGoldPrice();
    res.json({ pricePerGram: price });
  } catch (error) {
    console.error('Error fetching gold price:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update gold price (admin only)
router.post('/gold/price', protect, async (req: AuthRequest, res) => {
  try {
    const { pricePerGram } = req.body;
    await investmentService.updateGoldPrice(pricePerGram);
    res.json({ message: 'Gold price updated' });
  } catch (error) {
    console.error('Error updating gold price:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get gold price history
router.get('/gold/history', protect, async (req: AuthRequest, res) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const history = await investmentService.getGoldPriceHistory(days);
    res.json(history);
  } catch (error) {
    console.error('Error fetching gold history:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
