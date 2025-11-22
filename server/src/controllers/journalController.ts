import { Request, Response } from 'express'
import Journal from '../models/Journal'
import { AuthRequest } from '../middleware/auth'
import googleSheets from '../services/googleSheets'

export const getJournals = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId
    const items = await Journal.find({ userId }).sort({ date: -1 })
    res.json(items)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

export const createJournal = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId
    const { title, content, tags, date } = req.body
    const entry = new Journal({ userId, title, content, tags, date })
    await entry.save()

    // Sync to Google Sheets
    await googleSheets.syncJournal(entry.toObject())

    res.status(201).json(entry)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

export const getJournal = async (req: Request, res: Response) => {
  try {
    const entry = await Journal.findById(req.params.id)
    if (!entry) return res.status(404).json({ message: 'Not found' })
    res.json(entry)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

export const updateJournal = async (req: Request, res: Response) => {
  try {
    const entry = await Journal.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!entry) return res.status(404).json({ message: 'Not found' })

    // Sync to Google Sheets
    await googleSheets.syncJournal(entry.toObject())

    res.json(entry)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

export const deleteJournal = async (req: Request, res: Response) => {
  try {
    const entry = await Journal.findByIdAndDelete(req.params.id)
    if (!entry) return res.status(404).json({ message: 'Not found' })
    res.json({ message: 'Deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}
