import React from 'react'
import styles from '../../clients/pages/register/ClientRegisterPage.module.css'
import { VehicleRegisterProvider, useVehicleRegister } from '../context/VehicleRegisterContext'
import successImage from '@assets/icons/success-icon.png'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { fetchAvailableCustomers } from '@services/customers/apiCustomers'
import { createVehicle, updateVehicle } from '@services/vehicles/apiVehicles'
import { fetchVehicleDetails } from '@services/reports/apiReports'

// Util: comprimir imagem em JPEG e retornar base64 (sem prefixo) + preview URL
async function compressImageToBase64(
  file: File,
  options: { maxWidth?: number; maxHeight?: number; quality?: number; mimeType?: string } = {}
): Promise<{ base64: string; previewUrl: string }> {
  const { maxWidth = 1200, maxHeight = 1200, quality = 0.75, mimeType = 'image/jpeg' } = options
  const dataUrl: string = await new Promise<string>((resolve, reject) => {
    const fr = new FileReader()
    fr.onerror = () => reject(new Error('Falha ao ler arquivo'))
    fr.onload = () => resolve(String(fr.result || ''))
    fr.readAsDataURL(file)
  })
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image()
    i.onload = () => resolve(i)
    i.onerror = () => reject(new Error('Falha ao carregar imagem'))
    i.src = dataUrl
  })
  const ratio = Math.min(maxWidth / img.naturalWidth, maxHeight / img.naturalHeight, 1)
  const w = Math.round(img.naturalWidth * ratio)
  const h = Math.round(img.naturalHeight * ratio)
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas não suportado')
  ctx.drawImage(img, 0, 0, w, h)
  const blob: Blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => {
      if (!b) return reject(new Error('Falha ao comprimir imagem'))
      resolve(b as Blob)
    }, mimeType, quality)
  })
  const previewUrl = URL.createObjectURL(blob)
  const base64WithPrefix: string = await new Promise<string>((resolve, reject) => {
    const fr = new FileReader()
    fr.onerror = () => reject(new Error('Falha ao ler blob'))
    fr.onload = () => resolve(String(fr.result || ''))
    fr.readAsDataURL(blob)
  })
  const base64 = base64WithPrefix.includes(',') ? base64WithPrefix.split(',')[1] : base64WithPrefix
  return { base64: base64 as string, previewUrl: previewUrl as string }
}

function normalize(str: string) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}
function formatPhone(phone?: string) {
  if (!phone) return ''
  const d = phone.replace(/\D/g, '')
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 3)}${d.slice(3, 7)}-${d.slice(7)}`
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return phone
}
function fromApiCategory(value?: string): string | undefined {
  if (!value) return undefined
  const v = normalize(String(value))
  const map: Record<string, string> = {
    'particular': 'Particular',
    'aluguel': 'Aluguel'
  }
  return map[v]
}
function toApiCategory(label?: string): string | undefined {
  if (!label) return undefined
  const v = normalize(String(label))
  const map: Record<string, string> = {
    'particular': 'Particular',
    'aluguel': 'Aluguel'
  }
  return map[v]
}
function toApiFuel(label?: string): string | undefined {
  if (!label) return undefined
  const key = normalize(label)
  const map: Record<string, string> = {
    'alcool': 'alchool',
    'gas': 'gas',
    'gasolina': 'gasoline',
    'alcool/gasolina': 'alchool_gas',
    'gasolina/gas': 'gasoline_gas',
    'diesel': 'diesel',
    'eletrico': 'electric'
  }
  return map[key]
}
function fromApiFuel(value?: string): string | undefined {
  if (!value) return undefined
  const v = normalize(String(value))
  const map: Record<string, string> = {
    alchool: 'Álcool',
    gas: 'Gás',
    gasoline: 'Gasolina',
    alchool_gas: 'Álcool/Gasolina',
    gasoline_gas: 'Gasolina/Gas',
    diesel: 'Diesel',
    electric: 'Elétrico'
  }
  // tenta matches diretos
  if (map[v]) return map[v]
  // tenta normalizar separadores
  const v2 = v.replace(/\s+/g, '').replace(/-/g, '_')
  return map[v2]
}
function formatCpf(cpf: string) {
  const d = cpf.replace(/\D/g, '')
  if (d.length !== 11) return cpf
  return d.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}
function formatCnpj(cnpj: string) {
  const d = cnpj.replace(/\D/g, '')
  if (d.length !== 14) return cnpj
  return d.replace(/^(\d{2})(\d)/, '$1.$2').replace(/^(\d{2}\.\d{3})(\d)/, '$1.$2').replace(/^(\d{2}\.\d{3}\.\d{3})(\d)/, '$1/$2').replace(/(\d{4})(\d)/, '$1-$2')
}

type Mode = 'nome' | 'cpf' | 'cnpj'

function SelectClientStep({ onNext }: { onNext: () => void }) {
  const [mode, setMode] = React.useState<Mode>('nome')
  const [q, setQ] = React.useState('')
  const [open, setOpen] = React.useState(false)
  const [results, setResults] = React.useState<Array<{ id?: string | number; name: string; tax_id: string; tel_number?: string }>>([])
  const [loading, setLoading] = React.useState(false)
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null)
  const [selected, setSelected] = React.useState<{
    id: string
    nome: string
    documentType: 'CPF' | 'CNPJ'
    document: string
    phone?: string
  } | null>(null)
  const { setClient } = useVehicleRegister()

  // debounced remote search
  React.useEffect(() => {
    const term = q.trim()
    if (!term) { setResults([]); return }
    const handler = setTimeout(async () => {
      setLoading(true)
      try {
        const field_selected = mode === 'nome' ? 'name' : mode
        const list = await fetchAvailableCustomers({ search: term, field_selected })
        setResults(list)
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 350)
    return () => clearTimeout(handler)
  }, [q, mode])

  function onChangeMode(m: Mode) {
    setMode(m)
    setQ('')
    setResults([])
    setSelected(null)
  }

  function onSelect(item: { id?: string | number; name: string; tax_id: string; tel_number?: string }) {
    const digits = item.tax_id.replace(/\D/g, '')
    const documentType: 'CPF' | 'CNPJ' = digits.length === 14 ? 'CNPJ' : 'CPF'
    const mapped = {
      id: String(item.id ?? (digits || item.name)),
      nome: item.name,
      documentType,
      document: digits || item.tax_id,
      phone: formatPhone(item.tel_number)
    }
    setSelected(mapped)
    setQ(item.name)
    setOpen(false)
  }

  const canSubmit = !!selected
  const docFormatted = selected
    ? selected.documentType === 'CPF' ? formatCpf(selected.document) : formatCnpj(selected.document)
    : ''

  return (
    <div className={styles.wrap}>
      <div className={styles.card} style={{ maxWidth: 720, margin: '40px auto' }}>
        <h3 className={styles.title}>Selecione o cliente</h3>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <label style={{ marginRight: 8 }}><input type="radio" name="mode" checked={mode === 'nome'} onChange={() => onChangeMode('nome')} /> Nome</label>
            <label style={{ marginRight: 8 }}><input type="radio" name="mode" checked={mode === 'cpf'} onChange={() => onChangeMode('cpf')} /> CPF</label>
            <label><input type="radio" name="mode" checked={mode === 'cnpj'} onChange={() => onChangeMode('cnpj')} /> CNPJ</label>
          </div>
          <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
            <input
              value={q}
              onChange={(e) => { setQ(e.target.value); setOpen(true) }}
              onFocus={() => setOpen(true)}
              onBlur={() => setTimeout(() => setOpen(false), 120)}
              placeholder={mode === 'nome' ? 'Digite o nome' : mode === 'cpf' ? 'Digite o CPF' : 'Digite o CNPJ'}
              style={{
                width: '100%', height: 40, border: '1px solid #d7e2e6', borderRadius: 8, padding: '0 10px'
              }}
            />
            {open && (loading || results.length > 0) && (
              <div style={{
                position: 'absolute', top: 44, left: 0, right: 0, background: '#fff',
                border: '1px solid #e7eef0', borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.08)', zIndex: 10, maxHeight: 240, overflowY: 'auto'
              }}>
                {loading && <div style={{ padding: '10px 12px', color: '#7b848a' }}>Buscando...</div>}
                {!loading && results.map((c, idx) => {
                  const digits = c.tax_id.replace(/\D/g, '')
                  const labelDoc = digits.length === 14 ? formatCnpj(digits) : formatCpf(digits)
                  const isHovered = hoveredIndex === idx
                  return (
                    <div
                      key={String(c.id ?? `${c.name}-${c.tax_id}`)}
                      onMouseDown={() => onSelect(c)}
                      onMouseEnter={() => setHoveredIndex(idx)}
                      onMouseLeave={() => setHoveredIndex(null)}
                      style={{
                        padding: '10px 12px',
                        cursor: 'pointer',
                        background: isHovered ? 'var(--color-accent)' : '#ffffff',
                        color: isHovered ? '#ffffff' : 'inherit',
                        transition: 'background 120ms ease, color 120ms ease'
                      }}
                    >
                      <div>{c.name}</div>
                      <div style={{ fontSize: 12, color: isHovered ? '#ffffff' : '#7b848a' }}>{labelDoc}</div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {selected && (
          <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid #eef3f4', display: 'grid', gap: 8 }}>
            <div><strong>Nome</strong><div>{selected.nome}</div></div>
            <div><strong>{selected.documentType}</strong><div>{docFormatted}</div></div>
            <div><strong>Telefone</strong><div>{selected.phone || '-'}</div></div>
          </div>
        )}

        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center' }}>
          <button
            disabled={!canSubmit}
            style={{
              padding: '12px 24px',
              borderRadius: 999,
              border: 0,
              background: canSubmit ? 'var(--color-accent)' : '#e7eef0',
              color: canSubmit ? '#ffffff' : '#7b848a',
              fontWeight: 800,
              cursor: canSubmit ? 'pointer' : 'not-allowed',
              minWidth: 220
            }}
            onClick={() => {
              if (!selected) return
              setClient({ id: selected.id, nome: selected.nome, documentType: selected.documentType, document: selected.document, phone: selected.phone })
              onNext()
            }}
          >
            Cadastrar Veículo
          </button>
        </div>
      </div>
    </div>
  )
}

function VehicleDocsStep({ onBack, onSubmit }: { onBack: () => void; onSubmit: () => void }) {
  const { data, setVehicle } = useVehicleRegister()
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const docFormatted = data.client
    ? (data.client.documentType === 'CPF' ? formatCpf(data.client.document) : formatCnpj(data.client.document))
    : ''
  const years = React.useMemo(() => {
    const current = new Date().getFullYear() + 1
    const start = 1980
    const arr: number[] = []
    for (let y = current; y >= start; y--) arr.push(y)
    return arr
  }, [])
  function normalizePlate(input: string) {
    return input.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 7)
  }
  function isValidPlate(plate: string) {
    const value = (plate || '').toUpperCase()
    return /^[A-Z]{3}-?\d[A-Z0-9]\d{2}$/.test(value)
  }
  function isValidRenavam(value: string) {
    const d = value.replace(/\D/g, '')
    return d.length === 11
  }
  function isValidChassis(chassis: string) {
    const v = (chassis || '').toUpperCase()
    if (!v) return false
    if (v.startsWith('0')) return false
    if (/[QOI]/.test(v)) return false
    return true
  }
  function isNumeric(str?: string) {
    if (!str) return false
    return /^\d+$/.test(str)
  }
  function validate() {
    const e: Record<string, string> = {}
    if (!data.vehicle.brand || !data.vehicle.brand.trim()) e.brand = 'Marca é obrigatória.'
    if (!data.vehicle.model || !data.vehicle.model.trim()) e.model = 'Modelo é obrigatório.'
    if (!data.vehicle.plate || !isValidPlate(data.vehicle.plate)) e.plate = 'Placa inválida. Use ABC1D23.'
    if (!data.vehicle.chassis || !data.vehicle.chassis.trim()) e.chassis = 'Chassi é obrigatório.'
    else if (!isValidChassis(data.vehicle.chassis)) e.chassis = 'Chassi inválido: não iniciar com 0, sem Q/O/I e sem 6 dígitos consecutivos.'
    if (!data.vehicle.renavam) e.renavam = 'Renavam é obrigatório.'
    else if (!isValidRenavam(data.vehicle.renavam)) e.renavam = 'Renavam deve ter 11 dígitos.'
    if (!data.vehicle.year || !isNumeric(data.vehicle.year)) e.year = 'Ano é obrigatório.'
    if (!data.vehicle.modelYear || !isNumeric(data.vehicle.modelYear)) e.modelYear = 'Modelo é obrigatório.'
    if (!data.vehicle.fuel) e.fuel = 'Combustível é obrigatório.'
    setErrors(e)
    return Object.keys(e).length === 0
  }
  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <h3 className={styles.title}>Documentos</h3>
        <div className={styles.twoCol}>
          <div className={styles.grid}>
            <div className={styles.label}>{data.client?.documentType}</div>
            <input className={styles.input} value={docFormatted} disabled />

            <div className={styles.label}>Nome</div>
            <input className={styles.input} value={data.client?.nome || ''} disabled />

            <div className={styles.label}>Marca</div>
            <input className={styles.input} value={data.vehicle.brand || ''} onChange={(e) => setVehicle({ brand: e.target.value })} />
            {errors.brand && <div className={styles.error}>{errors.brand}</div>}

            <div className={styles.label}>Modelo</div>
            <input className={styles.input} value={data.vehicle.model || ''} onChange={(e) => setVehicle({ model: e.target.value })} />
            {errors.model && <div className={styles.error}>{errors.model}</div>}

            <div className={styles.label}>Placa</div>
            <input className={styles.input} value={data.vehicle.plate || ''} onChange={(e) => setVehicle({ plate: normalizePlate(e.target.value) })} placeholder="ABC1D23" />
            {errors.plate && <div className={styles.error}>{errors.plate}</div>}

            <div className={styles.label}>Chassi</div>
            <input className={styles.input} value={data.vehicle.chassis || ''} onChange={(e) => setVehicle({ chassis: e.target.value })} />
            {errors.chassis && <div className={styles.error}>{errors.chassis}</div>}

            <div className={styles.label}>Renavam</div>
            <input
              className={styles.input}
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={11}
              value={data.vehicle.renavam || ''}
              onChange={(e) => setVehicle({ renavam: e.target.value.replace(/\D/g, '').slice(0, 11) })}
            />
            {errors.renavam && <div className={styles.error}>{errors.renavam}</div>}

            <div className={styles.label}>Ano | Modelo</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <select className={styles.select} style={{ width: 140 }} value={data.vehicle.year || ''} onChange={(e) => setVehicle({ year: e.target.value })}>
                <option value="">Selecione</option>
                {years.map((y) => <option key={y} value={String(y)}>{y}</option>)}
              </select>
              <select className={styles.select} style={{ width: 140 }} value={data.vehicle.modelYear || ''} onChange={(e) => setVehicle({ modelYear: e.target.value })}>
                <option value="">Selecione</option>
                {years.map((y) => <option key={y} value={String(y)}>{y}</option>)}
              </select>
            </div>
            {(errors.year || errors.modelYear) && <div className={styles.error}>{errors.year || errors.modelYear}</div>}

            <div className={styles.label}>Cor</div>
            <input className={styles.input} value={data.vehicle.color || ''} onChange={(e) => setVehicle({ color: e.target.value })} />

            <div className={styles.label}>CRV</div>
            <input className={styles.input} value={data.vehicle.crv || ''} onChange={(e) => setVehicle({ crv: e.target.value })} />

            <div className={styles.label}>Combustível</div>
            <select className={styles.select} value={data.vehicle.fuel || ''} onChange={(e) => setVehicle({ fuel: e.target.value })}>
              <option value="">Selecione</option>
              <option>Álcool</option>
              <option>Gás</option>
              <option>Gasolina</option>
              <option>Álcool/Gasolina</option>
              <option>Gasolina/Gas</option>
              <option>Diesel</option>
              <option>Elétrico</option>
            </select>
            {errors.fuel && <div className={styles.error}>{errors.fuel}</div>}

            <div className={styles.label}>Categoria</div>
            <select className={styles.select} value={data.vehicle.category || ''} onChange={(e) => setVehicle({ category: e.target.value })}>
              <option value="">Selecione</option>
              <option>Particular</option>
              <option>Aluguel</option>
            </select>
          </div>
          <aside className={styles.sideCard}>
            <h4 className={styles.sideTitle}>Imagens do Cliente</h4>
            <div className={styles.preview}>
              {data.vehicle.docPhotoUrl ? <img src={data.vehicle.docPhotoUrl} alt="Documento" /> : 'Foto do Documento'}
            </div>
            <div className={styles.upload}>
              <button className={`${styles.btn} ${styles.primary}`} onClick={() => (document.getElementById('veh-doc-input') as HTMLInputElement)?.click()}>Carregar imagem</button>
              <input
                id="veh-doc-input"
                type="file"
                accept="image/*"
                hidden
                onChange={async (e) => {
                  const f = e.target.files?.[0]
                  if (!f) return
                  try {
                    const { base64, previewUrl } = await compressImageToBase64(f)
                    setVehicle({ docPhotoUrl: previewUrl, docPhoto: base64 })
                  } catch {
                    // Fallback sem compressão
                    const fr = new FileReader()
                    fr.onload = () => {
                      const res = String(fr.result || '')
                      const base64 = res.includes(',') ? res.split(',')[1] : res
                      setVehicle({ docPhotoUrl: URL.createObjectURL(f), docPhoto: base64 })
                    }
                    fr.readAsDataURL(f)
                  }
                }}
              />
            </div>
          </aside>
        </div>
        <div className={styles.actions}>
          <button className={`${styles.btn} ${styles.muted}`} onClick={onBack}>Voltar</button>
          <button className={`${styles.btn} ${styles.primary}`} onClick={() => { if (validate()) onSubmit() }}>Cadastrar</button>
          <button className={`${styles.btn} ${styles.muted}`} onClick={() => setVehicle({ brand: '', model: '', plate: '', chassis: '', renavam: '', year: '', modelYear: '', color: '', crv: '', fuel: '', category: '', docPhotoUrl: undefined })}>Limpar Dados</button>
        </div>
      </div>
    </div>
  )
}

function SummaryModal({
  onClose,
  onConfirm,
  loading,
  errorMessage
}: {
  onClose: () => void
  onConfirm: () => void
  loading: boolean
  errorMessage?: string | null
}) {
  const { data } = useVehicleRegister()
  const items: Array<[string, string | undefined]> = [
    ['Cliente', data.client?.nome],
    ['Documento', data.client ? `${data.client.documentType} ${data.client.document}` : undefined],
    ['Telefone', data.client?.phone],
    ['Marca', data.vehicle.brand],
    ['Modelo', data.vehicle.model],
    ['Placa', data.vehicle.plate],
    ['Chassi', data.vehicle.chassis],
    ['Renavam', data.vehicle.renavam],
    ['Ano | Modelo', data.vehicle.year && data.vehicle.modelYear ? `${data.vehicle.year}/${data.vehicle.modelYear}` : undefined],
    ['Cor', data.vehicle.color],
    ['CRV', data.vehicle.crv],
    ['Combustível', data.vehicle.fuel],
    ['Categoria', data.vehicle.category],
  ]
  return (
    <>
      <div className={styles.summaryBackdrop} onClick={onClose} />
      <div className={styles.summary}>
        <div className={styles.summaryCard}>
          <h4 className={styles.summaryTitle}>Confirmar cadastro do veículo?</h4>
          <ul className={styles.summaryList}>
            {items.filter(([, v]) => Boolean(v)).map(([k, v]) => (
              <li key={k}><strong>{k}:</strong> {v}</li>
            ))}
          </ul>
          {errorMessage && (
            <div className={styles.error} role="alert" style={{ gridColumn: '1 / -1', margin: '0 0 6px 0' }}>
              Erro ao cadastrar veículo - Entre em contato com o suporte
            </div>
          )}
          <div className={styles.summaryFooter}>
            <button className={`${styles.btn} ${styles.muted}`} onClick={onClose} disabled={loading}>Voltar</button>
            <button className={`${styles.btn} ${styles.primary}`} onClick={onConfirm} disabled={loading}>
              {loading ? <span className={styles.spinner} /> : 'Cadastrar'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

function Success({ onNew }: { onNew: () => void }) {
  const navigate = useNavigate()
  return (
    <div className={styles.card} style={{ maxWidth: 720, margin: '40px auto' }}>
      <h3 className={styles.title}>Sucesso</h3>
      <div className={styles.successCenter}>
        <div className={styles.successImage}>
          <img src={successImage} alt="Sucesso" />
        </div>
        <p>Veículo cadastrado com sucesso!</p>
      </div>
      <div className={styles.actions}>
        <button className={`${styles.btn} ${styles.primary}`} onClick={onNew}>Cadastrar Novo Veículo</button>
        <button className={`${styles.btn} ${styles.muted}`} onClick={() => navigate('/relatorio-clientes')}>Ir para Relatório de Clientes</button>
      </div>
    </div>
  )
}

function Content() {
  const params = useParams()
  const location = useLocation() as any
  const initialStep: 'select' | 'docs' = params.id ? 'docs' : 'select'
  const [step, setStep] = React.useState<'select' | 'docs' | 'success'>(initialStep)
  const [showSummary, setShowSummary] = React.useState(false)
  const [submitting, setSubmitting] = React.useState(false)
  const [submitError, setSubmitError] = React.useState<string | null>(null)
  const { data, setVehicle, setClient } = useVehicleRegister()
  const editingVehicleId = params.id

  // Prefill for edit
  const [hasPrefilled, setHasPrefilled] = React.useState(false)
  // If coming from Edit action, prefill client basics immediately using navigation state,
  // so we land directly on the docs step without flashing the selection screen.
  React.useEffect(() => {
    if (!editingVehicleId) return
    const st = (location?.state || {}) as { customer_id?: string | number; customer_name?: string; tax_id?: string }
    if (st.customer_id || st.customer_name || st.tax_id) {
      const tax = st.tax_id
      let documentType: 'CPF' | 'CNPJ' = 'CPF'
      let document = ''
      if (tax) {
        const digits = tax.replace(/\D/g, '')
        documentType = digits.length === 14 ? 'CNPJ' : 'CPF'
        document = digits
      }
      setClient({
        id: st.customer_id ? String(st.customer_id) : (data.client?.id || ''),
        nome: st.customer_name || data.client?.nome || '',
        documentType,
        document,
        phone: data.client?.phone
      })
      setStep('docs')
    }
  }, [editingVehicleId])
  React.useEffect(() => {
    let active = true
    ;(async () => {
      if (!editingVehicleId || hasPrefilled) return
      try {
        const det = await fetchVehicleDetails(editingVehicleId)
        if (!active) return
        setVehicle({
          brand: det.brand || '',
          model: det.model || '',
          plate: det.number_plate || '',
          chassis: det.chassis || '',
          renavam: det.national_registry || '',
          year: det.year_fabric || '',
          modelYear: det.year_model || '',
          color: det.color || '',
          crv: det.certification_number || '',
          // usa diretamente o valor retornado pela API para exibir no select;
          // se por algum motivo vier em outro formato, tenta converter
          fuel: fromApiFuel(det.fuel) || det.fuel,
          category: fromApiCategory(det.category) || det.category,
          // preview de imagem existente (sem enviar no PATCH a menos que troque)
          docPhotoUrl: det.crlv_image || undefined
        })
        const st = (location?.state || {}) as { customer_id?: string | number; customer_name?: string; tax_id?: string }
        const cid = det.customer_id ?? st.customer_id
        const tax = st.tax_id
        let documentType: 'CPF' | 'CNPJ' = 'CPF'
        let document = ''
        if (tax) {
          const digits = tax.replace(/\D/g, '')
          documentType = digits.length === 14 ? 'CNPJ' : 'CPF'
          document = digits
        }
        setClient({
          id: cid ? String(cid) : (data.client?.id || ''),
          nome: st.customer_name || data.client?.nome || '',
          documentType,
          document,
          phone: data.client?.phone
        })
        setHasPrefilled(true)
        setStep('docs')
      } catch {
        // ignore prefill errors
      }
    })()
    return () => { active = false }
  }, [editingVehicleId, hasPrefilled, setVehicle])

  async function confirm() {
    if (submitting) return
    setSubmitError(null)
    setSubmitting(true)
    const payload = {
      customer_id: data.client?.id || '',
      brand: data.vehicle.brand || '',
      model: data.vehicle.model || '',
      number_plate: data.vehicle.plate?.toUpperCase() || '',
      chassis: data.vehicle.chassis?.toUpperCase() || '',
      national_registry: data.vehicle.renavam || undefined,
      year_fabric: data.vehicle.year || undefined,
      year_model: data.vehicle.modelYear || undefined,
      fuel: toApiFuel(data.vehicle.fuel),
      color: data.vehicle.color || undefined,
      category: toApiCategory(data.vehicle.category) || undefined,
      certification_number: data.vehicle.crv || undefined,
      // envia os bytes base64 se usuário adicionou/trocou a imagem
      crlv_image: data.vehicle.docPhoto || undefined
    }
    try {
      if (editingVehicleId) {
        await updateVehicle(editingVehicleId, payload)
      } else {
        await createVehicle(payload)
      }
      setShowSummary(false)
      setStep('success')
    } catch (e) {
      const msg = (e as Error).message
      setSubmitError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      {step === 'select' && <SelectClientStep onNext={() => setStep('docs')} />}
      {step === 'docs' && <VehicleDocsStep onBack={() => setStep('select')} onSubmit={() => setShowSummary(true)} />}
      {step === 'success' && <Success onNew={() => {
        // limpa os campos do veículo mas mantém o cliente selecionado
        setVehicle({
          brand: '', model: '', plate: '', chassis: '', renavam: '',
          year: '', modelYear: '', color: '', crv: '', fuel: '', category: '', docPhotoUrl: undefined, docPhoto: undefined
        })
        setStep('docs')
      }} />}
      {showSummary && (
        <SummaryModal
          onClose={() => { if (!submitting) setShowSummary(false) }}
          onConfirm={confirm}
          loading={submitting}
          errorMessage={submitError}
        />
      )}
    </>
  )
}

export default function NewVehiclePage() {
  return (
    <VehicleRegisterProvider>
      <Content />
    </VehicleRegisterProvider>
  )
}


