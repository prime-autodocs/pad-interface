// src/routes/Router.tsx
import { createBrowserRouter } from 'react-router-dom'
import Login from '../features/auth/Login'
import { PrivateRoute } from './PrivateRoute'
import Home from '../pages/Home'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: (
      <PrivateRoute>
        <Home />
      </PrivateRoute>
    ),
  },
])
