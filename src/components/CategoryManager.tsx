import { useState } from 'react'
import { useAccount } from '../context/AccountContext'
import './CategoryManager.css'

interface CategoryManagerProps {
  categoryType: 'expense' | 'income' | 'payment'
  onClose: () => void
  onSelect: (category: string) => void
}

const CategoryManager = ({ categoryType, onClose, onSelect }: CategoryManagerProps) => {
  const { categories, addCategory, deleteCategory } = useAccount()
  const [isAdding, setIsAdding] = useState(false)
  const [newCategory, setNewCategory] = useState('')

  const typeCategories = categories[categoryType] || []

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault()
    if (newCategory.trim()) {
      addCategory(categoryType, newCategory.trim())
      setNewCategory('')
      setIsAdding(false)
    }
  }

  const handleDeleteCategory = (category: string) => {
    if (window.confirm(`Delete category "${category}"?`)) {
      deleteCategory(categoryType, category)
    }
  }

  return (
    <div className="category-manager-overlay">
      <div className="category-manager-modal">
        <div className="category-manager-header">
          <h3>Manage {categoryType.charAt(0).toUpperCase() + categoryType.slice(1)} Categories</h3>
          <button onClick={onClose} className="close-button">×</button>
        </div>
        <div className="category-list">
          {typeCategories.map((cat) => (
            <div key={cat} className="category-item">
              <span onClick={() => { onSelect(cat); onClose() }} className="category-name">{cat}</span>
              {!['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Education', 'Salary', 'Other'].includes(cat) && (
                <button onClick={() => handleDeleteCategory(cat)} className="delete-category-btn">×</button>
              )}
            </div>
          ))}
        </div>
        {isAdding ? (
          <form onSubmit={handleAddCategory} className="add-category-form">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Category name"
              autoFocus
            />
            <div className="form-actions">
              <button type="submit" className="save-btn">Add</button>
              <button type="button" onClick={() => { setIsAdding(false); setNewCategory('') }} className="cancel-btn">Cancel</button>
            </div>
          </form>
        ) : (
          <button onClick={() => setIsAdding(true)} className="add-category-button">+ Add Category</button>
        )}
      </div>
    </div>
  )
}

export default CategoryManager

