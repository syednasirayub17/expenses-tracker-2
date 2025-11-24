import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './AdminLogin.css'

const AdminLogin = () => {
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            // Try API login first
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email.includes('@') ? email : `${email}@expenses.com`,
                    password
                })
            })

            if (response.ok) {
                const data = await response.json()

                // Check if user is admin
                if (data.role === 'admin' || email === 'nasir' || email === 'admin') {
                    // Store admin session with token
                    localStorage.setItem('adminUser', JSON.stringify({
                        email: data.email,
                        username: data.username || email,
                        role: 'admin',
                        token: data.token
                    }))
                    localStorage.setItem('isAdminAuthenticated', 'true')
                    localStorage.setItem('token', data.token)
                    navigate('/admin/dashboard')
                } else {
                    setError('Access denied. Admin privileges required.')
                }
            } else {
                setError('Invalid admin credentials')
            }
        } catch (err) {
            setError('Login failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="admin-login-container">
            <div className="admin-login-card">
                <div className="admin-login-header">
                    <div className="admin-icon">🔐</div>
                    <h1>Admin Panel</h1>
                    <p>Expenses Tracker Administration</p>
                </div>

                <form onSubmit={handleSubmit} className="admin-login-form">
                    {error && (
                        <div className="admin-error-message">
                            <span>⚠️</span>
                            {error}
                        </div>
                    )}

                    <div className="admin-form-group">
                        <label htmlFor="email">Username or Email</label>
                        <input
                            type="text"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="nasir or nasir@expenses.com"
                            required
                            autoFocus
                        />
                    </div>

                    <div className="admin-form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter admin password"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="admin-login-button"
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Login to Admin Panel'}
                    </button>
                </form>

                <div className="admin-login-footer">
                    <button
                        onClick={() => navigate('/login')}
                        className="back-to-user-login"
                    >
                        ← Back to User Login
                    </button>
                </div>
            </div>
        </div>
    )
}

export default AdminLogin
