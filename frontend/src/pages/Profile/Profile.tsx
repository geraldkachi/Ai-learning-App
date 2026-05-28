/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { 
  User, 
  Mail, 
  LogOut, 
  Eye, 
  EyeOff,
  Save,
  ArrowLeft,
  Loader2,
  CheckCircle,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import authService from '../../services/authService'

const Profile: React.FC = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const response = await authService.changePassword({currentPassword: data.currentPassword, newPassword: data.newPassword})
      return response
    },
    onSuccess: (data) => {
      toast.success(data?.message || 'Password changed successfully!')
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || error?.error || 'Failed to change password')
    },
  })

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmitPasswordChange = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!passwordData.currentPassword) {
      toast.error('Please enter your current password')
      return
    }
    
    if (!passwordData.newPassword) {
      toast.error('Please enter a new password')
      return
    }
    
    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters')
      return
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }
    
    changePasswordMutation.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    })
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
    toast.success('Logged out successfully')
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-emerald-600 hover:text-emerald-700 mb-4 inline-flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <h1 className="text-3xl font-bold text-slate-800">Profile Settings</h1>
        <p className="text-slate-500 mt-1">Manage your account settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Information Card */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="px-6 py-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-800">User Information</h2>
            <p className="text-sm text-slate-500">Your personal account information</p>
          </div>
          
          <div className="p-6 space-y-4">
            {/* Username */}
            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/50">
              <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="flex-1">
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Username</label>
                <p className="text-slate-800 font-medium mt-0.5">{user?.username|| 'Not set'}</p>
              </div>
            </div>
            
            {/* Email */}
            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/50">
              <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="flex-1">
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Email Address</label>
                <p className="text-slate-800 font-medium mt-0.5">{user?.email || 'Not set'}</p>
              </div>
            </div>
            
            {/* Member Since */}
            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/50">
              <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="flex-1">
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Member Since</label>
                <p className="text-slate-800 font-medium mt-0.5">
                  {user?.createdAt 
                    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                    : 'Not available'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Change Password Card */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="px-6 py-4 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-800">Change Password</h2>
            <p className="text-sm text-slate-500">Update your password to keep your account secure</p>
          </div>
          
          <form onSubmit={handleSubmitPasswordChange} className="p-6 space-y-4">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter current password"
                  className="w-full px-4 py-2.5 pr-10 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter new password (min. 6 characters)"
                  className="w-full px-4 py-2.5 pr-10 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-1">Password must be at least 6 characters</p>
            </div>
            
            {/* Confirm New Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Confirm new password"
                  className="w-full px-4 py-2.5 pr-10 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
            {/* Password strength indicator */}
            {passwordData.newPassword && (
              <div className="mt-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${
                        passwordData.newPassword.length < 6 ? 'w-1/3 bg-red-500' :
                        passwordData.newPassword.length < 8 ? 'w-2/3 bg-yellow-500' :
                        'w-full bg-green-500'
                      }`}
                    />
                  </div>
                  <span className="text-xs text-slate-500">
                    {passwordData.newPassword.length < 6 ? 'Weak' :
                     passwordData.newPassword.length < 8 ? 'Medium' : 'Strong'}
                  </span>
                </div>
              </div>
            )}
            
            {/* Change Password Button */}
            <button
              type="submit"
              disabled={changePasswordMutation.isPending}
              className="w-full mt-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {changePasswordMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Changing Password...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Change Password
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Danger Zone - Logout Section */}
      <div className="mt-8">
        <div className="bg-white rounded-2xl border border-red-200 overflow-hidden shadow-sm">
          <div className="px-6 py-4 bg-gradient-to-r from-red-50 to-rose-50 border-b border-red-100">
            <h2 className="text-lg font-semibold text-red-800">Account Actions</h2>
            <p className="text-sm text-red-600">Manage your account session</p>
          </div>
          
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-slate-800">Logout</h3>
                <p className="text-sm text-slate-500">Sign out of your account on this device</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Session Info */}
      <div className="mt-6 text-center">
        <p className="text-xs text-slate-400">
          Logged in as <span className="font-medium text-slate-500">{user?.email || user?.username}</span>
        </p>
      </div>
    </div>
  )
}

export default Profile