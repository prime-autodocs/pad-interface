export const authService = {
  login: async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('http://localhost:8000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ login: username, password }),
      })

      if (!response.ok) {
        return false
      }

      const data = await response.json()

      if (data.token) {
        localStorage.setItem('token', data.token)
        return true
      }

      return false
    } catch (error) {
      console.error('Erro no login:', error)
      return false
    }
  },

  logout: () => {
    localStorage.removeItem('token')
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token')
  },

  getToken: (): string | null => {
    return localStorage.getItem('token')
  },
}
