import React from 'react'
import styles from './ClientsReportPage.module.css'
import { Client } from '../data/mock'
import { useNavigate } from 'react-router-dom'
import { lockScroll, unlockScroll } from '../../../lib/scrollLock'
import { fetchReportsList, type ReportItem, fetchCustomerDetails, type CustomerDetails, fetchVehicleDetails, type VehicleDetails } from '@services/reports/apiReports'
import { fetchVehiclesByCustomer, type VehicleListItem, deleteVehicle } from '@services/vehicles/apiVehicles'
import ClientDetailsDrawer from '../components/ClientDetailsDrawer'
import VehicleDetailsDrawer from '../components/VehicleDetailsDrawer'
import VehiclesModal from '../components/VehiclesModal'
import { deleteCustomer } from '@services/customers/apiCustomers'
import editIcon from '@assets/icons/edit.png'
import deleteIcon from '@assets/icons/delete.png'

function normalize(str: string) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

function maskTaxId(doc: string): string {
  const d = doc.replace(/\D/g, '')
  if (d.length === 11) return `${d.slice(0, 3)}.***.***-${d.slice(-2)}`
  if (d.length === 14) return `${d.slice(0, 2)}.***.***/****-${d.slice(-2)}`
  return doc
}

export default function ClientsReportPage() {
  const [query, setQuery] = React.useState('')
  const [debouncedQuery, setDebouncedQuery] = React.useState('')
  const [typeFilter, setTypeFilter] = React.useState<string>('Todos')
  const [perPage, setPerPage] = React.useState(10)
  const [page, setPage] = React.useState(1)
  const [items, setItems] = React.useState<ReportItem[]>([])
  const [totalClients, setTotalClients] = React.useState<number>(0)
  const [loading, setLoading] = React.useState<boolean>(false)
  const [error, setError] = React.useState<string | null>(null)
  const [fabOpen, setFabOpen] = React.useState(false)
  const [detailsOpen, setDetailsOpen] = React.useState(false)
  const [selected, setSelected] = React.useState<Client | null>(null)
  const [detailsLoading, setDetailsLoading] = React.useState(false)
  const [drawerDocs, setDrawerDocs] = React.useState<{
    identityNumber?: string
    identityOrg?: string
    identityIssuedAt?: string
    identityLocal?: string
    driverLicenseNumber?: string
    driverLicenseExpiration?: string
    smtrPermissionNumber?: string
    smtrRatrNumber?: string
    courseDueDate?: string
    photoImage?: string
    driverLicenseImage?: string
    smtrPermissionImage?: string
  } | undefined>(undefined)
  const [vehModalOpen, setVehModalOpen] = React.useState(false)
  const [vehModalLoading, setVehModalLoading] = React.useState(false)
  const [vehModalError, setVehModalError] = React.useState<string | null>(null)
  const [vehList, setVehList] = React.useState<VehicleListItem[]>([])
  const [vehDrawerOpen, setVehDrawerOpen] = React.useState(false)
  const [vehDrawerLoading, setVehDrawerLoading] = React.useState(false)
  const [vehDetails, setVehDetails] = React.useState<VehicleDetails | null>(null)
  const [vehClientName, setVehClientName] = React.useState<string | null>(null)
  const [vehClientDocLabel, setVehClientDocLabel] = React.useState<string | null>(null)
  const [vehCustomerId, setVehCustomerId] = React.useState<string | number | null>(null)
  const [vehDrawerError, setVehDrawerError] = React.useState<string | null>(null)
  const [deletingId, setDeletingId] = React.useState<string | number | null>(null)
  const [confirmDelete, setConfirmDelete] = React.useState<{ id: string | number; name: string; count: number } | null>(null)
  const [vehDeletingId, setVehDeletingId] = React.useState<string | number | null>(null)

  function formatDocLabel(taxId: string): string {
    const d = taxId.replace(/\D/g, '')
    if (d.length === 11) {
      const cpf = d.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2')
      return `CPF ${cpf}`
    }
    if (d.length === 14) {
      const cnpj = d.replace(/^(\d{2})(\d)/, '$1.$2').replace(/^(\d{2}\.\d{3})(\d)/, '$1.$2').replace(/^(\d{2}\.\d{3}\.\d{3})(\d)/, '$1/$2').replace(/(\d{4})(\d)/, '$1-$2')
      return `CNPJ ${cnpj}`
    }
    return taxId
  }
  const navigate = useNavigate()
  React.useEffect(() => {
    if (fabOpen) {
      lockScroll('fab-menu')
      return () => unlockScroll('fab-menu')
    }
  }, [fabOpen])

  // Debounce search: 0.5s sem digitar
  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 500)
    return () => clearTimeout(t)
  }, [query])

  // Fetch from API when debounced search or filter changes
  React.useEffect(() => {
    let active = true
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const filter_by =
          typeFilter === 'Todos' ? undefined :
          typeFilter === 'Ambos' ? 'both' :
          (typeFilter.toUpperCase() as 'DETRAN' | 'SMTR')
        const resp = await fetchReportsList({ search: debouncedQuery, filter_by })
        if (!active) return
        setItems(resp.items ?? [])
        setTotalClients(Number(resp.total_clients ?? 0))
        setPage(1)
      } catch (e) {
        if (!active) return
        setError(e instanceof Error ? e.message : 'Erro ao carregar relatório')
        setItems([])
        setTotalClients(0)
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => { active = false }
  }, [debouncedQuery, typeFilter])

  React.useEffect(() => {
    setPage(1)
  }, [perPage])

  const totalPages = Math.max(1, Math.ceil(items.length / perPage))
  const start = (page - 1) * perPage
  const pageItems = items.slice(start, start + perPage)

  async function openDetails(c: ReportItem) {
    setDetailsOpen(true)
    setDetailsLoading(true)
    setSelected({
      id: String(c.id),
      nome: c.name,
      documentType: c.tax_id.replace(/\D/g, '').length === 14 ? 'CNPJ' : 'CPF',
      document: c.tax_id,
      placa: '',
      tipo: c.customer_type as any,
      veiculos: c.total_veihicles ?? 0,
      phone: '',
      sex: '',
    })
    try {
      const det = await fetchCustomerDetails(c.id)
      const mapped: Client = {
        id: String(c.id),
        nome: det.full_name,
        documentType: det.tax_type,
        document: det.tax_id,
        placa: '',
        tipo: det.customer_type,
        veiculos: c.total_veihicles,
        phone: det.tel_number,
        birthDate: det.birth_date,
        sex: det.gender,
        permissionNumber: det.documents.smtr_permission_number ?? null,
        address: det.address.address ? {
          street: det.address.address,
          city: det.address.city || '',
          state: det.address.state || '',
          zip: det.address.zip_code || ''
        } : undefined,
        cnh: (det.documents.driver_license_number || det.documents.identity_issued_at || det.documents.driver_license_expiration || det.documents.identity_local) ? {
          registro: det.documents.driver_license_number || '',
          expedicao: det.documents.identity_issued_at || '',
          validade: det.documents.driver_license_expiration || '',
          uf: det.documents.identity_local || ''
        } : undefined
      }
      setSelected(mapped)
      setDrawerDocs({
        identityNumber: det.documents.identity_number,
        identityOrg: det.documents.identity_org,
        identityIssuedAt: det.documents.identity_issued_at,
        identityLocal: det.documents.identity_local,
        driverLicenseNumber: det.documents.driver_license_number,
        driverLicenseExpiration: det.documents.driver_license_expiration,
        smtrPermissionNumber: det.documents.smtr_permission_number,
        smtrRatrNumber: det.documents.smtr_ratr_number,
        courseDueDate: det.documents.course_due_date,
        // imagens (se vierem)
        photoImage: (det as any).customer_image,
        driverLicenseImage: det.documents.driver_license_image,
        smtrPermissionImage: det.documents.smtr_permission_image
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao abrir detalhes')
    } finally {
      setDetailsLoading(false)
    }
  }

  async function openVehicles(c: ReportItem) {
    setVehModalOpen(true)
    setVehModalLoading(true)
    setVehModalError(null)
    setVehList([])
    setVehClientName(c.name)
    setVehClientDocLabel(formatDocLabel(c.tax_id))
    setVehCustomerId(c.id)
    try {
      const list = await fetchVehiclesByCustomer(c.id)
      setVehList(list)
    } catch (e) {
      setVehModalError(e instanceof Error ? e.message : 'Erro ao carregar veículos')
    } finally {
      setVehModalLoading(false)
    }
  }
  function editVehicle(vehicleId: string | number) {
    const v = vehList.find((x) => String(x.id) === String(vehicleId))
    const state = v ? {
      customer_id: v.customer_id,
      customer_name: v.customer_name,
      tax_id: v.tax_id
    } : undefined
    // envia informações do cliente para prefill do formulário
    navigate(`/veiculos/editar/${vehicleId}`, { state } as any)
  }
  async function removeVehicle(vehicleId: string | number) {
    if (vehDeletingId) return
    setVehDeletingId(vehicleId)
    try {
      await deleteVehicle(vehicleId)
      // refresh the list currently shown in modal
      const customerId = vehCustomerId ?? selected?.id
      if (customerId) {
        const list = await fetchVehiclesByCustomer(customerId)
        setVehList(list)
        // Atualiza a contagem no grid atrás
        setItems((prev) =>
          prev.map((it) =>
            String(it.id) === String(customerId)
              ? ({ ...(it as any), total_veihicles: list.length, total_vehicles: list.length } as any)
              : it
          )
        )
      }
    } catch (e) {
      setVehModalError(e instanceof Error ? e.message : 'Erro ao excluir veículo')
    } finally {
      setVehDeletingId(null)
    }
  }

  async function handleDeleteCustomer(customerId: string | number) {
    if (deletingId) return
    setDeletingId(customerId)
    try {
      await deleteCustomer(customerId)
      // Fecha modal de confirmação (se aberto)
      setConfirmDelete(null)
      // Recarrega a listagem atual
      setLoading(true)
      setError(null)
      const filter_by =
        typeFilter === 'Todos' ? undefined :
        (typeFilter.toUpperCase() as 'DETRAN' | 'SMTR' | 'BOTH') === 'BOTH' ? 'both' :
        (typeFilter.toUpperCase() as 'DETRAN' | 'SMTR')
      const resp = await fetchReportsList({ search: debouncedQuery, filter_by: filter_by as any })
      setItems(resp.items ?? [])
      setTotalClients(Number(resp.total_clients ?? 0))
      // Mantém a página atual, ajustando se ficou vazia
      const maxPages = Math.max(1, Math.ceil((resp.items ?? []).length / perPage))
      if (page > maxPages) setPage(maxPages)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao excluir cliente')
    } finally {
      setLoading(false)
      setDeletingId(null)
    }
  }

  async function openVehicleDetails(vehicleId: string | number) {
    // garante que erros não apareçam no modal de listagem
    setVehModalError(null)
    setVehDrawerOpen(true)
    setVehDrawerLoading(true)
    setVehDetails(null)
    setVehDrawerError(null)
    try {
      const det = await fetchVehicleDetails(vehicleId)
      setVehDetails(det)
    } catch (e) {
      setVehDrawerError(e instanceof Error ? e.message : 'Erro ao carregar detalhes do veículo')
    } finally {
      setVehDrawerLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.searchGroup}>
            <label htmlFor="searchClients" className={styles.searchLabel}>Busca</label>
            <input
              id="searchClients"
              className={styles.search}
              placeholder="Buscar por Nome, Placa ou CPF/CNPJ"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <select
            className={styles.select}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            title="Filtrar por tipo de cliente"
          >
            <option value="Todos">Todos</option>
            <option value="Detran">Detran</option>
            <option value="SMTR">SMTR</option>
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
              <th className={[styles.cell, styles.actionsCol].join(' ')}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((c, idx) => (
              <tr
                key={String(c.id ?? idx)}
                className={styles.row}
                onClick={() => openDetails(c)}
                style={{ cursor: 'pointer' }}
              >
                <td className={styles.cell}>{c.name}</td>
                <td className={styles.cell}>{maskTaxId(c.tax_id)}</td>
                <td className={styles.cell}>{c.customer_type}</td>
                <td className={styles.cell}>
                  <button
                    className={styles.badgeBtn}
                    onClick={(e) => { e.stopPropagation(); openVehicles(c) }}
                    title="Ver veículos do cliente"
                  >
                    <span className={styles.badge}>
                      {(c as any).total_veihicles ?? (c as any).total_vehicles ?? 0}
                    </span>
                  </button>
                </td>
                <td className={[styles.cell, styles.actions].join(' ')}>
                  <button
                    type="button"
                    className={styles.actionBtn}
                    title="Editar cliente"
                    onClick={(e) => { e.stopPropagation(); navigate(`/clientes/editar/${c.id}`) }}
                  >
                    <img src={editIcon} alt="Editar" width={18} height={18} />
                  </button>
                  <button
                    type="button"
                    className={[styles.actionBtn, styles.danger].join(' ')}
                    title="Excluir cliente"
                    disabled={deletingId === c.id}
                    onClick={(e) => {
                      e.stopPropagation()
                      const count = (c as any).total_veihicles ?? (c as any).total_vehicles ?? 0
                      if (count >= 1) {
                        setConfirmDelete({ id: c.id, name: c.name, count })
                      } else {
                        handleDeleteCustomer(c.id)
                      }
                    }}
                  >
                    <img src={deleteIcon} alt="Excluir" width={18} height={18} />
                  </button>
                </td>
              </tr>
            ))}
            {(!loading && pageItems.length === 0) && (
              <tr>
                <td className={styles.cell} colSpan={5}>Nenhum cliente encontrado</td>
              </tr>
            )}
            {loading && Array.from({ length: 10 }).map((_, i) => (
              <tr key={`skeleton-${i}`} className={styles.row}>
                <td className={styles.cell}><span className={styles.skeleton} style={{ width: `${60 + (i % 3) * 10}%` }} /></td>
                <td className={styles.cell}><span className={styles.skeleton} style={{ width: '40%' }} /></td>
                <td className={styles.cell}><span className={styles.skeleton} style={{ width: '30%' }} /></td>
                <td className={styles.cell}><span className={[styles.skeleton, styles.skeletonBadge].join(' ')} /></td>
                <td className={styles.cell}><span className={styles.skeleton} style={{ width: '60%' }} /></td>
              </tr>
            ))}
            {error && !loading && (
              <tr>
                <td className={styles.cell} colSpan={5} style={{ color: '#d93025' }}>{error}</td>
              </tr>
            )}
          </tbody>
        </table>
        </div>

        {/* Cards para mobile */}
        <div className={styles.cards}>
          {loading
            ? Array.from({ length: 10 }).map((_, i) => (
                <div key={`card-skeleton-${i}`} className={styles.cardSkeleton}>
                  <span className={styles.skeleton} style={{ width: `${65 + (i % 3) * 10}%` }} />
                  <span className={styles.skeleton} style={{ width: '55%' }} />
                  <div className={styles.cardRow}>
                    <span className={styles.skeleton} style={{ width: '40%' }} />
                    <span className={[styles.skeleton, styles.skeletonBadge].join(' ')} />
                  </div>
                </div>
              ))
            : pageItems.map((c, idx) => (
                <div key={String(c.id ?? idx)} className={styles.cardItem} onClick={() => openDetails(c)} style={{ cursor: 'pointer' }}>
                  <div className={styles.cardLine}><span className={styles.k}>Nome:</span> <span className={styles.v}>{c.name}</span></div>
                  <div className={styles.cardLine}><span className={styles.k}>Documento:</span> <span className={styles.v}>{maskTaxId(c.tax_id)}</span></div>
                  <div className={styles.cardRow}>
                    <div><span className={styles.k}>Tipo:</span> <span className={styles.v}>{c.customer_type}</span></div>
                    <button
                      type="button"
                      className={styles.vehiclesBtn}
                      title="Veículos"
                      onClick={(e) => { e.stopPropagation(); openVehicles(c) }}
                    >
                      <span className={styles.k}>Veículos:</span>
                      <span className={styles.badge}>
                        {(c as any).total_veihicles ?? (c as any).total_vehicles ?? 0}
                      </span>
                    </button>
                  </div>
                  <div className={styles.cardActions} onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      className={styles.cardActionBtn}
                      title="Editar cliente"
                      onClick={() => navigate(`/clientes/editar/${c.id}`)}
                    >
                      <img src={editIcon} alt="Editar" width={18} height={18} />
                    </button>
                    <button
                      type="button"
                      className={[styles.cardActionBtn, styles.cardDanger].join(' ')}
                      title="Excluir cliente"
                      disabled={deletingId === c.id}
                      onClick={() => {
                        const count = (c as any).total_veihicles ?? (c as any).total_vehicles ?? 0
                        if (count >= 1) {
                          setConfirmDelete({ id: c.id, name: c.name, count })
                        } else {
                          handleDeleteCustomer(c.id)
                        }
                      }}
                    >
                      <img src={deleteIcon} alt="Excluir" width={18} height={18} />
                    </button>
                  </div>
                </div>
              ))}
        </div>

        <div className={styles.footer}>
          <div className={styles.total}>Total: {totalClients} Clientes</div>
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
      <ClientDetailsDrawer open={detailsOpen} client={selected} loading={detailsLoading} documents={drawerDocs} onClose={() => { setSelected(null); setDetailsOpen(false) }} />
      <VehiclesModal
        open={vehModalOpen}
        loading={vehModalLoading}
        error={vehModalError}
        items={vehList}
        clientName={vehClientName}
        clientDocLabel={vehClientDocLabel}
        onClose={() => {
          // Ao fechar, garante contagem sincronizada no grid
          if (vehCustomerId != null) {
            const count = vehList.length
            setItems((prev) =>
              prev.map((it) =>
                String(it.id) === String(vehCustomerId)
                  ? ({ ...(it as any), total_veihicles: count, total_vehicles: count } as any)
                  : it
              )
            )
          }
          setVehModalOpen(false)
        }}
        onOpenVehicle={(id) => openVehicleDetails(id)}
        onEditVehicle={(id) => editVehicle(id)}
        onDeleteVehicle={(id) => removeVehicle(id)}
        deletingId={vehDeletingId}
      />
      <VehicleDetailsDrawer
        open={vehDrawerOpen}
        loading={vehDrawerLoading}
        vehicle={vehDetails}
        error={vehDrawerError}
        onClose={() => { setVehDrawerOpen(false); setVehDetails(null); setVehDrawerError(null) }}
      />
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
      {confirmDelete && (
        <>
          <div className={styles.confirmBackdrop} onClick={() => { if (!deletingId) setConfirmDelete(null) }} />
          <div className={styles.confirm}>
            <div className={styles.confirmCard}>
              <h4 className={styles.confirmTitle}>Confirmar deleção</h4>
              <p className={styles.confirmText}>
                {confirmDelete.count > 1 ? (
                  `Este cliente tem ${confirmDelete.count} veículos cadastrados. Deseja realmente deletar seu registro?`
                ) : (
                  `Este cliente tem ${confirmDelete.count} veículo cadastrado. Deseja realmente deletar seu registro?`
                )}
              </p>
              <div className={styles.confirmActions}>
                <button className={[styles.btn, styles.muted].join(' ')} onClick={() => setConfirmDelete(null)} disabled={!!deletingId}>Voltar</button>
                <button
                  className={[styles.btn, styles.primary].join(' ')}
                  onClick={() => confirmDelete && handleDeleteCustomer(confirmDelete.id)}
                  disabled={!!deletingId}
                >
                  {deletingId ? 'Removendo...' : 'Confirmar'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}


