export type VehicleCreateRequest = {
  customer_id: string | number
  brand: string
  model: string
  number_plate: string
  chassis: string
  national_registry?: string
  year_fabric?: string
  year_model?: string
  fuel?: string
  color?: string
  category?: string
  certification_number?: string
  crlv_image?: string
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

export async function createVehicle(payload: VehicleCreateRequest): Promise<void> {
  const baseUrl = getBaseUrl()
  const url = `${baseUrl}/vehicles/`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    credentials: getCredentialsMode(),
    body: JSON.stringify(payload)
  })
  if (!res.ok) {
    let detail: string | undefined
    try {
      const j = await res.json()
      detail = j?.detail ?? j?.message
    } catch {}
    throw new Error(detail ?? `Erro ao cadastrar veículo (${res.status})`)
  }
}

export type VehicleListItem = {
  id: string | number
  brand: string
  model: string
  number_plate: string
  last_legalization_year?: number
}

export async function fetchVehiclesByCustomer(customerId: string | number): Promise<VehicleListItem[]> {
  const baseUrl = getBaseUrl()
  const url = `${baseUrl}/vehicles/list/${encodeURIComponent(String(customerId))}`
  const res = await fetch(url, { credentials: getCredentialsMode(), headers: { Accept: 'application/json' } })
  if (!res.ok) {
    let detail: string | undefined
    try {
      const j = await res.json()
      detail = j?.detail ?? j?.message
    } catch {}
    throw new Error(detail ?? `Erro ao listar veículos (${res.status})`)
  }
  const json = await res.json()
  if (Array.isArray(json)) return json as VehicleListItem[]
  if (Array.isArray(json?.items)) return json.items as VehicleListItem[]
  return []
}


