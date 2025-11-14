import React from 'react'
import styles from './AppLayout.module.css'
import Sidebar from '@app/layouts/Sidebar'
import { Outlet, useLocation } from 'react-router-dom'
import { lockScroll, unlockScroll } from '../../lib/scrollLock'

export default function AppLayout() {
  const [menuOpen, setMenuOpen] = React.useState(false)
  const location = useLocation()

  function getTitle() {
    if (location.pathname.startsWith('/dashboard')) return 'Dashboards'
    if (location.pathname.startsWith('/clientes')) return 'Cadastrar Cliente'
    if (location.pathname.startsWith('/veiculos')) return 'Cadastrar Veículo'
    if (location.pathname.startsWith('/relatorio-clientes')) return 'Relatório de Clientes'
    return 'PrimeAutoDocs'
  }

  React.useEffect(() => {
    if (menuOpen) {
      lockScroll('sidebar-drawer')
      return () => unlockScroll('sidebar-drawer')
    }
  }, [menuOpen])

  return (
    <div className={styles.app}>
      <Sidebar />
      <main className={styles.main}>
        <header className={styles.header}>
          <button className={styles.burger} onClick={() => setMenuOpen(true)} aria-label="Abrir menu">☰</button>
          <h1>{getTitle()}</h1>
        </header>
        {menuOpen && (
          <>
            <div className={styles.backdrop} onClick={() => setMenuOpen(false)} />
            <div className={styles.drawer}>
              <Sidebar variant="mobile" onNavigate={() => setMenuOpen(false)} />
            </div>
          </>
        )}
        <Outlet />
      </main>
    </div>
  )
}


