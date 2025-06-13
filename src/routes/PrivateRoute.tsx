// src/routes/PrivateRoute.tsx
import { Navigate } from 'react-router-dom'
import { authService } from '../services/authService'
import type { JSX } from 'react'

export function PrivateRoute({ children }: { children: JSX.Element }) {
  const isAuth = authService.isAuthenticated()
  return isAuth ? children : <Navigate to="/login" replace />
}
