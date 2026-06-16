import { useState } from 'react'
import { Warehouse, RotateCw, Plus, TrendingDown } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { cn } from '@/lib/utils'

const tabs = [
  { key: 'inventory', label: '库存管理', icon: Warehouse },
  { key: 'turns', label: '翻抛记录', icon: RotateCw },
] as const

type TabKey = (typeof tabs)[number]['key']

const areas = ['A区', 'B区', 'C区']

const statusMap: Record<string, { label: string; cls: string }> = {
  normal: { label: '正常', cls: 'badge-success' },
  warning: { label: '预警', cls: 'badge-warning' },
  full: { label: '已满', cls: 'badge-danger' },
}

function getCapacityColor(ratio: number) {
  if (ratio > 0.9) return 'bg-red-500'
  if (ratio > 0.7) return 'bg-amber-500'
  return 'bg-emerald-500'
}

export default function Storage() {
  const [activeTab, setActiveTab] = useState<TabKey>('inventory')
  const { storageSheds, turnRecords, addTurnRecord } = useStore()

  const [shedId, setShedId] = useState('')
  const [area, setArea] = useState(areas[0])
  const [operator, setOperator] = useState('')
  const [beforeMoisture, setBeforeMoisture] = useState('')
  const [afterMoisture, setAfterMoisture] = useState('')

  const handleSubmit = () => {
    const shed = storageSheds.find((s) => s.id === shedId)
    if (!shed || !operator || !beforeMoisture || !afterMoisture) return
    addTurnRecord({
      shedId: shed.id,
      shedName: shed.name,
      turnTime: new Date().toISOString(),
      area,
      operator,
      beforeMoisture: Number(beforeMoisture),
      afterMoisture: Number(afterMoisture),
    })
    setShedId('')
    setArea(areas[0])
    setOperator('')
    setBeforeMoisture('')
    setAfterMoisture('')
  }

  const sortedRecords = [...turnRecords].sort(
    (a, b) => new Date(b.turnTime).getTime() - new Date(a.turnTime).getTime()
  )

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">暂存堆棚</h1>
        <p className="text-sm text-slate-500 mt-1">库存监控与翻抛作业管理</p>
      </div>

      <div className="flex gap-1 p-1 bg-slate-100 rounded-lg w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all',
              activeTab === tab.key
                ? 'bg-white text-primary-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'inventory' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {storageSheds.map((shed) => {
            const ratio = shed.currentStock / shed.capacity
            const pct = (ratio * 100).toFixed(1)
            return (
              <div key={shed.id} className="card">
                <div className="card-header flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Warehouse className="w-4 h-4 text-amber-600" />
                    <span className="font-semibold text-slate-800">{shed.name}</span>
                  </div>
                  <span className={statusMap[shed.status]?.cls}>
                    {statusMap[shed.status]?.label}
                  </span>
                </div>
                <div className="card-body space-y-3">
                  <div>
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>库存容量</span>
                      <span>{shed.currentStock} / {shed.capacity} 吨 ({pct}%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={cn('h-full rounded-full transition-all', getCapacityColor(ratio))}
                        style={{ width: `${Math.min(ratio * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">含水率</span>
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded text-xs font-medium',
                        shed.moistureRate > 70
                          ? 'bg-red-50 text-red-600'
                          : shed.moistureRate > 60
                            ? 'bg-amber-50 text-amber-600'
                            : 'bg-emerald-50 text-emerald-600'
                      )}
                    >
                      {shed.moistureRate}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">上次翻抛</span>
                    <span className="text-slate-700">
                      {new Date(shed.lastTurnTime).toLocaleString('zh-CN', {
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {activeTab === 'turns' && (
        <div className="space-y-6">
          <div className="card">
            <div className="card-header flex items-center gap-2">
              <Plus className="w-4 h-4 text-primary-600" />
              <span className="font-semibold text-slate-800">新增翻抛记录</span>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">堆棚</label>
                  <select
                    className="select-field"
                    value={shedId}
                    onChange={(e) => setShedId(e.target.value)}
                  >
                    <option value="">请选择堆棚</option>
                    {storageSheds.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">区域</label>
                  <select
                    className="select-field"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                  >
                    {areas.map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">操作人</label>
                  <input
                    className="input-field"
                    value={operator}
                    onChange={(e) => setOperator(e.target.value)}
                    placeholder="请输入操作人"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">翻抛前含水率 (%)</label>
                  <input
                    className="input-field"
                    type="number"
                    value={beforeMoisture}
                    onChange={(e) => setBeforeMoisture(e.target.value)}
                    placeholder="如 75"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">翻抛后含水率 (%)</label>
                  <input
                    className="input-field"
                    type="number"
                    value={afterMoisture}
                    onChange={(e) => setAfterMoisture(e.target.value)}
                    placeholder="如 60"
                  />
                </div>
                <div className="flex items-end">
                  <button className="btn-primary w-full" onClick={handleSubmit}>
                    提交记录
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header flex items-center gap-2">
              <RotateCw className="w-4 h-4 text-primary-600" />
              <span className="font-semibold text-slate-800">翻抛记录列表</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="table-header text-left">堆棚</th>
                    <th className="table-header text-left">区域</th>
                    <th className="table-header text-left">翻抛时间</th>
                    <th className="table-header text-left">操作人</th>
                    <th className="table-header text-left">含水率变化</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedRecords.map((rec) => (
                    <tr key={rec.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                      <td className="table-cell">{rec.shedName}</td>
                      <td className="table-cell">{rec.area}</td>
                      <td className="table-cell">
                        {new Date(rec.turnTime).toLocaleString('zh-CN', {
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="table-cell">{rec.operator}</td>
                      <td className="table-cell">
                        <div className="flex items-center gap-1">
                          <span className="text-amber-600">{rec.beforeMoisture}%</span>
                          <TrendingDown className="w-3 h-3 text-slate-400" />
                          <span className="text-emerald-600">{rec.afterMoisture}%</span>
                        </div>
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
