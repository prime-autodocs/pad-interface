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


