import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, Edit3, Save } from 'lucide-react';

export default function LessonPage() {
  const { moduleId, lessonId } = useParams();
  const [lesson, setLesson] = useState(null);
  const [user, setUser] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [updateStatus, setUpdateStatus] = useState('');
  const [scores, setScores] = useState({}); // Для хранения временных оценок

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        
        const [lessonRes, userRes] = await Promise.all([
          axios.get(`/lessons/${lessonId}/`),
          axios.get('/profile/')
        ]);

        setLesson(lessonRes.data);
        setUser(userRes.data);

        if (userRes.data.role === 'teacher') {
          const studentsRes = await axios.get(`/lessons/${lessonId}/students/`);
          setStudents(studentsRes.data);
          
          // Инициализируем временные оценки
          const initialScores = {};
          studentsRes.data.forEach(student => {
            initialScores[student.mark_id] = student.mark || '';
          });
          setScores(initialScores);
        } else {
          try {
            const marksRes = await axios.get(`/marks/${lessonId}/`);
            setStudents(marksRes.data);
          } catch (err) {
            setStudents([]);
          }
        }
      } catch (err) {
        console.error('Ошибка загрузки урока:', err);
        setError('Не удалось загрузить урок');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [lessonId]);

  const handleScoreChange = (markId, value) => {
    setScores(prev => ({
      ...prev,
      [markId]: value
    }));
  };

  const handleSaveScores = async () => {
    try {
      setUpdateStatus('Сохранение...');
      
      // Отправляем все оценки
      await Promise.all(
        Object.entries(scores).map(([markId, score]) => 
          axios.patch(`/marks/${markId}/update/`, { score })
        )
      );
      
      setUpdateStatus('Оценки сохранены');
      setTimeout(() => setUpdateStatus(''), 3000);
    } catch (err) {
      console.error('Ошибка сохранения оценок:', err);
      setUpdateStatus('Ошибка сохранения оценок');
    }
  };

  const handleFileUpload = async () => {
    if (!file) return;
    
    try {
      setUploading(true);
      
      let markId = null;
      if (students.length > 0 && students[0].id) {
        markId = students[0].id;
      }
      
      if (!markId) {
        setUpdateStatus('Сначала учитель должен создать оценку');
        return;
      }
      
      const formData = new FormData();
      formData.append('answer', file);
      
      await axios.patch(`/marks/${markId}/update/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setUpdateStatus('Файл успешно загружен');
      setTimeout(() => setUpdateStatus(''), 3000);
      setFile(null);
    } catch (err) {
      console.error('Ошибка загрузки файла:', err);
      setUpdateStatus('Ошибка загрузки файла');
    } finally {
      setUploading(false);
    }
  };

  function formatDateTime(iso, { month = true, year = false, tz = null } = {}) {
    if (!iso) return 'Не указано';
    const d = new Date(iso);
    if (isNaN(d)) return 'Не указано';

    const dateOpts = { day: 'numeric' };
    if (month) dateOpts.month = 'long';
    if (month && year) dateOpts.year = 'numeric';
    if (tz) dateOpts.timeZone = tz;

    const timeOpts = { hour: '2-digit', minute: '2-digit' };
    if (tz) timeOpts.timeZone = tz;

    return `${new Intl.DateTimeFormat('ru-RU', dateOpts).format(d)}, ${new Intl.DateTimeFormat('ru-RU', timeOpts).format(d)}`;
  }

  if (loading) {
    return (
      <div className="lesson-loading">
        <div className="loading-spinner"></div>
        <p>Загрузка урока...</p>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="lesson-error">
        <h2>Ошибка</h2>
        <p>{error || 'Урок не найден'}</p>
        <Link to={`/modules/${moduleId}`} className="back-link">
          ← Назад к модулю
        </Link>
      </div>
    );
  }

  return (
    <div className="lesson-container">
      <style>
        {`
          .save-scores-btn {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 10px 16px;
            background: #4CAF50;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            margin-bottom: 16px;
          }
          
          .save-scores-btn:disabled {
            background: #ccc;
            cursor: not-allowed;
          }
          
          .score-input {
            padding: 12px; /* Увеличиваем для лучшего касания на iPhone */
            font-size: 16px; /* Предотвращает масштабирование на iOS */
            min-width: 60px;
            border: 1px solid #ddd;
            border-radius: 4px;
          }
          
          /* Стиль для предотвращения масштабирования на iOS */
          @media screen and (max-width: 768px) {
            input[type="number"] {
              font-size: 16px !important;
            }
          }
        `}
      </style>

      <div className="lesson-header">
        <Link to={`/modules/${moduleId}`} className="back-link">
          ← Назад к модулю
        </Link>
        <h1 className="lesson-title">{lesson.title}</h1>
        
        <div className="lesson-meta">
          <div className="meta-item">
            <Calendar size={16} />
            <span>Создан: {formatDateTime(lesson.created_at)}</span>
          </div>
          <div className="meta-item">
            <Edit3 size={16} />
            <span>Обновлен: {formatDateTime(lesson.updated_at)}</span>
          </div>
          {lesson.start_time && (
            <div className="meta-item">
              <Clock size={16} />
              <span>Начало урока: {formatDateTime(lesson.start_time)}</span>
            </div>
          )}
          {lesson.end_time && (
            <div className="meta-item">
              <Clock size={16} />
              <span>Окончание урока: {formatDateTime(lesson.end_time)}</span>
            </div>
          )}
        </div>
        
        {lesson.description && (
          <p className="lesson-description">{lesson.description}</p>
        )}
        {lesson.content && (
          <div className="lesson-content">
            <h3>Содержание урока:</h3>
            <p>{lesson.content}</p>
          </div>
        )}
      </div>

      {updateStatus && (
        <div className={`update-status ${updateStatus.includes('Ошибка') ? 'error' : 'success'}`}>
          {updateStatus}
        </div>
      )}

      <div className="lesson-main-content">
        {user?.role === 'teacher' ? (
          <div className="teacher-view">
            <h2 className="section-title">Студенты и оценки</h2>
            
            <button 
              onClick={handleSaveScores}
              className="save-scores-btn"
              disabled={Object.keys(scores).length === 0}
            >
              <Save size={16} />
              Сохранить все оценки
            </button>
            
            {students.length > 0 ? (
              <div className="students-table">
                <div className="table-header">
                  <div className="table-cell">Студент</div>
                  <div className="table-cell">Текущая оценка</div>
                  <div className="table-cell">Новая оценка</div>
                  <div className="table-cell">Работа</div>
                </div>
                
                {students.map(student => (
                  <div key={student.id} className="table-row">
                    <div className="table-cell">
                      {student.first_name || `Студент #${student.id}`}
                    </div>
                    <div className="table-cell">
                      <span className={`score ${student.mark ? 'has-score' : 'no-score'}`}>
                        {student.mark || '—'}
                      </span>
                    </div>
                    <div className="table-cell">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={scores[student.mark_id] || ''}
                        onChange={(e) => handleScoreChange(student.mark_id, e.target.value)}
                        className="score-input"
                        placeholder="0-100"
                      />
                    </div>
                    <div className="table-cell">
                      {student.answer_url && (
                        <a 
                          href={student.answer_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          Посмотреть работу
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-students">
                <p>На этот урок еще не записаны студенты</p>
              </div>
            )}
          </div>
        ) : (
          <div className="student-view">
            <h2 className="section-title">Ваша работа</h2>
            
            {students.length > 0 && students[0].score ? (
              <div className="score-display">
                <h3>Ваша оценка</h3>
                <span className="score-value">{students[0].score}</span>
                <span className="score-label">баллов</span>
              </div>
            ) : (
              <div className="no-score">
                <p>Оценка еще не выставлена</p>
              </div>
            )}
            
            <div className="file-upload-section">
              <h3>Загрузить ответ</h3>
              <div className="file-upload">
                <input
                  type="file"
                  id="file-upload"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="file-input"
                />
                <label htmlFor="file-upload" className="file-label">
                  {file ? file.name : 'Выберите файл'}
                </label>
                <button
                  onClick={handleFileUpload}
                  disabled={!file || uploading}
                  className="upload-button"
                >
                  {uploading ? 'Загрузка...' : 'Загрузить'}
                </button>
              </div>
              <p className="file-help">Загрузите файл с вашим ответом на задание</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}