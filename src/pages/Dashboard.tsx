import { Link } from 'react-router-dom'
import {
  Scale,
  Warehouse,
  Droplets,
  Flame,
  Snowflake,
  Truck,
  ClipboardCheck,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts'
import { useStore } from '@/store/useStore'
import { cn } from '@/lib/utils'

const quickLinks = [
  { path: '/weighing', label: '进泥过磅', icon: Scale, color: 'bg-primary-600' },
  { path: '/storage', label: '暂存堆棚', icon: Warehouse, color: 'bg-amber-600' },
  { path: '/dewatering', label: '调理脱水', icon: Droplets, color: 'bg-blue-600' },
  { path: '/thermal-drying', label: '热干化', icon: Flame, color: 'bg-red-500' },
  { path: '/low-temp-drying', label: '低温干燥', icon: Snowflake, color: 'bg-cyan-600' },
  { path: '/transport', label: '出泥外运', icon: Truck, color: 'bg-emerald-600' },
  { path: '/ledger', label: '台账监管', icon: ClipboardCheck, color: 'bg-violet-600' },
]

const flowSteps = [
  { label: '进泥过磅', status: 'active' as const },
  { label: '暂存堆棚', status: 'active' as const },
  { label: '调理脱水', status: 'active' as const },
  { label: '干化处置', status: 'warning' as const },
  { label: '出泥外运', status: 'active' as const },
]

export default function Dashboard() {
  const { weighingRecords, dailyStatistics, alerts, transportManifests } = useStore()

  const today = new Date().toISOString().slice(0, 10)
  const todayStats = dailyStatistics[dailyStatistics.length - 1]
  const todayWeighing = weighingRecords.filter((r) => r.weighTime.slice(0, 10) === today)
  const todayTransport = transportManifests.filter((r) => r.createTime.slice(0, 10) === today)

  const intakeToday = todayWeighing.reduce((s, r) => s + r.netWeight, 0)
  const outputToday = todayTransport.reduce((s, r) => s + r.drySludgeWeight, 0)

  const recentStats = dailyStatistics.slice(-7)

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      {/* Page title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">运营总览</h1>
          <p className="text-sm text-slate-500 mt-1">污泥处置中心实时运营状态</p>
        </div>
        <div className="badge-success">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
          运行中
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="stat-label">今日进泥量</span>
            <Scale className="w-4 h-4 text-primary-500" />
          </div>
          <div className="flex items-end gap-2">
            <span className="stat-value text-primary-700">{intakeToday.toFixed(1)}</span>
            <span className="text-sm text-slate-400 mb-1">吨</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-emerald-600 mt-1">
            <ArrowUpRight className="w-3 h-3" />
            <span>较昨日 +12.3%</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="stat-label">今日处置量</span>
            <TrendingUp className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-end gap-2">
            <span className="stat-value text-amber-600">{todayStats?.processedAmount.toFixed(1) || '0.0'}</span>
            <span className="text-sm text-slate-400 mb-1">吨</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-emerald-600 mt-1">
            <ArrowUpRight className="w-3 h-3" />
            <span>较昨日 +5.8%</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="stat-label">今日出泥量</span>
            <Truck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-end gap-2">
            <span className="stat-value text-emerald-600">{outputToday.toFixed(1)}</span>
            <span className="text-sm text-slate-400 mb-1">吨</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-red-500 mt-1">
            <ArrowDownRight className="w-3 h-3" />
            <span>较昨日 -3.2%</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="stat-label">当前库存量</span>
            <Warehouse className="w-4 h-4 text-slate-500" />
          </div>
          <div className="flex items-end gap-2">
            <span className="stat-value text-slate-700">{todayStats?.stockAmount.toFixed(1) || '0.0'}</span>
            <span className="text-sm text-slate-400 mb-1">吨</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-amber-600 mt-1">
            <AlertTriangle className="w-3 h-3" />
            <span>库存偏高</span>
          </div>
        </div>
      </div>

      {/* Process flow */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">处置流程状态</h3>
        <div className="flex items-center justify-between gap-2">
          {flowSteps.map((step, i) => (
            <div key={step.label} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold mb-2',
                    step.status === 'active'
                      ? 'bg-primary-600'
                      : step.status === 'warning'
                        ? 'bg-amber-500'
                        : 'bg-slate-300'
                  )}
                >
                  {i + 1}
                </div>
                <span className="text-xs text-slate-600 font-medium">{step.label}</span>
                <span
                  className={cn(
                    'text-[10px] mt-0.5',
                    step.status === 'active'
                      ? 'text-emerald-600'
                      : step.status === 'warning'
                        ? 'text-amber-600'
                        : 'text-slate-400'
                  )}
                >
                  {step.status === 'active' ? '正常' : step.status === 'warning' ? '预警' : '停机'}
                </span>
              </div>
              {i < flowSteps.length - 1 && (
                <div className="flex-shrink-0 w-8 lg:w-16 h-[2px] bg-slate-200 -mt-4">
                  <div
                    className={cn(
                      'h-full',
                      step.status === 'active' ? 'bg-primary-500' : 'bg-slate-300'
                    )}
                    style={{ width: '100%' }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700">近7日处置量</h3>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={recentStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tickFormatter={(v: string) => v.slice(5)} fontSize={11} stroke="#94a3b8" />
                <YAxis fontSize={11} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    background: '#1e293b',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="intakeAmount" name="进泥量" fill="#0d9488" radius={[4, 4, 0, 0]} />
                <Bar dataKey="processedAmount" name="处置量" fill="#d97706" radius={[4, 4, 0, 0]} />
                <Bar dataKey="outputAmount" name="出泥量" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700">含水率趋势</h3>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={recentStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tickFormatter={(v: string) => v.slice(5)} fontSize={11} stroke="#94a3b8" />
                <YAxis domain={[40, 90]} fontSize={11} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    background: '#1e293b',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                />
                <Line type="monotone" dataKey="avgMoisture" name="平均含水率" stroke="#0d9488" strokeWidth={2} dot={{ fill: '#0d9488', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick links + Alerts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Quick links */}
        <div className="lg:col-span-2 card">
          <div className="card-header">
            <h3 className="text-sm font-semibold text-slate-700">快捷入口</h3>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {quickLinks.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:border-primary-200 hover:bg-primary-50/30 transition-all group"
                >
                  <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center text-white', item.color)}>
                    <item.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700 group-hover:text-primary-700">{item.label}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Alerts */}
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700">异常告警</h3>
            <span className="badge-danger">{alerts.length}</span>
          </div>
          <div className="card-body space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={cn(
                  'p-3 rounded-lg border',
                  alert.level === 'critical' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'
                )}
              >
                <div className="flex items-start gap-2">
                  <AlertTriangle
                    className={cn(
                      'w-4 h-4 flex-shrink-0 mt-0.5',
                      alert.level === 'critical' ? 'text-red-500' : 'text-amber-500'
                    )}
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-700">{alert.message}</p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {alert.module} · {new Date(alert.time).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
