import React from 'react'
import styles from './LoginPage.module.css'
import Button from '@components/ui/Button'
import TextField from '@components/form/TextField'
import BrandLogo from '@assets/images/brand-logo.png'
import { authenticate } from '@services/auth/mockAuth'
import { useNavigate } from 'react-router-dom'

export default function LoginPage() {
  const navigate = useNavigate()
  const [username, setUsername] = React.useState('')
  const [password, setPassword] = React.useState('')
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
              placeholder="Placeholder"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
            <TextField
              label="Senha"
              placeholder="Placeholder"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            {error && <div className={styles.error}>{error}</div>}
            <Button fullWidth disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</Button>
          </form>
        </div>
      </section>
    </div>
  )
}

