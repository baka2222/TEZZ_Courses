import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import SchedulePage from './pages/SchedulePage';
import ModulePage from './pages/ModulePage';
import LessonPage from './pages/LessonPage';
import DiaryPage from './pages/DiaryPage';
import ProtectedRoute from './components/ProtectedRoute';
import Shell from './components/Shell';
import ModulesPage from './pages/ModulesPage';


export default function App() {
return (
<Router>
<Routes>
<Route path="/login" element={<LoginPage />} />
<Route path="/" element={<ProtectedRoute><Shell><ModulesPage /></Shell></ProtectedRoute>} />
<Route path="/profile" element={<ProtectedRoute><Shell><ProfilePage /></Shell></ProtectedRoute>} />
<Route path="/schedule" element={<ProtectedRoute><Shell><SchedulePage /></Shell></ProtectedRoute>} />
<Route path="/modules" element={<ProtectedRoute><Shell><ModulesPage /></Shell></ProtectedRoute>} />
<Route path="/modules/:moduleId" element={<ProtectedRoute><Shell><ModulePage /></Shell></ProtectedRoute>} />
<Route path="/modules/:moduleId/lessons/:lessonId" element={<ProtectedRoute><Shell><LessonPage /></Shell></ProtectedRoute>} />
<Route path="/diary" element={<ProtectedRoute><Shell><DiaryPage /></Shell></ProtectedRoute>} />
<Route path="*" element={<Navigate to="/" replace />} />
</Routes>
</Router>
);
}