import { useState, useEffect, useCallback } from 'react'
import { usersAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { Plus, Edit2, UserX, X, ChevronLeft, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'

const ROLES = ['viewer', 'analyst', 'admin']
const initialForm = { name: '', email: '', password: '', role: 'viewer' }

function UserModal({ user, onClose, onSaved }) {
  const [form, setForm]       = useState(user ? { name: user.name, role: user.role, isActive: user.isActive } : initialForm)
  const [loading, setLoading] = useState(false)
  const isEdit = !!user

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (isEdit) {
        await usersAPI.update(user._id, form)
        toast.success('User updated')
      } else {
        await usersAPI.create(form)
        toast.success('User created')
      }
      onSaved()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card w-full max-w-md p-6 fade-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-semibold text-surface-900">{isEdit ? 'Edit User' : 'Create User'}</h2>
          <button onClick={onClose} className="text-surface-400 hover:text-surface-600"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-surface-600 mb-1.5">Full Name</label>
            <input type="text" className="input" placeholder="John Doe"
              value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          </div>
          {!isEdit && (
            <>
              <div>
                <label className="block text-xs font-medium text-surface-600 mb-1.5">Email</label>
                <input type="email" className="input" placeholder="john@example.com"
                  value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
              </div>
              <div>
                <label className="block text-xs font-medium text-surface-600 mb-1.5">Password</label>
                <input type="password" className="input" placeholder="Min. 6 characters"
                  value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
              </div>
            </>
          )}
          <div>
            <label className="block text-xs font-medium text-surface-600 mb-1.5">Role</label>
            <select className="input" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
              {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase()+r.slice(1)}</option>)}
            </select>
          </div>
          {isEdit && (
            <div className="flex items-center gap-3">
              <input type="checkbox" id="isActive" checked={form.isActive}
                onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                className="w-4 h-4 accent-brand-600" />
              <label htmlFor="isActive" className="text-sm text-surface-700">Active account</label>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Saving…' : isEdit ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function UsersPage() {
  const { user: currentUser } = useAuth()
  const [users,      setUsers]      = useState([])
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 })
  const [loading,    setLoading]    = useState(true)
  const [modal,      setModal]      = useState(null)
  const [page,       setPage]       = useState(1)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await usersAPI.getAll({ page, limit: 10 })
      setUsers(res.data.data.users)
      setPagination(res.data.data.pagination)
    } catch {
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => { load() }, [load])

  const handleDeactivate = async (id) => {
    if (!confirm('Deactivate this user?')) return
    try {
      await usersAPI.delete(id)
      toast.success('User deactivated')
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    }
  }

  const RoleBadge = ({ role }) => {
    const map = { admin: 'badge-admin', analyst: 'badge-analyst', viewer: 'badge-viewer' }
    return <span className={map[role] || 'badge-viewer'}>{role}</span>
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-surface-900">User Management</h1>
          <p className="text-surface-500 text-sm mt-0.5">{pagination.total} total users</p>
        </div>
        <button onClick={() => setModal('create')} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add User
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-100 bg-surface-50">
                <th className="text-left text-xs font-semibold text-surface-500 px-6 py-3">Name</th>
                <th className="text-left text-xs font-semibold text-surface-500 px-6 py-3">Email</th>
                <th className="text-left text-xs font-semibold text-surface-500 px-6 py-3">Role</th>
                <th className="text-left text-xs font-semibold text-surface-500 px-6 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-surface-500 px-6 py-3">Created</th>
                <th className="text-right text-xs font-semibold text-surface-500 px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-50">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12 text-surface-400 text-sm">Loading…</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-surface-400 text-sm">No users found</td></tr>
              ) : users.map(u => (
                <tr key={u._id} className="hover:bg-surface-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-semibold text-sm flex-shrink-0">
                        {u.name?.[0]?.toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-surface-800">
                        {u.name} {u._id === currentUser?._id && <span className="text-xs text-surface-400">(you)</span>}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-surface-500">{u.email}</td>
                  <td className="px-6 py-4"><RoleBadge role={u.role} /></td>
                  <td className="px-6 py-4">
                    <span className={u.isActive ? 'badge-active' : 'badge-inactive'}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-surface-400 font-mono">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => setModal(u)}
                        className="p-1.5 rounded-lg hover:bg-surface-100 text-surface-400 hover:text-brand-600 transition-colors">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {u._id !== currentUser?._id && u.isActive && (
                        <button onClick={() => handleDeactivate(u._id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-surface-400 hover:text-red-500 transition-colors">
                          <UserX className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-surface-100">
            <p className="text-sm text-surface-500">Page {pagination.page} of {pagination.totalPages}</p>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                className="btn-secondary p-2 disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button>
              <button disabled={page >= pagination.totalPages} onClick={() => setPage(p => p + 1)}
                className="btn-secondary p-2 disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>

      {modal && (
        <UserModal
          user={modal === 'create' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); load() }}
        />
      )}
    </div>
  )
}
