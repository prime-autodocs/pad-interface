import React from 'react'
import styles from '../../clients/pages/register/ClientRegisterPage.module.css'
import { VehicleRegisterProvider, useVehicleRegister } from '../context/VehicleRegisterContext'
import successImage from '@assets/icons/success-icon.png'
import { useNavigate } from 'react-router-dom'
import { fetchAvailableCustomers } from '@services/customers/apiCustomers'
import { createVehicle } from '@services/vehicles/apiVehicles'

function normalize(str: string) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
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
  const [results, setResults] = React.useState<Array<{ id?: string | number; name: string; tax_id: string }>>([])
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

  function onSelect(item: { id?: string | number; name: string; tax_id: string }) {
    const digits = item.tax_id.replace(/\D/g, '')
    const documentType: 'CPF' | 'CNPJ' = digits.length === 14 ? 'CNPJ' : 'CPF'
    const mapped = {
      id: String(item.id ?? (digits || item.name)),
      nome: item.name,
      documentType,
      document: digits || item.tax_id,
      phone: undefined
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
    if (/[0-9]{6}/.test(v)) return false
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
    if (data.vehicle.renavam && !isValidRenavam(data.vehicle.renavam)) e.renavam = 'Renavam deve ter 11 dígitos.'
    if (!data.vehicle.year || !isNumeric(data.vehicle.year)) e.year = 'Ano é obrigatório.'
    if (!data.vehicle.modelYear || !isNumeric(data.vehicle.modelYear)) e.modelYear = 'Modelo é obrigatório.'
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
              <option>Gasolina</option>
              <option>Alcool</option>
              <option>Gas/Gasolina</option>
              <option>Gas/Alcool</option>
              <option>Eletrico</option>
              <option>Diesel</option>
              <option>Gasolina/Alcool</option>
            </select>

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
              <input id="veh-doc-input" type="file" accept="image/*" hidden onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) setVehicle({ docPhotoUrl: URL.createObjectURL(f) })
              }} />
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
              {errorMessage}
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
  const [step, setStep] = React.useState<'select' | 'docs' | 'success'>('select')
  const [showSummary, setShowSummary] = React.useState(false)
  const [submitting, setSubmitting] = React.useState(false)
  const [submitError, setSubmitError] = React.useState<string | null>(null)
  const { data, setVehicle } = useVehicleRegister()

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
      fuel: data.vehicle.fuel || undefined,
      color: data.vehicle.color || undefined,
      category: data.vehicle.category || undefined,
      certification_number: data.vehicle.crv || undefined,
      crlv_image: data.vehicle.docPhotoUrl || undefined
    }
    try {
      await createVehicle(payload)
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
          year: '', modelYear: '', color: '', crv: '', fuel: '', category: '', docPhotoUrl: undefined
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


