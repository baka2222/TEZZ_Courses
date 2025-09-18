import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import { Calendar, Clock, BookOpen, ChevronLeft, ChevronRight, MapPin, User, Bell } from 'lucide-react';

export default function SchedulePage() {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('week'); // 'day', 'week', 'month'

  useEffect(() => {
    setLoading(true);
    setError('');
    
    axios.get('/modules/')
      .then(res => {
        setModules(res.data);
      })
      .catch(err => {
        console.error('Ошибка загрузки расписания:', err);
        setError('Не удалось загрузить расписание');
      })
      .finally(() => setLoading(false));
  }, []);

  // Функция для получения всех уроков с временными интервалами
  const getAllLessons = () => {
    const allLessons = [];
    
    modules.forEach(module => {
      module.lessons.forEach(lesson => {
        if (lesson.start_time && lesson.end_time) {
          allLessons.push({
            ...lesson,
            moduleTitle: module.title,
            moduleId: module.id
          });
        }
      });
    });
    
    // Сортируем уроки по времени начала
    return allLessons.sort((a, b) => 
      new Date(a.start_time) - new Date(b.start_time)
    );
  };

  // Функция для группировки уроков по дням
  const groupLessonsByDate = (lessons) => {
    const grouped = {};
    
    lessons.forEach(lesson => {
      const date = new Date(lesson.start_time);
      const dateKey = date.toDateString();
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = {
          date: date,
          lessons: []
        };
      }
      
      grouped[dateKey].lessons.push(lesson);
    });
    
    return grouped;
  };

  // Функция для получения дней недели
  const getWeekDays = () => {
    const days = [];
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1); // Начало недели с понедельника
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    
    return days;
  };

  // Функция для навигации по датам
  const navigateDate = (direction) => {
    const newDate = new Date(currentDate);
    
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    
    setCurrentDate(newDate);
  };

  // Функция для форматирования времени
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Функция для форматирования даты
  const formatDate = (date) => {
    return date.toLocaleDateString('ru-RU', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  };

  // Функция для определения, является ли дата сегодняшним днем
  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  // Функция для определения, прошел ли урок
  const isLessonPassed = (lesson) => {
    return new Date(lesson.end_time) < new Date();
  };

  // Функция для определения, идет ли урок сейчас
  const isLessonOngoing = (lesson) => {
    const now = new Date();
    return new Date(lesson.start_time) <= now && new Date(lesson.end_time) >= now;
  };

  if (loading) {
    return (
      <div className="schedule-loading">
        <div className="loading-spinner"></div>
        <p>Загрузка расписания...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="schedule-error">
        <h2>Ошибка</h2>
        <p>{error}</p>
      </div>
    );
  }

  const allLessons = getAllLessons();
  const groupedLessons = groupLessonsByDate(allLessons);
  const weekDays = getWeekDays();

  return (
    <div className="schedule-container">
      <div className="schedule-header">
        <h1 className="schedule-title">
          <Calendar size={32} />
          Расписание уроков
        </h1>
        <p className="schedule-subtitle">Планируйте свое обучение эффективно</p>
      </div>

      {/* Навигация и переключение режимов просмотра */}
      <div className="schedule-controls">
        <div className="view-mode-selector">
          <button 
            className={`view-mode-btn ${viewMode === 'day' ? 'active' : ''}`}
            onClick={() => setViewMode('day')}
          >
            День
          </button>
          <button 
            className={`view-mode-btn ${viewMode === 'week' ? 'active' : ''}`}
            onClick={() => setViewMode('week')}
          >
            Неделя
          </button>
          <button 
            className={`view-mode-btn ${viewMode === 'month' ? 'active' : ''}`}
            onClick={() => setViewMode('month')}
          >
            Месяц
          </button>
        </div>

        <div className="date-navigation">
          <button 
            className="nav-btn"
            onClick={() => navigateDate('prev')}
          >
            <ChevronLeft size={20} />
          </button>
          
          <div className="current-date-display">
            {viewMode === 'day' && (
              <h2>{formatDate(currentDate)}</h2>
            )}
            {viewMode === 'week' && (
              <h2>
                {formatDate(weekDays[0])} - {formatDate(weekDays[6])}
              </h2>
            )}
            {viewMode === 'month' && (
              <h2>
                {currentDate.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
              </h2>
            )}
          </div>
          
          <button 
            className="nav-btn"
            onClick={() => navigateDate('next')}
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <button 
          className="today-btn"
          onClick={() => setCurrentDate(new Date())}
        >
          Сегодня
        </button>
      </div>

      {/* Статистика расписания */}
      <div className="schedule-stats">
        <div className="stat-card">
          <div className="stat-icon total">
            <BookOpen size={24} />
          </div>
          <div className="stat-content">
            <h3>Всего уроков</h3>
            <p className="stat-value">{allLessons.length}</p>
            <p className="stat-label">в расписании</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon upcoming">
            <Bell size={24} />
          </div>
          <div className="stat-content">
            <h3>Предстоящие</h3>
            <p className="stat-value">
              {allLessons.filter(lesson => new Date(lesson.start_time) > new Date()).length}
            </p>
            <p className="stat-label">ближайших уроков</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon completed">
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <h3>Завершено</h3>
            <p className="stat-value">
              {allLessons.filter(lesson => new Date(lesson.end_time) < new Date()).length}
            </p>
            <p className="stat-label">уроков</p>
          </div>
        </div>
      </div>

      {/* Отображение расписания */}
      <div className="schedule-content">
        {viewMode === 'day' && (
          <div className="day-view">
            <h3 className="view-title">Расписание на {formatDate(currentDate)}</h3>
            
            {groupedLessons[currentDate.toDateString()] ? (
              <div className="timeline">
                {groupedLessons[currentDate.toDateString()].lessons.map(lesson => (
                  <div 
                    key={lesson.id} 
                    className={`timeline-item ${isLessonPassed(lesson) ? 'passed' : ''} ${isLessonOngoing(lesson) ? 'ongoing' : ''}`}
                  >
                    <div className="time-range">
                      <Clock size={16} />
                      <span>{formatTime(lesson.start_time)} - {formatTime(lesson.end_time)}</span>
                    </div>
                    
                    <div className="lesson-info">
                      <h4>{lesson.title}</h4>
                      <p className="module-name">{lesson.moduleTitle}</p>
                      {lesson.content && (
                        <p className="lesson-content">{lesson.content}</p>
                      )}
                    </div>
                    
                    <div className="lesson-status">
                      {isLessonOngoing(lesson) && (
                        <span className="status-badge ongoing">Сейчас</span>
                      )}
                      {isLessonPassed(lesson) && !isLessonOngoing(lesson) && (
                        <span className="status-badge passed">Завершен</span>
                      )}
                      {!isLessonPassed(lesson) && !isLessonOngoing(lesson) && (
                        <span className="status-badge upcoming">Предстоит</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-lessons">
                <p>На этот день уроков не запланировано</p>
              </div>
            )}
          </div>
        )}

        {viewMode === 'week' && (
          <div className="week-view">
            <h3 className="view-title">Расписание на неделю</h3>
            
            <div className="week-grid">
              {weekDays.map(day => {
                const dayKey = day.toDateString();
                const dayLessons = groupedLessons[dayKey]?.lessons || [];
                
                return (
                  <div 
                    key={dayKey} 
                    className={`week-day ${isToday(day) ? 'today' : ''}`}
                  >
                    <div className="day-header">
                      <h4>{formatDate(day)}</h4>
                      {isToday(day) && <span className="today-badge">Сегодня</span>}
                    </div>
                    
                    {dayLessons.length > 0 ? (
                      <div className="day-lessons">
                        {dayLessons.map(lesson => (
                          <div 
                            key={lesson.id} 
                            className={`week-lesson ${isLessonPassed(lesson) ? 'passed' : ''} ${isLessonOngoing(lesson) ? 'ongoing' : ''}`}
                          >
                            <div className="lesson-time">
                              <Clock size={14} />
                              <span>{formatTime(lesson.start_time)}</span>
                            </div>
                            <div className="lesson-title">{lesson.title}</div>
                            <div className="lesson-module">{lesson.moduleTitle}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="no-lessons-day">
                        <p>Нет уроков</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {viewMode === 'month' && (
          <div className="month-view">
            <h3 className="view-title">Расписание на {currentDate.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}</h3>
            
            <div className="month-grid">
              <div className="month-header">
                {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => (
                  <div key={day} className="month-day-header">{day}</div>
                ))}
              </div>
              
              <div className="month-days">
                {/* Здесь будет реализация календаря на месяц */}
                <div className="month-placeholder">
                  <p>Месячный вид в разработке</p>
                  <p>Используйте daily или weekly view для просмотра расписания</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Ближайшие уроки */}
      <div className="upcoming-lessons">
        <h3 className="section-title">Ближайшие уроки</h3>
        
        {allLessons.filter(lesson => new Date(lesson.start_time) > new Date()).length > 0 ? (
          <div className="upcoming-list">
            {allLessons
              .filter(lesson => new Date(lesson.start_time) > new Date())
              .slice(0, 3)
              .map(lesson => (
                <div key={lesson.id} className="upcoming-item">
                  <div className="upcoming-time">
                    <div className="upcoming-date">
                      {new Date(lesson.start_time).toLocaleDateString('ru-RU', { 
                        day: 'numeric',
                        month: 'short'
                      })}
                    </div>
                    <div className="upcoming-range">
                      {formatTime(lesson.start_time)} - {formatTime(lesson.end_time)}
                    </div>
                  </div>
                  
                  <div className="upcoming-info">
                    <h4>{lesson.title}</h4>
                    <p>{lesson.moduleTitle}</p>
                  </div>
                  
                  <div className="upcoming-actions">
                    <button className="remind-btn">
                      <Bell size={16} />
                      Напомнить
                    </button>
                  </div>
                </div>
              ))
            }
          </div>
        ) : (
          <div className="no-upcoming">
            <p>Ближайшие уроки отсутствуют</p>
          </div>
        )}
      </div>
    </div>
  );
}