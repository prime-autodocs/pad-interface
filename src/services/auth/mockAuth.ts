export type AuthResult = {
  success: boolean
  message?: string
  token?: string
  user?: { username: string }
}

const VALID_CREDENTIALS = {
  username: 'teste',
  password: 'teste'
}

const STORAGE_KEY = 'pad_auth_session'

export function isAuthenticated(): boolean {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    if (!value) return false
    const session = JSON.parse(value) as { token: string; user: { username: string } }
    return Boolean(session?.token)
  } catch {
    return false
  }
}

export function getUser(): { username: string } | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    if (!value) return null
    const session = JSON.parse(value) as { token: string; user: { username: string } }
    return session?.user ?? null
  } catch {
    return null
  }
}

export function logout(): void {
  localStorage.removeItem(STORAGE_KEY)
}

export async function authenticate(username: string, password: string): Promise<AuthResult> {
  await new Promise((r) => setTimeout(r, 400))
  if (username === VALID_CREDENTIALS.username && password === VALID_CREDENTIALS.password) {
    const result: AuthResult = {
      success: true,
      token: 'mock-token',
      user: { username }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: result.token, user: result.user }))
    return result
  }
  return { success: false, message: 'Credenciais inválidas' }
}


