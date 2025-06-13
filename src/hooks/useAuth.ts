import { authService } from '../services/authService'

export function useAuth() {
  return {
    isAuthenticated: authService.isAuthenticated(),
  }
}

