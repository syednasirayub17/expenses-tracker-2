import React, { createContext, useContext, useState, useEffect } from 'react'

interface User {
  username: string
  email: string
  fullName?: string
  phone?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  register: (username: string, email: string, password: string) => Promise<boolean>
  updateProfile: (updates: Partial<User>) => Promise<boolean>
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>
  resetPassword: (username: string, email: string, newPassword: string) => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check if user is logged in on mount
    const storedUser = localStorage.getItem('user')
    const storedAuth = localStorage.getItem('isAuthenticated')
    if (storedUser && storedAuth === 'true') {
      setUser(JSON.parse(storedUser))
      setIsAuthenticated(true)
    }
  }, [])

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // Try API first, fallback to localStorage
      const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000'
      
      try {
        const response = await fetch(`${API_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        })

        if (response.ok) {
          const data = await response.json()
          const userData = { 
            username: data.username, 
            email: data.email,
            fullName: data.fullName,
            phone: data.phone
          }
          setUser(userData)
          setIsAuthenticated(true)
          localStorage.setItem('user', JSON.stringify(userData))
          localStorage.setItem('isAuthenticated', 'true')
          localStorage.setItem('token', data.token)
          return true
        }
      } catch (apiError) {
        console.log('API not available, using localStorage')
      }

      // Fallback to localStorage
      const users = JSON.parse(localStorage.getItem('users') || '[]')
      const foundUser = users.find(
        (u: any) => u.username === username && u.password === password
      )

      if (foundUser) {
        const userData = { username: foundUser.username, email: foundUser.email }
        setUser(userData)
        setIsAuthenticated(true)
        localStorage.setItem('user', JSON.stringify(userData))
        localStorage.setItem('isAuthenticated', 'true')
        return true
      }
      return false
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  const register = async (username: string, email: string, password: string): Promise<boolean> => {
    try {
      // Try API first, fallback to localStorage
      const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000'
      
      try {
        const response = await fetch(`${API_URL}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, email, password })
        })

        if (response.ok) {
          const data = await response.json()
          const userData = { 
            username: data.username, 
            email: data.email,
            fullName: data.fullName,
            phone: data.phone
          }
          setUser(userData)
          setIsAuthenticated(true)
          localStorage.setItem('user', JSON.stringify(userData))
          localStorage.setItem('isAuthenticated', 'true')
          localStorage.setItem('token', data.token)
          return true
        } else {
          return false
        }
      } catch (apiError) {
        console.log('API not available, using localStorage')
      }

      // Fallback to localStorage
      const users = JSON.parse(localStorage.getItem('users') || '[]')
      
      if (users.some((u: any) => u.username === username)) {
        return false
      }

      const newUser = { username, email, password }
      users.push(newUser)
      localStorage.setItem('users', JSON.stringify(users))

      const userData = { username, email }
      setUser(userData)
      setIsAuthenticated(true)
      localStorage.setItem('user', JSON.stringify(userData))
      localStorage.setItem('isAuthenticated', 'true')
      return true
    } catch (error) {
      console.error('Registration error:', error)
      return false
    }
  }

  const updateProfile = async (updates: Partial<User>): Promise<boolean> => {
    if (!user) return false

    try {
      const users = JSON.parse(localStorage.getItem('users') || '[]')
      const userIndex = users.findIndex((u: any) => u.username === user.username)

      if (userIndex === -1) return false

      // Update user data
      users[userIndex] = { ...users[userIndex], ...updates }
      localStorage.setItem('users', JSON.stringify(users))

      // Update current user state
      const updatedUser = { ...user, ...updates }
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))

      return true
    } catch (error) {
      console.error('Error updating profile:', error)
      return false
    }
  }

  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    if (!user) return false

    try {
      const users = JSON.parse(localStorage.getItem('users') || '[]')
      const userIndex = users.findIndex(
        (u: any) => u.username === user.username && u.password === currentPassword
      )

      if (userIndex === -1) return false

      users[userIndex].password = newPassword
      localStorage.setItem('users', JSON.stringify(users))

      return true
    } catch (error) {
      console.error('Error changing password:', error)
      return false
    }
  }

  const resetPassword = async (username: string, email: string, newPassword: string): Promise<boolean> => {
    try {
      const users = JSON.parse(localStorage.getItem('users') || '[]')
      const userIndex = users.findIndex(
        (u: any) => u.username === username && u.email === email
      )

      if (userIndex === -1) return false

      users[userIndex].password = newPassword
      localStorage.setItem('users', JSON.stringify(users))

      return true
    } catch (error) {
      console.error('Error resetting password:', error)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem('user')
    localStorage.removeItem('isAuthenticated')
    // Note: Account data is kept in localStorage and will persist across logins
    // This allows data to be available when user logs back in
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, register, updateProfile, changePassword, resetPassword }}>
      {children}
    </AuthContext.Provider>
  )
}

