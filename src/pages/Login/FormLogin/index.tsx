import { useState } from 'react';
import './FormLogin.css';
import LoginButton from './LoginButton';
import LoginFormField from './LoginFormField';
import useUsersQuery from '../../../api/users/services/useUsersQuery';

const FormLogin = () => {

  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const onRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    const response = await useUsersQuery(user, password);
    setIsLoading(false);
    if (response) {
      if (response == true) {
        window.location.href = '/home';
      } else {
        console.error('Login failed');
      }
    }
  };

  return (
    <section className="login-form">
      <form onSubmit={onRegister}>
        <h1>Bem-vindo(a)</h1>

        <LoginFormField 
          value={user} 
          label="Usuário" 
          placeholder="Digite seu usuário" 
          type="text"  
          onTyping={value => setUser(value)}
        />
        <LoginFormField 
          value={password}
          label="Senha" 
          placeholder="Digite sua senha" 
          type="password" 
          onTyping={value => setPassword(value)}
        />
        <LoginButton isLoading={isLoading} />
      </form>
    </section>
  );
};

export default FormLogin;   