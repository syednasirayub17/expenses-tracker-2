import React, { useEffect, useState } from 'react'
import './Journal.css'
import api from '../services/api'

const Journal: React.FC = () => {
  const [items, setItems] = useState<any[]>([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  const load = async () => {
    try {
      const data = await api.journalApi.list()
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
      await api.journalApi.create({ title, content, date: new Date().toISOString() })
      setTitle('')
      setContent('')
      load()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await api.journalApi.remove(id)
      load()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="journal-page">
      <h2>Journal</h2>
      <div>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
        <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Content" />
        <button onClick={handleAdd}>Add</button>
      </div>
      <div className="journal-list">
        {items.length === 0 && <p>No entries yet</p>}
        {items.map((it) => (
          <div key={it._id || it.id} className="journal-entry">
            <h4>{it.title}</h4>
            <div>{new Date(it.date).toLocaleString()}</div>
            <p>{it.content}</p>
            <button onClick={() => handleDelete(it._id || it.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Journal
