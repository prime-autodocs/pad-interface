type CardsSummaryResponse = {
  total_customers: number
  total_vehicles: number
  new_customers_current_month: number
  services_current_month: number
}

type NewCustomersPoint = { label: string; value: number }
export type NewCustomersPeriod = 'monthly' | 'quarter' | 'annual'
export type NewCustomersResponse = {
  period: NewCustomersPeriod
  points: NewCustomersPoint[]
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

export async function fetchCardsSummary(): Promise<CardsSummaryResponse> {
  const baseUrl = getBaseUrl()
  const url = `${baseUrl}/dashboards/cards-summary`
  const res = await fetch(url, { credentials: getCredentialsMode() })
  if (!res.ok) {
    throw new Error(`Erro ao buscar resumo (${res.status})`)
  }
  const json = (await res.json()) as CardsSummaryResponse
  return json
}

export async function fetchNewCustomers(period: NewCustomersPeriod): Promise<NewCustomersResponse> {
  const baseUrl = getBaseUrl()
  const url = `${baseUrl}/dashboards/new-customers?period=${encodeURIComponent(period)}`
  const res = await fetch(url, { credentials: getCredentialsMode() })
  if (!res.ok) {
    throw new Error(`Erro ao buscar novos clientes (${res.status})`)
  }
  const json = (await res.json()) as NewCustomersResponse
  return json
}


