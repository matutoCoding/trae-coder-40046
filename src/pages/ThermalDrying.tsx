import { useState } from 'react';
import { Flame, Thermometer, Droplets, Plus } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { useStore } from '@/store/useStore';
import { cn } from '@/lib/utils';

export default function ThermalDrying() {
  const [activeTab, setActiveTab] = useState<'temp' | 'moisture'>('temp');
  const { thermalDryingRecords, tempCurveData, addThermalDryingRecord } = useStore();

  const latest = thermalDryingRecords[0];

  const [form, setForm] = useState({
    batchNo: '',
    inletTemp: '',
    outletTemp: '',
    drumTemp: '',
    outputMoisture: '',
    energyConsumption: '',
    operator: '',
  });

  const handleSubmit = () => {
    addThermalDryingRecord({
      batchNo: form.batchNo,
      inletTemp: Number(form.inletTemp),
      outletTemp: Number(form.outletTemp),
      drumTemp: Number(form.drumTemp),
      outputMoisture: Number(form.outputMoisture),
      energyConsumption: Number(form.energyConsumption),
      operator: form.operator,
      operateTime: new Date().toLocaleString('zh-CN'),
    });
    setForm({
      batchNo: '',
      inletTemp: '',
      outletTemp: '',
      drumTemp: '',
      outputMoisture: '',
      energyConsumption: '',
      operator: '',
    });
  };

  const tabs = [
    { key: 'temp' as const, label: '温度监控', icon: Thermometer },
    { key: 'moisture' as const, label: '含水率检测', icon: Droplets },
  ];

  const sortedRecords = [...thermalDryingRecords].sort(
    (a, b) => new Date(b.operateTime).getTime() - new Date(a.operateTime).getTime()
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Flame className="h-6 w-6 text-red-500" />
        <h1 className="text-2xl font-bold">热干化</h1>
      </div>

      <div className="flex gap-2 border-b border-gray-700 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-t-lg text-sm font-medium transition-colors',
              activeTab === tab.key
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'temp' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card">
              <div className="card-header">
                <Thermometer className="h-5 w-5 text-red-500" />
                <span className="stat-label">进风温度</span>
              </div>
              <div className="card-body">
                <span className="stat-value text-red-500">{latest?.inletTemp ?? '--'}</span>
                <span className="text-sm text-gray-400 ml-1">°C</span>
              </div>
            </div>
            <div className="card">
              <div className="card-header">
                <Thermometer className="h-5 w-5 text-blue-500" />
                <span className="stat-label">出风温度</span>
              </div>
              <div className="card-body">
                <span className="stat-value text-blue-500">{latest?.outletTemp ?? '--'}</span>
                <span className="text-sm text-gray-400 ml-1">°C</span>
              </div>
            </div>
            <div className="card">
              <div className="card-header">
                <Thermometer className="h-5 w-5 text-amber-500" />
                <span className="stat-label">筒体温度</span>
              </div>
              <div className="card-body">
                <span className="stat-value text-amber-500">{latest?.drumTemp ?? '--'}</span>
                <span className="text-sm text-gray-400 ml-1">°C</span>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <span className="font-semibold">24h 温度曲线</span>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={tempCurveData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="time" stroke="#9CA3AF" fontSize={12} />
                  <YAxis stroke="#9CA3AF" fontSize={12} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                    labelStyle={{ color: '#F3F4F6' }}
                  />
                  <ReferenceLine y={650} stroke="#EF4444" strokeDasharray="6 3" label={{ value: '进风上限', fill: '#EF4444', fontSize: 11 }} />
                  <ReferenceLine y={150} stroke="#3B82F6" strokeDasharray="6 3" label={{ value: '出风下限', fill: '#3B82F6', fontSize: 11 }} />
                  <ReferenceLine y={500} stroke="#F59E0B" strokeDasharray="6 3" label={{ value: '筒体上限', fill: '#F59E0B', fontSize: 11 }} />
                  <Line type="monotone" dataKey="inlet" stroke="#EF4444" strokeWidth={2} dot={false} name="进风温度" />
                  <Line type="monotone" dataKey="outlet" stroke="#3B82F6" strokeWidth={2} dot={false} name="出风温度" />
                  <Line type="monotone" dataKey="drum" stroke="#F59E0B" strokeWidth={2} dot={false} name="筒体温度" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <Plus className="h-5 w-5 text-green-500" />
              <span className="font-semibold">新增记录</span>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input
                  className="input-field"
                  placeholder="批次号"
                  value={form.batchNo}
                  onChange={(e) => setForm({ ...form, batchNo: e.target.value })}
                />
                <input
                  className="input-field"
                  placeholder="进风温度 (°C)"
                  type="number"
                  value={form.inletTemp}
                  onChange={(e) => setForm({ ...form, inletTemp: e.target.value })}
                />
                <input
                  className="input-field"
                  placeholder="出风温度 (°C)"
                  type="number"
                  value={form.outletTemp}
                  onChange={(e) => setForm({ ...form, outletTemp: e.target.value })}
                />
                <input
                  className="input-field"
                  placeholder="筒体温度 (°C)"
                  type="number"
                  value={form.drumTemp}
                  onChange={(e) => setForm({ ...form, drumTemp: e.target.value })}
                />
                <input
                  className="input-field"
                  placeholder="出料含水率 (%)"
                  type="number"
                  value={form.outputMoisture}
                  onChange={(e) => setForm({ ...form, outputMoisture: e.target.value })}
                />
                <input
                  className="input-field"
                  placeholder="能耗 (kWh)"
                  type="number"
                  value={form.energyConsumption}
                  onChange={(e) => setForm({ ...form, energyConsumption: e.target.value })}
                />
                <input
                  className="input-field"
                  placeholder="操作员"
                  value={form.operator}
                  onChange={(e) => setForm({ ...form, operator: e.target.value })}
                />
                <button className="btn-primary flex items-center justify-center gap-2" onClick={handleSubmit}>
                  <Plus className="h-4 w-4" />
                  添加记录
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'moisture' && (
        <div className="card">
          <div className="card-header">
            <Droplets className="h-5 w-5 text-blue-400" />
            <span className="font-semibold">含水率检测记录</span>
          </div>
          <div className="card-body overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="table-header text-left py-3 px-4">批次号</th>
                  <th className="table-header text-left py-3 px-4">进风温度</th>
                  <th className="table-header text-left py-3 px-4">出风温度</th>
                  <th className="table-header text-left py-3 px-4">筒体温度</th>
                  <th className="table-header text-left py-3 px-4">出料含水率</th>
                  <th className="table-header text-left py-3 px-4">能耗</th>
                  <th className="table-header text-left py-3 px-4">操作员</th>
                  <th className="table-header text-left py-3 px-4">时间</th>
                </tr>
              </thead>
              <tbody>
                {sortedRecords.map((record) => (
                  <tr key={record.id} className="border-b border-gray-700/50 hover:bg-gray-800/50">
                    <td className="table-cell py-3 px-4 font-medium">{record.batchNo}</td>
                    <td className="table-cell py-3 px-4 text-red-400">{record.inletTemp}°C</td>
                    <td className="table-cell py-3 px-4 text-blue-400">{record.outletTemp}°C</td>
                    <td className="table-cell py-3 px-4 text-amber-400">{record.drumTemp}°C</td>
                    <td className="table-cell py-3 px-4">
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded-full text-xs font-medium',
                          record.outputMoisture <= 40
                            ? 'badge-success bg-green-900/50 text-green-400'
                            : 'badge-warning bg-yellow-900/50 text-yellow-400'
                        )}
                      >
                        {record.outputMoisture}%
                      </span>
                    </td>
                    <td className="table-cell py-3 px-4">{record.energyConsumption} kWh</td>
                    <td className="table-cell py-3 px-4">{record.operator}</td>
                    <td className="table-cell py-3 px-4 text-gray-400">{record.operateTime}</td>
                  </tr>
                ))}
                {sortedRecords.length === 0 && (
                  <tr>
                    <td colSpan={8} className="table-cell py-8 text-center text-gray-500">
                      暂无记录
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
