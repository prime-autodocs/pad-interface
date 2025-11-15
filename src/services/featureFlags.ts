type FeatureFlags = Record<string, boolean>

function getBaseUrl(): string {
  const base = import.meta.env.VITE_API_BASE_URL as string | undefined
  if (!base) return ''
  return base.replace(/\/+$/, '')
}

function getCredentialsMode(): RequestCredentials {
  const withCreds = (import.meta.env.VITE_API_WITH_CREDENTIALS as string | undefined)?.toLowerCase() === 'true'
  return withCreds ? 'include' : 'omit'
}

export async function fetchFeatureFlags(): Promise<FeatureFlags> {
  const baseUrl = getBaseUrl()
  const url = `${baseUrl}/feature-flags/`
  const res = await fetch(url, { credentials: getCredentialsMode() })
  if (!res.ok) {
    throw new Error(`Erro ao buscar feature flags (${res.status})`)
  }
  return (await res.json()) as FeatureFlags
}

export type { FeatureFlags }


