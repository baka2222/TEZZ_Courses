import React, { useState } from 'react';
import axios from '../api/axios';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const res = await axios.post('/api/token/', { username, password });
      const { access, refresh } = res.data;
      localStorage.setItem('access', access);
      if (refresh) localStorage.setItem('refresh', refresh);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      navigate('/profile');
    } catch (err) {
      console.error(err);
      setError('Неверный логин или пароль');
    } finally { 
      setLoading(false); 
    }
  };

  const handleTelegramRedirect = () => {
    window.open('https://t.me/isbakks', '_blank');
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="bg-glow-1"></div>
        <div className="bg-glow-2"></div>
      </div>
      
      <div className="login-card">
        <div className="login-header">
          <div className="tezz-logo">TEZZ</div>
          <h2 className="login-title">Добро пожаловать</h2>
          <p className="login-subtitle">Войдите в свой аккаунт</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <input 
              className="login-input" 
              placeholder=" "
              value={username} 
              onChange={e => setUsername(e.target.value)} 
            />
            <label className="input-label">Логин</label>
          </div>
          
          <div className="input-group">
            <input 
              className="login-input" 
              placeholder=" "
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
            />
            <label className="input-label">Пароль</label>
          </div>
          
          {error && <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>}
          
          <button 
            className={`login-button ${loading ? 'loading' : ''}`} 
            disabled={loading}
            type="submit"
          >
            {loading ? (
              <div className="button-loader"></div>
            ) : (
              'Войти'
            )}
          </button>
        </form>
        
        <div className="login-footer">
          <p className="help-text">Нужна помощь с доступом?</p>
          <button className="telegram-link" onClick={handleTelegramRedirect}>
            Написать в Telegram: @isbakks
          </button>
        </div>
      </div>
    </div>
  );
}