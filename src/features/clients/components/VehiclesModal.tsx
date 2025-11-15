import React from 'react'
import styles from './VehiclesModal.module.css'
import { VehicleListItem } from '@services/vehicles/apiVehicles'

export default function VehiclesModal({
  open,
  loading,
  error,
  items,
  clientName,
  clientDocLabel,
  onClose,
  onOpenVehicle
}: {
  open: boolean
  loading: boolean
  error?: string | null
  items: VehicleListItem[]
  clientName?: string | null
  clientDocLabel?: string | null
  onClose: () => void
  onOpenVehicle: (vehicleId: string | number) => void
}) {
  if (!open) return null
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
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr className={styles.row}>
                      <td className={styles.cell} colSpan={3}><span className={styles.spinner} /> Carregando…</td>
                    </tr>
                  )}
                  {!loading && items.length === 0 && !error && (
                    <tr className={styles.row}>
                      <td className={`${styles.cell} ${styles.empty}`} colSpan={3}>Sem veículos</td>
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
                    </tr>
                  ))}
                </tbody>
              </table>
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
