import React from 'react'
import styles from './ClientRegisterPage.module.css'
import successImage from '@assets/icons/summary/success-icon.png'
import { ClientRegisterProvider, useClientRegister, DocumentType, ClientKind } from '../../context/ClientRegisterContext'
import { useNavigate } from 'react-router-dom'

function isValidCPF(doc: string) {
  const d = doc.replace(/\D/g, '')
  return d.length === 11
}
function isValidCNPJ(doc: string) {
  const d = doc.replace(/\D/g, '')
  return d.length === 14
}

type Step = 'personal' | 'docs' | 'address' | 'success'

function PersonalStep({ onNext }: { onNext: () => void }) {
  const { data, setPersonal } = useClientRegister()
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const fileRef = React.useRef<HTMLInputElement>(null)

  function validate(): boolean {
    const e: Record<string, string> = {}
    if (!data.personal.fullName.trim()) e.fullName = 'Nome completo é obrigatório'
    if (!data.personal.document.trim()) e.document = 'Documento é obrigatório'
    if (data.personal.documentType === 'CPF' && !isValidCPF(data.personal.document)) e.document = 'CPF inválido'
    if (data.personal.documentType === 'CNPJ' && !isValidCNPJ(data.personal.document)) e.document = 'CNPJ inválido'
    if (!data.personal.phone.trim()) e.phone = 'Telefone é obrigatório'
    else {
      const digits = data.personal.phone.replace(/\D/g, '')
      if (digits.length < 10 || digits.length > 11) e.phone = 'Telefone inválido'
    }
    if (!data.personal.clientType) e.clientType = 'Tipo do Cliente é obrigatório'
    if (data.personal.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.personal.email)) {
      e.email = 'E-mail inválido'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function next() {
    if (validate()) onNext()
  }

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>Dados Pessoais</h3>
      <div className={styles.twoCol}>
        <div>
      <div className={styles.grid}>
        <div className={styles.label}>Nome Completo</div>
        <input className={styles.input} value={data.personal.fullName} onChange={(e) => setPersonal({ fullName: e.target.value })} />
        {errors.fullName && <div className={styles.error}>{errors.fullName}</div>}

        <div className={styles.label}>Tipo do Documento</div>
        <select className={styles.select} value={data.personal.documentType} onChange={(e) => setPersonal({ documentType: e.target.value as DocumentType, document: '' })}>
          <option value="CPF">CPF</option>
          <option value="CNPJ">CNPJ</option>
        </select>

        <div className={styles.label}>{data.personal.documentType}</div>
        <input className={styles.input} value={data.personal.document} onChange={(e) => setPersonal({ document: e.target.value })} placeholder={data.personal.documentType === 'CPF' ? '000.000.000-00' : '00.000.000/0000-00'} />
        {errors.document && <div className={styles.error}>{errors.document}</div>}

        <div className={styles.label}>Nascimento</div>
        <input className={styles.input} type="date" value={data.personal.birthDate || ''} onChange={(e) => setPersonal({ birthDate: e.target.value })} />

        <div className={styles.label}>Tipo do Cliente</div>
        <select className={styles.select} value={data.personal.clientType || ''} onChange={(e) => setPersonal({ clientType: (e.target.value || undefined) as ClientKind })}>
          <option value="">Selecione</option>
          <option value="SMTR">SMTR</option>
          <option value="Detran">Detran</option>
          <option value="Ambos">Ambos</option>
        </select>
        {errors.clientType && <div className={styles.error}>{errors.clientType}</div>}

        <div className={styles.label}>Estado Civil</div>
        <select className={styles.select} value={data.personal.maritalStatus || ''} onChange={(e) => setPersonal({ maritalStatus: e.target.value })}>
          <option value="">Selecione</option>
          <option value="Solteiro(a)">Solteiro(a)</option>
          <option value="Casado(a)">Casado(a)</option>
          <option value="Divorciado(a)">Divorciado(a)</option>
          <option value="Viúvo(a)">Viúvo(a)</option>
          <option value="União Estável">União Estável</option>
        </select>

        <div className={styles.label}>Sexo</div>
        <select className={styles.select} value={data.personal.sex || ''} onChange={(e) => setPersonal({ sex: (e.target.value || undefined) as any })}>
          <option value="">Selecione</option>
          <option value="Masculino">Masculino</option>
          <option value="Feminino">Feminino</option>
          <option value="Outro">Outro</option>
        </select>

        <div className={styles.label}>Telefone</div>
        <input className={styles.input} value={data.personal.phone} onChange={(e) => setPersonal({ phone: e.target.value })} />
        {errors.phone && <div className={styles.error}>{errors.phone}</div>}

        <div className={styles.label}>E-mail</div>
        <input className={styles.input} value={data.personal.email || ''} onChange={(e) => setPersonal({ email: e.target.value })} />
        {errors.email && <div className={styles.error}>{errors.email}</div>}
      </div>
        </div>
        <aside className={styles.sideCard}>
          <h4 className={styles.sideTitle}>Imagens do Cliente</h4>
          <div className={styles.preview}>
            {data.personal.photoUrl ? <img src={data.personal.photoUrl} alt="Foto do cliente" /> : 'Foto do Cliente'}
          </div>
          <div className={styles.upload}>
            <button className={`${styles.btn} ${styles.primary}`} onClick={() => fileRef.current?.click()}>Enviar</button>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) setPersonal({ photoUrl: URL.createObjectURL(f) })
            }} />
          </div>
        </aside>
      </div>
      <div className={styles.actions}>
        <button className={`${styles.btn} ${styles.primary}`} onClick={next}>Próximo</button>
        <button className={`${styles.btn} ${styles.muted}`} onClick={() => setPersonal({ fullName: '', document: '', phone: '', email: '', birthDate: '', maritalStatus: '' })}>Limpar Dados</button>
      </div>
    </div>
  )
}

function DocumentsStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { data, setDocs } = useClientRegister()
  const cnhInputRef = React.useRef<HTMLInputElement>(null)
  const permInputRef = React.useRef<HTMLInputElement>(null)
  return (
    <div className={styles.card}>
      <h3 className={styles.title}>Documentos</h3>
      <div className={styles.twoCol}>
        <div>
      <div className={styles.grid}>
        <div className={styles.label}>RG</div>
        <input className={styles.input} value={data.docs.rg || ''} onChange={(e) => setDocs({ rg: e.target.value })} />

        <div className={styles.label}>Órgão Expedidor</div>
        <input className={styles.input} value={data.docs.orgaoExpedidor || ''} onChange={(e) => setDocs({ orgaoExpedidor: e.target.value })} />

        <div className={styles.label}>Data de Expedição</div>
        <input className={styles.input} type="date" value={data.docs.dataExpedicao || ''} onChange={(e) => setDocs({ dataExpedicao: e.target.value })} />

        <div className={styles.label}>UF Expedidor</div>
        <input className={styles.input} value={data.docs.ufExpedidor || ''} onChange={(e) => setDocs({ ufExpedidor: e.target.value })} />

        <div className={styles.label}>CNH</div>
        <input className={styles.input} value={data.docs.cnh || ''} onChange={(e) => setDocs({ cnh: e.target.value })} />

        <div className={styles.label}>Validade da CNH</div>
        <input className={styles.input} type="date" value={data.docs.validadeCnh || ''} onChange={(e) => setDocs({ validadeCnh: e.target.value })} />

        <div className={styles.label}>Nº da Permissão</div>
        <input className={styles.input} value={data.docs.numeroPermissao || ''} onChange={(e) => setDocs({ numeroPermissao: e.target.value })} />

        <div className={styles.label}>RATR</div>
        <input className={styles.input} value={data.docs.ratr || ''} onChange={(e) => setDocs({ ratr: e.target.value })} />
      </div>
        </div>
        <aside className={styles.sideCard}>
          <h4 className={styles.sideTitle}>Imagens do Cliente</h4>
          <div>
            <div className={styles.sideTitle} style={{ marginBottom: 8 }}>Foto da CNH</div>
            <div className={styles.preview}>
              {data.docs.photoCnh ? <img src={data.docs.photoCnh} alt="Foto da CNH" /> : 'Foto da CNH'}
            </div>
            <div className={styles.upload}>
              <button className={`${styles.btn} ${styles.primary}`} onClick={() => cnhInputRef.current?.click()}>Enviar</button>
              <input ref={cnhInputRef} type="file" accept="image/*" hidden onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) setDocs({ photoCnh: URL.createObjectURL(f) })
              }} />
            </div>
          </div>

          <div className={styles.group}>
            <div className={styles.sideTitle} style={{ marginBottom: 8 }}>Foto da Permissão</div>
            <div className={styles.preview}>
              {data.docs.photoPermissao ? <img src={data.docs.photoPermissao} alt="Foto da Permissão" /> : 'Foto da Permissão'}
            </div>
            <div className={styles.upload}>
              <button className={`${styles.btn} ${styles.primary}`} onClick={() => permInputRef.current?.click()}>Enviar</button>
              <input ref={permInputRef} type="file" accept="image/*" hidden onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) setDocs({ photoPermissao: URL.createObjectURL(f) })
              }} />
            </div>
          </div>
        </aside>
      </div>
      <div className={styles.actions}>
        <button className={`${styles.btn} ${styles.muted}`} onClick={onBack}>Voltar</button>
        <button className={`${styles.btn} ${styles.primary}`} onClick={onNext}>Próximo</button>
        <button className={`${styles.btn} ${styles.muted}`} onClick={() => setDocs({ rg: '', orgaoExpedidor: '', dataExpedicao: '', ufExpedidor: '', cnh: '', validadeCnh: '', numeroPermissao: '', ratr: '' })}>Limpar Dados</button>
      </div>
    </div>
  )
}

function AddressStep({ onBack, onConfirm }: { onBack: () => void; onConfirm: () => void }) {
  const { data, setAddress } = useClientRegister()
  const [cepStatus, setCepStatus] = React.useState<'idle' | 'loading' | 'ok' | 'error'>('idle')
  const [cepMsg, setCepMsg] = React.useState<string | null>(null)

  async function lookupCEP() {
    const digits = (data.address.cep || '').replace(/\D/g, '')
    if (digits.length !== 8) {
      setCepStatus('error')
      setCepMsg('CEP deve conter 8 dígitos')
      return
    }
    try {
      setCepStatus('loading')
      setCepMsg(null)
      const resp = await fetch(`https://viacep.com.br/ws/${digits}/json/`)
      const json = await resp.json()
      if (json.erro) {
        setCepStatus('error')
        setCepMsg('CEP não encontrado')
        return
      }
      setAddress({
        address: json.logradouro || '',
        neighborhood: json.bairro || '',
        city: json.localidade || '',
        state: json.uf || ''
      })
      setCepStatus('ok')
    } catch (e) {
      setCepStatus('error')
      setCepMsg('Falha ao consultar CEP')
    }
  }

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>Endereço</h3>
      <div className={styles.grid}>
        <div className={styles.label}>CEP</div>
        <input
          className={styles.input}
          value={data.address.cep || ''}
          onChange={(e) => { setAddress({ cep: e.target.value }); setCepStatus('idle'); setCepMsg(null) }}
          onBlur={lookupCEP}
          placeholder="00000-000"
          inputMode="numeric"
        />
        {cepMsg && <div className={styles.error}>{cepMsg}</div>}

        <div className={styles.label}>Endereço</div>
        <input className={styles.input} value={data.address.address || ''} onChange={(e) => setAddress({ address: e.target.value })} disabled />

        <div className={styles.label}>Número</div>
        <input className={styles.input} value={data.address.number || ''} onChange={(e) => setAddress({ number: e.target.value })} disabled={cepStatus !== 'ok'} />

        <div className={styles.label}>Complemento</div>
        <input className={styles.input} value={data.address.complement || ''} onChange={(e) => setAddress({ complement: e.target.value })} disabled={cepStatus !== 'ok'} />

        <div className={styles.label}>Bairro</div>
        <input className={styles.input} value={data.address.neighborhood || ''} onChange={(e) => setAddress({ neighborhood: e.target.value })} disabled />

        <div className={styles.label}>Cidade</div>
        <input className={styles.input} value={data.address.city || ''} onChange={(e) => setAddress({ city: e.target.value })} disabled />

        <div className={styles.label}>Estado</div>
        <input className={styles.input} value={data.address.state || ''} onChange={(e) => setAddress({ state: e.target.value })} disabled />
      </div>
      <div className={styles.actions}>
        <button className={`${styles.btn} ${styles.muted}`} onClick={onBack}>Voltar</button>
        <button className={`${styles.btn} ${styles.primary}`} onClick={onConfirm}>Cadastrar</button>
        <button className={`${styles.btn} ${styles.muted}`} onClick={() => setAddress({ cep: '', address: '', number: '', complement: '', neighborhood: '', city: '', state: '' })}>Limpar Dados</button>
      </div>
    </div>
  )
}

function SummaryModal({ onClose, onConfirm }: { onClose: () => void; onConfirm: () => void }) {
  const { data } = useClientRegister()
  const formatDateBR = (iso?: string) => {
    if (!iso) return undefined
    // Evitar fuso horário: tratar como string 'yyyy-mm-dd'
    const parts = iso.split('-')
    if (parts.length !== 3) return iso
    const [yyyy, mm, dd] = parts
    if (!dd || !mm || !yyyy) return iso
    return `${dd}/${mm}/${yyyy}`
  }
  const enderecoFull = (() => {
    if (!data.address.address) return undefined
    const parts: string[] = []
    parts.push(data.address.address)
    if (data.address.number) parts.push(data.address.number)
    if (data.address.neighborhood) parts.push(`Bairro ${data.address.neighborhood}`)
    const cityUf =
      data.address.city && data.address.state ? `${data.address.city}/${data.address.state}` :
      data.address.city ? data.address.city :
      data.address.state ? data.address.state : ''
    if (cityUf) parts.push(cityUf)
    if (data.address.cep) parts.push(`CEP ${data.address.cep}`)
    return parts.join(' - ')
  })()
  const items: Array<[string, string | undefined]> = [
    ['Nome', data.personal.fullName || undefined],
    ['Documento', data.personal.document ? `${data.personal.documentType} ${data.personal.document}` : undefined],
    ['Telefone', data.personal.phone || undefined],
    ['Tipo do Cliente', data.personal.clientType || undefined],
    ['Email', data.personal.email || undefined],
    ['Endereço', enderecoFull],
    ['Nascimento', formatDateBR(data.personal.birthDate)],
    ['Estado Civil', data.personal.maritalStatus || undefined],
    ['Sexo', data.personal.sex || undefined],
  ]
  return (
    <>
      <div className={styles.summaryBackdrop} onClick={onClose} />
      <div className={styles.summary}>
        <div className={styles.summaryCard}>
          <h4 className={styles.summaryTitle}>Confirmar cadastro do cliente?</h4>
          <ul className={styles.summaryList}>
            {items.filter(([, value]) => Boolean(value)).map(([label, value]) => (
              <li key={label}><strong>{label}:</strong> {value}</li>
            ))}
          </ul>
          <div className={styles.summaryFooter}>
            <button className={`${styles.btn} ${styles.muted}`} onClick={onClose}>Voltar</button>
            <button className={`${styles.btn} ${styles.primary}`} onClick={onConfirm}>Cadastrar</button>
          </div>
        </div>
      </div>
    </>
  )
}

function SuccessStep() {
  const navigate = useNavigate()
  const { clear } = useClientRegister()
  function again() {
    clear()
    // Refresh total para garantir o formulário zerado como requisitado
    window.location.replace('/clientes')
  }
  return (
    <div className={styles.card}>
      <h3 className={styles.title}>Sucesso</h3>
      <div className={styles.successCenter}>
        <div className={styles.successImage}>
          <img src={successImage} alt="Sucesso" />
        </div>
        <p>Cliente cadastrado com sucesso!</p>
      </div>
      <div className={styles.actions}>
        <button className={`${styles.btn} ${styles.primary}`} onClick={again}>Cadastrar Novo Cliente</button>
        <button className={`${styles.btn} ${styles.muted}`} onClick={() => navigate('/veiculos')}>Cadastrar Veículo</button>
        <button className={`${styles.btn} ${styles.muted}`} onClick={() => navigate('/relatorio-clientes')}>Ir para Relatório de Clientes</button>
      </div>
    </div>
  )
}

function Content() {
  const [step, setStep] = React.useState<Step>('personal')
  const [showSummary, setShowSummary] = React.useState(false)
  const { data } = useClientRegister()
  async function confirmRegister() {
    setShowSummary(false)
    // Monta payload para API fake (substituir no futuro pela API real)
    const payload = {
      personal: {
        fullName: data.personal.fullName,
        documentType: data.personal.documentType,
        document: data.personal.document,
        birthDate: data.personal.birthDate,
        clientType: data.personal.clientType,
        maritalStatus: data.personal.maritalStatus,
        sex: data.personal.sex,
        phone: data.personal.phone,
        email: data.personal.email,
      },
      documents: {
        rg: data.docs.rg,
        orgaoExpedidor: data.docs.orgaoExpedidor,
        dataExpedicao: data.docs.dataExpedicao,
        ufExpedidor: data.docs.ufExpedidor,
        cnh: data.docs.cnh,
        validadeCnh: data.docs.validadeCnh,
        numeroPermissao: data.docs.numeroPermissao,
        ratr: data.docs.ratr,
      },
      address: {
        cep: data.address.cep,
        address: data.address.address,
        number: data.address.number,
        complement: data.address.complement,
        neighborhood: data.address.neighborhood,
        city: data.address.city,
        state: data.address.state,
      }
    }
    try {
      await fetch('https://jsonplaceholder.typicode.com/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
    } catch (e) {
      // Mantém UX fluida; no futuro tratar com toast/erro
    } finally {
      setStep('success')
    }
  }
  return (
    <div className={styles.wrap}>
      {step === 'personal' && <PersonalStep onNext={() => setStep('docs')} />}
      {step === 'docs' && <DocumentsStep onNext={() => setStep('address')} onBack={() => setStep('personal')} />}
      {step === 'address' && <AddressStep onBack={() => setStep('docs')} onConfirm={() => setShowSummary(true)} />}
      {step === 'success' && <SuccessStep />}
      {showSummary && <SummaryModal onClose={() => setShowSummary(false)} onConfirm={confirmRegister} />}
    </div>
  )
}

export default function ClientRegisterPage() {
  return (
    <ClientRegisterProvider>
      <Content />
    </ClientRegisterProvider>
  )
}


