import React from 'react'

export type DocumentType = 'CPF' | 'CNPJ'
export type ClientKind = 'Detran' | 'SMTR' | 'Ambos'

export type PersonalData = {
  fullName: string
  documentType: DocumentType
  document: string
  birthDate?: string
  clientType?: ClientKind
  maritalStatus?: string
  sex?: 'Masculino' | 'Feminino' | 'Outro'
  phone: string
  email?: string
  photoUrl?: string
}

export type DocumentsData = {
  rg?: string
  orgaoExpedidor?: string
  dataExpedicao?: string
  ufExpedidor?: string
  cnh?: string
  validadeCnh?: string
  numeroPermissao?: string
  ratr?: string
  photoCnh?: string
  photoPermissao?: string
}

export type AddressData = {
  cep?: string
  address?: string
  number?: string
  complement?: string
  neighborhood?: string
  city?: string
  state?: string
}

export type ClientRegisterState = {
  personal: PersonalData
  docs: DocumentsData
  address: AddressData
}

type ContextType = {
  data: ClientRegisterState
  setPersonal: (p: Partial<PersonalData>) => void
  setDocs: (d: Partial<DocumentsData>) => void
  setAddress: (a: Partial<AddressData>) => void
  clear: () => void
}

const defaultState: ClientRegisterState = {
  personal: {
    fullName: '',
    documentType: 'CPF',
    document: '',
    phone: '',
    clientType: undefined
  },
  docs: {},
  address: {}
}

export const ClientRegisterContext = React.createContext<ContextType | undefined>(undefined)

export function ClientRegisterProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = React.useState<ClientRegisterState>(defaultState)
  const setPersonal = (p: Partial<PersonalData>) =>
    setData((prev) => ({ ...prev, personal: { ...prev.personal, ...p } }))
  const setDocs = (d: Partial<DocumentsData>) =>
    setData((prev) => ({ ...prev, docs: { ...prev.docs, ...d } }))
  const setAddress = (a: Partial<AddressData>) =>
    setData((prev) => ({ ...prev, address: { ...prev.address, ...a } }))
  const clear = () => setData(defaultState)
  return (
    <ClientRegisterContext.Provider value={{ data, setPersonal, setDocs, setAddress, clear }}>
      {children}
    </ClientRegisterContext.Provider>
  )
}

export function useClientRegister() {
  const ctx = React.useContext(ClientRegisterContext)
  if (!ctx) throw new Error('useClientRegister must be used within ClientRegisterProvider')
  return ctx
}


