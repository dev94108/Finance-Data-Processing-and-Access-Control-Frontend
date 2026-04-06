import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../services/api'
import { User, Mail, Shield, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'

const RoleBadge = ({ role }) => {
  const map = { admin: 'badge-admin', analyst: 'badge-analyst', viewer: 'badge-viewer' }
  return <span className={map[role] || 'badge-viewer'}>{role}</span>
}

export default function ProfilePage() {
  const { user, login } = useAuth()
  const [form, setForm]       = useState({ name: user?.name || '' })
  const [loading, setLoading] = useState(false)

  const handleUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await authAPI.me() // verify token is still valid
      toast.success('Profile is read-only. Only an admin can update your details.')
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-surface-900">My Profile</h1>
        <p className="text-surface-500 text-sm mt-0.5">Your account information</p>
      </div>

      {/* Avatar card */}
      <div className="card p-6 flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-2xl flex-shrink-0">
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <h2 className="text-lg font-semibold text-surface-900">{user?.name}</h2>
          <p className="text-sm text-surface-500">{user?.email}</p>
          <div className="mt-1.5">
            <RoleBadge role={user?.role} />
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="card p-6 space-y-5">
        <h3 className="text-sm font-semibold text-surface-800">Account Details</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-surface-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <User className="w-4 h-4 text-surface-500" />
            </div>
            <div>
              <p className="text-xs text-surface-400 font-medium">Full Name</p>
              <p className="text-sm text-surface-800 mt-0.5">{user?.name}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-surface-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Mail className="w-4 h-4 text-surface-500" />
            </div>
            <div>
              <p className="text-xs text-surface-400 font-medium">Email Address</p>
              <p className="text-sm text-surface-800 mt-0.5">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-surface-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Shield className="w-4 h-4 text-surface-500" />
            </div>
            <div>
              <p className="text-xs text-surface-400 font-medium">Role</p>
              <div className="mt-0.5"><RoleBadge role={user?.role} /></div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-surface-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Calendar className="w-4 h-4 text-surface-500" />
            </div>
            <div>
              <p className="text-xs text-surface-400 font-medium">Member Since</p>
              <p className="text-sm text-surface-800 mt-0.5">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Role permissions */}
      <div className="card p-6">
        <h3 className="text-sm font-semibold text-surface-800 mb-4">Your Permissions</h3>
        <div className="space-y-2.5">
          {[
            { label: 'View financial records',      allowed: true },
            { label: 'Access dashboard analytics',  allowed: user?.role === 'analyst' || user?.role === 'admin' },
            { label: 'Create & edit records',       allowed: user?.role === 'admin' },
            { label: 'Manage users',                allowed: user?.role === 'admin' },
          ].map(({ label, allowed }) => (
            <div key={label} className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${allowed ? 'bg-green-100 text-green-600' : 'bg-surface-100 text-surface-400'}`}>
                {allowed ? '✓' : '×'}
              </div>
              <span className={`text-sm ${allowed ? 'text-surface-700' : 'text-surface-400'}`}>{label}</span>
            </div>
          ))}
        </div>
        {user?.role === 'viewer' && (
          <p className="text-xs text-surface-400 mt-4 bg-surface-50 rounded-xl p-3">
            Contact an admin to upgrade your role to analyst or admin.
          </p>
        )}
      </div>
    </div>
  )
}
