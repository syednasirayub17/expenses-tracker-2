import React, { useEffect, useState } from 'react'
import { DayBookEntry } from '../types'
import './DayBook.css'
import api from '../services/api'

const DayBook: React.FC = () => {
  const [items, setItems] = useState<DayBookEntry[]>([])
  const [note, setNote] = useState('')

  const load = async () => {
    try {
      const data = await api.daybookApi.list()
      setItems(data)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleAdd = async () => {
    try {
      const payload = { date: new Date().toISOString(), notes: note, transactions: [] }
      await api.daybookApi.create(payload)
      setNote('')
      load()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await api.daybookApi.remove(id)
      load()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="daybook-page">
      <h2>Day Book</h2>
      <div>
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note" />
        <button onClick={handleAdd}>Add</button>
      </div>
      <div className="daybook-list">
        {items.length === 0 && <p>No entries yet</p>}
        {items.map((it) => (
          <div key={it._id || it.id} className="daybook-item">
            <div>{new Date(it.date).toLocaleDateString()}</div>
            <div>{it.notes}</div>
            <button onClick={() => handleDelete(it._id || it.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default DayBook
