import React from 'react'
import styles from './ClientMapModal.module.css'
import { lockScroll, unlockScroll } from '../../../lib/scrollLock'

type Props = {
  open: boolean
  embedUrl: string
  mapsUrl: string
  title?: string
  onClose: () => void
}

export default function ClientMapModal({ open, embedUrl, mapsUrl, title = 'Localização', onClose }: Props) {
  React.useEffect(() => {
    if (open) {
      lockScroll('client-map-modal')
    } else {
      unlockScroll('client-map-modal')
    }
    return () => unlockScroll('client-map-modal')
  }, [open])
  return open ? (
    <>
      <div className={styles.backdrop} onClick={onClose} />
      <div className={styles.modal} role="dialog" aria-modal="true" aria-label="Mapa do Google">
        <div className={styles.card}>
          <div className={styles.header}>
            <h4 className={styles.title}>{title}</h4>
            <button className={styles.close} aria-label="Fechar" onClick={onClose}>×</button>
          </div>
          <div className={styles.mapWrap}>
            <iframe className={styles.iframe} src={embedUrl} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          </div>
          <div className={styles.footer}>
            <a className={styles.goBtn} href={mapsUrl} target="_blank" rel="noreferrer">Ir para Google Maps</a>
          </div>
        </div>
      </div>
    </>
  ) : null
}


