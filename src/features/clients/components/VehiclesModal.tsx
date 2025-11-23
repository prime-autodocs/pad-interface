import React from 'react'
import styles from './VehiclesModal.module.css'
import { VehicleListItem } from '@services/vehicles/apiVehicles'
import editIcon from '@assets/icons/edit.png'
import deleteIcon from '@assets/icons/delete.png'
import { lockScroll, unlockScroll } from '../../../lib/scrollLock'

export default function VehiclesModal({
  open,
  loading,
  error,
  items,
  clientName,
  clientDocLabel,
  onClose,
  onOpenVehicle,
  onEditVehicle,
  onDeleteVehicle,
  deletingId
}: {
  open: boolean
  loading: boolean
  error?: string | null
  items: VehicleListItem[]
  clientName?: string | null
  clientDocLabel?: string | null
  onClose: () => void
  onOpenVehicle: (vehicleId: string | number) => void
  onEditVehicle: (vehicleId: string | number) => void
  onDeleteVehicle: (vehicleId: string | number) => void
  deletingId?: string | number | null
}) {
  if (!open) return null
  React.useEffect(() => {
    lockScroll('vehicles-modal')
    return () => unlockScroll('vehicles-modal')
  }, [])
  const useScroll = !loading && items.length > 5
  return (
    <>
      <div className={styles.backdrop} onClick={onClose} />
      <div className={styles.modal} role="dialog" aria-modal="true">
        <div className={styles.card}>
          <div className={styles.header}>
            <div>
              <h4 className={styles.title}>Listagem de carros</h4>
              {(clientName || clientDocLabel) && (
                <div className={styles.sub}>
                  {clientName && <div>{clientName}</div>}
                  {clientDocLabel && <div className={styles.muted}>{clientDocLabel}</div>}
                </div>
              )}
            </div>
            <button className={styles.close} onClick={onClose}>✕</button>
          </div>
          {error && <div className={styles.error}>{error}</div>}
          <div className={`${styles.body} ${useScroll ? styles.scroll : ''}`}>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead className={styles.thead}>
                  <tr>
                    <th className={styles.cell}>Veículo</th>
                    <th className={styles.cell}>Placa</th>
                    <th className={styles.cell}>Último licenciamento</th>
                    <th className={`${styles.cell} ${styles.actionsCol}`}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr className={styles.row}>
                      <td className={styles.cell} colSpan={4}><span className={styles.spinner} /> Carregando…</td>
                    </tr>
                  )}
                  {!loading && items.length === 0 && !error && (
                    <tr className={styles.row}>
                      <td className={`${styles.cell} ${styles.empty}`} colSpan={4}>Sem veículos</td>
                    </tr>
                  )}
                  {!loading && items.map((v) => (
                    <tr key={String(v.id)} className={styles.row}>
                      <td className={styles.cell}>{[v.brand, v.model].filter(Boolean).join(' ')}</td>
                      <td className={styles.cell}>
                        <button className={styles.platePill} onClick={() => onOpenVehicle(v.id)} title="Ver detalhes do veículo">
                          {v.number_plate}
                        </button>
                      </td>
                      <td className={styles.cell}>{v.last_legalization_year ?? '-'}</td>
                      <td className={`${styles.cell} ${styles.actionsCol}`}>
                        <div className={styles.actions}>
                          <button className={styles.actionBtn} title="Editar veículo" onClick={() => onEditVehicle(v.id)}>
                            <img src={editIcon} alt="Editar" width={18} height={18} />
                          </button>
                          <button
                            className={`${styles.actionBtn} ${styles.danger}`}
                            title="Excluir veículo"
                            disabled={deletingId === v.id}
                            onClick={() => onDeleteVehicle(v.id)}
                          >
                            <img src={deleteIcon} alt="Excluir" width={18} height={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className={styles.grid}>
              {loading && (
                <div className={styles.empty} style={{ padding: 16 }}>
                  <span className={styles.spinner} /> Carregando…
                </div>
              )}
              {!loading && items.length === 0 && !error && (
                <div className={styles.empty}>Sem veículos</div>
              )}
              {!loading && items.length > 0 && items.map((v) => (
                <div key={String(v.id)} className={styles.vehCard}>
                  <div className={styles.vehTitle}>{[v.brand, v.model].filter(Boolean).join(' ')}</div>
                  <div className={styles.vehRow}>
                    <button className={styles.platePill} onClick={() => onOpenVehicle(v.id)} title="Ver detalhes do veículo">
                      {v.number_plate}
                    </button>
                    <div className={styles.cardActions}>
                      <button className={styles.actionBtn} title="Editar veículo" onClick={() => onEditVehicle(v.id)}>
                        <img src={editIcon} alt="Editar" width={18} height={18} />
                      </button>
                      <button
                        className={`${styles.actionBtn} ${styles.danger}`}
                        title="Excluir veículo"
                        disabled={deletingId === v.id}
                        onClick={() => onDeleteVehicle(v.id)}
                      >
                        <img src={deleteIcon} alt="Excluir" width={18} height={18} />
                      </button>
                    </div>
                  </div>
                  <div className={styles.vehMuted}>Último licenciamento</div>
                  <div>{v.last_legalization_year ?? '-'}</div>
                </div>
              ))}
            </div>
          </div>
          <div className={styles.footer}>
            <button className={styles.closeBtn} onClick={onClose}>Fechar</button>
          </div>
        </div>
      </div>
    </>
  )
}
