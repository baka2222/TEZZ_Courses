import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import { Link, useParams } from 'react-router-dom';

export default function ModulePage() {
  const { moduleId } = useParams();
  const [module, setModule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    
    axios.get(`modules/${moduleId}/`)
      .then(res => {
        setModule(res.data);
      })
      .catch(err => {
        console.error('Ошибка загрузки модуля:', err);
        setError('Не удалось загрузить модуль');
      })
      .finally(() => setLoading(false));
  }, [moduleId]);

  if (loading) {
    return (
      <div className="module-loading">
        <div className="loading-spinner"></div>
        <p>Загрузка модуля...</p>
      </div>
    );
  }
  
  if (error || !module) {
    return (
      <div className="module-error">
        <h2>Ошибка</h2>
        <p>{error || 'Модуль не найден'}</p>
        <Link to="/modules" className="back-link">← Назад к модулям</Link>
      </div>
    );
  }

  return (
    <div className="module-container">
      <div className="module-header">
        <Link to="/modules" className="back-link">← Назад к модулям</Link>
        <h1 className="module-title">{module.title}</h1>
        <p className="module-description">{module.description}</p>
      </div>

      <div className="lessons-list">
        <h2 className="lessons-title">Уроки модуля</h2>
        
        {module.lessons && module.lessons.length ? (
          <div className="lessons-grid">
            {module.lessons.map(lesson => (
              <div key={lesson.id} className="lesson-card">
                <div className="lesson-info">
                  <h3 className="lesson-title">{lesson.title}</h3>
                  {lesson.start_time && (
                    <div className="lesson-date">
                      {new Date(lesson.start_time).toLocaleString('ru-RU')}
                    </div>
                  )}
                  {lesson.content && (
                    <p className="lesson-content-preview">
                      {lesson.content.length > 100 
                        ? `${lesson.content.substring(0, 100)}...` 
                        : lesson.content
                      }
                    </p>
                  )}
                </div>
                
                <div className="lesson-actions">
                  <Link 
                    to={`/modules/${moduleId}/lessons/${lesson.id}`} 
                    className="lesson-link"
                  >
                    Открыть урок
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-lessons">
            <p>В этом модуле пока нет уроков</p>
          </div>
        )}
      </div>
    </div>
  );
}