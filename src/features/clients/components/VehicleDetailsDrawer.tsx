import React from 'react'
import styles from './ClientDetailsDrawer.module.css'
import { Client, Vehicle } from '../data/mock'
import { lockScroll, unlockScroll } from '../../../lib/scrollLock'

type Props = {
  open: boolean
  client: Client
  vehicle: Vehicle
  onClose: () => void
}

export default function VehicleDetailsDrawer({ open, client, vehicle, onClose }: Props) {
  const [visible, setVisible] = React.useState(false)
  React.useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(id)
  }, [])
  React.useEffect(() => {
    lockScroll('vehicle-details-drawer')
    return () => unlockScroll('vehicle-details-drawer')
  }, [])
  function handleClose() {
    setVisible(false)
  }
  function handleTransitionEnd() {
    if (!visible) onClose()
  }

  const notProvided = 'Não preenchido'

  return (
    <>
      <div className={[styles.backdrop, visible ? styles.backdropOpen : ''].join(' ')} onClick={handleClose} />
      <aside
        className={[styles.drawer, visible ? styles.open : ''].join(' ')}
        onTransitionEnd={handleTransitionEnd}
      >
        <header className={styles.header}>
          <h3 className={styles.title}>Detalhe do Veículo</h3>
          <button className={styles.close} onClick={handleClose}>×</button>
        </header>
        <div className={styles.content}>
          <div className={styles.field}>
            <div className={styles.label}>Cliente</div>
            <div className={styles.value}>{client.nome}</div>
          </div>
          <div className={[styles.field, styles.full].join(' ')}>
            <div className={styles.label}>Documento</div>
            <div className={styles.docBox}>Documento</div>
          </div>

          <div className={styles.field}>
            <div className={styles.label}>Veículo</div>
            <div className={styles.value}>{vehicle.model}</div>
          </div>
          <div className={styles.field}>
            <div className={styles.label}>Placa</div>
            <div className={styles.value}>{vehicle.plate}</div>
          </div>

          <div className={styles.field}>
            <div className={styles.label}>Chassi</div>
            <div className={styles.value}>{vehicle.chassis || notProvided}</div>
          </div>
          <div className={styles.field}>
            <div className={styles.label}>Renavam</div>
            <div className={styles.value}>{vehicle.renavam || notProvided}</div>
          </div>

          <div className={styles.field}>
            <div className={styles.label}>Ano/Modelo</div>
            <div className={styles.value}>
              {vehicle.year || notProvided}/{vehicle.modelYear || notProvided}
            </div>
          </div>
          <div className={styles.field}>
            <div className={styles.label}>Combustível</div>
            <div className={styles.value}>{vehicle.fuel || notProvided}</div>
          </div>

          <div className={styles.field}>
            <div className={styles.label}>Categoria</div>
            <div className={styles.value}>{vehicle.category || notProvided}</div>
          </div>
          <div className={styles.field}>
            <div className={styles.label}>Cor</div>
            <div className={styles.value}>{vehicle.color || notProvided}</div>
          </div>

          <div className={styles.field}>
            <div className={styles.label}>CRV</div>
            <div className={styles.value}>{vehicle.crv ?? notProvided}</div>
          </div>
        </div>
      </aside>
    </>
  )
}


