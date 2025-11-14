import React from 'react'
import styles from './Sidebar.module.css'
import BrandLogo from '@assets/images/brand-logo.png'
import { NavLink } from 'react-router-dom'

const items = [
  { to: '/dashboard', label: 'Dashboards' },
  { to: '/clientes', label: 'Cadastrar Cliente' },
  { to: '/veiculos', label: 'Cadastrar Veículo' },
  { to: '/relatorio-clientes', label: 'Relatório de Clientes' },
]

type Props = {
  variant?: 'desktop' | 'mobile'
  onNavigate?: () => void
}

export default function Sidebar({ variant = 'desktop', onNavigate }: Props) {
  return (
    <aside className={[styles.sidebar, variant === 'mobile' ? styles.mobile : ''].join(' ').trim()}>
      <div className={styles.logoArea}>
        <img src={BrandLogo} alt="Prime AutoDocs" />
      </div>
      <nav className={styles.nav}>
        {items.map((it) => (
          <NavLink
            key={it.label}
            to={it.to}
            className={({ isActive }) =>
              [styles.link, isActive ? styles.active : ''].join(' ').trim()
            }
            onClick={onNavigate}
          >
            <span>{it.label}</span>
            <span className={styles.chevron}>›</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}


