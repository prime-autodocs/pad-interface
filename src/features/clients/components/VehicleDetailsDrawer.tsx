import React from 'react'
import styles from './ClientDetailsDrawer.module.css'
import { lockScroll, unlockScroll } from '../../../lib/scrollLock'
import type { VehicleDetails } from '@services/reports/apiReports'

export default function VehicleDetailsDrawer({
  open,
  loading,
  vehicle,
  error,
  onClose
}: {
  open: boolean
  loading: boolean
  vehicle?: VehicleDetails | null
  error?: string | null
  onClose: () => void
}) {
  const [photoModalUrl, setPhotoModalUrl] = React.useState<string | null>(null)
  function toTitleCase(value?: string | number | null): string {
    if (value == null) return '-'
    const s = String(value).replace(/[_\-]+/g, ' ').trim().toLowerCase()
    if (!s) return '-'
    return s.split(/\s+/).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  }
  React.useEffect(() => {
    if (open) {
      lockScroll('veh-details')
      return () => unlockScroll('veh-details')
    }
  }, [open])

  if (!open) return null
  return (
    <>
      <div className={[styles.backdrop, open ? styles.backdropOpen : ''].join(' ').trim()} onClick={onClose} />
      <aside className={[styles.drawer, open ? styles.open : ''].join(' ').trim()}>
        <header className={styles.header}>
          <h3 className={styles.title}>Detalhes do Veículo</h3>
          <button className={styles.close} onClick={onClose}>✕</button>
        </header>
        <div className={styles.content}>
          {/* CRLV primeiro */}
          <div className={[styles.section, styles.full].join(' ')}>
            <div className={styles.label}>CRLV</div>
          </div>
          <div className={[styles.full].join(' ')}>
            {loading ? (
              <div className={styles.docBox}><span className={`${styles.skeleton} ${styles.skeletonBlock}`} /></div>
            ) : vehicle?.crlv_image ? (
              <div className={styles.docBox}>
                <img
                  src={vehicle.crlv_image}
                  alt="CRLV"
                  onClick={() => setPhotoModalUrl(vehicle.crlv_image!)}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8, cursor: 'zoom-in' }}
                />
              </div>
            ) : (
              <div className={styles.docBox}>Sem CRLV</div>
            )}
          </div>

          {error && (
            <div className={[styles.full, styles.danger].join(' ')} role="alert" style={{ marginBottom: 4 }}>
              {error}
            </div>
          )}
          {/* Coluna 1 */}
          <div className={styles.field}>
            <div className={styles.label}>Marca</div>
            <div className={styles.value}>{loading ? <span className={`${styles.skeleton} ${styles.skeletonLine}`} /> : (vehicle?.brand || '-')}</div>
          </div>
          <div className={styles.field}>
            <div className={styles.label}>Modelo</div>
            <div className={styles.value}>{loading ? <span className={`${styles.skeleton} ${styles.skeletonLine}`} /> : (vehicle?.model || '-')}</div>
          </div>
          <div className={styles.field}>
            <div className={styles.label}>Placa</div>
            <div className={styles.value}>{loading ? <span className={`${styles.skeleton} ${styles.skeletonSmall}`} /> : (vehicle?.number_plate || '-')}</div>
          </div>
          <div className={styles.field}>
            <div className={styles.label}>Chassi</div>
            <div className={styles.value}>{loading ? <span className={`${styles.skeleton} ${styles.skeletonBlock}`} /> : (vehicle?.chassis || '-')}</div>
          </div>
          <div className={styles.field}>
            <div className={styles.label}>Renavam</div>
            <div className={styles.value}>{loading ? <span className={`${styles.skeleton} ${styles.skeletonSmall}`} /> : (vehicle?.national_registry || '-')}</div>
          </div>
          <div className={styles.field}>
            <div className={styles.label}>Ano Fabricação</div>
            <div className={styles.value}>{loading ? <span className={`${styles.skeleton} ${styles.skeletonSmall}`} /> : (vehicle?.year_fabric || '-')}</div>
          </div>
          <div className={styles.field}>
            <div className={styles.label}>Ano Modelo</div>
            <div className={styles.value}>{loading ? <span className={`${styles.skeleton} ${styles.skeletonSmall}`} /> : (vehicle?.year_model || '-')}</div>
          </div>
          <div className={styles.field}>
            <div className={styles.label}>Combustível</div>
            <div className={styles.value}>{loading ? <span className={`${styles.skeleton} ${styles.skeletonSmall}`} /> : (vehicle?.fuel || '-')}</div>
          </div>
          <div className={styles.field}>
            <div className={styles.label}>Cor</div>
            <div className={styles.value}>{loading ? <span className={`${styles.skeleton} ${styles.skeletonSmall}`} /> : (vehicle?.color || '-')}</div>
          </div>
          <div className={styles.field}>
            <div className={styles.label}>Categoria</div>
            <div className={styles.value}>{loading ? <span className={`${styles.skeleton} ${styles.skeletonSmall}`} /> : toTitleCase(vehicle?.category as any)}</div>
          </div>
          <div className={styles.field}>
            <div className={styles.label}>Certificação</div>
            <div className={styles.value}>{loading ? <span className={`${styles.skeleton} ${styles.skeletonSmall}`} /> : (vehicle?.certification_number || '-')}</div>
          </div>
          <div className={styles.field}>
            <div className={styles.label}>Último Licenciamento</div>
            <div className={styles.value}>{loading ? <span className={`${styles.skeleton} ${styles.skeletonSmall}`} /> : (vehicle?.last_legalization_year ?? '-')}</div>
          </div>

        </div>
      </aside>
      {photoModalUrl && (
        <>
          <div className={styles.photoBackdrop} onClick={() => setPhotoModalUrl(null)} />
          <div className={styles.photoModal}>
            <img className={styles.photoFull} src={photoModalUrl} alt="Documento" />
            <button className={styles.backBtn} onClick={() => setPhotoModalUrl(null)}>Voltar</button>
          </div>
        </>
      )}
    </>
  )
}
