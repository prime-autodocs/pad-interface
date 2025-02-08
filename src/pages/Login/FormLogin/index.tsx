import { useState } from 'react';
import './FormLogin.css';
import LoginButton from './LoginButton';
import LoginFormField from './LoginFormField';

const FormLogin = () => {

  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');

  const onRegister = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log('Usuário:', user, 'Senha:', password);
    fetch(`/api/users/?login=${user}&password=${password}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(response => response.json())
      .then(data => {
        if (data) {
          console.log('Login success');
          // Handle login success
        } else {
          console.log('Login failed');
          // Handle login failure
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
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
        <LoginButton />
      </form>
    </section>
  );
};

export default FormLogin;   