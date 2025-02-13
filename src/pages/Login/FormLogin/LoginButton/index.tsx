import './LoginButton.css';

interface LoginButtonProps {
  isLoading: boolean;
}

const LoginButton: React.FC<LoginButtonProps> = ({ isLoading }) => {
  return (
    <button className="login-button" disabled={isLoading}>
      {isLoading ? 'Carregando...' : 'Entrar'}
    </button>
  );
};

export default LoginButton;