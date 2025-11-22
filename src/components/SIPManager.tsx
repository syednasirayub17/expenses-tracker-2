import React, { useState } from 'react'
import api from '../services/api'
import './SIPManager.css'

const SIPManager: React.FC<{ sips?: any[]; refresh?: () => void }> = ({ sips = [], refresh }) => {
  const [name, setName] = useState('')
  const [amount, setAmount] = useState(0)

  const handleAdd = async () => {
    try {
      await api.investmentApi.sips.create({ name, amount, startDate: new Date().toISOString(), frequency: 'monthly' })
      setName('')
      setAmount(0)
      refresh && refresh()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await api.investmentApi.sips.remove(id)
      refresh && refresh()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="sip-manager">
      <div>
        <input placeholder="Fund name" value={name} onChange={(e) => setName(e.target.value)} />
        <input type="number" placeholder="Monthly amount" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
        <button onClick={handleAdd}>Add SIP</button>
      </div>
      <div>
        {sips.length === 0 && <p>No SIPs</p>}
        {sips.map((s) => (
          <div key={s._id || s.id}>
            <strong>{s.name}</strong> • {s.amount}
            <button onClick={() => handleDelete(s._id || s.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SIPManager
