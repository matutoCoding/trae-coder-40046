export interface WeighingRecord {
  id: string
  plateNumber: string
  grossWeight: number
  tareWeight: number
  netWeight: number
  sourceUnit: string
  driver: string
  weighTime: string
  operator: string
}

export interface MoistureTest {
  id: string
  sampleId: string
  weighingId: string
  moistureRate: number
  testMethod: string
  tester: string
  testTime: string
  isQualified: boolean
}

export interface StorageShed {
  id: string
  name: string
  capacity: number
  currentStock: number
  moistureRate: number
  lastTurnTime: string
  status: 'normal' | 'warning' | 'full'
}

export interface TurnRecord {
  id: string
  shedId: string
  shedName: string
  turnTime: string
  area: string
  operator: string
  beforeMoisture: number
  afterMoisture: number
}

export interface ConditioningRecord {
  id: string
  batchNo: string
  sludgeAmount: number
  chemicalType: string
  chemicalDosage: number
  ratio: string
  operator: string
  operateTime: string
}

export interface FilterPressRecord {
  id: string
  batchNo: string
  feedAmount: number
  pressTime: number
  outputMoisture: number
  filtrateVolume: number
  operator: string
  operateTime: string
}

export interface ThermalDryingRecord {
  id: string
  batchNo: string
  inletTemp: number
  outletTemp: number
  drumTemp: number
  outputMoisture: number
  energyConsumption: number
  operator: string
  operateTime: string
}

export interface LowTempDryingRecord {
  id: string
  batchNo: string
  dryTemp: number
  humidity: number
  airVolume: number
  duration: number
  outputMoisture: number
  operator: string
  operateTime: string
}

export interface DeodorizationRecord {
  id: string
  batchNo: string
  equipmentStatus: string
  deodorantDosage: number
  odorConcentration: number
  operator: string
  operateTime: string
}

export interface TransportManifest {
  id: string
  manifestNo: string
  receivingUnit: string
  plateNumber: string
  drySludgeWeight: number
  status: 'pending' | 'approved' | 'shipped'
  operator: string
  createTime: string
  approvedTime?: string
  shippedTime?: string
}

export interface DailyStatistics {
  id: string
  date: string
  intakeAmount: number
  processedAmount: number
  outputAmount: number
  stockAmount: number
  avgMoisture: number
}

export interface AlertItem {
  id: string
  type: 'moisture' | 'temperature' | 'stock' | 'equipment'
  level: 'warning' | 'critical'
  message: string
  time: string
  module: string
}

export interface UploadTask {
  id: string
  taskName: string
  dataType: string
  status: 'pending' | 'uploaded' | 'failed'
  uploadTime: string
  dataSize: string
  month: string
}
