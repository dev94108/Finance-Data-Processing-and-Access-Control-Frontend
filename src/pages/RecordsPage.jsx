import { useState, useEffect, useCallback } from 'react'
import { recordsAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { Plus, Search, Filter, Edit2, Trash2, X, ChevronLeft, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'

const CATEGORIES = ['salary','freelance','investment','rent','utilities','groceries','transport','entertainment','healthcare','education','other']
const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n || 0)

const initialForm = { amount: '', type: 'income', category: 'salary', date: new Date().toISOString().split('T')[0], notes: '' }

function RecordModal({ record, onClose, onSaved }) {
  const [form, setForm]       = useState(record ? { ...record, date: record.date?.split('T')[0] } : initialForm)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (record) {
        await recordsAPI.update(record._id, form)
        toast.success('Record updated')
      } else {
        await recordsAPI.create(form)
        toast.success('Record created')
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
          <h2 className="font-semibold text-surface-900">{record ? 'Edit Record' : 'New Record'}</h2>
          <button onClick={onClose} className="text-surface-400 hover:text-surface-600"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-surface-600 mb-1.5">Amount</label>
              <input type="number" step="0.01" min="0.01" className="input" placeholder="0.00"
                value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required />
            </div>
            <div>
              <label className="block text-xs font-medium text-surface-600 mb-1.5">Type</label>
              <select className="input" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-surface-600 mb-1.5">Category</label>
              <select className="input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-surface-600 mb-1.5">Date</label>
              <input type="date" className="input" value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-surface-600 mb-1.5">Notes <span className="text-surface-400">(optional)</span></label>
            <textarea className="input resize-none" rows={2} placeholder="Add a note…"
              value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Saving…' : record ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function RecordsPage() {
  const { isAdmin } = useAuth()
  const [records,    setRecords]    = useState([])
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 })
  const [loading,    setLoading]    = useState(true)
  const [modal,      setModal]      = useState(null) // null | 'create' | record object
  const [filters,    setFilters]    = useState({ type: '', category: '', startDate: '', endDate: '' })
  const [search,     setSearch]     = useState('')
  const [page,       setPage]       = useState(1)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit: 10, ...Object.fromEntries(Object.entries(filters).filter(([,v]) => v)) }
      const res = await recordsAPI.getAll(params)
      setRecords(res.data.data.records)
      setPagination(res.data.data.pagination)
    } catch {
      toast.error('Failed to load records')
    } finally {
      setLoading(false)
    }
  }, [page, filters])

  useEffect(() => { load() }, [load])

  const handleDelete = async (id) => {
    if (!confirm('Delete this record?')) return
    try {
      await recordsAPI.delete(id)
      toast.success('Record deleted')
      load()
    } catch {
      toast.error('Failed to delete')
    }
  }

  const clearFilters = () => { setFilters({ type: '', category: '', startDate: '', endDate: '' }); setPage(1) }

  const hasFilters = Object.values(filters).some(Boolean)

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-surface-900">Financial Records</h1>
          <p className="text-surface-500 text-sm mt-0.5">{pagination.total} total records</p>
        </div>
        {isAdmin && (
          <button onClick={() => setModal('create')} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Record
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2 text-surface-500 text-sm">
            <Filter className="w-4 h-4" /> Filters
          </div>
          <select className="input w-36 text-sm" value={filters.type} onChange={e => { setFilters(f => ({ ...f, type: e.target.value })); setPage(1) }}>
            <option value="">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <select className="input w-36 text-sm" value={filters.category} onChange={e => { setFilters(f => ({ ...f, category: e.target.value })); setPage(1) }}>
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
          </select>
          <input type="date" className="input w-40 text-sm" value={filters.startDate}
            onChange={e => { setFilters(f => ({ ...f, startDate: e.target.value })); setPage(1) }} />
          <span className="text-surface-400 text-sm">to</span>
          <input type="date" className="input w-40 text-sm" value={filters.endDate}
            onChange={e => { setFilters(f => ({ ...f, endDate: e.target.value })); setPage(1) }} />
          {hasFilters && (
            <button onClick={clearFilters} className="flex items-center gap-1.5 text-sm text-surface-500 hover:text-red-500 transition-colors">
              <X className="w-3.5 h-3.5" /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-100 bg-surface-50">
                <th className="text-left text-xs font-semibold text-surface-500 px-6 py-3">Date</th>
                <th className="text-left text-xs font-semibold text-surface-500 px-6 py-3">Type</th>
                <th className="text-left text-xs font-semibold text-surface-500 px-6 py-3">Category</th>
                <th className="text-left text-xs font-semibold text-surface-500 px-6 py-3">Amount</th>
                <th className="text-left text-xs font-semibold text-surface-500 px-6 py-3">Notes</th>
                <th className="text-left text-xs font-semibold text-surface-500 px-6 py-3">Created By</th>
                {isAdmin && <th className="text-right text-xs font-semibold text-surface-500 px-6 py-3">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-50">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-12 text-surface-400 text-sm">Loading…</td></tr>
              ) : records.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-surface-400 text-sm">No records found</td></tr>
              ) : records.map(r => (
                <tr key={r._id} className="hover:bg-surface-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-surface-600 font-mono">{new Date(r.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4"><span className={r.type === 'income' ? 'badge-income' : 'badge-expense'}>{r.type}</span></td>
                  <td className="px-6 py-4 text-sm text-surface-700 capitalize">{r.category}</td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-semibold font-mono ${r.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                      {r.type === 'income' ? '+' : '-'}{fmt(r.amount)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-surface-500 max-w-[180px] truncate">{r.notes || '—'}</td>
                  <td className="px-6 py-4 text-sm text-surface-500">{r.createdBy?.name || '—'}</td>
                  {isAdmin && (
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setModal(r)} className="p-1.5 rounded-lg hover:bg-surface-100 text-surface-400 hover:text-brand-600 transition-colors">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(r._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-surface-400 hover:text-red-500 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-surface-100">
            <p className="text-sm text-surface-500">
              Page {pagination.page} of {pagination.totalPages}
            </p>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                className="btn-secondary p-2 disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button>
              <button disabled={page >= pagination.totalPages} onClick={() => setPage(p => p + 1)}
                className="btn-secondary p-2 disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <RecordModal
          record={modal === 'create' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); load() }}
        />
      )}
    </div>
  )
}
