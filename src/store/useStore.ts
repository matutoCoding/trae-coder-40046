import { create } from 'zustand'
import { persist } from 'zustand/middleware'
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
import {
  generateWeighingRecords,
  generateMoistureTests,
  generateStorageSheds,
  generateTurnRecords,
  generateConditioningRecords,
  generateFilterPressRecords,
  generateThermalDryingRecords,
  generateLowTempDryingRecords,
  generateDeodorizationRecords,
  generateTransportManifests,
  generateDailyStatistics,
  generateAlerts,
  generateUploadTasks,
  generateTempCurveData,
} from '@/data/mockData'

interface SludgeStore {
  weighingRecords: WeighingRecord[]
  moistureTests: MoistureTest[]
  storageSheds: StorageShed[]
  turnRecords: TurnRecord[]
  conditioningRecords: ConditioningRecord[]
  filterPressRecords: FilterPressRecord[]
  thermalDryingRecords: ThermalDryingRecord[]
  lowTempDryingRecords: LowTempDryingRecord[]
  deodorizationRecords: DeodorizationRecord[]
  transportManifests: TransportManifest[]
  dailyStatistics: DailyStatistics[]
  alerts: AlertItem[]
  uploadTasks: UploadTask[]
  tempCurveData: { time: string; inlet: number; outlet: number; drum: number }[]

  addWeighingRecord: (record: Omit<WeighingRecord, 'id'> & { id?: string }) => void
  addMoistureTest: (test: Omit<MoistureTest, 'id'>) => void
  addTurnRecord: (record: Omit<TurnRecord, 'id'>) => void
  addConditioningRecord: (record: Omit<ConditioningRecord, 'id'>) => void
  addFilterPressRecord: (record: Omit<FilterPressRecord, 'id'>) => void
  addThermalDryingRecord: (record: Omit<ThermalDryingRecord, 'id'>) => void
  addLowTempDryingRecord: (record: Omit<LowTempDryingRecord, 'id'>) => void
  addDeodorizationRecord: (record: Omit<DeodorizationRecord, 'id'>) => void
  addTransportManifest: (manifest: Omit<TransportManifest, 'id'>) => void
  updateManifestStatus: (id: string, status: TransportManifest['status']) => void
  updateUploadTaskStatus: (id: string, status: UploadTask['status']) => void
  updateShed: (id: string, data: Partial<StorageShed>) => void
}

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

const STORAGE_KEY = 'sludge-management-store-v2'

function getInitialState() {
  const initialWeighing = generateWeighingRecords()
  const initialMoisture = generateMoistureTests(initialWeighing)
  const initialSheds = generateStorageSheds()
  return {
    weighingRecords: initialWeighing,
    moistureTests: initialMoisture,
    storageSheds: initialSheds,
    turnRecords: generateTurnRecords(initialSheds),
    conditioningRecords: generateConditioningRecords(),
    filterPressRecords: generateFilterPressRecords(),
    thermalDryingRecords: generateThermalDryingRecords(),
    lowTempDryingRecords: generateLowTempDryingRecords(),
    deodorizationRecords: generateDeodorizationRecords(),
    transportManifests: generateTransportManifests(),
    dailyStatistics: generateDailyStatistics(),
    alerts: generateAlerts(),
    uploadTasks: generateUploadTasks(),
    tempCurveData: generateTempCurveData(),
  }
}

export const useStore = create<SludgeStore>()(
  persist(
    (set) => ({
      ...getInitialState(),

      addWeighingRecord: (record) =>
        set((s) => ({ weighingRecords: [{ ...record, id: record.id || genId() }, ...s.weighingRecords] })),

      addMoistureTest: (test) =>
        set((s) => ({ moistureTests: [{ ...test, id: genId() }, ...s.moistureTests] })),

      addTurnRecord: (record) =>
        set((s) => ({ turnRecords: [{ ...record, id: genId() }, ...s.turnRecords] })),

      addConditioningRecord: (record) =>
        set((s) => ({ conditioningRecords: [{ ...record, id: genId() }, ...s.conditioningRecords] })),

      addFilterPressRecord: (record) =>
        set((s) => ({ filterPressRecords: [{ ...record, id: genId() }, ...s.filterPressRecords] })),

      addThermalDryingRecord: (record) =>
        set((s) => ({ thermalDryingRecords: [{ ...record, id: genId() }, ...s.thermalDryingRecords] })),

      addLowTempDryingRecord: (record) =>
        set((s) => ({ lowTempDryingRecords: [{ ...record, id: genId() }, ...s.lowTempDryingRecords] })),

      addDeodorizationRecord: (record) =>
        set((s) => ({ deodorizationRecords: [{ ...record, id: genId() }, ...s.deodorizationRecords] })),

      addTransportManifest: (manifest) =>
        set((s) => ({ transportManifests: [{ ...manifest, id: genId() }, ...s.transportManifests] })),

      updateManifestStatus: (id, status) =>
        set((s) => ({
          transportManifests: s.transportManifests.map((m) =>
            m.id === id
              ? { ...m, status, shippedTime: status === 'shipped' ? (m.shippedTime || new Date().toISOString()) : m.shippedTime }
              : m
          ),
        })),

      updateUploadTaskStatus: (id, status) =>
        set((s) => ({
          uploadTasks: s.uploadTasks.map((t) =>
            t.id === id ? { ...t, status, uploadTime: status === 'uploaded' ? new Date().toISOString() : t.uploadTime } : t
          ),
        })),

      updateShed: (id, data) =>
        set((s) => ({
          storageSheds: s.storageSheds.map((sh) =>
            sh.id === id ? { ...sh, ...data } : sh
          ),
        })),
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        weighingRecords: state.weighingRecords,
        moistureTests: state.moistureTests,
        storageSheds: state.storageSheds,
        turnRecords: state.turnRecords,
        conditioningRecords: state.conditioningRecords,
        filterPressRecords: state.filterPressRecords,
        thermalDryingRecords: state.thermalDryingRecords,
        lowTempDryingRecords: state.lowTempDryingRecords,
        deodorizationRecords: state.deodorizationRecords,
        transportManifests: state.transportManifests,
        uploadTasks: state.uploadTasks,
      }),
      merge: (persistedState, currentState) => {
        if (!persistedState || typeof persistedState !== 'object') return currentState
        const merged = { ...currentState, ...persistedState } as SludgeStore
        return merged
      },
    }
  )
)
