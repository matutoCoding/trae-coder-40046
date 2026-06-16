import { useState, useMemo } from 'react';
import {
  Truck, FileText, Check, Download, Plus, X, ChevronDown, ChevronUp,
  Calendar as CalendarIcon, ClipboardList, Send, CheckCircle, Clock,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { cn } from '@/lib/utils';
import type { TransportManifest } from '@/types';

type Tab = 'records' | 'manifests';
type ManifestStatus = 'pending' | 'approved' | 'shipped';

const statusMap: Record<ManifestStatus, { label: string; cls: string }> = {
  pending: { label: '待审批', cls: 'badge-warning' },
  approved: { label: '已审批', cls: 'badge-info' },
  shipped: { label: '已外运', cls: 'badge-success' },
};

const units = ['建材公司', '焚烧发电厂', '水泥厂', '砖厂'];
const plates = ['粤A12345', '粤A67890', '粤B11111', '粤B22222', '粤C33333'];
const operators = ['张三', '李四', '王五', '赵六', '钱七'];

const fmtTime = (t?: string) => t ? new Date(t).toLocaleString('zh-CN') : '-';
const fmtDate = (t?: string) => t ? new Date(t).toLocaleDateString('zh-CN') : '-';

const genId = () => Math.random().toString(36).slice(2, 10);

function exportCSV(manifests: TransportManifest[], monthLabel: string) {
  const header = ['联单号', '接收单位', '车牌号', '干污泥重量(吨)', '创建时间', '审批时间', '外运时间', '操作员'];
  const rows = manifests.map((m) => [
    m.manifestNo,
    m.receivingUnit,
    m.plateNumber,
    String(m.drySludgeWeight),
    fmtTime(m.createTime),
    fmtTime(m.approvedTime),
    fmtTime(m.shippedTime),
    m.operator,
  ]);
  const csv = '\ufeff' + [header, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `外运台账明细_${monthLabel}_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function Timeline({ manifest }: { manifest: TransportManifest }) {
  const items = [
    {
      label: '创建联单',
      icon: <ClipboardList className="w-3.5 h-3.5" />,
      time: manifest.createTime,
      done: true,
    },
    {
      label: '审批通过',
      icon: <CheckCircle className="w-3.5 h-3.5" />,
      time: manifest.approvedTime,
      done: manifest.status !== 'pending',
    },
    {
      label: '确认外运',
      icon: <Truck className="w-3.5 h-3.5" />,
      time: manifest.shippedTime,
      done: manifest.status === 'shipped',
    },
  ];
  return (
    <div className="space-y-2">
      {items.map((it, i) => (
        <div key={i} className="flex items-start gap-2">
          <div className="flex flex-col items-center">
            <div className={cn(
              'w-7 h-7 rounded-full flex items-center justify-center border-2 shrink-0',
              it.done
                ? 'bg-emerald-50 border-emerald-400 text-emerald-700'
                : 'bg-gray-100 border-gray-300 text-gray-400'
            )}>
              {it.icon}
            </div>
            {i < items.length - 1 && (
              <div className={cn('w-0.5 flex-1 min-h-4', it.done ? 'bg-emerald-300' : 'bg-gray-200')} />
            )}
          </div>
          <div className="flex-1 pb-2">
            <div className="flex items-center justify-between gap-2">
              <span className={cn('text-sm font-medium', it.done ? 'text-slate-800' : 'text-slate-400')}>
                {it.label}
              </span>
              <span className="text-[11px] text-slate-500 font-mono">{fmtTime(it.time)}</span>
            </div>
            {it.done && (
              <p className="text-[11px] text-slate-500 mt-0.5">
                操作员：{operators[i % operators.length]}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function ManifestCard({
  m, onApprove, onShip, expanded, onToggle,
}: {
  m: TransportManifest;
  onApprove: (id: string) => void;
  onShip: (id: string) => void;
  expanded: boolean;
  onToggle: (id: string) => void;
}) {
  return (
    <div className="card">
      <div
        className="card-header flex items-center justify-between cursor-pointer"
        onClick={() => onToggle(m.id)}
      >
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-teal-600" />
          <span className="font-semibold">{m.manifestNo}</span>
          <span className={cn(statusMap[m.status].cls, 'text-xs')}>{statusMap[m.status].label}</span>
        </div>
        {expanded
          ? <ChevronUp className="w-4 h-4 text-slate-400" />
          : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </div>
      <div className="card-body space-y-3">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
          <div>
            <p className="text-[11px] text-gray-500">接收单位</p>
            <p className="font-medium">{m.receivingUnit}</p>
          </div>
          <div>
            <p className="text-[11px] text-gray-500">车牌号</p>
            <p className="font-mono">{m.plateNumber}</p>
          </div>
          <div>
            <p className="text-[11px] text-gray-500">干污泥重量</p>
            <p className="font-bold text-teal-700">{m.drySludgeWeight} 吨</p>
          </div>
          <div>
            <p className="text-[11px] text-gray-500">创建时间</p>
            <p className="text-xs text-slate-600">{fmtTime(m.createTime)}</p>
          </div>
          <div>
            <p className="text-[11px] text-gray-500">审批时间</p>
            <p className="text-xs text-slate-600">{m.approvedTime ? fmtTime(m.approvedTime) : '-'}</p>
          </div>
          <div>
            <p className="text-[11px] text-gray-500">外运时间</p>
            <p className="text-xs text-emerald-700 font-medium">{m.shippedTime ? fmtTime(m.shippedTime) : '-'}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {m.status === 'pending' && (
            <button onClick={() => onApprove(m.id)} className="btn-primary px-3 py-1.5 rounded text-xs flex items-center gap-1">
              <Check className="w-3 h-3" />审批通过
            </button>
          )}
          {m.status === 'approved' && (
            <button onClick={() => onShip(m.id)} className="btn-primary px-3 py-1.5 rounded text-xs flex items-center gap-1">
              <Send className="w-3 h-3" />确认外运
            </button>
          )}
        </div>

        {expanded && (
          <div className="pt-3 border-t border-slate-100">
            <p className="text-[11px] font-semibold text-slate-600 mb-2">流转时间线</p>
            <Timeline manifest={m} />
          </div>
        )}
      </div>
    </div>
  );
}

export default function Transport() {
  const [tab, setTab] = useState<Tab>('manifests');
  const [expandedManifest, setExpandedManifest] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const [newManifest, setNewManifest] = useState({
    receivingUnit: units[0],
    plateNumber: plates[0],
    drySludgeWeight: '10',
  });

  const { transportManifests, addTransportManifest, updateManifestStatus } = useStore();

  const [recordsDateFrom, setRecordsDateFrom] = useState<string>('');
  const [recordsDateTo, setRecordsDateTo] = useState<string>('');
  const [monthFilter, setMonthFilter] = useState<string>('');

  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    for (const m of transportManifests) {
      if (m.status === 'shipped' && m.shippedTime) set.add(m.shippedTime.slice(0, 7));
      if (m.createTime) set.add(m.createTime.slice(0, 7));
    }
    return Array.from(set).sort().reverse();
  }, [transportManifests]);

  const shippedRecords = useMemo(() => {
    let arr = transportManifests
      .filter((m) => m.status === 'shipped' && m.shippedTime)
      .slice()
      .sort((a, b) => new Date(b.shippedTime!).getTime() - new Date(a.shippedTime!).getTime());
    if (monthFilter) {
      arr = arr.filter((m) => m.shippedTime!.slice(0, 7) === monthFilter);
    }
    if (recordsDateFrom) {
      arr = arr.filter((m) => m.shippedTime!.slice(0, 10) >= recordsDateFrom);
    }
    if (recordsDateTo) {
      arr = arr.filter((m) => m.shippedTime!.slice(0, 10) <= recordsDateTo);
    }
    return arr;
  }, [transportManifests, recordsDateFrom, recordsDateTo, monthFilter]);

  const pendingManifests = transportManifests.filter((m) => m.status === 'pending');
  const approvedManifests = transportManifests.filter((m) => m.status === 'approved');
  const shippedManifests = transportManifests.filter((m) => m.status === 'shipped');

  const shippedTotalWeight = shippedRecords.reduce((s, m) => s + m.drySludgeWeight, 0);

  const handleAdd = () => {
    if (!newManifest.drySludgeWeight) return;
    const now = new Date().toISOString();
    addTransportManifest({
      manifestNo: `LD-${now.slice(0, 10).replace(/-/g, '')}-${String(Math.floor(Math.random() * 900) + 100)}`,
      receivingUnit: newManifest.receivingUnit,
      plateNumber: newManifest.plateNumber,
      drySludgeWeight: Number(newManifest.drySludgeWeight),
      status: 'pending',
      operator: operators[Math.floor(Math.random() * operators.length)],
      createTime: now,
    });
    setShowAdd(false);
    setNewManifest({ receivingUnit: units[0], plateNumber: plates[0], drySludgeWeight: '10' });
  };

  const filterLabel = monthFilter
    ? `${monthFilter.slice(0, 4)}年${parseInt(monthFilter.slice(5, 7), 10)}月`
    : (recordsDateFrom || recordsDateTo ? '筛选区间' : '全部');

  return (
    <div className="space-y-4 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Truck className="w-6 h-6 text-teal-600" />
          <h1 className="text-xl font-bold">出泥外运</h1>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary px-3 py-1.5 rounded text-sm flex items-center gap-1">
          <Plus className="w-4 h-4" />新建联单
        </button>
      </div>

      <div className="flex gap-1 border-b border-gray-200 flex-wrap">
        <button
          onClick={() => setTab('manifests')}
          className={cn(
            'flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors',
            tab === 'manifests'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          )}
        >
          <FileText className="w-4 h-4" />联单管理
        </button>
        <button
          onClick={() => setTab('records')}
          className={cn(
            'flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors',
            tab === 'records'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          )}
        >
          <ClipboardList className="w-4 h-4" />外运记录
        </button>
      </div>

      {tab === 'manifests' && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: '待审批', value: pendingManifests.length, color: 'text-amber-700', icon: <Clock className="w-5 h-5 text-amber-600" /> },
              { label: '已审批待外运', value: approvedManifests.length, color: 'text-teal-700', icon: <Check className="w-5 h-5 text-teal-600" /> },
              { label: '已外运', value: shippedManifests.length, color: 'text-emerald-700', icon: <Truck className="w-5 h-5 text-emerald-600" /> },
            ].map((card) => (
              <div key={card.label} className="card">
                <div className="card-body">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="stat-label text-xs text-gray-500">{card.label}</p>
                      <p className={cn('stat-value text-2xl font-bold', card.color)}>{card.value}</p>
                    </div>
                    {card.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {transportManifests.map((m) => (
              <ManifestCard
                key={m.id}
                m={m}
                onApprove={(id) => updateManifestStatus(id, 'approved')}
                onShip={(id) => updateManifestStatus(id, 'shipped')}
                expanded={expandedManifest === m.id}
                onToggle={(id) => setExpandedManifest(expandedManifest === id ? null : id)}
              />
            ))}
          </div>
        </div>
      )}

      {tab === 'records' && (
        <div className="space-y-4">
          <div className="card">
            <div className="card-body space-y-3">
              <div className="flex flex-wrap items-end gap-3">
                <div>
                  <label className="text-[11px] text-slate-500 mb-1 block">按月份快速筛选</label>
                  <select
                    value={monthFilter}
                    onChange={(e) => {
                      setMonthFilter(e.target.value);
                      setRecordsDateFrom('');
                      setRecordsDateTo('');
                    }}
                    className="input-field w-40"
                  >
                    <option value="">全部月份</option>
                    {availableMonths.map((m) => (
                      <option key={m} value={m}>
                        {m.slice(0, 4)}年{parseInt(m.slice(5, 7), 10)}月
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 mb-1 block">外运开始日期</label>
                  <input
                    type="date"
                    value={recordsDateFrom}
                    onChange={(e) => {
                      setRecordsDateFrom(e.target.value);
                      setMonthFilter('');
                    }}
                    className="input-field w-40"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 mb-1 block">外运结束日期</label>
                  <input
                    type="date"
                    value={recordsDateTo}
                    onChange={(e) => {
                      setRecordsDateTo(e.target.value);
                      setMonthFilter('');
                    }}
                    className="input-field w-40"
                  />
                </div>
                <button
                  onClick={() => {
                    setMonthFilter('');
                    setRecordsDateFrom('');
                    setRecordsDateTo('');
                  }}
                  className="btn-secondary px-3 py-1.5 rounded text-xs"
                >
                  清除筛选
                </button>
                <div className="flex-1" />
                <button
                  onClick={() => exportCSV(shippedRecords, filterLabel)}
                  disabled={shippedRecords.length === 0}
                  className={cn(
                    'px-3 py-1.5 rounded text-xs flex items-center gap-1',
                    shippedRecords.length === 0 ? 'btn-secondary opacity-50 cursor-not-allowed' : 'btn-primary'
                  )}
                >
                  <Download className="w-3.5 h-3.5" />导出台账明细（{shippedRecords.length}条）
                </button>
              </div>
              <div className="flex flex-wrap gap-4 pt-1 text-xs text-slate-600">
                <p>
                  <CalendarIcon className="w-3.5 h-3.5 inline -mt-0.5 mr-1 text-teal-600" />
                  筛选范围：<span className="font-medium">{filterLabel}</span>
                </p>
                <p>
                  <Truck className="w-3.5 h-3.5 inline -mt-0.5 mr-1 text-emerald-600" />
                  外运车次：<span className="font-bold">{shippedRecords.length}</span> 车
                </p>
                <p>
                  <CheckCircle className="w-3.5 h-3.5 inline -mt-0.5 mr-1 text-amber-600" />
                  总重量：<span className="font-bold text-emerald-700">{shippedTotalWeight.toFixed(1)}</span> 吨
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header font-semibold flex items-center justify-between">
              <span>外运记录（按确认外运时间排序）</span>
            </div>
            <div className="card-body overflow-x-auto">
              {shippedRecords.length === 0 ? (
                <p className="text-center text-sm text-slate-400 py-8">暂无外运记录</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="table-header border-b">
                      <th className="table-cell text-left py-2 px-3">联单号</th>
                      <th className="table-cell text-left py-2 px-3">接收单位</th>
                      <th className="table-cell text-left py-2 px-3">车牌号</th>
                      <th className="table-cell text-right py-2 px-3">重量(吨)</th>
                      <th className="table-cell text-left py-2 px-3">外运时间</th>
                      <th className="table-cell text-left py-2 px-3">操作员</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shippedRecords.map((m) => (
                      <tr key={m.id} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="table-cell py-2 px-3 font-mono text-xs">{m.manifestNo}</td>
                        <td className="table-cell py-2 px-3">{m.receivingUnit}</td>
                        <td className="table-cell py-2 px-3 font-mono">{m.plateNumber}</td>
                        <td className="table-cell py-2 px-3 text-right font-bold text-emerald-700">{m.drySludgeWeight}</td>
                        <td className="table-cell py-2 px-3 text-slate-600 text-xs">
                          <Clock className="w-3 h-3 inline -mt-0.5 mr-1 text-slate-400" />
                          {fmtTime(m.shippedTime)}
                        </td>
                        <td className="table-cell py-2 px-3">{m.operator}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-50 font-semibold">
                      <td className="table-cell py-2 px-3" colSpan={3}>合计</td>
                      <td className="table-cell py-2 px-3 text-right text-emerald-700">{shippedTotalWeight.toFixed(1)}</td>
                      <td className="table-cell py-2 px-3" colSpan={2}>{shippedRecords.length} 车次</td>
                    </tr>
                  </tfoot>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">新建外运联单</h3>
              <button onClick={() => setShowAdd(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">接收单位</label>
                <select
                  value={newManifest.receivingUnit}
                  onChange={(e) => setNewManifest({ ...newManifest, receivingUnit: e.target.value })}
                  className="input-field w-full"
                >
                  {units.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">车牌号</label>
                <select
                  value={newManifest.plateNumber}
                  onChange={(e) => setNewManifest({ ...newManifest, plateNumber: e.target.value })}
                  className="input-field w-full"
                >
                  {plates.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">干污泥重量(吨)</label>
                <input
                  type="number"
                  step="0.1"
                  value={newManifest.drySludgeWeight}
                  onChange={(e) => setNewManifest({ ...newManifest, drySludgeWeight: e.target.value })}
                  className="input-field w-full"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-5 justify-end">
              <button onClick={() => setShowAdd(false)} className="btn-secondary px-4 py-2 rounded text-sm">取消</button>
              <button onClick={handleAdd} className="btn-primary px-4 py-2 rounded text-sm">创建联单</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
