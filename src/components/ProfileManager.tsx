import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import './ProfileManager.css'

const ProfileManager = () => {
  const { user, updateProfile, changePassword } = useAuth()
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Profile form state
  const [fullName, setFullName] = useState(user?.fullName || '')
  const [email, setEmail] = useState(user?.email || '')
  const [phone, setPhone] = useState(user?.phone || '')

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    const success = await updateProfile({ fullName, email, phone })

    if (success) {
      setMessage({ type: 'success', text: 'Profile updated successfully!' })
      setIsEditingProfile(false)
    } else {
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' })
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match!' })
      return
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters long!' })
      return
    }

    const success = await changePassword(currentPassword, newPassword)

    if (success) {
      setMessage({ type: 'success', text: 'Password changed successfully!' })
      setIsChangingPassword(false)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } else {
      setMessage({ type: 'error', text: 'Current password is incorrect!' })
    }
  }

  return (
    <div className="profile-manager">
      <div className="profile-header">
        <h2>Profile Settings</h2>
      </div>

      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="profile-sections">
        {/* Profile Information Section */}
        <div className="profile-section">
          <div className="section-header">
            <h3>Personal Information</h3>
            {!isEditingProfile && (
              <button onClick={() => setIsEditingProfile(true)} className="edit-button">
                Edit Profile
              </button>
            )}
          </div>

          {!isEditingProfile ? (
            <div className="profile-info">
              <div className="info-item">
                <label>Username:</label>
                <span>{user?.username}</span>
              </div>
              <div className="info-item">
                <label>Full Name:</label>
                <span>{user?.fullName || 'Not set'}</span>
              </div>
              <div className="info-item">
                <label>Email:</label>
                <span>{user?.email}</span>
              </div>
              <div className="info-item">
                <label>Phone:</label>
                <span>{user?.phone || 'Not set'}</span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleProfileUpdate} className="profile-form">
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  value={user?.username}
                  disabled
                  className="disabled-input"
                />
                <small>Username cannot be changed</small>
              </div>

              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter your phone number"
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingProfile(false)
                    setFullName(user?.fullName || '')
                    setEmail(user?.email || '')
                    setPhone(user?.phone || '')
                    setMessage(null)
                  }}
                  className="cancel-button"
                >
                  Cancel
                </button>
                <button type="submit" className="save-button">
                  Save Changes
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Password Change Section */}
        <div className="profile-section">
          <div className="section-header">
            <h3>Change Password</h3>
            {!isChangingPassword && (
              <button onClick={() => setIsChangingPassword(true)} className="edit-button">
                Change Password
              </button>
            )}
          </div>

          {!isChangingPassword ? (
            <div className="password-info">
              <p>Keep your account secure by using a strong password.</p>
              <p className="password-hint">Password must be at least 6 characters long.</p>
            </div>
          ) : (
            <form onSubmit={handlePasswordChange} className="password-form">
              <div className="form-group">
                <label>Current Password *</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  required
                  minLength={6}
                />
              </div>

              <div className="form-group">
                <label>New Password *</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  minLength={6}
                />
              </div>

              <div className="form-group">
                <label>Confirm New Password *</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                  minLength={6}
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => {
                    setIsChangingPassword(false)
                    setCurrentPassword('')
                    setNewPassword('')
                    setConfirmPassword('')
                    setMessage(null)
                  }}
                  className="cancel-button"
                >
                  Cancel
                </button>
                <button type="submit" className="save-button">
                  Update Password
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProfileManager
