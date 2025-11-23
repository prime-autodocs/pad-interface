export type ReportItem = {
  id: string | number
  name: string
  tax_id: string
  customer_type: string
  total_veihicles: number
}

export type ReportsListResponse = {
  items: ReportItem[]
  total_clients: number
}

export type CustomerDetails = {
  id?: string | number
  tax_type: 'CPF' | 'CNPJ'
  tax_id: string
  full_name: string
  customer_image?: string
  gender: string
  email?: string
  birth_date?: string
  customer_type: string
  civil_status?: string
  tel_number: string
  address: {
    address?: string
    number?: string
    complement?: string
    neighborhood?: string
    city?: string
    state?: string
    zip_code?: string
  }
  documents: {
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
    course_due_date?: string
  }
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

export async function fetchReportsList(params: { search?: string; filter_by?: 'DETRAN' | 'SMTR' | 'both' } = {}): Promise<ReportsListResponse> {
  const baseUrl = getBaseUrl()
  const qs = new URLSearchParams()
  if (params.search && params.search.trim()) qs.set('search', params.search.trim())
  if (params.filter_by) qs.set('filter_by', params.filter_by)
  const url = `${baseUrl}/reports/list${qs.toString() ? `?${qs.toString()}` : ''}`
  const res = await fetch(url, { credentials: getCredentialsMode() })
  if (!res.ok) {
    let detail: string | undefined
    try {
      const j = await res.json()
      detail = j?.detail ?? j?.message
    } catch {}
    throw new Error(detail ?? `Erro ao carregar relatório (${res.status})`)
  }
  const json = (await res.json()) as ReportsListResponse
  return json
}

export async function fetchCustomerDetails(customerId: string | number): Promise<CustomerDetails> {
  const baseUrl = getBaseUrl()
  const url = `${baseUrl}/reports/customer-details/${encodeURIComponent(String(customerId))}`
  const res = await fetch(url, { credentials: getCredentialsMode() })
  if (!res.ok) {
    let detail: string | undefined
    try {
      const j = await res.json()
      detail = j?.detail ?? j?.message
    } catch {}
    throw new Error(detail ?? `Erro ao carregar detalhes do cliente (${res.status})`)
  }
  return (await res.json()) as CustomerDetails
}

export type VehicleDetails = {
  id: string | number
  customer_id?: string | number
  brand?: string
  model?: string
  number_plate?: string
  chassis?: string
  national_registry?: string
  year_fabric?: string
  year_model?: string
  fuel?: string
  color?: string
  category?: string
  certification_number?: string
  crlv_image?: string
  last_legalization_year?: number
}

export async function fetchVehicleDetails(vehicleId: string | number): Promise<VehicleDetails> {
  const baseUrl = getBaseUrl()
  const url = `${baseUrl}/reports/vehicle-details/${encodeURIComponent(String(vehicleId))}`
  const res = await fetch(url, { credentials: getCredentialsMode() })
  if (!res.ok) {
    let detail: string | undefined
    try {
      const j = await res.json()
      detail = j?.detail ?? j?.message
    } catch {}
    throw new Error(detail ?? `Erro ao carregar detalhes do veículo (${res.status})`)
  }
  return (await res.json()) as VehicleDetails
}


