import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './AdminDashboard.css'

interface User {
    id: string
    username: string
    email: string
    createdAt: string
    lastLogin?: string
    isActive: boolean
}

const AdminDashboard = () => {
    const navigate = useNavigate()
    const [users, setUsers] = useState<User[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeUsers: 0,
        totalTransactions: 0,
        totalAccounts: 0
    })

    useEffect(() => {
        // Check if admin is authenticated
        const isAdmin = localStorage.getItem('isAdminAuthenticated')
        if (!isAdmin) {
            navigate('/admin/login')
            return
        }

        // Load users from localStorage (in production, fetch from API)
        loadUsers()
        calculateStats()
    }, [navigate])

    const loadUsers = () => {
        const storedUsers = JSON.parse(localStorage.getItem('users') || '[]')
        const usersWithStatus = storedUsers.map((user: any) => ({
            ...user,
            isActive: true,
            createdAt: user.createdAt || new Date().toISOString()
        }))
        setUsers(usersWithStatus)
    }

    const calculateStats = () => {
        const storedUsers = JSON.parse(localStorage.getItem('users') || '[]')
        const allTransactions = JSON.parse(localStorage.getItem('transactions') || '[]')
        const allAccounts = JSON.parse(localStorage.getItem('bankAccounts') || '[]')

        setStats({
            totalUsers: storedUsers.length,
            activeUsers: storedUsers.length,
            totalTransactions: allTransactions.length,
            totalAccounts: allAccounts.length
        })
    }

    const handleLogout = () => {
        localStorage.removeItem('adminUser')
        localStorage.removeItem('isAdminAuthenticated')
        navigate('/admin/login')
    }

    const handleDeleteUser = (userId: string) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            const updatedUsers = users.filter(u => u.id !== userId)
            setUsers(updatedUsers)
            localStorage.setItem('users', JSON.stringify(updatedUsers))
            calculateStats()
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
                                        <tr key={user.id}>
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
                                                        onClick={() => handleDeleteUser(user.id)}
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
