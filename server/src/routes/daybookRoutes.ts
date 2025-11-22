import express from 'express'
import {
  getDayBooks,
  createDayBook,
  getDayBook,
  updateDayBook,
  deleteDayBook,
} from '../controllers/dayBookController'
import { protect } from '../middleware/auth'

const router = express.Router()

router.use(protect)

router.route('/').get(getDayBooks).post(createDayBook)
router.route('/:id').get(getDayBook).put(updateDayBook).delete(deleteDayBook)

export default router
