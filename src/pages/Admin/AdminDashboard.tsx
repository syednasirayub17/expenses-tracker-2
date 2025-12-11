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

const AdminDashboard = () => {
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
    const [showCreateModal, setShowCreateModal] = useState(false)

    useEffect(() => {
        // Check if admin is authenticated
        const isAdmin = localStorage.getItem('isAdminAuthenticated')
        if (!isAdmin) {
            navigate('/admin/login')
            return
        }

        // Load users from API
        loadUsers()
        loadStats()
    }, [navigate])

    const loadUsers = async () => {
        try {
            const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}')
            const token = adminUser.token || localStorage.getItem('token')

            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/users`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.ok) {
                const data = await response.json()
                setUsers(data)
            } else {
                console.error('Failed to load users')
            }
        } catch (error) {
            console.error('Error loading users:', error)
        }
    }

    const loadStats = async () => {
        try {
            const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}')
            const token = adminUser.token || localStorage.getItem('token')

            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/stats`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.ok) {
                const data = await response.json()
                setStats({
                    totalUsers: data.totalUsers,
                    activeUsers: data.activeUsers,
                    totalTransactions: data.totalTransactions,
                    totalAccounts: data.totalAccounts
                })
            } else {
                console.error('Failed to load stats')
            }
        } catch (error) {
            console.error('Error loading stats:', error)
        }
    }

    const handleLogout = () => {
        localStorage.removeItem('adminUser')
        localStorage.removeItem('isAdminAuthenticated')
        navigate('/admin/login')
    }

    const handleDeleteUser = async (userId: string) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}')
                const token = adminUser.token || localStorage.getItem('token')

                const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/users/${userId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })

                if (response.ok) {
                    // Reload users after deletion
                    loadUsers()
                    loadStats()
                } else {
                    const error = await response.json()
                    alert(error.message || 'Failed to delete user')
                }
            } catch (error) {
                console.error('Error deleting user:', error)
                alert('Failed to delete user')
            }
        }
    }

    const filteredUsers = users.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="admin-dashboard">
            <header className="admin-header">
                <div className="admin-header-content">
                    <div>
                        <h1>🔐 Admin Panel</h1>
                        <p>Expenses Tracker Administration</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <span style={{ fontSize: '14px', opacity: 0.9 }}>
                            Welcome, {JSON.parse(localStorage.getItem('adminUser') || '{}').username || 'Admin'}
                        </span>
                        <button onClick={handleLogout} className="admin-logout-btn">
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <div className="admin-content">
                {/* Stats Cards */}
                <div className="admin-stats-grid">
                    <div className="admin-stat-card">
                        <div className="stat-icon">👥</div>
                        <div className="stat-info">
                            <h3>Total Users</h3>
                            <p className="stat-value">{stats.totalUsers}</p>
                        </div>
                    </div>

                    <div className="admin-stat-card">
                        <div className="stat-icon">✅</div>
                        <div className="stat-info">
                            <h3>Active Users</h3>
                            <p className="stat-value">{stats.activeUsers}</p>
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

                {/* User Management */}
                <div className="admin-section">
                    <div className="section-header">
                        <h2>User Management</h2>
                        <div className="search-box">
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="users-table-container">
                        <table className="users-table">
                            <thead>
                                <tr>
                                    <th>Username</th>
                                    <th>Email</th>
                                    <th>Created At</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="no-users">
                                            No users found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <tr key={user._id}>
                                            <td className="user-name">{user.username}</td>
                                            <td>{user.email}</td>
                                            <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                            <td>
                                                <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                                                    {user.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button className="btn-view" title="View Details">
                                                        👁️
                                                    </button>
                                                    <button className="btn-edit" title="Edit User">
                                                        ✏️
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
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AdminDashboard
