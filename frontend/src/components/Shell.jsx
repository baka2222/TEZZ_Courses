import React, { useState, useEffect } from 'react';
import { Menu, User, Calendar, BookOpen, Table, LogOut, X } from 'lucide-react';
import NavLink from './NavLink';

export default function Shell({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Блокировка прокрутки тела при открытом меню
    if (mobileOpen && isMobile) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }
  }, [mobileOpen, isMobile]);

  const handleLogout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    window.location.href = '/login';
  };

  const handleNavClick = () => {
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const toggleMobileMenu = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <div className="shell-container">
      {/* Мобильное меню */}
      <div 
        className={`mobile-overlay ${mobileOpen ? 'active' : ''}`} 
        onClick={() => setMobileOpen(false)}
      />
      
      <aside className={`shell-sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-toggle">
            <button 
              className="toggle-btn" 
              onClick={() => setCollapsed(v => !v)}
              aria-label="toggle menu"
            >
              {collapsed ? <Menu size={20} /> : <X size={20} />}
            </button>
            {!collapsed && (
              <div className="sidebar-brand">
                <div className="brand-logo">TEZZ</div>
                <div className="brand-subtitle">Courses</div>
              </div>
            )}
          </div>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/profile" icon={User} label="Профиль" collapsed={collapsed} onClick={handleNavClick} />
          <NavLink to="/schedule" icon={Calendar} label="Расписание" collapsed={collapsed} onClick={handleNavClick} />
          <NavLink to="/diary" icon={Table} label="Дневник" collapsed={collapsed} onClick={handleNavClick} />
          <NavLink to="/modules" icon={BookOpen} label="Модули" collapsed={collapsed} onClick={handleNavClick} />
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={18} />
            {!collapsed && <span>Выйти</span>}
          </button>
        </div>
      </aside>

      {/* Мобильный заголовок */}
      {isMobile && (
        <div className="mobile-header">
          <button 
            className="mobile-menu-btn"
            onClick={toggleMobileMenu}
            aria-label="Открыть меню"
          >
            <span></span>
          </button>
          <div className="mobile-brand">TEZZ</div>
        </div>
      )}

      <main className="shell-content">
        {children}
      </main>
    </div>
  );
}