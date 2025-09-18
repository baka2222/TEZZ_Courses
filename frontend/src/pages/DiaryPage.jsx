import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import { BookOpen, BarChart3, TrendingUp, Award } from 'lucide-react';

export default function DiaryPage() {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [overallStats, setOverallStats] = useState({
    average: 0,
    completed: 0,
    total: 0,
    highest: 0
  });

  useEffect(() => {
    setLoading(true);
    setError('');
    
    axios.get('/modules/')
      .then(res => {
        const modulesData = res.data;
        setModules(modulesData);
        
        // Calculate overall statistics
        let totalMarks = 0;
        let completedLessons = 0;
        let totalLessons = 0;
        let highestMark = 0;
        
        modulesData.forEach(module => {
          module.lessons.forEach(lesson => {
            totalLessons++;
            if (lesson.student_mark !== null) {
              completedLessons++;
              totalMarks += lesson.student_mark;
              if (lesson.student_mark > highestMark) {
                highestMark = lesson.student_mark;
              }
            }
          });
        });
        
        const averageMark = completedLessons > 0 ? totalMarks / completedLessons : 0;
        
        setOverallStats({
          average: averageMark,
          completed: completedLessons,
          total: totalLessons,
          highest: highestMark
        });
      })
      .catch(err => {
        console.error('Ошибка загрузки дневника:', err);
        setError('Не удалось загрузить данные дневника');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="diary-loading">
        <div className="diary-loading-spinner"></div>
        <p>Загрузка дневника...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="diary-error">
        <h2>Ошибка</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="diary-container">
      <div className="diary-header">
        <h1 className="diary-title">
          <BookOpen size={32} />
          Дневник успеваемости
        </h1>
        <p className="diary-subtitle">Обзор вашей успеваемости по всем модулям</p>
      </div>

      {/* Statistics Cards */}
      <div className="diary-stats-grid">
        <div className="diary-stat-card">
          <div className="diary-stat-icon diary-stat-average">
            <BarChart3 size={24} />
          </div>
          <div className="diary-stat-content">
            <h3>Средний балл</h3>
            <p className="diary-stat-value">{overallStats.average.toFixed(1)}</p>
            <p className="diary-stat-label">из 100 возможных</p>
          </div>
        </div>
        
        <div className="diary-stat-card">
          <div className="diary-stat-icon diary-stat-completed">
            <Award size={24} />
          </div>
          <div className="diary-stat-content">
            <h3>Выполнено уроков</h3>
            <p className="diary-stat-value">{overallStats.completed}/{overallStats.total}</p>
            <p className="diary-stat-label">
              {overallStats.total > 0 
                ? `${Math.round((overallStats.completed / overallStats.total) * 100)}% завершено` 
                : 'Нет уроков'
              }
            </p>
          </div>
        </div>
        
        <div className="diary-stat-card">
          <div className="diary-stat-icon diary-stat-best">
            <TrendingUp size={24} />
          </div>
          <div className="diary-stat-content">
            <h3>Лучшая оценка</h3>
            <p className="diary-stat-value">{overallStats.highest}</p>
            <p className="diary-stat-label">максимальный балл</p>
          </div>
        </div>
      </div>

      {/* Modules Table */}
      <div className="diary-content">
        <h2 className="diary-modules-title">Детализация по модулям</h2>
        
        {modules.length > 0 ? (
          <div className="diary-modules-table">
            <div className="diary-table-header">
              <div className="diary-table-cell diary-module-name">Модуль</div>
              <div className="diary-table-cell">Уроки</div>
              <div className="diary-table-cell">Средний балл</div>
              <div className="diary-table-cell">Прогресс</div>
              <div className="diary-table-cell">Лучшая оценка</div>
            </div>
            
            {modules.map(module => {
              // Calculate module statistics
              let moduleTotalMarks = 0;
              let moduleCompletedLessons = 0;
              let moduleHighestMark = 0;
              
              module.lessons.forEach(lesson => {
                if (lesson.student_mark !== null) {
                  moduleCompletedLessons++;
                  moduleTotalMarks += lesson.student_mark;
                  if (lesson.student_mark > moduleHighestMark) {
                    moduleHighestMark = lesson.student_mark;
                  }
                }
              });
              
              const moduleAverage = moduleCompletedLessons > 0 
                ? moduleTotalMarks / moduleCompletedLessons 
                : 0;
              const progressPercentage = module.lessons.length > 0
                ? (moduleCompletedLessons / module.lessons.length) * 100
                : 0;
                
              return (
                <div key={module.id} className="diary-table-row">
                  <div className="diary-table-cell diary-module-name">
                    <div className="diary-module-info">
                      <h4>{module.title}</h4>
                      <p>{module.description}</p>
                    </div>
                  </div>
                  <div className="diary-table-cell">
                    <span className="diary-lessons-count">
                      {moduleCompletedLessons}/{module.lessons.length}
                    </span>
                  </div>
                  <div className="diary-table-cell">
                    <span className={`diary-average-value ${moduleAverage >= 80 ? 'diary-high' : moduleAverage >= 60 ? 'diary-medium' : 'diary-low'}`}>
                      {moduleAverage > 0 ? moduleAverage.toFixed(1) : '—'}
                    </span>
                  </div>
                  <div className="diary-table-cell">
                    <div className="diary-progress-container">
                      <div 
                        className="diary-progress-bar"
                        style={{ width: `${progressPercentage}%` }}
                      ></div>
                      <span className="diary-progress-text">{Math.round(progressPercentage)}%</span>
                    </div>
                  </div>
                  <div className="diary-table-cell">
                    <span className="diary-highest-mark">
                      {moduleHighestMark > 0 ? moduleHighestMark : '—'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="diary-no-modules">
            <p>У вас пока нет модулей с оценками</p>
          </div>
        )}
      </div>

      {/* Lessons Details */}
      <div className="diary-lessons-details">
        <h2 className="diary-lessons-title">Детализация по урокам</h2>
        
        {modules.map(module => (
          <div key={module.id} className="diary-module-lessons">
            <h3 className="diary-module-lessons-title">{module.title}</h3>
            
            {module.lessons.length > 0 ? (
              <div className="diary-lessons-grid">
                {module.lessons.map(lesson => (
                  <div key={lesson.id} className="diary-lesson-card">
                    <div className="diary-lesson-header">
                      <h4>{lesson.title}</h4>
                      {lesson.student_mark !== null ? (
                        <span className={`diary-lesson-mark ${lesson.student_mark >= 80 ? 'diary-high' : lesson.student_mark >= 60 ? 'diary-medium' : 'diary-low'}`}>
                          {lesson.student_mark}
                        </span>
                      ) : (
                        <span className="diary-lesson-mark diary-absent">—</span>
                      )}
                    </div>
                    
                    <p className="diary-lesson-content">{lesson.content}</p>
                    
                    <div className="diary-lesson-dates">
                      <div className="diary-date-item">
                        <span className="diary-date-label">Создан:</span>
                        <span className="diary-date-value">
                          {new Date(lesson.created_at).toLocaleDateString('ru-RU')}
                        </span>
                      </div>
                      <div className="diary-date-item">
                        <span className="diary-date-label">Обновлен:</span>
                        <span className="diary-date-value">
                          {new Date(lesson.updated_at).toLocaleDateString('ru-RU')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="diary-no-lessons">В этом модуле нет уроков</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}