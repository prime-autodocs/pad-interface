import type { AuthResult } from './mockAuth'

const STORAGE_KEY = 'pad_auth_session'

function getBaseUrl(): string {
  const base = import.meta.env.VITE_API_BASE_URL as string | undefined
  if (!base) {
    return ''
  }
  return base.replace(/\/+$/, '')
}

function getCredentialsMode(): RequestCredentials {
  const withCreds = (import.meta.env.VITE_API_WITH_CREDENTIALS as string | undefined)?.toLowerCase() === 'true'
  return withCreds ? 'include' : 'omit'
}

export async function authenticate(username: string, password: string): Promise<AuthResult> {
  const baseUrl = getBaseUrl()
  // Prefer secure POST with JSON body
  const postUrl = `${baseUrl}/auth/login`

  try {
    // Try POST first to avoid exposing credentials in URL (history/logs)
    let response = await fetch(postUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ login: username, password }),
      credentials: getCredentialsMode()
    })

    // Parse body when possível
    let data: any = null
    try {
      data = await response.clone().json()
    } catch {}

    if (response.ok) {
      // FastAPI handler retorna {"token": "..."}
      const tokenFromApi = (data?.token as string | undefined)
      if (!tokenFromApi) {
        return { success: false, message: 'Resposta inválida do servidor' }
      }
      const user = { username }
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: tokenFromApi, user }))
      return { success: true, token: tokenFromApi, user }
    }

    if (response.status === 401) {
      return { success: false, message: 'Credenciais inválidas' }
    }

    const detail = (data?.detail as string | undefined) ?? (data?.message as string | undefined)
    return { success: false, message: detail ?? 'Erro ao autenticar' }
  } catch (err) {
    return { success: false, message: 'Falha de comunicação com o servidor' }
  }
}


