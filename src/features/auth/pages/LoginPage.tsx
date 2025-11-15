import React from 'react'
import styles from './LoginPage.module.css'
import Button from '@components/ui/Button'
import TextField from '@components/form/TextField'
import BrandLogo from '@assets/images/brand-logo.png'
import { authenticate } from '@services/auth/apiAuth'
import { useNavigate } from 'react-router-dom'
import Eye from '@assets/icons/eye.png'
import EyeOff from '@assets/icons/eye-off.png'

export default function LoginPage() {
  const navigate = useNavigate()
  const [username, setUsername] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [showPassword, setShowPassword] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const result = await authenticate(username.trim(), password)
    setLoading(false)
    if (result.success) {
      navigate('/dashboard', { replace: true })
    } else {
      setError(result.message || 'Erro ao autenticar')
    }
  }

  return (
    <div className={styles.container}>
      <section className={styles.left}>
        <div className={styles.brand}>
          <img src={BrandLogo} alt="Prime AutoDocs" className={styles.logo} />
        </div>
      </section>
      <section className={styles.right}>
        <div className={styles.card}>
          <h1 className={styles.title}>Bem-vindo(a)</h1>
          <form className={styles.form} onSubmit={handleSubmit}>
            <TextField
              label="Login"
              placeholder="Digite seu login"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
            <TextField
              label="Senha"
              placeholder="Digite sua senha"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              endSlot={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  style={{ all: 'unset', cursor: 'pointer', color: 'inherit', display: 'grid', placeItems: 'center' }}
                >
                  <img className={styles.eyeIcon} src={showPassword ? EyeOff : Eye} alt="" />
                </button>
              }
            />
            {error && <div className={styles.error}>{error}</div>}
            <Button fullWidth disabled={loading}>
              {loading ? <span className={styles.spinner} aria-label="Carregando" /> : 'Entrar'}
            </Button>
          </form>
        </div>
      </section>
    </div>
  )
}

