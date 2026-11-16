import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  GraduationCap,
  BookOpen,
  LayoutDashboard,
  Shield,
  LogOut,
  Menu,
  X,
  User,
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header className="navbar">
      <div className="container">
        <div className="navbar-inner">
          {/* Logo / Brand */}
          <Link to="/" className="navbar-brand" onClick={closeMenu}>
            <div className="brand-badge">
              <GraduationCap size={24} />
            </div>
            <div className="brand-text-wrapper">
              <span className="brand-title">COGNEVANCE</span>
              <span className="brand-subtitle">TECHNOLOGIES LMS</span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav>
            <ul className={`nav-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
              <li>
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    `nav-link ${isActive ? 'active' : ''}`
                  }
                  onClick={closeMenu}
                  end
                >
                  Home
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/courses"
                  className={({ isActive }) =>
                    `nav-link ${isActive ? 'active' : ''}`
                  }
                  onClick={closeMenu}
                >
                  Explore Courses
                </NavLink>
              </li>

              {/* Role-based dashboard links */}
              {isAuthenticated && !isAdmin && (
                <li>
                  <NavLink
                    to="/dashboard"
                    className={({ isActive }) =>
                      `nav-link ${isActive ? 'active' : ''}`
                    }
                    onClick={closeMenu}
                  >
                    My Learning
                  </NavLink>
                </li>
              )}

              {isAuthenticated && isAdmin && (
                <li>
                  <NavLink
                    to="/admin"
                    className={({ isActive }) =>
                      `nav-link ${isActive ? 'active' : ''}`
                    }
                    onClick={closeMenu}
                  >
                    Admin Control
                  </NavLink>
                </li>
              )}

              {/* Mobile Auth actions (inside drawer when on mobile) */}
              {mobileMenuOpen && (
                <li style={{ paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                  {isAuthenticated ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className={`badge ${isAdmin ? 'badge-admin' : 'badge-student'}`}>
                          {isAdmin ? 'Admin' : 'Student'}
                        </span>
                        <span style={{ fontWeight: 600, color: 'var(--navy-900)' }}>
                          {user?.name}
                        </span>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="btn btn-secondary btn-sm"
                        style={{ width: '100%' }}
                      >
                        <LogOut size={16} /> Log Out
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <Link
                        to="/login"
                        className="btn btn-secondary btn-block"
                        onClick={closeMenu}
                      >
                        Sign In
                      </Link>
                      <Link
                        to="/register"
                        className="btn btn-primary btn-block"
                        onClick={closeMenu}
                      >
                        Get Started
                      </Link>
                    </div>
                  )}
                </li>
              )}
            </ul>
          </nav>

          {/* Desktop Auth Section */}
          <div className="nav-auth-buttons">
            {isAuthenticated ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div className="user-menu-pill">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="user-avatar-sm" />
                  ) : (
                    <div className="user-avatar-sm">
                      <User size={16} />
                    </div>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--navy-900)' }}>
                      {user?.name?.split(' ')[0]}
                    </span>
                    <span
                      style={{
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        color: isAdmin ? '#b45309' : 'var(--primary)',
                      }}
                    >
                      {isAdmin ? 'Admin' : 'Student'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="btn btn-secondary btn-sm"
                  title="Sign out of your account"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="btn btn-secondary btn-sm">
                  Sign In
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm">
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
