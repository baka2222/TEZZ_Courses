import React, { useEffect, useState } from 'react';
import axios from '../api/axios';

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    let mounted = true;
    axios.get('/profile/').then(res => { 
      if (mounted) setProfile(res.data); 
    }).catch(() => {});
    return () => mounted = false;
  }, []);

  const handleSave = async () => {
    setSaving(true); 
    setMsg('');
    try {
      const payload = { 
        first_name: profile.first_name, 
        telegram: profile.telegram, 
        discord: profile.discord 
      };
      const res = await axios.patch('/profile/', payload);
      setProfile(res.data);
      setMsg('Профиль успешно обновлен');
    } catch (err) {
      console.error(err); 
      setMsg('Ошибка сохранения');
    } finally { 
      setSaving(false); 
      setTimeout(() => setMsg(''), 2500); 
    }
  };

  if (!profile) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>
        <p>Загрузка профиля...</p>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-background">
      </div>
      
      <div className="profile-card">
        <div className="profile-header">
          <h1 className="profile-title">Профиль</h1>
          <p className="profile-subtitle">Управление вашими данными</p>
        </div>
        
        <div className="profile-form">
          <div className="input-group">
            <label className="profile-label">Имя</label>
            <input 
              className="profile-input" 
              value={profile.first_name} 
              onChange={(e) => setProfile({...profile, first_name: e.target.value})} 
            />
          </div>
          
          <div className="input-group">
            <label className="profile-label">Telegram</label>
            <input 
              className="profile-input" 
              value={profile.telegram || ''} 
              onChange={(e) => setProfile({...profile, telegram: e.target.value})} 
              placeholder="@username"
            />
          </div>
          
          <div className="input-group">
            <label className="profile-label">Discord</label>
            <input 
              className="profile-input" 
              value={profile.discord || ''} 
              onChange={(e) => setProfile({...profile, discord: e.target.value})} 
              placeholder="username#1234"
            />
          </div>
          
          <div className="profile-actions">
            <button 
              onClick={handleSave} 
              disabled={saving} 
              className={`profile-save-btn ${saving ? 'loading' : ''}`}
            >
              {saving ? (
                <div className="button-loader"></div>
              ) : (
                'Сохранить изменения'
              )}
            </button>
            
            {msg && (
              <div className={`profile-message ${msg.includes('Ошибка') ? 'error' : 'success'}`}>
                {msg}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}