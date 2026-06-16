import { useState, useMemo } from 'react';
import {
  ClipboardCheck, BarChart3, Upload, FileText, Download, RefreshCw,
  CheckCircle, XCircle, Clock, ChevronDown, ChevronRight, Calendar,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line,
} from 'recharts';
import { useStore } from '@/store/useStore';
import { cn } from '@/lib/utils';

type TabKey = 'statistics' | 'upload' | 'reports';

const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: 'statistics', label: '处置量统计', icon: <BarChart3 className="w-4 h-4" /> },
  { key: 'upload', label: '数据上传', icon: <Upload className="w-4 h-4" /> },
  { key: 'reports', label: '合规报表', icon: <FileText className="w-4 h-4" /> },
];

const rangeOptions = [
  { days: 7, label: '近7天' },
  { days: 15, label: '近15天' },
  { days: 30, label: '近30天' },
];

const complianceItems = [
  { name: '进泥量记录', passed: true },
  { name: '含水率检测记录', passed: true },
  { name: '处置量统计', passed: true },
  { name: '外运联单记录', passed: true },
  { name: '除臭运行记录', passed: true },
];

const months = ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06'];

function fmtTime(t?: string) {
  if (!t) return '-';
  return new Date(t).toLocaleString('zh-CN');
}

function fmtMonth(ym: string) {
  const [y, m] = ym.split('-');
  return `${y}年${parseInt(m, 10)}月`;
}

const statusBadge = (status: string) => {
  const map: Record<string, { cls: string; icon: React.ReactNode; text: string }> = {
    pending: { cls: 'badge-warning', icon: <Clock className="w-3 h-3" />, text: '待上传' },
    uploaded: { cls: 'badge-success', icon: <CheckCircle className="w-3 h-3" />, text: '已上传' },
    failed: { cls: 'badge-danger', icon: <XCircle className="w-3 h-3" />, text: '失败' },
  };
  const info = map[status] || map.pending;
  return (
    <span className={cn(info.cls, 'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium')}>
      {info.icon}{info.text}
    </span>
  );
};

export default function Ledger() {
  const [activeTab, setActiveTab] = useState<TabKey>('statistics');
  const [rangeDays, setRangeDays] = useState(7);
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null);
  const [expandedUploadMonth, setExpandedUploadMonth] = useState<string | null>(null);

  const {
    dailyStatistics, uploadTasks, updateUploadTaskStatus, transportManifests,
  } = useStore();

  const filteredStats = dailyStatistics.slice(-rangeDays);

  const totalIntake = filteredStats.reduce((s, d) => s + d.intakeAmount, 0);
  const totalProcessed = filteredStats.reduce((s, d) => s + d.processedAmount, 0);
  const totalOutput = filteredStats.reduce((s, d) => s + d.outputAmount, 0);
  const avgMoisture = filteredStats.length
    ? filteredStats.reduce((s, d) => s + d.avgMoisture, 0) / filteredStats.length
    : 0;

  const monthlyData = useMemo(() => {
    const map = new Map<string, {
      intake: number; processed: number; output: number; moisture: number; cnt: number;
    }>();
    for (const d of dailyStatistics) {
      const m = d.date.slice(0, 7);
      const cur = map.get(m) || { intake: 0, processed: 0, output: 0, moisture: 0, cnt: 0 };
      cur.intake += d.intakeAmount;
      cur.processed += d.processedAmount;
      cur.output += d.outputAmount;
      cur.moisture += d.avgMoisture;
      cur.cnt += 1;
      map.set(m, cur);
    }
    return months.map((m) => {
      const r = map.get(m);
      return {
        month: m,
        intake: r ? r.intake : 0,
        processed: r ? r.processed : 0,
        output: r ? r.output : 0,
        moisture: r ? r.moisture / r.cnt : 0,
      };
    });
  }, [dailyStatistics]);

  const shippedByMonth = useMemo(() => {
    const m = new Map<string, typeof transportManifests>();
    for (const t of transportManifests) {
      if (t.status === 'shipped' && t.shippedTime) {
        const key = t.shippedTime.slice(0, 7);
        if (!m.has(key)) m.set(key, []);
        m.get(key)!.push(t);
      }
    }
    return m;
  }, [transportManifests]);

  const monthUploadStatus = useMemo(() => {
    const res = new Map<string, 'all' | 'partial' | 'none'>();
    for (const month of months) {
      const tasks = uploadTasks.filter((t) => t.month === month);
      if (tasks.length === 0) { res.set(month, 'none'); continue; }
      const uploadedCnt = tasks.filter((t) => t.status === 'uploaded').length;
      if (uploadedCnt === tasks.length) res.set(month, 'all');
      else if (uploadedCnt === 0) res.set(month, 'none');
      else res.set(month, 'partial');
    }
    return res;
  }, [uploadTasks]);

  return (
    <div className="space-y-4 max-w-[1400px] mx-auto">
      <div className="flex items-center gap-2 mb-2">
        <ClipboardCheck className="w-6 h-6 text-teal-600" />
        <h1 className="text-xl font-bold">台账监管</h1>
      </div>

      <div className="flex gap-1 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors',
              activeTab === tab.key
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            )}
          >
            {tab.icon}{tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'statistics' && (
        <div className="space-y-4">
          <div className="card">
            <div className="card-header flex items-center justify-between">
              <span className="font-semibold">处置量趋势</span>
              <div className="flex gap-1">
                {rangeOptions.map((opt) => (
                  <button
                    key={opt.days}
                    onClick={() => setRangeDays(opt.days)}
                    className={cn(
                      'px-3 py-1 text-xs rounded-md transition-colors',
                      rangeDays === opt.days ? 'btn-primary' : 'btn-secondary'
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={filteredStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }} />
                  <Legend />
                  <Bar dataKey="intakeAmount" name="进泥量" fill="#14b8a6" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="processedAmount" name="处置量" fill="#f59e0b" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="outputAmount" name="外运量" fill="#22c55e" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={filteredStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" domain={[40, 90]} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }} />
                  <Legend />
                  <Line type="monotone" dataKey="avgMoisture" name="平均含水率(%)" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: '总进泥量(t)', value: totalIntake.toFixed(1), color: 'text-teal-700' },
              { label: '总处置量(t)', value: totalProcessed.toFixed(1), color: 'text-amber-700' },
              { label: '总外运量(t)', value: totalOutput.toFixed(1), color: 'text-green-700' },
              { label: '平均含水率(%)', value: avgMoisture.toFixed(1), color: 'text-indigo-700' },
            ].map((card) => (
              <div key={card.label} className="card">
                <div className="card-body text-center">
                  <p className="stat-label text-xs text-gray-500">{card.label}</p>
                  <p className={cn('stat-value text-2xl font-bold', card.color)}>{card.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="card-header font-semibold flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-teal-600" />
                月度汇总（点击查看外运明细）
              </span>
            </div>
            <div className="card-body">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="table-header border-b">
                      <th className="table-cell text-left py-2 px-3 w-10"></th>
                      <th className="table-cell text-left py-2 px-3">月份</th>
                      <th className="table-cell text-right py-2 px-3">进泥量(t)</th>
                      <th className="table-cell text-right py-2 px-3">处置量(t)</th>
                      <th className="table-cell text-right py-2 px-3">外运量(t)</th>
                      <th className="table-cell text-right py-2 px-3">平均含水率(%)</th>
                      <th className="table-cell text-center py-2 px-3">上报状态</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyData.map((m) => {
                      const expanded = expandedMonth === m.month;
                      const manifests = shippedByMonth.get(m.month) || [];
                      const uploadSt = monthUploadStatus.get(m.month) || 'none';
                      const uploadBadge = uploadSt === 'all'
                        ? <span className="badge-success inline-flex items-center gap-1"><CheckCircle className="w-3 h-3" />已上报</span>
                        : uploadSt === 'partial'
                          ? <span className="badge-warning inline-flex items-center gap-1"><Clock className="w-3 h-3" />部分上报</span>
                          : <span className="badge-danger inline-flex items-center gap-1"><XCircle className="w-3 h-3" />未上报</span>;
                      return (
                        <>
                          <tr key={m.month} className="border-b last:border-0 hover:bg-gray-50 cursor-pointer"
                            onClick={() => setExpandedMonth(expanded ? null : m.month)}>
                            <td className="table-cell py-2 px-3">
                              {expanded
                                ? <ChevronDown className="w-4 h-4 text-slate-400" />
                                : <ChevronRight className="w-4 h-4 text-slate-400" />}
                            </td>
                            <td className="table-cell py-2 px-3 font-medium">{fmtMonth(m.month)}</td>
                            <td className="table-cell py-2 px-3 text-right font-mono">{m.intake.toFixed(1)}</td>
                            <td className="table-cell py-2 px-3 text-right font-mono">{m.processed.toFixed(1)}</td>
                            <td className="table-cell py-2 px-3 text-right font-mono font-semibold text-emerald-700">{m.output.toFixed(1)}</td>
                            <td className="table-cell py-2 px-3 text-right font-mono">{m.moisture.toFixed(1)}</td>
                            <td className="table-cell py-2 px-3 text-center">{uploadBadge}</td>
                          </tr>
                          {expanded && (
                            <tr className="bg-slate-50">
                              <td colSpan={7} className="py-3 px-8">
                                <div className="mb-2 flex items-center justify-between">
                                  <p className="text-xs font-semibold text-slate-600">{fmtMonth(m.month)} 外运明细（共 {manifests.length} 车次 / 总重 {manifests.reduce((s, x) => s + x.drySludgeWeight, 0).toFixed(1)} 吨）</p>
                                </div>
                                {manifests.length === 0 ? (
                                  <p className="py-4 text-center text-sm text-slate-400">本月暂无外运记录</p>
                                ) : (
                                  <table className="w-full text-sm bg-white rounded-lg overflow-hidden">
                                    <thead>
                                      <tr className="table-header">
                                        <th className="table-cell text-left py-1.5 px-3">联单号</th>
                                        <th className="table-cell text-left py-1.5 px-3">接收单位</th>
                                        <th className="table-cell text-left py-1.5 px-3">车牌号</th>
                                        <th className="table-cell text-right py-1.5 px-3">重量(吨)</th>
                                        <th className="table-cell text-left py-1.5 px-3">外运时间</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {manifests.map((mf) => (
                                        <tr key={mf.id} className="border-b border-slate-100 last:border-0">
                                          <td className="table-cell py-1.5 px-3 font-mono text-xs">{mf.manifestNo}</td>
                                          <td className="table-cell py-1.5 px-3">{mf.receivingUnit}</td>
                                          <td className="table-cell py-1.5 px-3">{mf.plateNumber}</td>
                                          <td className="table-cell py-1.5 px-3 text-right font-medium">{mf.drySludgeWeight}</td>
                                          <td className="table-cell py-1.5 px-3 text-slate-500 text-xs">{fmtTime(mf.shippedTime)}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                )}
                              </td>
                            </tr>
                          )}
                        </>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'upload' && (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: '总任务数', value: uploadTasks.length, color: 'text-gray-700' },
              { label: '已上传', value: uploadTasks.filter((t) => t.status === 'uploaded').length, color: 'text-green-700' },
              { label: '待上传', value: uploadTasks.filter((t) => t.status === 'pending').length, color: 'text-amber-700' },
              { label: '失败', value: uploadTasks.filter((t) => t.status === 'failed').length, color: 'text-red-700' },
            ].map((s) => (
              <div key={s.label} className="card">
                <div className="card-body text-center">
                  <p className="stat-label text-xs text-gray-500">{s.label}</p>
                  <p className={cn('stat-value text-2xl font-bold', s.color)}>{s.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            {months.map((month) => {
              const tasks = uploadTasks.filter((t) => t.month === month);
              const expanded = expandedUploadMonth === month;
              const allUploaded = tasks.length > 0 && tasks.every((t) => t.status === 'uploaded');
              if (tasks.length === 0) return null;
              return (
                <div key={month} className="card">
                  <div
                    className="card-header flex items-center justify-between cursor-pointer"
                    onClick={() => setExpandedUploadMonth(expanded ? null : month)}
                  >
                    <div className="flex items-center gap-2">
                      {expanded
                        ? <ChevronDown className="w-4 h-4 text-slate-400" />
                        : <ChevronRight className="w-4 h-4 text-slate-400" />}
                      <Calendar className="w-4 h-4 text-teal-600" />
                      <span className="font-semibold">{fmtMonth(month)} 台账上报</span>
                      <span className="text-xs text-slate-400">（{tasks.length} 项）</span>
                    </div>
                    {allUploaded
                      ? <span className="badge-success inline-flex items-center gap-1"><CheckCircle className="w-3 h-3" />全部已上报</span>
                      : <span className="badge-warning inline-flex items-center gap-1"><Clock className="w-3 h-3" />待处理</span>}
                  </div>
                  {expanded && (
                    <div className="card-body overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="table-header border-b">
                            <th className="table-cell text-left py-2 px-3">任务名称</th>
                            <th className="table-cell text-left py-2 px-3">数据类型</th>
                            <th className="table-cell text-left py-2 px-3">状态</th>
                            <th className="table-cell text-left py-2 px-3">上传时间</th>
                            <th className="table-cell text-left py-2 px-3">数据大小</th>
                            <th className="table-cell text-left py-2 px-3">操作</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tasks.map((task) => (
                            <tr key={task.id} className="border-b last:border-0 hover:bg-gray-50">
                              <td className="table-cell py-2 px-3">{task.taskName}</td>
                              <td className="table-cell py-2 px-3">{task.dataType}</td>
                              <td className="table-cell py-2 px-3">{statusBadge(task.status)}</td>
                              <td className="table-cell py-2 px-3">{task.uploadTime ? fmtTime(task.uploadTime) : '-'}</td>
                              <td className="table-cell py-2 px-3">{task.dataSize}</td>
                              <td className="table-cell py-2 px-3">
                                {task.status === 'pending' && (
                                  <button
                                    onClick={() => updateUploadTaskStatus(task.id, 'uploaded')}
                                    className="btn-primary px-3 py-1 rounded text-xs"
                                  >
                                    上传
                                  </button>
                                )}
                                {task.status === 'failed' && (
                                  <button
                                    onClick={() => updateUploadTaskStatus(task.id, 'uploaded')}
                                    className="btn-secondary px-3 py-1 rounded text-xs flex items-center gap-1"
                                  >
                                    <RefreshCw className="w-3 h-3" />重试
                                  </button>
                                )}
                                {task.status === 'uploaded' && (
                                  <span className="text-xs text-emerald-600">已完成</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="space-y-4">
          <div className="card">
            <div className="card-header flex items-center justify-between">
              <span className="font-semibold">月度汇总数据</span>
              <div className="flex gap-2">
                <button className="btn-primary px-3 py-1.5 rounded text-xs flex items-center gap-1">
                  <BarChart3 className="w-3 h-3" />生成报表
                </button>
                <button className="btn-secondary px-3 py-1.5 rounded text-xs flex items-center gap-1">
                  <Download className="w-3 h-3" />导出
                </button>
              </div>
            </div>
            <div className="card-body overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="table-header border-b">
                    <th className="table-cell text-left py-2 px-3">月份</th>
                    <th className="table-cell text-right py-2 px-3">进泥量(t)</th>
                    <th className="table-cell text-right py-2 px-3">处置量(t)</th>
                    <th className="table-cell text-right py-2 px-3">外运量(t)</th>
                    <th className="table-cell text-right py-2 px-3">平均含水率(%)</th>
                    <th className="table-cell text-center py-2 px-3">上报状态</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyData.map((m) => {
                    const uploadSt = monthUploadStatus.get(m.month) || 'none';
                    const uploadBadge = uploadSt === 'all'
                      ? <span className="badge-success inline-flex items-center gap-1"><CheckCircle className="w-3 h-3" />已上报</span>
                      : uploadSt === 'partial'
                        ? <span className="badge-warning inline-flex items-center gap-1"><Clock className="w-3 h-3" />部分上报</span>
                        : <span className="badge-danger inline-flex items-center gap-1"><XCircle className="w-3 h-3" />未上报</span>;
                    return (
                      <tr key={m.month} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="table-cell py-2 px-3 font-medium">{fmtMonth(m.month)}</td>
                        <td className="table-cell py-2 px-3 text-right font-mono">{m.intake.toFixed(1)}</td>
                        <td className="table-cell py-2 px-3 text-right font-mono">{m.processed.toFixed(1)}</td>
                        <td className="table-cell py-2 px-3 text-right font-mono font-semibold text-emerald-700">{m.output.toFixed(1)}</td>
                        <td className="table-cell py-2 px-3 text-right font-mono">{m.moisture.toFixed(1)}</td>
                        <td className="table-cell py-2 px-3 text-center">{uploadBadge}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <div className="card-header font-semibold flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4 text-teal-600" />
              合规检查清单
            </div>
            <div className="card-body">
              <ul className="space-y-2">
                {complianceItems.map((item) => (
                  <li key={item.name} className="flex items-center justify-between py-2 px-3 rounded-md bg-gray-50">
                    <span className="text-sm">{item.name}</span>
                    <span className="badge-success inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium">
                      <CheckCircle className="w-3 h-3" />已合规
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
