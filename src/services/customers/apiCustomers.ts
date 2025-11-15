type CreateCustomerAddress = {
  address?: string
  number?: string
  complement?: string
  neighborhood?: string
  city?: string
  state?: string
  zip_code?: string
}

type CreateCustomerDocuments = {
  identity_number?: string
  identity_org?: string
  identity_issued_at?: string
  identity_local?: string
  driver_license_number?: string
  driver_license_expiration?: string
  driver_license_image?: string
  smtr_permission_number?: string
  smtr_permission_image?: string
  smtr_ratr_number?: string
}

export type CreateCustomerRequest = {
  tax_type: 'CPF' | 'CNPJ'
  tax_id: string
  full_name: string
  gender?: 'male' | 'female' | 'other'
  email?: string
  birth_date?: string
  customer_type?: string
  civil_status?: string
  tel_number: string
  address: CreateCustomerAddress
  documents: CreateCustomerDocuments
}

function getBaseUrl(): string {
  const base = import.meta.env.VITE_API_BASE_URL as string | undefined
  if (!base) return ''
  return base.replace(/\/+$/, '')
}

function getCredentialsMode(): RequestCredentials {
  const withCreds = (import.meta.env.VITE_API_WITH_CREDENTIALS as string | undefined)?.toLowerCase() === 'true'
  return withCreds ? 'include' : 'omit'
}

export async function createCustomer(payload: CreateCustomerRequest): Promise<void> {
  const baseUrl = getBaseUrl()
  const url = `${baseUrl}/customers/`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    credentials: getCredentialsMode(),
    body: JSON.stringify(payload)
  })
  if (!res.ok) {
    // tenta extrair mensagem de erro do corpo
    let detail: string | undefined
    try {
      const json = await res.json()
      detail = json?.detail ?? json?.message
    } catch {}
    throw new Error(detail ?? `Erro ao cadastrar cliente (${detail})`)
  }
}

export type { CreateCustomerAddress, CreateCustomerDocuments }

export type AvailableCustomer = {
  id?: string | number
  name: string
  tax_id: string
}

export async function fetchAvailableCustomers(params: { search?: string; field_selected?: 'name' | 'cpf' | 'cnpj' } = {}): Promise<AvailableCustomer[]> {
  const baseUrl = getBaseUrl()
  const qs = new URLSearchParams()
  if (params.search && params.search.trim()) qs.set('search', params.search.trim())
  if (params.field_selected) qs.set('field_selected', params.field_selected)
  const url = `${baseUrl}/customers/available-customers/${qs.toString() ? `?${qs.toString()}` : ''}`
  const res = await fetch(url, { credentials: getCredentialsMode(), headers: { Accept: 'application/json' } })
  if (!res.ok) {
    let detail: string | undefined
    try {
      const j = await res.json()
      detail = j?.detail ?? j?.message
    } catch {}
    throw new Error(detail ?? `Erro ao carregar clientes disponíveis (${res.status})`)
  }
  const json = await res.json().catch(() => [])
  // API expected to return an array of { id?, name, tax_id }
  if (Array.isArray(json)) return json as AvailableCustomer[]
  // Some backends may wrap in { items: [...] }
  if (Array.isArray(json?.items)) return json.items as AvailableCustomer[]
  return []
}


