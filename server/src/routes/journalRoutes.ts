import express from 'express'
import {
  getJournals,
  createJournal,
  getJournal,
  updateJournal,
  deleteJournal,
} from '../controllers/journalController'
import { protect } from '../middleware/auth'

const router = express.Router()

router.use(protect)

router.route('/').get(getJournals).post(createJournal)
router.route('/:id').get(getJournal).put(updateJournal).delete(deleteJournal)

export default router
