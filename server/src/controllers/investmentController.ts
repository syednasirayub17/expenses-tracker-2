import { Request, Response } from 'express'
import Stock from '../models/Stock'
import SIP from '../models/SIP'
import { AuthRequest } from '../middleware/auth'
import googleSheets from '../services/googleSheets'

// Stocks
export const getStocks = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId
    const items = await Stock.find({ userId }).sort({ updatedAt: -1 })
    res.json(items)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

export const createStock = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId
    const { symbol, name, quantity, averagePrice, exchange } = req.body
    const item = new Stock({ userId, symbol, name, quantity, averagePrice, exchange })
    await item.save()

    // Sync to Google Sheets
    await googleSheets.syncStock(item.toObject())

    res.status(201).json(item)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

export const updateStock = async (req: Request, res: Response) => {
  try {
    const item = await Stock.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!item) return res.status(404).json({ message: 'Not found' })

    // Sync to Google Sheets
    await googleSheets.syncStock(item.toObject())

    res.json(item)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

export const deleteStock = async (req: Request, res: Response) => {
  try {
    const item = await Stock.findByIdAndDelete(req.params.id)
    if (!item) return res.status(404).json({ message: 'Not found' })
    res.json({ message: 'Deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

// SIPs
export const getSIPs = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId
    const items = await SIP.find({ userId }).sort({ updatedAt: -1 })
    res.json(items)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

export const createSIP = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId
    const { name, amount, startDate, frequency, isActive } = req.body
    const item = new SIP({ userId, name, amount, startDate, frequency, isActive })
    await item.save()

    // Sync to Google Sheets
    await googleSheets.syncSIP(item.toObject())

    res.status(201).json(item)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

export const updateSIP = async (req: Request, res: Response) => {
  try {
    const item = await SIP.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!item) return res.status(404).json({ message: 'Not found' })

    // Sync to Google Sheets
    await googleSheets.syncSIP(item.toObject())

    res.json(item)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

export const deleteSIP = async (req: Request, res: Response) => {
  try {
    const item = await SIP.findByIdAndDelete(req.params.id)
    if (!item) return res.status(404).json({ message: 'Not found' })
    res.json({ message: 'Deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}
