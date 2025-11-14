import React from 'react'
import styles from './VehiclesModal.module.css'
import { Client, Vehicle } from '../data/mock'
import VehicleDetailsDrawer from './VehicleDetailsDrawer'

type Props = {
  open: boolean
  client: Client | null
  onClose: () => void
}

function formatCpf(cpf: string): string {
  const d = cpf.replace(/\D/g, '')
  if (d.length !== 11) return cpf
  return d.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2')
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

function ensureVehicles(client: Client): Vehicle[] {
  if (client.vehicles && client.vehicles.length) return client.vehicles
  const count = client.veiculos
  const list: Vehicle[] = []
  for (let i = 0; i < count; i++) {
    list.push({
      model: 'HYUNDAI HB20S',
      plate: `LSS-2C${70 + i}`,
      lastLicensingYear: 2024
    })
  }
  return list
}

export default function VehiclesModal({ open, client, onClose }: Props) {
  if (!open || !client) return null
  const vehicles = ensureVehicles(client)
  const doc = client.documentType === 'CPF' ? formatCpf(client.document) : formatCnpj(client.document)
  const useScroll = vehicles.length > 5
  const [detailsFor, setDetailsFor] = React.useState<Vehicle | null>(null)
  return (
    <>
      <div className={styles.backdrop} onClick={onClose} />
      <div className={styles.modal} role="dialog" aria-modal="true">
        <div className={styles.card}>
          <div className={styles.header}>
            <h3 className={styles.title}>Listagem de carros</h3>
            <div className={styles.sub}>
              <div>{client.nome}</div>
              <div>{client.documentType} {doc}</div>
            </div>
          </div>
          <div className={`${styles.body} ${useScroll ? styles.scroll : ''}`}>
            <table className={styles.table}>
              <thead className={styles.thead}>
                <tr>
                  <th>Veículo</th>
                  <th>Placa</th>
                  <th>Último licenciamento</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((v, idx) => (
                  <tr key={`${v.plate}-${idx}`} className={styles.row}>
                    <td className={styles.cell}>{v.model}</td>
                    <td className={styles.cell}>
                      <span className={styles.plate} onClick={() => setDetailsFor(v)}>{v.plate}</span>
                    </td>
                    <td className={styles.cell}>{v.lastLicensingYear}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className={styles.footer}>
            <button className={styles.closeBtn} onClick={onClose}>Fechar</button>
          </div>
        </div>
      </div>
      {detailsFor && (
        <VehicleDetailsDrawer
          open={!!detailsFor}
          client={client}
          vehicle={detailsFor}
          onClose={() => setDetailsFor(null)}
        />
      )}
    </>
  )
}


