import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import { Link } from 'react-router-dom';

export default function ModulesPage() {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    
    axios.get('modules/')
      .then(res => {
        setModules(res.data);
      })
      .catch(err => {
        console.error('Ошибка загрузки модулей:', err);
        setError('Не удалось загрузить модули');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="modules-loading">
        <div className="loading-spinner"></div>
        <p>Загрузка модулей...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="modules-error">
        <h2>Ошибка</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="modules-container">
      <div className="modules-header">
        <h1 className="modules-title">Модули обучения</h1>
        <p className="modules-subtitle">Выберите модуль для просмотра уроков</p>
      </div>

      <div className="modules-grid">
        {modules.length > 0 ? (
          modules.map(module => (
            <div key={module.id} className="module-card">
              <div className="module-card-header">
                <h2 className="module-card-title">{module.title}</h2>
                <div className="module-lessons-count">
                  {module.lessons?.length || 0} уроков
                </div>
              </div>
              
              <p className="module-card-description">{module.description}</p>
              
              <div className="module-card-footer">
                <Link 
                  to={`/modules/${module.id}`} 
                  className="module-card-link"
                >
                  Открыть модуль
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="no-modules">
            <p>Модули пока не добавлены</p>
          </div>
        )}
      </div>
    </div>
  );
}