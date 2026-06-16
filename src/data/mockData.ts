import type {
  WeighingRecord,
  MoistureTest,
  StorageShed,
  TurnRecord,
  ConditioningRecord,
  FilterPressRecord,
  ThermalDryingRecord,
  LowTempDryingRecord,
  DeodorizationRecord,
  TransportManifest,
  DailyStatistics,
  AlertItem,
  UploadTask,
} from '@/types'

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function randomDate(daysAgo: number) {
  const d = new Date()
  d.setDate(d.getDate() - Math.floor(Math.random() * daysAgo))
  d.setHours(Math.floor(Math.random() * 12) + 7, Math.floor(Math.random() * 60))
  return d.toISOString()
}

function formatDate(d: Date) {
  return d.toISOString().slice(0, 10)
}

const sourceUnits = ['城东污水厂', '城西污水厂', '高新区污水厂', '经开区污水厂', '滨湖区污水厂']
const drivers = ['张建国', '李明华', '王德发', '赵永强', '刘志刚']
const operators = ['陈工', '周工', '吴工', '孙工']
const plates = ['苏B·12345', '苏B·23456', '苏B·34567', '苏B·45678', '苏B·56789']

export function generateWeighingRecords(): WeighingRecord[] {
  return Array.from({ length: 30 }, (_, i) => {
    const gross = 25 + Math.random() * 15
    const tare = 10 + Math.random() * 5
    return {
      id: genId() + i,
      plateNumber: plates[i % plates.length],
      grossWeight: Math.round(gross * 100) / 100,
      tareWeight: Math.round(tare * 100) / 100,
      netWeight: Math.round((gross - tare) * 100) / 100,
      sourceUnit: sourceUnits[i % sourceUnits.length],
      driver: drivers[i % drivers.length],
      weighTime: randomDate(30),
      operator: operators[i % operators.length],
    }
  })
}

export function generateMoistureTests(records: WeighingRecord[]): MoistureTest[] {
  return records.slice(0, 20).map((r, i) => {
    const rate = 65 + Math.random() * 20
    return {
      id: genId() + 'm' + i,
      sampleId: `SY-${new Date(r.weighTime).toISOString().slice(0, 10).replace(/-/g, '')}-${String(i + 1).padStart(3, '0')}`,
      weighingId: r.id,
      moistureRate: Math.round(rate * 10) / 10,
      testMethod: i % 2 === 0 ? '烘干法' : '快速测定法',
      tester: operators[i % operators.length],
      testTime: r.weighTime,
      isQualified: rate <= 80,
    }
  })
}

export function generateStorageSheds(): StorageShed[] {
  return [
    { id: 'shed1', name: '1号堆棚', capacity: 500, currentStock: 320, moistureRate: 72.5, lastTurnTime: randomDate(2), status: 'normal' },
    { id: 'shed2', name: '2号堆棚', capacity: 500, currentStock: 450, moistureRate: 78.3, lastTurnTime: randomDate(5), status: 'warning' },
    { id: 'shed3', name: '3号堆棚', capacity: 400, currentStock: 380, moistureRate: 80.1, lastTurnTime: randomDate(8), status: 'full' },
    { id: 'shed4', name: '4号堆棚', capacity: 400, currentStock: 150, moistureRate: 68.2, lastTurnTime: randomDate(1), status: 'normal' },
  ]
}

export function generateTurnRecords(sheds: StorageShed[]): TurnRecord[] {
  return Array.from({ length: 15 }, (_, i) => {
    const shed = sheds[i % sheds.length]
    const before = 70 + Math.random() * 15
    return {
      id: genId() + 't' + i,
      shedId: shed.id,
      shedName: shed.name,
      turnTime: randomDate(15),
      area: `${String.fromCharCode(65 + (i % 3))}区`,
      operator: operators[i % operators.length],
      beforeMoisture: Math.round(before * 10) / 10,
      afterMoisture: Math.round((before - 3 - Math.random() * 5) * 10) / 10,
    }
  })
}

export function generateConditioningRecords(): ConditioningRecord[] {
  const chemicals = ['PAC', 'PAM', 'FeCl3', '石灰']
  return Array.from({ length: 12 }, (_, i) => {
    const sludge = 15 + Math.random() * 10
    const dosage = 0.5 + Math.random() * 2
    return {
      id: genId() + 'c' + i,
      batchNo: `TL-${new Date(randomDate(20)).toISOString().slice(0, 10).replace(/-/g, '')}-${String(i + 1).padStart(3, '0')}`,
      sludgeAmount: Math.round(sludge * 10) / 10,
      chemicalType: chemicals[i % chemicals.length],
      chemicalDosage: Math.round(dosage * 100) / 100,
      ratio: `${Math.round(dosage / sludge * 10000) / 100}%`,
      operator: operators[i % operators.length],
      operateTime: randomDate(20),
    }
  })
}

export function generateFilterPressRecords(): FilterPressRecord[] {
  return Array.from({ length: 10 }, (_, i) => {
    const moisture = 45 + Math.random() * 20
    return {
      id: genId() + 'f' + i,
      batchNo: `BY-${new Date(randomDate(20)).toISOString().slice(0, 10).replace(/-/g, '')}-${String(i + 1).padStart(3, '0')}`,
      feedAmount: Math.round((12 + Math.random() * 8) * 10) / 10,
      pressTime: Math.round((1.5 + Math.random() * 2) * 10) / 10,
      outputMoisture: Math.round(moisture * 10) / 10,
      filtrateVolume: Math.round((5 + Math.random() * 4) * 10) / 10,
      operator: operators[i % operators.length],
      operateTime: randomDate(20),
    }
  })
}

export function generateThermalDryingRecords(): ThermalDryingRecord[] {
  return Array.from({ length: 15 }, (_, i) => {
    const moisture = 15 + Math.random() * 25
    return {
      id: genId() + 'th' + i,
      batchNo: `RG-${new Date(randomDate(20)).toISOString().slice(0, 10).replace(/-/g, '')}-${String(i + 1).padStart(3, '0')}`,
      inletTemp: Math.round((200 + Math.random() * 100) * 10) / 10,
      outletTemp: Math.round((80 + Math.random() * 40) * 10) / 10,
      drumTemp: Math.round((150 + Math.random() * 50) * 10) / 10,
      outputMoisture: Math.round(moisture * 10) / 10,
      energyConsumption: Math.round((80 + Math.random() * 60) * 10) / 10,
      operator: operators[i % operators.length],
      operateTime: randomDate(20),
    }
  })
}

export function generateLowTempDryingRecords(): LowTempDryingRecord[] {
  return Array.from({ length: 10 }, (_, i) => {
    const moisture = 20 + Math.random() * 20
    return {
      id: genId() + 'lt' + i,
      batchNo: `DW-${new Date(randomDate(20)).toISOString().slice(0, 10).replace(/-/g, '')}-${String(i + 1).padStart(3, '0')}`,
      dryTemp: Math.round((45 + Math.random() * 15) * 10) / 10,
      humidity: Math.round((30 + Math.random() * 30) * 10) / 10,
      airVolume: Math.round((5000 + Math.random() * 3000)),
      duration: Math.round((4 + Math.random() * 6) * 10) / 10,
      outputMoisture: Math.round(moisture * 10) / 10,
      operator: operators[i % operators.length],
      operateTime: randomDate(20),
    }
  })
}

export function generateDeodorizationRecords(): DeodorizationRecord[] {
  return Array.from({ length: 10 }, (_, i) => ({
    id: genId() + 'd' + i,
    batchNo: `CX-${new Date(randomDate(20)).toISOString().slice(0, 10).replace(/-/g, '')}-${String(i + 1).padStart(3, '0')}`,
    equipmentStatus: i % 5 === 0 ? '维护中' : '运行正常',
    deodorantDosage: Math.round((2 + Math.random() * 3) * 100) / 100,
    odorConcentration: Math.round((10 + Math.random() * 40)),
    operator: operators[i % operators.length],
    operateTime: randomDate(20),
  }))
}

export function generateTransportManifests(): TransportManifest[] {
  const units = ['建材公司', '焚烧发电厂', '水泥厂', '砖厂']
  const statuses: TransportManifest['status'][] = ['pending', 'approved', 'shipped']
  return Array.from({ length: 12 }, (_, i) => {
    const createT = randomDate(20)
    const status = statuses[i % statuses.length]
    const shippedT = status === 'shipped' ? new Date(new Date(createT).getTime() + 86400000 * (Math.random() < 0.3 ? 1 : 0)).toISOString() : undefined
    return {
      id: genId() + 'tr' + i,
      manifestNo: `LD-${new Date(createT).toISOString().slice(0, 10).replace(/-/g, '')}-${String(i + 1).padStart(3, '0')}`,
      receivingUnit: units[i % units.length],
      plateNumber: plates[i % plates.length],
      drySludgeWeight: Math.round((8 + Math.random() * 12) * 10) / 10,
      status,
      operator: operators[i % operators.length],
      createTime: createT,
      shippedTime: shippedT,
    }
  })
}

export function generateDailyStatistics(): DailyStatistics[] {
  return Array.from({ length: 30 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (29 - i))
    const intake = 20 + Math.random() * 25
    const processed = 15 + Math.random() * 20
    const output = 8 + Math.random() * 12
    return {
      id: genId() + 's' + i,
      date: formatDate(d),
      intakeAmount: Math.round(intake * 10) / 10,
      processedAmount: Math.round(processed * 10) / 10,
      outputAmount: Math.round(output * 10) / 10,
      stockAmount: Math.round((80 + Math.random() * 60) * 10) / 10,
      avgMoisture: Math.round((55 + Math.random() * 25) * 10) / 10,
    }
  })
}

export function generateAlerts(): AlertItem[] {
  return [
    { id: 'a1', type: 'moisture', level: 'critical', message: '3号堆棚含水率超标 (80.1%)', time: new Date().toISOString(), module: '暂存堆棚' },
    { id: 'a2', type: 'temperature', level: 'warning', message: '热干化出口温度偏高 (118°C)', time: new Date(Date.now() - 3600000).toISOString(), module: '热干化' },
    { id: 'a3', type: 'stock', level: 'warning', message: '2号堆棚库存接近满容 (90%)', time: new Date(Date.now() - 7200000).toISOString(), module: '暂存堆棚' },
    { id: 'a4', type: 'equipment', level: 'critical', message: '除臭设备3号机组维护中', time: new Date(Date.now() - 10800000).toISOString(), module: '低温干燥' },
    { id: 'a5', type: 'moisture', level: 'warning', message: '板框压滤出泥含水率偏高 (62.3%)', time: new Date(Date.now() - 14400000).toISOString(), module: '调理脱水' },
  ]
}

export function generateUploadTasks(): UploadTask[] {
  const types = [
    { dataType: '进泥过磅', size: '2.3MB' },
    { dataType: '处置统计', size: '1.8MB' },
    { dataType: '出泥外运', size: '1.2MB' },
    { dataType: '检测数据', size: '3.1MB' },
    { dataType: '运行数据', size: '4.5MB' },
  ]
  const months = ['2026-02', '2026-03', '2026-04', '2026-05', '2026-06']
  const tasks: UploadTask[] = []
  let idx = 1
  for (const month of months) {
    for (const t of types) {
      const isCurrent = month === '2026-06'
      const isPrev = month === '2026-05'
      const status: UploadTask['status'] = isCurrent ? (idx % 3 === 0 ? 'pending' : (idx % 3 === 1 ? 'uploaded' : 'failed'))
        : isPrev ? (idx % 2 === 0 ? 'uploaded' : 'pending')
        : 'uploaded'
      const uploadTime = status === 'uploaded'
        ? new Date(new Date(month + '-15').getTime() + idx * 3600000).toISOString()
        : (status === 'failed' ? new Date(new Date(month + '-20').getTime()).toISOString() : '')
      const [y, m] = month.split('-')
      tasks.push({
        id: 'u' + idx,
        taskName: `${y}年${parseInt(m, 10)}月${t.dataType}`,
        dataType: t.dataType,
        status,
        uploadTime,
        dataSize: t.size,
        month,
      })
      idx++
    }
  }
  return tasks
}

export function generateTempCurveData() {
  return Array.from({ length: 24 }, (_, i) => ({
    time: `${String(i).padStart(2, '0')}:00`,
    inlet: 200 + Math.random() * 80 + Math.sin(i / 3) * 30,
    outlet: 80 + Math.random() * 30 + Math.sin(i / 3) * 15,
    drum: 150 + Math.random() * 40 + Math.sin(i / 3) * 20,
  }))
}
