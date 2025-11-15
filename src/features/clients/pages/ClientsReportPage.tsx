import React from 'react'
import styles from './ClientsReportPage.module.css'
import { Client, clientsMock, clientTypes, ClientType } from '../data/mock'
import ClientDetailsDrawer from '../components/ClientDetailsDrawer'
import VehiclesModal from '../components/VehiclesModal'
import { useNavigate } from 'react-router-dom'
import { lockScroll, unlockScroll } from '../../../lib/scrollLock'

function normalize(str: string) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

function maskCpf(cpf: string): string {
  const d = cpf.replace(/\D/g, '')
  if (d.length !== 11) return cpf
  return `${d.slice(0, 3)}.***.***-${d.slice(-2)}`
}
function maskCnpj(cnpj: string): string {
  const d = cnpj.replace(/\D/g, '')
  if (d.length !== 14) return cnpj
  return `${d.slice(0, 2)}.***.***/****-${d.slice(-2)}`
}
function getMaskedDocument(c: Client): string {
  return c.documentType === 'CPF' ? maskCpf(c.document) : maskCnpj(c.document)
}

// Full formatted versions (no obfuscation), for the drawer
function formatCpf(cpf: string): string {
  const d = cpf.replace(/\D/g, '')
  if (d.length !== 11) return cpf
  return d
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}
function formatCnpj(cnpj: string): string {
  const d = cnpj.replace(/\D/g, '')
  if (d.length !== 14) return cnpj
  return d
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2}\.\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{2}\.\d{3}\.\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
}
function getFormattedDocument(c: Client): string {
  return c.documentType === 'CPF' ? formatCpf(c.document) : formatCnpj(c.document)
}

export default function ClientsReportPage() {
  const [query, setQuery] = React.useState('')
  const [typeFilter, setTypeFilter] = React.useState<ClientType | 'Todos'>('Todos')
  const [perPage, setPerPage] = React.useState(10)
  const [page, setPage] = React.useState(1)
  const [selected, setSelected] = React.useState<Client | null>(null)
  const [vehiclesFor, setVehiclesFor] = React.useState<Client | null>(null)
  const [fabOpen, setFabOpen] = React.useState(false)
  const navigate = useNavigate()
  React.useEffect(() => {
    if (fabOpen) {
      lockScroll('fab-menu')
      return () => unlockScroll('fab-menu')
    }
  }, [fabOpen])

  const filtered = React.useMemo(() => {
    const q = normalize(query.trim())
    const qDigits = query.replace(/\D/g, '')
    const thresholdMet = q.length >= 3 || qDigits.length >= 3
    const tokens = q.split(/\s+/).filter(Boolean)
    return clientsMock.filter((c) => {
      if (!thresholdMet) return typeFilter === 'Todos' || c.tipo === typeFilter
      const nameNorm = normalize(c.nome)
      const plateNorm = normalize(c.placa)
      const nameMatch = tokens.length > 0 ? tokens.every((t) => nameNorm.includes(t)) : false
      const plateMatch = plateNorm.includes(q)
      const docMatch = qDigits.length >= 3 && c.document.includes(qDigits)
      const matchesQ = nameMatch || plateMatch || docMatch
      const matchesType = typeFilter === 'Todos' || c.tipo === typeFilter
      return matchesQ && matchesType
    })
  }, [query, typeFilter])

  React.useEffect(() => {
    setPage(1)
  }, [query, typeFilter, perPage])

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
  const start = (page - 1) * perPage
  const pageItems = filtered.slice(start, start + perPage)

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.searchGroup}>
            <label htmlFor="searchClients" className={styles.searchLabel}>Busca</label>
            <input
              id="searchClients"
              className={styles.search}
              placeholder="Buscar por Nome, Placa ou CPF/CNPJ (min. 3 caracteres)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <select
            className={styles.select}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            title="Filtrar por tipo de cliente"
          >
            <option value="Todos">Todos</option>
            {clientTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <button className={[styles.chip, styles.newBtn].join(' ')} title="Novo cliente" onClick={() => navigate('/clientes')}>
            Novo Cliente
          </button>
        </div>

        <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead className={styles.thead}>
            <tr>
              <th className={styles.cell}>Nome</th>
              <th className={styles.cell}>CPF/CNPJ</th>
              <th className={styles.cell}>Tipo</th>
              <th className={styles.cell}>Veículos</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((c) => (
              <tr key={c.id} className={styles.row} onClick={() => setSelected(c)} style={{ cursor: 'pointer' }}>
                <td className={styles.cell}>{c.nome}</td>
                <td className={styles.cell}>{getMaskedDocument(c)}</td>
                <td className={styles.cell}>{c.tipo}</td>
                <td className={styles.cell}>
                  <span
                    className={[styles.badge, c.veiculos === 0 ? styles.badgeMuted : ''].join(' ').trim()}
                    onClick={(e) => { e.stopPropagation(); setVehiclesFor(c) }}
                    style={{ cursor: 'pointer' }}
                  >
                    {c.veiculos}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>

        {/* Cards para mobile */}
        <div className={styles.cards}>
          {pageItems.map((c) => (
            <div key={c.id} className={styles.cardItem} onClick={() => setSelected(c)}>
              <div className={styles.cardLine}><span className={styles.k}>Nome:</span> <span className={styles.v}>{c.nome}</span></div>
              <div className={styles.cardLine}><span className={styles.k}>Documento:</span> <span className={styles.v}>{getMaskedDocument(c)}</span></div>
              <div className={styles.cardRow}>
                <div><span className={styles.k}>Tipo:</span> <span className={styles.v}>{c.tipo}</span></div>
                <button
                  type="button"
                  className={styles.vehiclesBtn}
                  onClick={(e) => { e.stopPropagation(); setVehiclesFor(c) }}
                  disabled={c.veiculos === 0}
                  title={c.veiculos === 0 ? 'Sem veículos' : 'Ver veículos'}
                >
                  <span className={styles.k}>Veículos:</span>
                  <span className={[styles.badge, c.veiculos === 0 ? styles.badgeMuted : ''].join(' ').trim()}>
                    {c.veiculos}
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.footer}>
          <div className={styles.total}>Total: {filtered.length} Clientes</div>
          <div className={styles.pager}>
            <div className={styles.perPage}>
              <span>Itens por página:</span>
              <select
                className={styles.select}
                value={perPage}
                onChange={(e) => setPerPage(parseInt(e.target.value, 10))}
              >
                {[5, 7, 10, 15, 20].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            <div className={styles.pages}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={[styles.pageBtn, n === page ? styles.pageActive : ''].join(' ').trim()}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <>
        {selected && <ClientDetailsDrawer open={!!selected} client={selected} onClose={() => setSelected(null)} />}
        {vehiclesFor && <VehiclesModal open={!!vehiclesFor} client={vehiclesFor} onClose={() => setVehiclesFor(null)} />}
      </>
      {/* FAB mobile */}
      {fabOpen && <div className={styles.fabBackdrop} onClick={() => setFabOpen(false)} />}
      <div className={styles.fabWrap}>
        <button
          className={[styles.fab, fabOpen ? styles.fabOpen : ''].join(' ').trim()}
          aria-label="Ações rápidas"
          aria-expanded={fabOpen}
          onClick={() => setFabOpen((v) => !v)}
        >
          +
        </button>
        <div className={[styles.fabMenu, fabOpen ? styles.fabMenuOpen : ''].join(' ').trim()}>
          <button
            className={styles.fabAction}
            onClick={() => { setFabOpen(false); navigate('/clientes') }}
          >
            Novo Cliente
          </button>
          <button
            className={styles.fabAction}
            onClick={() => { setFabOpen(false); navigate('/veiculos') }}
          >
            Novo Veículo
          </button>
        </div>
      </div>
    </div>
  )
}


