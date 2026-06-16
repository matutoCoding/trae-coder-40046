import { useState } from 'react'
import { Droplets, FlaskConical, Plus, Filter } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { cn } from '@/lib/utils'

type Tab = 'conditioning' | 'filterPress'

const CHEMICAL_TYPES = ['PAC', 'PAM', 'FeCl3', '石灰']

export default function Dewatering() {
  const [activeTab, setActiveTab] = useState<Tab>('conditioning')
  const { conditioningRecords, filterPressRecords, addConditioningRecord, addFilterPressRecord } = useStore()

  const [sludgeAmount, setSludgeAmount] = useState('')
  const [chemicalType, setChemicalType] = useState(CHEMICAL_TYPES[0])
  const [chemicalDosage, setChemicalDosage] = useState('')
  const [operator, setOperator] = useState('')

  const [feedAmount, setFeedAmount] = useState('')
  const [pressTime, setPressTime] = useState('')
  const [outputMoisture, setOutputMoisture] = useState('')
  const [filtrateVolume, setFiltrateVolume] = useState('')
  const [fpOperator, setFpOperator] = useState('')

  const ratio = sludgeAmount && chemicalDosage
    ? ((parseFloat(chemicalDosage) / parseFloat(sludgeAmount)) * 100).toFixed(2) + '%'
    : ''

  const handleConditioningSubmit = () => {
    if (!sludgeAmount || !chemicalDosage || !operator) return
    const batchNo = 'TJ-' + Date.now().toString(36).toUpperCase()
    addConditioningRecord({
      batchNo,
      sludgeAmount: parseFloat(sludgeAmount),
      chemicalType,
      chemicalDosage: parseFloat(chemicalDosage),
      ratio,
      operator,
      operateTime: new Date().toISOString(),
    })
    setSludgeAmount('')
    setChemicalDosage('')
    setOperator('')
  }

  const handleFilterPressSubmit = () => {
    if (!feedAmount || !pressTime || !outputMoisture || !filtrateVolume || !fpOperator) return
    const batchNo = 'BY-' + Date.now().toString(36).toUpperCase()
    addFilterPressRecord({
      batchNo,
      feedAmount: parseFloat(feedAmount),
      pressTime: parseFloat(pressTime),
      outputMoisture: parseFloat(outputMoisture),
      filtrateVolume: parseFloat(filtrateVolume),
      operator: fpOperator,
      operateTime: new Date().toISOString(),
    })
    setFeedAmount('')
    setPressTime('')
    setOutputMoisture('')
    setFiltrateVolume('')
    setFpOperator('')
  }

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'conditioning', label: '加药调理', icon: <FlaskConical className="w-4 h-4" /> },
    { key: 'filterPress', label: '板框压滤', icon: <Filter className="w-4 h-4" /> },
  ]

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">调理脱水</h1>
          <p className="text-sm text-slate-500 mt-1">化学调理与板框压滤作业记录</p>
        </div>
        <div className="flex items-center gap-2 text-blue-600">
          <Droplets className="w-5 h-5" />
          <span className="text-sm font-medium">脱水车间</span>
        </div>
      </div>

      <div className="flex gap-2 border-b border-slate-200 pb-0">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
              activeTab === tab.key
                ? 'border-primary-600 text-primary-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'conditioning' && (
        <div className="space-y-6">
          <div className="card">
            <div className="card-header">
              <h3 className="text-sm font-semibold text-slate-700">新增加药记录</h3>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">污泥量 (吨)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={sludgeAmount}
                    onChange={(e) => setSludgeAmount(e.target.value)}
                    placeholder="输入污泥量"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">药剂类型</label>
                  <select
                    className="select-field"
                    value={chemicalType}
                    onChange={(e) => setChemicalType(e.target.value)}
                  >
                    {CHEMICAL_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">加药量 (kg)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={chemicalDosage}
                    onChange={(e) => setChemicalDosage(e.target.value)}
                    placeholder="输入加药量"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">加药比例</label>
                  <input
                    type="text"
                    className="input-field bg-slate-50"
                    value={ratio}
                    readOnly
                    placeholder="自动计算"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">操作员</label>
                  <input
                    type="text"
                    className="input-field"
                    value={operator}
                    onChange={(e) => setOperator(e.target.value)}
                    placeholder="操作员姓名"
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button className="btn-primary flex items-center gap-1.5" onClick={handleConditioningSubmit}>
                  <Plus className="w-4 h-4" />
                  提交记录
                </button>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="text-sm font-semibold text-slate-700">加药调理记录</h3>
            </div>
            <div className="card-body overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="table-header text-left py-2.5 px-3">批次号</th>
                    <th className="table-header text-left py-2.5 px-3">污泥量(t)</th>
                    <th className="table-header text-left py-2.5 px-3">药剂</th>
                    <th className="table-header text-left py-2.5 px-3">加药比例</th>
                    <th className="table-header text-left py-2.5 px-3">操作员</th>
                    <th className="table-header text-left py-2.5 px-3">时间</th>
                  </tr>
                </thead>
                <tbody>
                  {conditioningRecords.map((r) => (
                    <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                      <td className="table-cell py-2.5 px-3 font-mono text-xs">{r.batchNo}</td>
                      <td className="table-cell py-2.5 px-3">{r.sludgeAmount}</td>
                      <td className="table-cell py-2.5 px-3">
                        <span className="inline-flex items-center gap-1">
                          <FlaskConical className="w-3 h-3 text-blue-500" />
                          {r.chemicalType} {r.chemicalDosage}kg
                        </span>
                      </td>
                      <td className="table-cell py-2.5 px-3 font-medium">{r.ratio}</td>
                      <td className="table-cell py-2.5 px-3">{r.operator}</td>
                      <td className="table-cell py-2.5 px-3 text-slate-400 text-xs">
                        {new Date(r.operateTime).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'filterPress' && (
        <div className="space-y-6">
          <div className="card">
            <div className="card-header">
              <h3 className="text-sm font-semibold text-slate-700">新增压滤记录</h3>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">进料量 (吨)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={feedAmount}
                    onChange={(e) => setFeedAmount(e.target.value)}
                    placeholder="输入进料量"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">压滤时间 (h)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={pressTime}
                    onChange={(e) => setPressTime(e.target.value)}
                    placeholder="输入压滤时间"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">出泥含水率 (%)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={outputMoisture}
                    onChange={(e) => setOutputMoisture(e.target.value)}
                    placeholder="输入含水率"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">滤液量 (吨)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={filtrateVolume}
                    onChange={(e) => setFiltrateVolume(e.target.value)}
                    placeholder="输入滤液量"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">操作员</label>
                  <input
                    type="text"
                    className="input-field"
                    value={fpOperator}
                    onChange={(e) => setFpOperator(e.target.value)}
                    placeholder="操作员姓名"
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button className="btn-primary flex items-center gap-1.5" onClick={handleFilterPressSubmit}>
                  <Plus className="w-4 h-4" />
                  提交记录
                </button>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="text-sm font-semibold text-slate-700">板框压滤记录</h3>
            </div>
            <div className="card-body overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="table-header text-left py-2.5 px-3">批次号</th>
                    <th className="table-header text-left py-2.5 px-3">进料量(t)</th>
                    <th className="table-header text-left py-2.5 px-3">压滤时间(h)</th>
                    <th className="table-header text-left py-2.5 px-3">含水率</th>
                    <th className="table-header text-left py-2.5 px-3">滤液量(t)</th>
                    <th className="table-header text-left py-2.5 px-3">操作员</th>
                    <th className="table-header text-left py-2.5 px-3">时间</th>
                  </tr>
                </thead>
                <tbody>
                  {filterPressRecords.map((r) => (
                    <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                      <td className="table-cell py-2.5 px-3 font-mono text-xs">{r.batchNo}</td>
                      <td className="table-cell py-2.5 px-3">{r.feedAmount}</td>
                      <td className="table-cell py-2.5 px-3">{r.pressTime}</td>
                      <td className="table-cell py-2.5 px-3">
                        <span className={cn(r.outputMoisture > 60 ? 'badge-warning' : 'badge-success')}>
                          {r.outputMoisture}%
                        </span>
                      </td>
                      <td className="table-cell py-2.5 px-3">{r.filtrateVolume}</td>
                      <td className="table-cell py-2.5 px-3">{r.operator}</td>
                      <td className="table-cell py-2.5 px-3 text-slate-400 text-xs">
                        {new Date(r.operateTime).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
