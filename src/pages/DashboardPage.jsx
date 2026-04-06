import { useState, useEffect } from 'react'
import { dashboardAPI } from '../services/api'
import { TrendingUp, TrendingDown, Wallet, Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'
import toast from 'react-hot-toast'

const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n || 0)
const COLORS = ['#16a34a','#2563eb','#d97706','#dc2626','#7c3aed','#0891b2','#be185d','#65a30d','#ea580c','#0d9488']

const StatCard = ({ label, value, icon: Icon, color, sub, trend }) => (
  <div className="card p-6 fade-in">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-surface-500 font-medium">{label}</p>
        <p className="text-2xl font-semibold mt-1 text-surface-900">{value}</p>
        {sub && <p className="text-xs text-surface-400 mt-1">{sub}</p>}
      </div>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
    {trend !== undefined && (
      <div className={`flex items-center gap-1 mt-3 text-xs font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-500'}`}>
        {trend >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
        {Math.abs(trend)}% vs last month
      </div>
    )}
  </div>
)

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="card p-3 text-xs shadow-card-hover">
      <p className="font-medium text-surface-700 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>{p.name}: {fmt(p.value)}</p>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const [summary,   setSummary]   = useState(null)
  const [monthly,   setMonthly]   = useState(null)
  const [weekly,    setWeekly]    = useState([])
  const [categories,setCategories]= useState([])
  const [recent,    setRecent]    = useState([])
  const [loading,   setLoading]   = useState(true)
  const [year,      setYear]      = useState(new Date().getFullYear())

  const loadAll = async () => {
    setLoading(true)
    try {
      const [s, m, w, c, r] = await Promise.all([
        dashboardAPI.summary(),
        dashboardAPI.monthlyTrends(year),
        dashboardAPI.weeklyTrends(),
        dashboardAPI.categories(),
        dashboardAPI.recent(6),
      ])
      setSummary(s.data.data.summary)
      setMonthly(m.data.data)
      setWeekly(w.data.data.weekly)
      setCategories(c.data.data.categories.slice(0, 8))
      setRecent(r.data.data.records)
    } catch {
      toast.error('Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadAll() }, [year])

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-surface-900">Dashboard</h1>
          <p className="text-surface-500 text-sm mt-0.5">Financial overview and analytics</p>
        </div>
        <select
          value={year}
          onChange={e => setYear(Number(e.target.value))}
          className="input w-32 text-sm"
        >
          {[2022,2023,2024,2025,2026].map(y => <option key={y}>{y}</option>)}
        </select>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Income"   value={fmt(summary?.totalIncome)}   icon={TrendingUp}   color="bg-green-100 text-green-600"  sub={`${summary?.incomeCount} records`} />
        <StatCard label="Total Expenses" value={fmt(summary?.totalExpenses)} icon={TrendingDown} color="bg-red-100 text-red-500"     sub={`${summary?.expenseCount} records`} />
        <StatCard label="Net Balance"    value={fmt(summary?.netBalance)}    icon={Wallet}       color={summary?.netBalance >= 0 ? 'bg-brand-100 text-brand-600' : 'bg-orange-100 text-orange-600'} />
        <StatCard label="Total Records"  value={summary?.totalRecords || 0}  icon={Activity}     color="bg-blue-100 text-blue-600" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Monthly area chart */}
        <div className="card p-6 xl:col-span-2">
          <h2 className="text-sm font-semibold text-surface-800 mb-5">Monthly Trends — {year}</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthly?.months || []} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="income" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#16a34a" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#16a34a" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="monthName" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v >= 1000 ? (v/1000).toFixed(0)+'k' : v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="income"  name="Income"  stroke="#16a34a" strokeWidth={2} fill="url(#income)"  dot={false} />
              <Area type="monotone" dataKey="expense" name="Expense" stroke="#ef4444" strokeWidth={2} fill="url(#expense)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category pie */}
        <div className="card p-6">
          <h2 className="text-sm font-semibold text-surface-800 mb-5">By Category</h2>
          {categories.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie data={categories} dataKey="income" nameKey="category" cx="50%" cy="50%" innerRadius={45} outerRadius={65} strokeWidth={0}>
                    {categories.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => fmt(v)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-3">
                {categories.slice(0,5).map((c, i) => (
                  <div key={c.category} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-surface-600 capitalize">{c.category}</span>
                    </div>
                    <span className="font-medium text-surface-800">{fmt(c.income + c.expense)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : <p className="text-surface-400 text-sm text-center py-8">No data yet</p>}
        </div>
      </div>

      {/* Weekly + Recent */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Weekly bar */}
        <div className="card p-6">
          <h2 className="text-sm font-semibold text-surface-800 mb-5">Last 7 Days</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={weekly} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} barSize={14} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false}
                tickFormatter={d => new Date(d).toLocaleDateString('en', { weekday: 'short' })} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v >= 1000 ? (v/1000).toFixed(0)+'k' : v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="income"  name="Income"  fill="#16a34a" radius={[4,4,0,0]} />
              <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent activity */}
        <div className="card p-6">
          <h2 className="text-sm font-semibold text-surface-800 mb-4">Recent Activity</h2>
          {recent.length > 0 ? (
            <div className="space-y-3">
              {recent.map(r => (
                <div key={r._id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs ${r.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                      {r.type === 'income' ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-surface-800 capitalize">{r.category}</p>
                      <p className="text-xs text-surface-400">{new Date(r.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-semibold font-mono ${r.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                    {r.type === 'income' ? '+' : '-'}{fmt(r.amount)}
                  </span>
                </div>
              ))}
            </div>
          ) : <p className="text-surface-400 text-sm text-center py-8">No recent activity</p>}
        </div>
      </div>
    </div>
  )
}
