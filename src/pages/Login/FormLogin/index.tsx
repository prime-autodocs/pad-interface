import './FormLogin.css';
import LoginButton from './LoginButton';
import LoginFormField from './LoginFormField';

const FormLogin = () => {
  return (
    <section className="login-form">
      <form>
        <h1>Bem-vindo(a)</h1>

        <LoginFormField label="Usuário" placeholder="Digite seu usuário" type="text" />
        <LoginFormField label="Senha" placeholder="Digite sua senha" type="password" />
        <LoginButton />
      </form>
    </section>
  );
};

export default FormLogin;   