import { useState } from 'react';
import { Scale, Droplets, FileText, Plus, Search, CheckCircle, XCircle } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { cn } from '@/lib/utils';

const SOURCE_OPTIONS = ['城东污水厂', '城西污水厂', '高新区污水厂', '经开区污水厂', '滨湖区污水厂'];
const TEST_METHODS = ['烘干法', '快速测定法'];

const TABS = [
  { key: 'register', label: '过磅登记', icon: Scale },
  { key: 'moisture', label: '含水率检测', icon: Droplets },
  { key: 'records', label: '进泥记录', icon: FileText },
] as const;

type TabKey = (typeof TABS)[number]['key'];

function generateSampleId() {
  const now = new Date();
  const date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const seq = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0');
  return `SY-${date}-${seq}`;
}

export default function Weighing() {
  const [activeTab, setActiveTab] = useState<TabKey>('register');
  const { weighingRecords, moistureTests, addWeighingRecord, addMoistureTest } = useStore();

  const [formPlate, setFormPlate] = useState('');
  const [formGross, setFormGross] = useState('');
  const [formTare, setFormTare] = useState('');
  const [formSource, setFormSource] = useState(SOURCE_OPTIONS[0]);
  const [formDriver, setFormDriver] = useState('');
  const [formOperator, setFormOperator] = useState('');

  const [testSampleId, setTestSampleId] = useState(generateSampleId());
  const [testWeighingId, setTestWeighingId] = useState('');
  const [testMoisture, setTestMoisture] = useState('');
  const [testMethod, setTestMethod] = useState(TEST_METHODS[0]);
  const [tester, setTester] = useState('');

  const [filterPlate, setFilterPlate] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const netWeight = Number(formGross) - Number(formTare);

  const handleSubmitWeighing = () => {
    if (!formPlate || !formGross || !formTare || netWeight <= 0) return;
    const newId = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    addWeighingRecord({
      plateNumber: formPlate,
      grossWeight: Number(formGross),
      tareWeight: Number(formTare),
      netWeight,
      sourceUnit: formSource,
      driver: formDriver,
      operator: formOperator,
      weighTime: new Date().toISOString(),
    });
    setFormPlate('');
    setFormGross('');
    setFormTare('');
    setFormDriver('');
    setTestWeighingId(newId);
    setActiveTab('moisture');
  };

  const handleSubmitMoisture = () => {
    if (!testWeighingId || !testMoisture) return;
    const rate = Number(testMoisture);
    addMoistureTest({
      sampleId: testSampleId,
      weighingId: testWeighingId,
      moistureRate: rate,
      testMethod: testMethod,
      tester,
      testTime: new Date().toISOString(),
      isQualified: rate <= 80,
    });
    setTestSampleId(generateSampleId());
    setTestMoisture('');
    setTester('');
  };

  const filteredRecords = weighingRecords.filter((r) => {
    if (filterPlate && !r.plateNumber.includes(filterPlate)) return false;
    if (filterDate && !r.weighTime.startsWith(filterDate)) return false;
    return true;
  });

  const totalPages = Math.ceil(filteredRecords.length / 10);
  const paginatedRecords = filteredRecords.slice((currentPage - 1) * 10, currentPage * 10);

  const recentRecords = weighingRecords.slice(0, 5);

  const renderRegister = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="card">
        <div className="card-header flex items-center gap-2">
          <Plus className="w-4 h-4" />
          过磅登记
        </div>
        <div className="card-body space-y-4">
          <div>
            <label className="stat-label">车牌号</label>
            <input className="input-field w-full" value={formPlate} onChange={(e) => setFormPlate(e.target.value)} placeholder="请输入车牌号" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="stat-label">毛重 (吨)</label>
              <input className="input-field w-full" type="number" value={formGross} onChange={(e) => setFormGross(e.target.value)} placeholder="0" />
            </div>
            <div>
              <label className="stat-label">皮重 (吨)</label>
              <input className="input-field w-full" type="number" value={formTare} onChange={(e) => setFormTare(e.target.value)} placeholder="0" />
            </div>
          </div>
          <div>
            <label className="stat-label">净重 (吨)</label>
            <div className="stat-value text-lg">{netWeight > 0 ? netWeight.toFixed(2) : '-'}</div>
          </div>
          <div>
            <label className="stat-label">来源单位</label>
            <select className="select-field w-full" value={formSource} onChange={(e) => setFormSource(e.target.value)}>
              {SOURCE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="stat-label">司机</label>
              <input className="input-field w-full" value={formDriver} onChange={(e) => setFormDriver(e.target.value)} placeholder="请输入司机姓名" />
            </div>
            <div>
              <label className="stat-label">操作员</label>
              <input className="input-field w-full" value={formOperator} onChange={(e) => setFormOperator(e.target.value)} placeholder="请输入操作员" />
            </div>
          </div>
          <button className="btn-primary w-full" onClick={handleSubmitWeighing}>确认登记</button>
        </div>
      </div>
      <div className="card">
        <div className="card-header">最近过磅记录</div>
        <div className="card-body">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="table-header">车牌号</th>
                <th className="table-header">净重(吨)</th>
                <th className="table-header">来源</th>
                <th className="table-header">时间</th>
              </tr>
            </thead>
            <tbody>
              {recentRecords.map((r) => (
                <tr key={r.id}>
                  <td className="table-cell">{r.plateNumber}</td>
                  <td className="table-cell">{r.netWeight.toFixed(2)}</td>
                  <td className="table-cell">{r.sourceUnit}</td>
                  <td className="table-cell">{new Date(r.weighTime).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderMoisture = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="card">
        <div className="card-header flex items-center gap-2">
          <Droplets className="w-4 h-4" />
          含水率检测
        </div>
        <div className="card-body space-y-4">
          <div>
            <label className="stat-label">样品编号</label>
            <input className="input-field w-full bg-gray-100" value={testSampleId} readOnly />
          </div>
          <div>
            <label className="stat-label">关联过磅记录</label>
            <select className="select-field w-full" value={testWeighingId} onChange={(e) => setTestWeighingId(e.target.value)}>
              <option value="">请选择</option>
              {weighingRecords.slice(0, 20).map((r) => (
                <option key={r.id} value={r.id}>{r.plateNumber} - {r.netWeight.toFixed(2)}吨</option>
              ))}
            </select>
          </div>
          <div>
            <label className="stat-label">含水率 (%)</label>
            <input className="input-field w-full" type="number" value={testMoisture} onChange={(e) => setTestMoisture(e.target.value)} placeholder="0" />
          </div>
          <div className="flex items-center gap-3">
            <span className={cn('text-sm font-medium', Number(testMoisture) <= 80 ? 'text-green-600' : 'text-red-600')}>
              {testMoisture ? (Number(testMoisture) <= 80 ? '合格' : '不合格') : ''}
            </span>
          </div>
          <div>
            <label className="stat-label">检测方法</label>
            <select className="select-field w-full" value={testMethod} onChange={(e) => setTestMethod(e.target.value)}>
              {TEST_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="stat-label">检测人</label>
            <input className="input-field w-full" value={tester} onChange={(e) => setTester(e.target.value)} placeholder="请输入检测人" />
          </div>
          <button className="btn-primary w-full" onClick={handleSubmitMoisture}>提交检测</button>
        </div>
      </div>
      <div className="card">
        <div className="card-header">检测记录</div>
        <div className="card-body">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="table-header">样品编号</th>
                <th className="table-header">含水率</th>
                <th className="table-header">方法</th>
                <th className="table-header">结果</th>
              </tr>
            </thead>
            <tbody>
              {moistureTests.map((t) => (
                <tr key={t.id}>
                  <td className="table-cell">{t.sampleId}</td>
                  <td className="table-cell">{t.moistureRate}%</td>
                  <td className="table-cell">{t.testMethod}</td>
                  <td className="table-cell">
                    <span className={cn(t.isQualified ? 'badge-success' : 'badge-danger')}>
                      {t.isQualified ? <CheckCircle className="w-3 h-3 inline mr-1" /> : <XCircle className="w-3 h-3 inline mr-1" />}
                      {t.isQualified ? '合格' : '不合格'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderRecords = () => (
    <div className="card">
      <div className="card-header">进泥记录</div>
      <div className="card-body">
        <div className="flex gap-4 mb-4 items-end">
          <div>
            <label className="stat-label">车牌号</label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
              <input className="input-field pl-8" value={filterPlate} onChange={(e) => { setFilterPlate(e.target.value); setCurrentPage(1); }} placeholder="搜索车牌号" />
            </div>
          </div>
          <div>
            <label className="stat-label">日期</label>
            <input className="input-field" type="date" value={filterDate} onChange={(e) => { setFilterDate(e.target.value); setCurrentPage(1); }} />
          </div>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="table-header">车牌号</th>
              <th className="table-header">毛重(吨)</th>
              <th className="table-header">皮重(吨)</th>
              <th className="table-header">净重(吨)</th>
              <th className="table-header">来源单位</th>
              <th className="table-header">司机</th>
              <th className="table-header">操作员</th>
              <th className="table-header">过磅时间</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRecords.map((r) => (
              <tr key={r.id}>
                <td className="table-cell">{r.plateNumber}</td>
                <td className="table-cell">{r.grossWeight.toFixed(2)}</td>
                <td className="table-cell">{r.tareWeight.toFixed(2)}</td>
                <td className="table-cell font-medium">{r.netWeight.toFixed(2)}</td>
                <td className="table-cell">{r.sourceUnit}</td>
                <td className="table-cell">{r.driver}</td>
                <td className="table-cell">{r.operator}</td>
                <td className="table-cell">{new Date(r.weighTime).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-between items-center mt-4">
          <span className="text-sm text-gray-500">共 {filteredRecords.length} 条</span>
          <div className="flex gap-2">
            <button className="btn-secondary" disabled={currentPage <= 1} onClick={() => setCurrentPage((p) => p - 1)}>上一页</button>
            <span className="flex items-center px-3 text-sm">{currentPage} / {totalPages || 1}</span>
            <button className="btn-secondary" disabled={currentPage >= totalPages} onClick={() => setCurrentPage((p) => p + 1)}>下一页</button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex gap-1 border-b">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              className={cn('flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors', activeTab === tab.key ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700')}
              onClick={() => setActiveTab(tab.key)}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>
      {activeTab === 'register' && renderRegister()}
      {activeTab === 'moisture' && renderMoisture()}
      {activeTab === 'records' && renderRecords()}
    </div>
  );
}
