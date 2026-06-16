import { useState } from 'react'
import { Snowflake, Wind, Plus, Thermometer, Droplets } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { cn } from '@/lib/utils'

const tabs = ['热泵干燥', '臭气除臭'] as const

const equipmentStatusOptions = ['运行正常', '维护中', '停机'] as const

export default function LowTempDrying() {
  const [activeTab, setActiveTab] = useState<number>(0)
  const { lowTempDryingRecords, deodorizationRecords, addLowTempDryingRecord, addDeodorizationRecord } = useStore()

  const [dryingForm, setDryingForm] = useState({
    dryTemp: '',
    humidity: '',
    airVolume: '',
    duration: '',
    outputMoisture: '',
    operator: '',
  })

  const [deodorForm, setDeodorForm] = useState({
    equipmentStatus: '运行正常' as string,
    deodorantDosage: '',
    odorConcentration: '',
    operator: '',
  })

  const latestDrying = lowTempDryingRecords[0]

  const handleDryingSubmit = () => {
    if (!dryingForm.dryTemp || !dryingForm.humidity || !dryingForm.airVolume || !dryingForm.duration || !dryingForm.outputMoisture || !dryingForm.operator) return
    addLowTempDryingRecord({
      batchNo: `DW-${Date.now().toString(36).toUpperCase()}`,
      dryTemp: Number(dryingForm.dryTemp),
      humidity: Number(dryingForm.humidity),
      airVolume: Number(dryingForm.airVolume),
      duration: Number(dryingForm.duration),
      outputMoisture: Number(dryingForm.outputMoisture),
      operator: dryingForm.operator,
      operateTime: new Date().toISOString(),
    })
    setDryingForm({ dryTemp: '', humidity: '', airVolume: '', duration: '', outputMoisture: '', operator: '' })
  }

  const handleDeodorSubmit = () => {
    if (!deodorForm.deodorantDosage || !deodorForm.odorConcentration || !deodorForm.operator) return
    addDeodorizationRecord({
      batchNo: `DC-${Date.now().toString(36).toUpperCase()}`,
      equipmentStatus: deodorForm.equipmentStatus,
      deodorantDosage: Number(deodorForm.deodorantDosage),
      odorConcentration: Number(deodorForm.odorConcentration),
      operator: deodorForm.operator,
      operateTime: new Date().toISOString(),
    })
    setDeodorForm({ equipmentStatus: '运行正常', deodorantDosage: '', odorConcentration: '', operator: '' })
  }

  const moistureBadge = (v: number) =>
    v <= 40 ? 'badge-success' : 'badge-warning'

  const statusBadge = (s: string) =>
    s === '运行正常' ? 'badge-success' : s === '维护中' ? 'badge-warning' : 'badge-danger'

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">低温干燥</h1>
        <p className="text-sm text-slate-500 mt-1">热泵干燥与臭气除臭管理</p>
      </div>

      <div className="flex gap-1 bg-slate-100 rounded-lg p-1 w-fit">
        {tabs.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            className={cn(
              'px-4 py-2 rounded-md text-sm font-medium transition-all',
              activeTab === i ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            )}
          >
            {i === 0 ? <Snowflake className="w-4 h-4 inline mr-1.5" /> : <Wind className="w-4 h-4 inline mr-1.5" />}
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 0 && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card p-4">
              <div className="flex items-center justify-between">
                <span className="stat-label">干燥温度</span>
                <Thermometer className="w-4 h-4 text-cyan-500" />
              </div>
              <span className="stat-value text-cyan-600">{latestDrying?.dryTemp ?? '-'}</span>
              <span className="text-xs text-slate-400">°C</span>
            </div>
            <div className="card p-4">
              <div className="flex items-center justify-between">
                <span className="stat-label">湿度</span>
                <Droplets className="w-4 h-4 text-blue-500" />
              </div>
              <span className="stat-value text-blue-600">{latestDrying?.humidity ?? '-'}</span>
              <span className="text-xs text-slate-400">%</span>
            </div>
            <div className="card p-4">
              <div className="flex items-center justify-between">
                <span className="stat-label">风量</span>
                <Wind className="w-4 h-4 text-slate-500" />
              </div>
              <span className="stat-value text-slate-600">{latestDrying?.airVolume ?? '-'}</span>
              <span className="text-xs text-slate-400">m³/h</span>
            </div>
            <div className="card p-4">
              <div className="flex items-center justify-between">
                <span className="stat-label">运行时长</span>
                <Snowflake className="w-4 h-4 text-amber-500" />
              </div>
              <span className="stat-value text-amber-600">{latestDrying?.duration ?? '-'}</span>
              <span className="text-xs text-slate-400">h</span>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="text-sm font-semibold text-slate-700">新增干燥记录</h3>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                <input className="input-field" placeholder="干燥温度 °C" value={dryingForm.dryTemp} onChange={(e) => setDryingForm({ ...dryingForm, dryTemp: e.target.value })} type="number" />
                <input className="input-field" placeholder="湿度 %" value={dryingForm.humidity} onChange={(e) => setDryingForm({ ...dryingForm, humidity: e.target.value })} type="number" />
                <input className="input-field" placeholder="风量 m³/h" value={dryingForm.airVolume} onChange={(e) => setDryingForm({ ...dryingForm, airVolume: e.target.value })} type="number" />
                <input className="input-field" placeholder="运行时长 h" value={dryingForm.duration} onChange={(e) => setDryingForm({ ...dryingForm, duration: e.target.value })} type="number" />
                <input className="input-field" placeholder="出泥含水率 %" value={dryingForm.outputMoisture} onChange={(e) => setDryingForm({ ...dryingForm, outputMoisture: e.target.value })} type="number" />
                <input className="input-field" placeholder="操作人" value={dryingForm.operator} onChange={(e) => setDryingForm({ ...dryingForm, operator: e.target.value })} />
              </div>
              <button className="btn-primary mt-3" onClick={handleDryingSubmit}>
                <Plus className="w-4 h-4 inline mr-1" />提交记录
              </button>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="text-sm font-semibold text-slate-700">干燥记录</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="table-header">批次号</th>
                    <th className="table-header">干燥温度(°C)</th>
                    <th className="table-header">湿度(%)</th>
                    <th className="table-header">风量(m³/h)</th>
                    <th className="table-header">时长(h)</th>
                    <th className="table-header">出泥含水率(%)</th>
                    <th className="table-header">操作人</th>
                    <th className="table-header">时间</th>
                  </tr>
                </thead>
                <tbody>
                  {lowTempDryingRecords.map((r) => (
                    <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                      <td className="table-cell font-medium">{r.batchNo}</td>
                      <td className="table-cell">{r.dryTemp}</td>
                      <td className="table-cell">{r.humidity}</td>
                      <td className="table-cell">{r.airVolume}</td>
                      <td className="table-cell">{r.duration}</td>
                      <td className="table-cell"><span className={moistureBadge(r.outputMoisture)}>{r.outputMoisture}%</span></td>
                      <td className="table-cell">{r.operator}</td>
                      <td className="table-cell text-slate-400">{new Date(r.operateTime).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 1 && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {deodorizationRecords.slice(0, 4).map((r) => (
              <div key={r.id} className="card p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-500">{r.batchNo}</span>
                  <span className={statusBadge(r.equipmentStatus)}>{r.equipmentStatus}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Wind className="w-4 h-4 text-slate-400" />
                  <span className="text-xs text-slate-500">除臭剂用量: {r.deodorantDosage}L</span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <Droplets className="w-4 h-4 text-slate-400" />
                  <span className="text-xs text-slate-500">臭气浓度: {r.odorConcentration}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="text-sm font-semibold text-slate-700">新增除臭记录</h3>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <select className="select-field" value={deodorForm.equipmentStatus} onChange={(e) => setDeodorForm({ ...deodorForm, equipmentStatus: e.target.value })}>
                  {equipmentStatusOptions.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
                <input className="input-field" placeholder="除臭剂用量 L" value={deodorForm.deodorantDosage} onChange={(e) => setDeodorForm({ ...deodorForm, deodorantDosage: e.target.value })} type="number" />
                <input className="input-field" placeholder="臭气浓度(无量纲)" value={deodorForm.odorConcentration} onChange={(e) => setDeodorForm({ ...deodorForm, odorConcentration: e.target.value })} type="number" />
                <input className="input-field" placeholder="操作人" value={deodorForm.operator} onChange={(e) => setDeodorForm({ ...deodorForm, operator: e.target.value })} />
              </div>
              <button className="btn-primary mt-3" onClick={handleDeodorSubmit}>
                <Plus className="w-4 h-4 inline mr-1" />提交记录
              </button>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="text-sm font-semibold text-slate-700">除臭记录</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="table-header">批次号</th>
                    <th className="table-header">设备状态</th>
                    <th className="table-header">除臭剂用量(L)</th>
                    <th className="table-header">臭气浓度</th>
                    <th className="table-header">操作人</th>
                    <th className="table-header">时间</th>
                  </tr>
                </thead>
                <tbody>
                  {deodorizationRecords.map((r) => (
                    <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                      <td className="table-cell font-medium">{r.batchNo}</td>
                      <td className="table-cell"><span className={statusBadge(r.equipmentStatus)}>{r.equipmentStatus}</span></td>
                      <td className="table-cell">{r.deodorantDosage}</td>
                      <td className="table-cell">{r.odorConcentration}</td>
                      <td className="table-cell">{r.operator}</td>
                      <td className="table-cell text-slate-400">{new Date(r.operateTime).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</td>
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
