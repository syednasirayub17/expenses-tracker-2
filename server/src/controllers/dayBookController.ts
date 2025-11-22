import { Request, Response } from 'express'
import DayBook from '../models/DayBook'
import { AuthRequest } from '../middleware/auth'
import googleSheets from '../services/googleSheets'

export const getDayBooks = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId
    const items = await DayBook.find({ userId }).sort({ date: -1 })
    res.json(items)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

export const createDayBook = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId
    const { date, transactions, notes } = req.body
    const entry = new DayBook({ userId, date, transactions, notes })
    await entry.save()

    // Sync to Google Sheets
    await googleSheets.syncDayBook(entry.toObject())

    res.status(201).json(entry)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

export const getDayBook = async (req: Request, res: Response) => {
  try {
    const entry = await DayBook.findById(req.params.id)
    if (!entry) return res.status(404).json({ message: 'Not found' })
    res.json(entry)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

export const updateDayBook = async (req: Request, res: Response) => {
  try {
    const entry = await DayBook.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!entry) return res.status(404).json({ message: 'Not found' })

    // Sync to Google Sheets
    await googleSheets.syncDayBook(entry.toObject())

    res.json(entry)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

export const deleteDayBook = async (req: Request, res: Response) => {
  try {
    const entry = await DayBook.findByIdAndDelete(req.params.id)
    if (!entry) return res.status(404).json({ message: 'Not found' })
    res.json({ message: 'Deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}
