import React from 'react';
import ReactDOM from 'react-dom';
import './styles/global.css';
import AppRouter from './routes';

ReactDOM.render(
  <React.StrictMode>
    <AppRouter />
  </React.StrictMode>,
  document.getElementById('root')
);