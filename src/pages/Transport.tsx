import { useState } from 'react'
import { Truck, FileText, Plus, Search, Check, Send, ChevronDown, ChevronUp, Calendar, User, Clock, CheckCircle2 } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { cn } from '@/lib/utils'
import type { TransportManifest } from '@/types'

const receivingUnits = ['建材公司', '焚烧发电厂', '水泥厂', '砖厂']
const plateNumbers = ['苏B·12345', '苏B·23456', '苏B·34567', '苏B·45678', '苏B·56789']

const statusConfig = {
  pending: { label: '待审批', badge: 'badge-warning' },
  approved: { label: '已审批', badge: 'badge-info' },
  shipped: { label: '已外运', badge: 'badge-success' },
} as const

function generateManifestNo() {
  const now = new Date()
  const date = now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0')
  const seq = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')
  return `LD-${date}-${seq}`
}

function fmtTime(t?: string) {
  if (!t) return '-'
  return new Date(t).toLocaleString('zh-CN')
}

function Timeline({ manifest }: { manifest: TransportManifest }) {
  const steps = [
    { key: 'create', label: '创建联单', time: manifest.createTime, icon: <FileText className="w-3.5 h-3.5" />, done: true },
    { key: 'approve', label: '审批通过', time: manifest.approvedTime, icon: <Check className="w-3.5 h-3.5" />, done: manifest.status !== 'pending' },
    { key: 'ship', label: '确认外运', time: manifest.shippedTime, icon: <Truck className="w-3.5 h-3.5" />, done: manifest.status === 'shipped' },
  ]
  return (
    <div className="pt-3 border-t border-slate-100 space-y-2">
      <p className="text-xs font-medium text-slate-500">流转时间线</p>
      <ol className="relative border-l border-slate-200 ml-1.5 space-y-2.5 pl-4">
        {steps.map((s) => (
          <li key={s.key} className="relative">
            <div className={cn(
              'absolute -left-[22px] top-0.5 w-6 h-6 rounded-full flex items-center justify-center',
              s.done ? 'bg-primary-600 text-white' : 'bg-slate-200 text-slate-400'
            )}>
              {s.icon}
            </div>
            <div className="flex items-center justify-between">
              <p className={cn('text-xs font-medium', s.done ? 'text-slate-800' : 'text-slate-400')}>
                {s.label}
                {s.done && <CheckCircle2 className="w-3 h-3 inline ml-1 text-emerald-500" />}
              </p>
              <p className="text-[10px] text-slate-400 font-mono">{fmtTime(s.time)}</p>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">操作员: {manifest.operator}</p>
          </li>
        ))}
      </ol>
    </div>
  )
}

export default function Transport() {
  const { transportManifests, addTransportManifest, updateManifestStatus } = useStore()
  const [activeTab, setActiveTab] = useState<'manifest' | 'records'>('manifest')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const [receivingUnit, setReceivingUnit] = useState(receivingUnits[0])
  const [plateNumber, setPlateNumber] = useState(plateNumbers[0])
  const [drySludgeWeight, setDrySludgeWeight] = useState('')
  const [operator, setOperator] = useState('')

  const [searchUnit, setSearchUnit] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const handleSubmit = () => {
    if (!drySludgeWeight || !operator) return
    addTransportManifest({
      manifestNo: generateManifestNo(),
      receivingUnit,
      plateNumber,
      drySludgeWeight: parseFloat(drySludgeWeight),
      status: 'pending',
      operator,
      createTime: new Date().toISOString(),
    })
    setDrySludgeWeight('')
    setOperator('')
  }

  const shippedRecords = transportManifests.filter((m) => m.status === 'shipped' && m.shippedTime)

  const filteredShipped = shippedRecords.filter((m) => {
    if (!m.shippedTime) return false
    const day = m.shippedTime.slice(0, 10)
    if (searchUnit && !m.receivingUnit.includes(searchUnit)) return false
    if (dateFrom && day < dateFrom) return false
    if (dateTo && day > dateTo) return false
    return true
  }).sort((a, b) => (b.shippedTime || '').localeCompare(a.shippedTime || ''))

  const totalWeight = filteredShipped.reduce((s, m) => s + m.drySludgeWeight, 0)

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">出泥外运</h1>
          <p className="text-sm text-slate-500 mt-1">联单管理与外运记录</p>
        </div>
        <Truck className="w-6 h-6 text-emerald-600" />
      </div>

      <div className="flex gap-1 bg-slate-100 rounded-lg p-1 w-fit">
        <button
          className={cn(
            'px-4 py-2 rounded-md text-sm font-medium transition-all',
            activeTab === 'manifest'
              ? 'bg-white text-primary-700 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          )}
          onClick={() => setActiveTab('manifest')}
        >
          <FileText className="w-4 h-4 inline mr-1.5 -mt-0.5" />
          联单管理
        </button>
        <button
          className={cn(
            'px-4 py-2 rounded-md text-sm font-medium transition-all',
            activeTab === 'records'
              ? 'bg-white text-primary-700 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          )}
          onClick={() => setActiveTab('records')}
        >
          <Truck className="w-4 h-4 inline mr-1.5 -mt-0.5" />
          外运记录
        </button>
      </div>

      {activeTab === 'manifest' && (
        <div className="space-y-6">
          <div className="card">
            <div className="card-header">
              <h3 className="text-sm font-semibold text-slate-700">新建联单</h3>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">接收单位</label>
                  <select
                    className="select-field"
                    value={receivingUnit}
                    onChange={(e) => setReceivingUnit(e.target.value)}
                  >
                    {receivingUnits.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">车牌号</label>
                  <select
                    className="select-field"
                    value={plateNumber}
                    onChange={(e) => setPlateNumber(e.target.value)}
                  >
                    {plateNumbers.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">干泥重量(吨)</label>
                  <input
                    type="number"
                    className="input-field"
                    placeholder="输入重量"
                    value={drySludgeWeight}
                    onChange={(e) => setDrySludgeWeight(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">操作员</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="操作员姓名"
                    value={operator}
                    onChange={(e) => setOperator(e.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <button className="btn-primary w-full" onClick={handleSubmit}>
                    <Plus className="w-4 h-4 inline mr-1 -mt-0.5" />
                    创建联单
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {transportManifests.map((m) => {
              const cfg = statusConfig[m.status]
              const expanded = expandedId === m.id
              return (
                <div key={m.id} className="card">
                  <div className="card-body space-y-3">
                    <div
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => setExpandedId(expanded ? null : m.id)}
                    >
                      <span className="text-sm font-bold text-slate-800">{m.manifestNo}</span>
                      <div className="flex items-center gap-2">
                        <span className={cfg.badge}>{cfg.label}</span>
                        {expanded
                          ? <ChevronUp className="w-4 h-4 text-slate-400" />
                          : <ChevronDown className="w-4 h-4 text-slate-400" />}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                      <div>接收单位: <span className="font-medium text-slate-800">{m.receivingUnit}</span></div>
                      <div>车牌号: <span className="font-medium text-slate-800">{m.plateNumber}</span></div>
                      <div>干泥重量: <span className="font-medium text-slate-800">{m.drySludgeWeight} 吨</span></div>
                      <div>操作员: <span className="font-medium text-slate-800">{m.operator}</span></div>
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      创建: {fmtTime(m.createTime)}
                    </div>

                    {expanded && <Timeline manifest={m} />}

                    <div className="flex gap-2 pt-1">
                      {m.status === 'pending' && (
                        <button
                          className="btn-primary text-xs flex-1"
                          onClick={() => updateManifestStatus(m.id, 'approved')}
                        >
                          <Check className="w-3 h-3 inline mr-1" />
                          审批通过
                        </button>
                      )}
                      {m.status === 'approved' && (
                        <button
                          className="btn-secondary text-xs flex-1"
                          onClick={() => updateManifestStatus(m.id, 'shipped')}
                        >
                          <Send className="w-3 h-3 inline mr-1" />
                          确认外运
                        </button>
                      )}
                      {m.status === 'shipped' && (
                        <span className="text-xs text-emerald-600 flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          已完成 · 外运时间 {fmtTime(m.shippedTime)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {activeTab === 'records' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="card">
              <div className="card-body text-center">
                <p className="stat-label">外运总重量</p>
                <p className="stat-value text-emerald-600">{totalWeight.toFixed(1)}<span className="text-sm font-normal text-slate-400 ml-1">吨</span></p>
              </div>
            </div>
            <div className="card">
              <div className="card-body text-center">
                <p className="stat-label">外运总车次</p>
                <p className="stat-value text-primary-600">{filteredShipped.length}<span className="text-sm font-normal text-slate-400 ml-1">次</span></p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-700">外运记录查询（按外运日期）</h3>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                按确认外运时间归档
              </span>
            </div>
            <div className="card-body">
              <div className="flex flex-wrap gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    className="input-field"
                    placeholder="接收单位"
                    value={searchUnit}
                    onChange={(e) => setSearchUnit(e.target.value)}
                  />
                </div>
                <input
                  type="date"
                  className="input-field"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
                <span className="text-slate-400 self-center">至</span>
                <input
                  type="date"
                  className="input-field"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="table-header text-left">联单号</th>
                      <th className="table-header text-left">接收单位</th>
                      <th className="table-header text-left">车牌号</th>
                      <th className="table-header text-right">干泥重量(吨)</th>
                      <th className="table-header text-left">外运时间</th>
                      <th className="table-header text-left">操作员</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredShipped.map((m) => (
                      <tr key={m.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                        <td className="table-cell font-medium text-slate-800">{m.manifestNo}</td>
                        <td className="table-cell">{m.receivingUnit}</td>
                        <td className="table-cell">{m.plateNumber}</td>
                        <td className="table-cell text-right font-medium">{m.drySludgeWeight}</td>
                        <td className="table-cell text-slate-600">
                          {fmtTime(m.shippedTime)}
                        </td>
                        <td className="table-cell">{m.operator}</td>
                      </tr>
                    ))}
                    {filteredShipped.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400">暂无外运记录</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
