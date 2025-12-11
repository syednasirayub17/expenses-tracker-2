import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { AccountProvider } from './context/AccountContext'
import { ThemeProvider } from './context/ThemeContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import AdminLogin from './pages/AdminLogin'
import AdvancedAdminDashboard from './pages/Admin/AdvancedAdminDashboard'
import './App.css'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const isAdminAuthenticated = localStorage.getItem('isAdminAuthenticated')
  return isAdminAuthenticated ? <>{children}</> : <Navigate to="/admin/login" />
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AccountProvider>
          <Router>
            <Routes>
              {/* User Routes */}
              <Route path="/login" element={<Login />} />
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />

              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route
                path="/admin/dashboard"
                element={
                  <AdminRoute>
                    <AdvancedAdminDashboard />
                  </AdminRoute>
                }
              />

              <Route path="/" element={<Navigate to="/dashboard" />} />
            </Routes>
          </Router>
        </AccountProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
