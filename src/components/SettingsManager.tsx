import { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'
import { UserPreferences } from '../types'
import './SettingsManager.css'

const CURRENCIES = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
]

const SettingsManager = () => {
  const { theme, toggleTheme } = useTheme()
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    const stored = localStorage.getItem('userPreferences')
    if (stored) {
      return JSON.parse(stored)
    }
    return {
      currency: 'INR',
      currencySymbol: '₹',
      dateFormat: 'DD/MM/YYYY' as const,
      theme: 'light' as const,
      notifications: true,
      emailNotifications: false,
      budgetAlerts: true,
      reminderDays: 3,
    }
  })

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    localStorage.setItem('userPreferences', JSON.stringify(preferences))
  }, [preferences])

  const handleCurrencyChange = (currencyCode: string) => {
    const currency = CURRENCIES.find((c) => c.code === currencyCode)
    if (currency) {
      setPreferences({
        ...preferences,
        currency: currency.code,
        currencySymbol: currency.symbol,
      })
      setMessage({ type: 'success', text: `Currency changed to ${currency.name}` })
      setTimeout(() => setMessage(null), 3000)
    }
  }

  const handleSave = () => {
    localStorage.setItem('userPreferences', JSON.stringify(preferences))
    setMessage({ type: 'success', text: 'Settings saved successfully!' })
    setTimeout(() => setMessage(null), 3000)
  }

  return (
    <div className="settings-manager">
      <div className="settings-header">
        <h2>Settings</h2>
      </div>

      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="settings-sections">
        {/* Appearance Settings */}
        <div className="settings-section">
          <h3>Appearance</h3>
          <div className="setting-item">
            <div className="setting-info">
              <label>Theme</label>
              <p>Choose your preferred color theme</p>
            </div>
            <div className="setting-control">
              <button
                onClick={() => {
                  toggleTheme()
                  setPreferences({ ...preferences, theme: theme === 'light' ? 'dark' : 'light' })
                }}
                className="theme-toggle"
              >
                {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
              </button>
            </div>
          </div>
        </div>

        {/* Currency Settings */}
        <div className="settings-section">
          <h3>Currency & Regional</h3>
          <div className="setting-item">
            <div className="setting-info">
              <label>Currency</label>
              <p>Select your preferred currency</p>
            </div>
            <div className="setting-control">
              <select
                value={preferences.currency}
                onChange={(e) => handleCurrencyChange(e.target.value)}
                className="currency-select"
              >
                {CURRENCIES.map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.symbol} {currency.name} ({currency.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <label>Date Format</label>
              <p>Choose how dates are displayed</p>
            </div>
            <div className="setting-control">
              <select
                value={preferences.dateFormat}
                onChange={(e) => setPreferences({ ...preferences, dateFormat: e.target.value as any })}
                className="date-format-select"
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY (31/12/2024)</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY (12/31/2024)</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD (2024-12-31)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="settings-section">
          <h3>Notifications & Alerts</h3>
          <div className="setting-item">
            <div className="setting-info">
              <label>Enable Notifications</label>
              <p>Receive in-app notifications</p>
            </div>
            <div className="setting-control">
              <label className="switch">
                <input
                  type="checkbox"
                  checked={preferences.notifications}
                  onChange={(e) => setPreferences({ ...preferences, notifications: e.target.checked })}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <label>Email Notifications</label>
              <p>Receive notifications via email</p>
            </div>
            <div className="setting-control">
              <label className="switch">
                <input
                  type="checkbox"
                  checked={preferences.emailNotifications}
                  onChange={(e) => setPreferences({ ...preferences, emailNotifications: e.target.checked })}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <label>Budget Alerts</label>
              <p>Get notified when approaching budget limits</p>
            </div>
            <div className="setting-control">
              <label className="switch">
                <input
                  type="checkbox"
                  checked={preferences.budgetAlerts}
                  onChange={(e) => setPreferences({ ...preferences, budgetAlerts: e.target.checked })}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <label>Reminder Days Before Due</label>
              <p>Days before bill/EMI due date to send reminder</p>
            </div>
            <div className="setting-control">
              <input
                type="number"
                min="1"
                max="30"
                value={preferences.reminderDays}
                onChange={(e) => setPreferences({ ...preferences, reminderDays: parseInt(e.target.value) })}
                className="reminder-input"
              />
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="settings-section">
          <h3>Data Management</h3>
          <div className="setting-item">
            <div className="setting-info">
              <label>Export All Data</label>
              <p>Download all your data as JSON</p>
            </div>
            <div className="setting-control">
              <button
                onClick={() => {
                  const data = {
                    bankAccounts: JSON.parse(localStorage.getItem('bankAccounts') || '[]'),
                    creditCards: JSON.parse(localStorage.getItem('creditCards') || '[]'),
                    loans: JSON.parse(localStorage.getItem('loans') || '[]'),
                    transactions: JSON.parse(localStorage.getItem('transactions') || '[]'),
                    budgets: JSON.parse(localStorage.getItem('budgets') || '[]'),
                    savings: JSON.parse(localStorage.getItem('savings') || '[]'),
                  }
                  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `expense-tracker-backup-${new Date().toISOString()}.json`
                  a.click()
                  setMessage({ type: 'success', text: 'Data exported successfully!' })
                  setTimeout(() => setMessage(null), 3000)
                }}
                className="export-button"
              >
                📥 Export Data
              </button>
            </div>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <label>Clear All Data</label>
              <p className="danger-text">This action cannot be undone</p>
            </div>
            <div className="setting-control">
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete all data? This cannot be undone!')) {
                    if (window.confirm('This will permanently delete ALL your data. Are you absolutely sure?')) {
                      localStorage.clear()
                      window.location.reload()
                    }
                  }
                }}
                className="danger-button"
              >
                🗑️ Clear All Data
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="settings-footer">
        <button onClick={handleSave} className="save-button">
          Save All Settings
        </button>
      </div>
    </div>
  )
}

export default SettingsManager
