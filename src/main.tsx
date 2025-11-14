import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import '@styles/globals/index.css'
import LoginPage from '@features/auth/pages/LoginPage'
import RequireAuth from '@app/guards/RequireAuth'
import AppLayout from '@app/layouts/AppLayout'
import DashboardPage from '@features/dashboard/pages/DashboardPage'
import ClientsReportPage from '@features/clients/pages/ClientsReportPage'
import ClientRegisterPage from '@features/clients/pages/register/ClientRegisterPage'
import NewVehiclePage from '@features/vehicles/pages/NewVehiclePage'

const router = createBrowserRouter([
  { path: '/', element: <LoginPage /> },
  { path: '/login', element: <LoginPage /> },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/dashboard', element: <DashboardPage /> },
          { path: '/relatorio-clientes', element: <ClientsReportPage /> },
          { path: '/clientes', element: <ClientRegisterPage /> },
          { path: '/veiculos', element: <NewVehiclePage /> }
        ]
      }
    ]
  }
])

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)


