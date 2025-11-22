import express from 'express'
import {
  getStocks,
  createStock,
  updateStock,
  deleteStock,
  getSIPs,
  createSIP,
  updateSIP,
  deleteSIP,
} from '../controllers/investmentController'
import { protect } from '../middleware/auth'

const router = express.Router()

router.use(protect)

// Stocks
router.route('/stocks').get(getStocks).post(createStock)
router.route('/stocks/:id').put(updateStock).delete(deleteStock)

// SIPs
router.route('/sips').get(getSIPs).post(createSIP)
router.route('/sips/:id').put(updateSIP).delete(deleteSIP)

export default router
