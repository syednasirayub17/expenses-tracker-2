import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './AdminDashboard.css'

interface User {
    _id: string
    username: string
    email: string
    fullName?: string
    phone?: string
    role: 'user' | 'admin'
    isActive: boolean
    twoFactorEnabled: boolean
    createdAt: string
    updatedAt: string
    stats?: {
        accountCount: number
        transactionCount: number
        lastLogin: string
    }
}

interface SystemSettings {
    signupEnabled: boolean
    maintenanceMode: boolean
    maxUsersAllowed: number
    allowedDomains: string[]
}

interface SystemStats {
    totalUsers: number
    activeUsers: number
    inactiveUsers: number
    adminUsers: number
    regularUsers: number
    totalAccounts: number
    totalTransactions: number
    recentUsers: any[]
}

const AdvancedAdminDashboard = () => {
    const navigate = useNavigate()
    const [users, setUsers] = useState<User[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [activeTab, setActiveTab] = useState<'users' | 'settings' | 'create'>('users')
    const [stats, setStats] = useState<SystemStats>({
        totalUsers: 0,
        activeUsers: 0,
        inactiveUsers: 0,
        adminUsers: 0,
        regularUsers: 0,
        totalAccounts: 0,
        totalTransactions: 0,
        recentUsers: []
    })
    const [settings, setSettings] = useState<SystemSettings>({
        signupEnabled: true,
        maintenanceMode: false,
        maxUsersAllowed: 1000,
        allowedDomains: []
    })
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [showUserModal, setShowUserModal] = useState(false)
    const [loading, setLoading] = useState(false)

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

    const getToken = () => {
        const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}')
        const userToken = localStorage.getItem('token')
        return adminUser.token || userToken || ''
    }

    useEffect(() => {
        const isAdmin = localStorage.getItem('isAdminAuthenticated') || localStorage.getItem('token')
        if (!isAdmin) {
            navigate('/admin/login')
            return
        }

        loadData()
    }, [navigate])

    const loadData = async () => {
        await Promise.all([loadUsers(), loadStats(), loadSettings()])
    }

    const loadUsers = async () => {
        try {
            const response = await fetch(`${API_URL}/api/admin/users`, {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            })

            if (response.status === 403) {
                // User is not admin, redirect to login
                alert('Access denied. Admin privileges required.')
                localStorage.removeItem('isAdminAuthenticated')
                navigate('/admin/login')
                return
            }

            if (response.ok) {
                const data = await response.json()
                setUsers(data.users || data || [])
            }
        } catch (error) {
            console.error('Error loading users:', error)
        }
    }

    const loadStats = async () => {
        try {
            const response = await fetch(`${API_URL}/api/admin/stats`, {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            })

            if (response.status === 403) {
                // User is not admin, redirect to login
                return
            }

            if (response.ok) {
                const data = await response.json()
                setStats(data.stats || data)
            }
        } catch (error) {
            console.error('Error loading stats:', error)
        }
    }

    const loadSettings = async () => {
        try {
            const response = await fetch(`${API_URL}/api/admin/settings`, {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            })

            if (response.status === 403) {
                // User is not admin, redirect to login
                return
            }

            if (response.ok) {
                const data = await response.json()
                setSettings(data.settings || data)
            }
        } catch (error) {
            console.error('Error loading settings:', error)
        }
    }

    const handleToggleSignup = async () => {
        setLoading(true)
        try {
            const response = await fetch(`${API_URL}/api/admin/settings`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${getToken()}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...settings,
                    signupEnabled: !settings.signupEnabled
                })
            })

            if (response.ok) {
                const data = await response.json()
                setSettings(data.settings)
                alert(`Signup ${!settings.signupEnabled ? 'enabled' : 'disabled'} successfully!`)
            }
        } catch (error) {
            alert('Failed to update signup status')
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateSettings = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const response = await fetch(`${API_URL}/api/admin/settings`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${getToken()}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(settings)
            })

            if (response.ok) {
                const data = await response.json()
                setSettings(data.settings)
                alert('Settings updated successfully!')
            }
        } catch (error) {
            alert('Failed to update settings')
        } finally {
            setLoading(false)
        }
    }

    const handleToggleUserRole = async (userId: string, currentRole: string) => {
        const newRole = currentRole === 'admin' ? 'user' : 'admin'
        try {
            const response = await fetch(`${API_URL}/api/admin/users/${userId}/role`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${getToken()}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ role: newRole })
            })

            if (response.ok) {
                await loadUsers()
                alert(`User role updated to ${newRole}`)
            } else {
                const error = await response.json()
                alert(error.message || 'Failed to update role')
            }
        } catch (error) {
            alert('Failed to update user role')
        }
    }

    const handleToggleUserStatus = async (userId: string) => {
        try {
            const response = await fetch(`${API_URL}/api/admin/users/${userId}/toggle-status`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${getToken()}` }
            })

            if (response.ok) {
                await loadUsers()
                alert('User status updated')
            } else {
                const error = await response.json()
                alert(error.message || 'Failed to update status')
            }
        } catch (error) {
            alert('Failed to toggle user status')
        }
    }

    const handleDeleteUser = async (userId: string) => {
        if (!window.confirm('Are you sure you want to delete this user? All their data will be permanently deleted.')) {
            return
        }

        try {
            const response = await fetch(`${API_URL}/api/admin/users/${userId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${getToken()}` }
            })

            if (response.ok) {
                await loadData()
                alert('User deleted successfully')
            } else {
                const error = await response.json()
                alert(error.message || 'Failed to delete user')
            }
        } catch (error) {
            alert('Failed to delete user')
        }
    }

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget as HTMLFormElement)
        
        setLoading(true)
        try {
            const response = await fetch(`${API_URL}/api/admin/users`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${getToken()}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: formData.get('username'),
                    email: formData.get('email'),
                    password: formData.get('password'),
                    fullName: formData.get('fullName'),
                    phone: formData.get('phone'),
                    role: formData.get('role')
                })
            })

            if (response.ok) {
                await loadData()
                alert('User created successfully!')
                ;(e.target as HTMLFormElement).reset()
            } else {
                const error = await response.json()
                alert(error.message || 'Failed to create user')
            }
        } catch (error) {
            alert('Failed to create user')
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = () => {
        localStorage.removeItem('adminUser')
        localStorage.removeItem('isAdminAuthenticated')
        navigate('/admin/login')
    }

    const filteredUsers = users.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.fullName && user.fullName.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    return (
        <div className="admin-dashboard">
            <header className="admin-header">
                <div className="admin-header-content">
                    <div>
                        <h1>🔐 Advanced Admin Panel</h1>
                        <p>Complete System Administration</p>
                    </div>
                    <button onClick={handleLogout} className="admin-logout-btn">
                        Logout
                    </button>
                </div>
            </header>

            <div className="admin-content">
                {/* Stats Overview */}
                <div className="admin-stats-grid">
                    <div className="admin-stat-card">
                        <div className="stat-icon">👥</div>
                        <div className="stat-info">
                            <h3>Total Users</h3>
                            <p className="stat-value">{stats.totalUsers}</p>
                            <span className="stat-subtitle">{stats.adminUsers} admins</span>
                        </div>
                    </div>
                    <div className="admin-stat-card">
                        <div className="stat-icon">✅</div>
                        <div className="stat-info">
                            <h3>Active Users</h3>
                            <p className="stat-value">{stats.activeUsers}</p>
                            <span className="stat-subtitle">{stats.inactiveUsers} inactive</span>
                        </div>
                    </div>
                    <div className="admin-stat-card">
                        <div className="stat-icon">💳</div>
                        <div className="stat-info">
                            <h3>Total Accounts</h3>
                            <p className="stat-value">{stats.totalAccounts}</p>
                        </div>
                    </div>
                    <div className="admin-stat-card">
                        <div className="stat-icon">📊</div>
                        <div className="stat-info">
                            <h3>Transactions</h3>
                            <p className="stat-value">{stats.totalTransactions}</p>
                        </div>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="admin-tabs">
                    <button 
                        className={activeTab === 'users' ? 'active' : ''}
                        onClick={() => setActiveTab('users')}
                    >
                        👥 User Management
                    </button>
                    <button 
                        className={activeTab === 'create' ? 'active' : ''}
                        onClick={() => setActiveTab('create')}
                    >
                        ➕ Create User
                    </button>
                    <button 
                        className={activeTab === 'settings' ? 'active' : ''}
                        onClick={() => setActiveTab('settings')}
                    >
                        ⚙️ System Settings
                    </button>
                </div>

                {/* User Management Tab */}
                {activeTab === 'users' && (
                    <div className="admin-section">
                        <div className="section-header">
                            <h2>User Management</h2>
                            <input
                                type="text"
                                className="admin-search"
                                placeholder="Search users..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="users-table-container">
                            <table className="users-table">
                                <thead>
                                    <tr>
                                        <th>Username</th>
                                        <th>Email</th>
                                        <th>Full Name</th>
                                        <th>Role</th>
                                        <th>Status</th>
                                        <th>2FA</th>
                                        <th>Stats</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map((user) => (
                                        <tr key={user._id}>
                                            <td className="user-name">{user.username}</td>
                                            <td>{user.email}</td>
                                            <td>{user.fullName || '-'}</td>
                                            <td>
                                                <span className={`role-badge ${user.role}`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                                                    {user.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td>
                                                {user.twoFactorEnabled ? '🔒' : '🔓'}
                                            </td>
                                            <td className="user-stats">
                                                {user.stats ? (
                                                    <span title={`Accounts: ${user.stats.accountCount}, Transactions: ${user.stats.transactionCount}`}>
                                                        📊 {user.stats.accountCount}/{user.stats.transactionCount}
                                                    </span>
                                                ) : '-'}
                                            </td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button
                                                        className="btn-role"
                                                        onClick={() => handleToggleUserRole(user._id, user.role)}
                                                        title="Toggle Role"
                                                    >
                                                        👤
                                                    </button>
                                                    <button
                                                        className="btn-toggle"
                                                        onClick={() => handleToggleUserStatus(user._id)}
                                                        title="Toggle Status"
                                                    >
                                                        {user.isActive ? '🔴' : '🟢'}
                                                    </button>
                                                    <button
                                                        className="btn-delete"
                                                        onClick={() => handleDeleteUser(user._id)}
                                                        title="Delete User"
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Create User Tab */}
                {activeTab === 'create' && (
                    <div className="admin-section">
                        <h2>Create New User</h2>
                        <form onSubmit={handleCreateUser} className="create-user-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Username *</label>
                                    <input type="text" name="username" required />
                                </div>
                                <div className="form-group">
                                    <label>Email *</label>
                                    <input type="email" name="email" required />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Password *</label>
                                    <input type="password" name="password" required minLength={6} />
                                </div>
                                <div className="form-group">
                                    <label>Role *</label>
                                    <select name="role" required>
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Full Name</label>
                                    <input type="text" name="fullName" />
                                </div>
                                <div className="form-group">
                                    <label>Phone</label>
                                    <input type="tel" name="phone" />
                                </div>
                            </div>
                            <button type="submit" className="btn-create" disabled={loading}>
                                {loading ? 'Creating...' : '✨ Create User'}
                            </button>
                        </form>
                    </div>
                )}

                {/* System Settings Tab */}
                {activeTab === 'settings' && (
                    <div className="admin-section">
                        <h2>System Settings</h2>
                        
                        {/* Quick Toggle */}
                        <div className="settings-quick-toggle">
                            <div className="toggle-card">
                                <div className="toggle-info">
                                    <h3>🔐 User Signup</h3>
                                    <p>Allow new users to register</p>
                                    <span className={`toggle-status ${settings.signupEnabled ? 'enabled' : 'disabled'}`}>
                                        {settings.signupEnabled ? '✅ Enabled' : '❌ Disabled'}
                                    </span>
                                </div>
                                <button 
                                    className={`toggle-btn ${settings.signupEnabled ? 'active' : ''}`}
                                    onClick={handleToggleSignup}
                                    disabled={loading}
                                >
                                    {loading ? '⏳' : settings.signupEnabled ? 'Disable' : 'Enable'}
                                </button>
                            </div>
                        </div>

                        {/* Detailed Settings Form */}
                        <form onSubmit={handleUpdateSettings} className="settings-form">
                            <div className="form-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={settings.signupEnabled}
                                        onChange={(e) => setSettings({...settings, signupEnabled: e.target.checked})}
                                    />
                                    Enable User Signup
                                </label>
                            </div>
                            <div className="form-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={settings.maintenanceMode}
                                        onChange={(e) => setSettings({...settings, maintenanceMode: e.target.checked})}
                                    />
                                    Maintenance Mode
                                </label>
                            </div>
                            <div className="form-group">
                                <label>Maximum Users Allowed</label>
                                <input
                                    type="number"
                                    value={settings.maxUsersAllowed}
                                    onChange={(e) => setSettings({...settings, maxUsersAllowed: parseInt(e.target.value)})}
                                    min={1}
                                />
                            </div>
                            <button type="submit" className="btn-save" disabled={loading}>
                                {loading ? 'Saving...' : '💾 Save Settings'}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    )
}

export default AdvancedAdminDashboard
