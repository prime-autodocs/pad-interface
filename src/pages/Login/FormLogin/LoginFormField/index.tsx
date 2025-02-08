import './LoginFormField.css';

interface LoginFormFieldProps {
    label: string;
    placeholder: string;
    type: string;
    value: string;
    onTyping: (value: string) => void;
}

const LoginFormField: React.FC<LoginFormFieldProps> = ({ label, placeholder, type, value, onTyping }) => {

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onTyping(e.target.value);
  };

  return (
    <div className="login-form-field">
      <label>{label}</label>
      <input value={value} onChange={handleChange} type={type} placeholder={placeholder} />
    </div>
  );
};

export default LoginFormField;