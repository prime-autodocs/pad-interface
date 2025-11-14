import React from 'react'
import styles from './ClientDetailsDrawer.module.css'
import { Client } from '../data/mock'

type Props = {
  open: boolean
  client: Client | null
  onClose: () => void
}

function formatDate(iso?: string) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('pt-BR')
}

export default function ClientDetailsDrawer({ open, client, onClose }: Props) {
  if (!client) return null
  const [visible, setVisible] = React.useState(false)
  React.useEffect(() => {
    // Defer to next frame to allow CSS transition from translateX(100%) -> 0
    const id = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(id)
  }, [])
  function handleClose() {
    setVisible(false)
  }
  function handleTransitionEnd() {
    if (!visible) onClose()
  }
  const addr = client.address
  const addressStr = addr
    ? `${addr.street}\n${addr.city} - ${addr.state}\n${addr.zip}`
    : ''
  const mapsUrl = addr
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${addr.street}, ${addr.city} - ${addr.state}, ${addr.zip}`
      )}`
    : '#'

  const validExpired =
    client.cnh?.validade ? new Date(client.cnh.validade) < new Date() : false

    function getFormattedDocument(client: Client): React.ReactNode {
        return client.documentType === 'CPF' ? formatCpf(client.document) : formatCnpj(client.document)
    }

  return (
    <>
      <div className={[styles.backdrop, visible ? styles.backdropOpen : ''].join(' ')} onClick={handleClose} />
      <aside
        className={[styles.drawer, visible ? styles.open : ''].join(' ')}
        onTransitionEnd={handleTransitionEnd}
      >
        <header className={styles.header}>
          <h3 className={styles.title}>Detalhe do Cliente</h3>
          <button className={styles.close} onClick={handleClose}>×</button>
        </header>
        <div className={styles.content}>
          <div className={styles.field}>
            <div className={styles.label}>Nome</div>
            <div className={styles.value}>{client.nome}</div>
          </div>
          <div className={[styles.field, styles.full].join(' ')}>
            <div className={styles.label}>Documentos</div>
            <div className={styles.docs}>
              <div className={styles.docBox}>Documento 1</div>
              <div className={styles.docBox}>Documento 2</div>
              <div className={styles.docBox}>Não possui permissão</div>
            </div>
          </div>

          <div className={styles.field}>
            <div className={styles.label}>CPF/CNPJ</div>
            <div className={styles.value}>{getFormattedDocument(client)}</div>
          </div>
          <div className={styles.field}>
            <div className={styles.label}>Tipo do Cliente</div>
            <div className={styles.value}>{client.tipo}</div>
          </div>

          <div className={styles.field}>
            <div className={styles.label}>Data de Nascimento</div>
            <div className={styles.value}>{formatDate(client.birthDate)}</div>
          </div>
          <div className={styles.field}>
            <div className={styles.label}>Sexo</div>
            <div className={styles.value}>{client.sex || '-'}</div>
          </div>

          <div className={styles.field}>
            <div className={styles.label}>Telefone</div>
            <div className={styles.value}>{client.phone}</div>
          </div>
          <div className={styles.field}>
            <div className={styles.label}>n° Permissão</div>
            <div className={styles.value}>
              {client.permissionNumber ? client.permissionNumber : (
                <span className={styles.muted}>Cliente não possui permissão</span>
              )}
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.label}>CNH</div>
          </div>
          <div className={styles.field}>
            <div className={styles.label}>Registro</div>
            <div className={styles.value}>{client.cnh?.registro || '-'}</div>
          </div>
          <div className={styles.field}>
            <div className={styles.label}>Expedição</div>
            <div className={styles.value}>{formatDate(client.cnh?.expedicao)}</div>
          </div>
          <div className={styles.field}>
            <div className={styles.label}>UF</div>
            <div className={styles.value}>{client.cnh?.uf || '-'}</div>
          </div>
          <div className={styles.field}>
            <div className={styles.label}>Validade</div>
            <div className={[styles.value, validExpired ? styles.danger : styles.muted].join(' ')}>
              {formatDate(client.cnh?.validade)}
            </div>
          </div>

          <div className={[styles.section, styles.full].join(' ')}>
            <div className={styles.label}>Endereço</div>
            <div className={[styles.value, styles.address].join(' ')}>{addressStr}</div>
            {addr && (
              <a className={styles.mapBtn} href={mapsUrl} target="_blank" rel="noreferrer">
                Ver no Mapa
              </a>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}


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
