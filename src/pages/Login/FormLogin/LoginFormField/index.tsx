import './LoginFormField.css';

interface LoginFormFieldProps {
    label: string;
    placeholder: string;
    type: string;
}

const LoginFormField: React.FC<LoginFormFieldProps> = ({ label, placeholder, type }) => {
  return (
    <div className="login-form-field">
      <label>{label}</label>
      <input type={type} placeholder={placeholder} />
    </div>
  );
};

export default LoginFormField;