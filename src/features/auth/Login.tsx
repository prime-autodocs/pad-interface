import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../../services/authService'
import logo from '../../assets/logo.png'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const success = await authService.login(username, password)
    if (success) {
      navigate('/')
    } else {
      setError('Usuário ou senha inválidos')
    }
  }

  return (
    <div className="w-full h-screen bg-gray-200 flex items-center justify-center">
      <div className="w-[100%] h-[100%] flex rounded-xl shadow-lg overflow-hidden"
      style={{ backgroundImage: 'linear-gradient(to top,rgb(22, 22, 22),rgb(83, 83, 83))'}}>
        <div className="w-1/2 flex items-center justify-center">
          <img src={logo} alt="Logo" className="w-[70%]"/>
        </div>

        <div className="h-[80%] bg-gray-800 p-10 flex flex-col items-center rounded-[2vw] justify-center"
            style={{ width: '30%',
                margin: 'auto',
                boxShadow: '0 8px 15px rgba(0, 0, 0, 0.5)',
             }}>

          <h2 className="text-2xl mb-10 text-white">Bem-vindo(a)</h2>

          <input
            type="text"
            placeholder="Login"
            className="w-full mb-4 px-4 py-2 bg-transparent border border-cyan-500 rounded outline-none text-white placeholder-gray-400"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Senha"
            className="w-full mb-6 px-4 py-2 bg-transparent border border-cyan-500 rounded outline-none text-white placeholder-gray-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="text-red-500 mb-4">{error}</p>}

          <button
            onClick={handleLogin}
            className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-2 rounded font-semibold shadow"
          >
            ENTRAR
          </button>
        </div>
      </div>
    </div>
  )
}
