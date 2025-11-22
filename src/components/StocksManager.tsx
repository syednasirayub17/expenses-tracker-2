import React, { useState } from 'react'
import api from '../services/api'
import './StocksManager.css'

const StocksManager: React.FC<{ stocks?: any[]; refresh?: () => void }> = ({ stocks = [], refresh }) => {
  const [symbol, setSymbol] = useState('')
  const [quantity, setQuantity] = useState(0)
  const [averagePrice, setAveragePrice] = useState(0)

  const handleAdd = async () => {
    try {
      await api.investmentApi.stocks.create({ symbol, quantity, averagePrice })
      setSymbol('')
      setQuantity(0)
      setAveragePrice(0)
      refresh && refresh()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await api.investmentApi.stocks.remove(id)
      refresh && refresh()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="stocks-manager">
      <div>
        <input placeholder="Symbol" value={symbol} onChange={(e) => setSymbol(e.target.value)} />
        <input type="number" placeholder="Quantity" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
        <input type="number" placeholder="Avg Price" value={averagePrice} onChange={(e) => setAveragePrice(Number(e.target.value))} />
        <button onClick={handleAdd}>Add Stock</button>
      </div>
      <div>
        {stocks.length === 0 && <p>No stocks</p>}
        {stocks.map((s) => (
          <div key={s._id || s.id}>
            <strong>{s.symbol}</strong> • {s.quantity} @ {s.averagePrice}
            <button onClick={() => handleDelete(s._id || s.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default StocksManager
