import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import TwoFactorVerify from '../components/TwoFactorVerify'
import './Login.css'

const Login = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [show2FA, setShow2FA] = useState(false)
  const [userId2FA, setUserId2FA] = useState('')
  const { login, complete2FALogin, register, resetPassword } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (isForgotPassword) {
      // Handle password reset
      if (!username || !email || !password || !confirmPassword) {
        setError('All fields are required')
        return
      }

      if (password !== confirmPassword) {
        setError('Passwords do not match')
        return
      }

      if (password.length < 6) {
        setError('Password must be at least 6 characters long')
        return
      }

      const resetSuccess = await resetPassword(username, email, password)
      if (resetSuccess) {
        setSuccess('Password reset successfully! You can now login.')
        setTimeout(() => {
          setIsForgotPassword(false)
          setIsLogin(true)
          setPassword('')
          setConfirmPassword('')
          setSuccess('')
        }, 2000)
      } else {
        setError('Invalid username or email')
      }
      return
    }

    if (isLogin) {
      const result = await login(username, password)
      if (result === true) {
        navigate('/dashboard')
      } else if (typeof result === 'object' && result.requires2FA) {
        // Show 2FA verification
        setUserId2FA(result.userId)
        setShow2FA(true)
      } else {
        setError('Invalid username or password')
      }
    } else {
      if (!username || !email || !password) {
        setError('All fields are required')
        return
      }
      const success = await register(username, email, password)
      if (success) {
        navigate('/dashboard')
      } else {
        setError('Username already exists')
      }
    }
  }

  const handle2FASuccess = async (userId: string) => {
    const success = await complete2FALogin(userId)
    if (success) {
      navigate('/dashboard')
    } else {
      setError('2FA verification failed')
      setShow2FA(false)
    }
  }

  const handle2FACancel = () => {
    setShow2FA(false)
    setUserId2FA('')
    setPassword('')
  }

  if (show2FA) {
    return <TwoFactorVerify userId={userId2FA} onSuccess={handle2FASuccess} onCancel={handle2FACancel} />
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Expenses Tracker</h1>
        <h2 className="login-subtitle">
          {isForgotPassword ? 'Reset Password' : isLogin ? 'Login' : 'Sign Up'}
        </h2>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Enter your username"
            />
          </div>

          {(!isLogin || isForgotPassword) && (
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="password">
              {isForgotPassword ? 'New Password' : 'Password'}
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder={isForgotPassword ? 'Enter new password' : 'Enter your password'}
              minLength={6}
            />
          </div>

          {isForgotPassword && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Confirm new password"
                minLength={6}
              />
            </div>
          )}

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <button type="submit" className="submit-button">
            {isForgotPassword ? 'Reset Password' : isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>

        {!isForgotPassword && (
          <>
            {isLogin && (
              <div className="forgot-password-link">
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(true)
                    setError('')
                    setSuccess('')
                    setPassword('')
                    setConfirmPassword('')
                  }}
                  className="link-button"
                >
                  Forgot Password?
                </button>
              </div>
            )}

            <div className="toggle-form">
              <p>
                {isLogin ? "Don't have an account? " : 'Already have an account? '}
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin)
                    setError('')
                    setSuccess('')
                    setUsername('')
                    setEmail('')
                    setPassword('')
                    setConfirmPassword('')
                  }}
                  className="toggle-button"
                >
                  {isLogin ? 'Sign Up' : 'Login'}
                </button>
              </p>
            </div>
          </>
        )}

        {isForgotPassword && (
          <div className="back-to-login">
            <button
              type="button"
              onClick={() => {
                setIsForgotPassword(false)
                setError('')
                setSuccess('')
                setUsername('')
                setEmail('')
                setPassword('')
                setConfirmPassword('')
              }}
              className="link-button"
            >
              ← Back to Login
            </button>
          </div>
        )}
      </div>
    </div >
  )
}

export default Login
