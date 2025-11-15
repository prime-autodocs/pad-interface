import React from 'react'
import styles from './ClientDetailsDrawer.module.css'
import { Client } from '../data/mock'
import { lockScroll, unlockScroll } from '../../../lib/scrollLock'
import ClientMapModal from './ClientMapModal'

type DrawerDocuments = {
  identityNumber?: string
  identityOrg?: string
  identityIssuedAt?: string
  identityLocal?: string
  driverLicenseNumber?: string
  driverLicenseExpiration?: string
  smtrPermissionNumber?: string
  smtrRatrNumber?: string
  photoImage?: string
  driverLicenseImage?: string
  smtrPermissionImage?: string
}

type Props = {
  open: boolean
  client: Client | null
  onClose: () => void
  loading?: boolean
  documents?: DrawerDocuments
}

function formatDate(iso?: string) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('pt-BR')
}

function formatPhone(phone?: string) {
  if (!phone) return ''
  const d = phone.replace(/\D/g, '')
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 3)}${d.slice(3, 7)}-${d.slice(7)}`
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return phone
}

function formatCEP(zip?: string) {
  if (!zip) return ''
  const d = zip.replace(/\D/g, '')
  if (d.length === 8) return `${d.slice(0, 5)}-${d.slice(5)}`
  return zip
}
export default function ClientDetailsDrawer({ open, client, onClose, loading, documents }: Props) {
  if (!client) return null
  const [visible, setVisible] = React.useState(false)
  const [showMap, setShowMap] = React.useState(false)
  React.useEffect(() => {
    // Defer to next frame to allow CSS transition from translateX(100%) -> 0
    const id = requestAnimationFrame(() => setVisible(true))
    lockScroll('client-details-drawer')
    return () => cancelAnimationFrame(id)
  }, [])
  React.useEffect(() => {
    return () => unlockScroll('client-details-drawer')
  }, [])
  function handleClose() {
    setVisible(false)
  }
  function handleTransitionEnd() {
    if (!visible) onClose()
  }
  const addr = client.address
  const addressStr = addr
    ? `${addr.street}\n${addr.city} - ${addr.state}\n${formatCEP(addr.zip)}`
    : ''
  const mapsUrl = addr
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${addr.street}, ${addr.city} - ${addr.state}, ${addr.zip}`
      )}`
    : '#'
  const embedUrl = addr
    ? `https://maps.google.com/maps?q=${encodeURIComponent(
        `${addr.street}, ${addr.city} - ${addr.state}, ${addr.zip}`
      )}&t=&z=15&ie=UTF8&iwloc=&output=embed`
    : ''

  const validExpired =
    client.cnh?.validade ? new Date(client.cnh.validade) < new Date() : false

    function getFormattedDocument(client: Client): React.ReactNode {
        return client.documentType === 'CPF' ? formatCpf(client.document) : formatCnpj(client.document)
    }
  const Skel = ({ w = '60%', small = false }: { w?: string; small?: boolean }) =>
    <span className={[styles.skeleton, small ? styles.skeletonSmall : styles.skeletonLine].join(' ')} style={{ width: w }} />

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
            <div className={styles.value}>{loading ? <Skel w="70%" /> : client.nome}</div>
          </div>
          <div className={[styles.field, styles.full].join(' ')}>
            <div className={styles.label}>Documentos</div>
            <div className={styles.docs}>
              <div className={styles.docBox}>
                {loading ? (
                  <span className={[styles.skeleton, styles.skeletonBlock].join(' ')} />
                ) : documents?.photoImage ? (
                  <img src={documents.photoImage} alt="Foto do cliente" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
                ) : (
                  'Sem foto cadastrada'
                )}
              </div>
              <div className={styles.docBox}>
                {loading ? (
                  <span className={[styles.skeleton, styles.skeletonBlock].join(' ')} />
                ) : documents?.driverLicenseImage ? (
                  <img src={documents.driverLicenseImage} alt="Documento do cliente" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
                ) : (
                  'Sem documento cadastrado'
                )}
              </div>
              {(client.tipo !== 'Detran') && (
                <div className={styles.docBox}>
                  {loading ? (
                    <span className={[styles.skeleton, styles.skeletonBlock].join(' ')} />
                  ) : documents?.smtrPermissionImage ? (
                    <img src={documents.smtrPermissionImage} alt="Permissão SMTR" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
                  ) : (
                    'Sem permissão registrada'
                  )}
                </div>
              )}
            </div>
          </div>

          <div className={styles.field}>
            <div className={styles.label}>CPF/CNPJ</div>
            <div className={styles.value}>{loading ? <Skel w="50%" /> : getFormattedDocument(client)}</div>
          </div>
          <div className={styles.field}>
            <div className={styles.label}>Tipo do Cliente</div>
            <div className={styles.value}>{loading ? <Skel w="40%" /> : client.tipo}</div>
          </div>

          <div className={styles.field}>
            <div className={styles.label}>Data de Nascimento</div>
            <div className={styles.value}>{loading ? <Skel w="40%" /> : formatDate(client.birthDate)}</div>
          </div>
          <div className={styles.field}>
            <div className={styles.label}>Sexo</div>
            <div className={styles.value}>{loading ? <Skel w="30%" /> : (client.sex || '-')}</div>
          </div>

          <div className={styles.field}>
            <div className={styles.label}>Telefone</div>
            <div className={styles.value}>{loading ? <Skel w="50%" /> : formatPhone(client.phone)}</div>
          </div>

          <div className={styles.section}>
            <div className={styles.label}>Identidade</div>
          </div>
          <div className={styles.field}>
            <div className={styles.label}>RG</div>
            <div className={styles.value}>{loading ? <Skel w="50%" /> : (documents?.identityNumber || '-')}</div>
          </div>
          <div className={styles.field}>
            <div className={styles.label}>Orgão emissor + UF</div>
            <div className={styles.value}>
              {loading ? <Skel w="60%" /> : [documents?.identityOrg, documents?.identityLocal].filter(Boolean).join(' / ') || '-'}
            </div>
          </div>
          <div className={styles.field}>
            <div className={styles.label}>Data de expedição</div>
            <div className={styles.value}>{loading ? <Skel w="40%" /> : formatDate(documents?.identityIssuedAt)}</div>
          </div>

          <div className={styles.section}>
            <div className={styles.label}>CNH</div>
          </div>
          <div className={styles.field}>
            <div className={styles.label}>Registro</div>
            <div className={styles.value}>{loading ? <Skel w="50%" /> : (client.cnh?.registro)}</div>
          </div>
          <div className={styles.field}>
            <div className={styles.label}>Validade</div>
            {loading ? <Skel w="40%" /> : (
              <div className={[styles.value, validExpired ? styles.danger : styles.muted].join(' ')}>
                {formatDate(client.cnh?.validade)}
              </div>
            )}
          </div>
          {!loading && !(documents?.driverLicenseNumber || documents?.driverLicenseExpiration || client.cnh?.registro || client.cnh?.validade) && (
            <div className={[styles.full, styles.value, styles.muted].join(' ')} style={{ marginTop: 4 }}>
              Sem CNH cadastrada
            </div>
          )}

          <div className={styles.section}>
            <div className={styles.label}>SMTR</div>
          </div>
          <div className={styles.field}>
            <div className={styles.label}>Permissão</div>
            <div className={styles.value}>
              {loading ? <Skel w="40%" /> : (documents?.smtrPermissionNumber || <span className={styles.muted}>Cliente não possui informações de SMTR</span>)}
            </div>
          </div>
          <div className={styles.field}>
            <div className={styles.label}>RATR</div>
            <div className={styles.value}>{loading ? <Skel w="30%" /> : (documents?.smtrRatrNumber)}</div>
          </div>

          <div className={[styles.section, styles.full].join(' ')}>
            <div className={styles.label}>Endereço</div>
            <div className={[styles.value, styles.address].join(' ')}>
              {loading ? <span className={[styles.skeleton, styles.skeletonBlock].join(' ')} /> : (addressStr || <span className={styles.muted}>Sem endereço cadastrado</span>)}
            </div>
            {!loading && addr && (
                <button className={styles.mapBtn} onClick={() => setShowMap(true)}>
                  Ver no Mapa
                </button>
            )}
          </div>
        </div>
      </aside>
      {!loading && addr && (
        <ClientMapModal
          open={showMap}
          embedUrl={embedUrl}
          mapsUrl={mapsUrl}
          title="Endereço do Cliente"
          onClose={() => setShowMap(false)}
        />
      )}
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
