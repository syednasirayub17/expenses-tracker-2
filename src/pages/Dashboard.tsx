import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from '../context/AuthContext'
import DashboardOverview from '../components/DashboardOverview'
import CashInHandManager from '../components/CashInHandManager'
import BankAccountManager from '../components/BankAccountManager'
import CreditCardManager from '../components/CreditCardManager'
import LoanManager from '../components/LoanManager'
import Reports from '../components/Reports'
import BudgetManager from '../components/BudgetManager'
import SavingsManager from '../components/SavingsManager'
import ExportManager from '../components/ExportManager'
import ProfileManager from '../components/ProfileManager'
import SettingsManager from '../components/SettingsManager'
import InvestmentDashboard from '../components/InvestmentDashboard'
import SharedWalletDashboard from '../components/SharedWalletDashboard'
import ActivityLogs from '../components/ActivityLogs'
import SecuritySettings from '../components/SecuritySettings'
import './Dashboard.css'

type TabType = 'overview' | 'cash' | 'bank' | 'creditCard' | 'loan' | 'reports' | 'budget' | 'savings' | 'investments' | 'wallets' | 'activity' | 'security' | 'export' | 'profile' | 'settings'

const Dashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<TabType>('overview')

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const tabs = [
    { id: 'overview' as TabType, label: 'Overview', icon: '📊' },
    { id: 'cash' as TabType, label: 'Cash in Hand', icon: '💵' },
    { id: 'bank' as TabType, label: 'Bank Accounts', icon: '🏦' },
    { id: 'creditCard' as TabType, label: 'Credit Cards', icon: '💳' },
    { id: 'loan' as TabType, label: 'Loans', icon: '📋' },
    { id: 'reports' as TabType, label: 'Reports', icon: '📈' },
    { id: 'budget' as TabType, label: 'Budget', icon: '💰' },
    { id: 'savings' as TabType, label: 'Savings', icon: '🎯' },
    { id: 'investments' as TabType, label: 'Investments', icon: '📈' },
    { id: 'wallets' as TabType, label: 'Shared Wallets', icon: '👥' },
    { id: 'activity' as TabType, label: 'Activity Logs', icon: '📝' },
    { id: 'security' as TabType, label: 'Security', icon: '🔐' },
    { id: 'export' as TabType, label: 'Export', icon: '📤' },
    { id: 'profile' as TabType, label: 'Profile', icon: '👤' },
    { id: 'settings' as TabType, label: 'Settings', icon: '⚙️' },
  ]

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Expenses Tracker</h1>
          <div className="header-actions">
            <span className="user-name">Welcome, {user?.username}!</span>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
      </header>

      <nav className="dashboard-nav">
        <div className="nav-content">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <main className="dashboard-main">
        {activeTab === 'overview' && <DashboardOverview />}
        {activeTab === 'cash' && <CashInHandManager />}
        {activeTab === 'bank' && <BankAccountManager />}
        {activeTab === 'creditCard' && <CreditCardManager />}
        {activeTab === 'loan' && <LoanManager />}
        {activeTab === 'reports' && <Reports />}
        {activeTab === 'budget' && <BudgetManager />}
        {activeTab === 'savings' && <SavingsManager />}
        {activeTab === 'investments' && <InvestmentDashboard />}
        {activeTab === 'wallets' && <SharedWalletDashboard />}
        {activeTab === 'activity' && <ActivityLogs />}
        {activeTab === 'security' && <SecuritySettings />}
        {activeTab === 'export' && <ExportManager />}
        {activeTab === 'profile' && <ProfileManager />}
        {activeTab === 'settings' && <SettingsManager />}
      </main>
    </div>
  )
}

export default Dashboard
