import React from 'react'
import { Client } from '../../clients/data/mock'

export type VehicleData = {
  brand?: string
  model?: string
  plate?: string
  chassis?: string
  renavam?: string
  year?: string
  modelYear?: string
  color?: string
  crv?: string
  fuel?: string
  category?: string
  docPhotoUrl?: string
}

export type VehicleRegisterState = {
  client?: Pick<Client, 'id' | 'nome' | 'documentType' | 'document' | 'phone'>
  vehicle: VehicleData
}

type Ctx = {
  data: VehicleRegisterState
  setClient: (c: VehicleRegisterState['client']) => void
  setVehicle: (v: Partial<VehicleData>) => void
  clear: () => void
}

const defaultState: VehicleRegisterState = { vehicle: {} }

export const VehicleRegisterContext = React.createContext<Ctx | undefined>(undefined)

export function VehicleRegisterProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = React.useState<VehicleRegisterState>(defaultState)
  const setClient = (c: VehicleRegisterState['client']) => setData((p) => ({ ...p, client: c }))
  const setVehicle = (v: Partial<VehicleData>) => setData((p) => ({ ...p, vehicle: { ...p.vehicle, ...v } }))
  const clear = () => setData(defaultState)
  return (
    <VehicleRegisterContext.Provider value={{ data, setClient, setVehicle, clear }}>
      {children}
    </VehicleRegisterContext.Provider>
  )
}

export function useVehicleRegister() {
  const ctx = React.useContext(VehicleRegisterContext)
  if (!ctx) throw new Error('useVehicleRegister must be used within VehicleRegisterProvider')
  return ctx
}


