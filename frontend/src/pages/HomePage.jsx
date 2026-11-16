import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import CourseCard from '../components/common/CourseCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  GraduationCap,
  ArrowRight,
  Sparkles,
  BookOpen,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Code2,
  Users,
  Compass,
} from 'lucide-react';

const HomePage = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/courses?limit=6&sort=rating');
      if (response.success) {
        setFeaturedCourses(response.courses || []);
      } else {
        throw new Error(response.message || 'Failed to fetch featured courses.');
      }
    } catch (err) {
      console.warn('Could not fetch featured courses:', err.message);
      setError(err.message || 'Unable to connect to backend server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section
        style={{
          background: 'linear-gradient(135deg, #0a0f1d 0%, #0f172a 60%, #1e293b 100%)',
          color: '#ffffff',
          padding: '5rem 0 4.5rem',
          position: 'relative',
          overflow: 'hidden',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div className="container">
          <div style={{ maxWidth: '850px', margin: '0 auto', textAlign: 'center' }}>
            {/* Internship Tag */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: 'rgba(37, 99, 235, 0.15)',
                border: '1px solid rgba(59, 130, 246, 0.4)',
                borderRadius: 'var(--radius-full)',
                padding: '0.4rem 1rem',
                fontSize: '0.825rem',
                fontWeight: 600,
                color: '#60a5fa',
                marginBottom: '1.75rem',
              }}
            >
              <Sparkles size={16} />
              <span>Cognevance Technologies • Level 2 Full Stack Internship Project</span>
            </div>

            <h1
              style={{
                color: '#ffffff',
                fontSize: '3.25rem',
                lineHeight: 1.15,
                fontWeight: 800,
                letterSpacing: '-0.03em',
                marginBottom: '1.5rem',
              }}
            >
              Master Next-Generation Tech with{' '}
              <span style={{ color: '#38bdf8' }}>Cognevance LMS</span>
            </h1>

            <p
              style={{
                fontSize: '1.15rem',
                color: '#94a3b8',
                lineHeight: 1.6,
                maxWidth: '680px',
                margin: '0 auto 2.25rem',
              }}
            >
              An enterprise-grade Online Course Management System built with MongoDB,
              Express.js, React 19, and Node.js. Discover curated curriculums, track
              lesson progress, and elevate your technical career.
            </p>

            {/* Hero CTAs */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1rem',
                flexWrap: 'wrap',
              }}
            >
              <Link to="/courses" className="btn btn-primary btn-lg">
                <Compass size={20} />
                Explore All Courses
              </Link>

              {isAuthenticated ? (
                <Link
                  to={isAdmin ? '/admin' : '/dashboard'}
                  className="btn btn-secondary btn-lg"
                  style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#ffffff', borderColor: 'rgba(255,255,255,0.2)' }}
                >
                  Go to {isAdmin ? 'Admin Console' : 'My Dashboard'}
                  <ArrowRight size={18} />
                </Link>
              ) : (
                <Link
                  to="/register"
                  className="btn btn-secondary btn-lg"
                  style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#ffffff', borderColor: 'rgba(255,255,255,0.2)' }}
                >
                  Join Free Today
                  <ArrowRight size={18} />
                </Link>
              )}
            </div>

            {/* Quick Metrics Bar */}
            <div
              style={{
                marginTop: '4rem',
                paddingTop: '2rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '1.5rem',
              }}
            >
              <div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#38bdf8' }}>7+</div>
                <div style={{ fontSize: '0.825rem', color: '#94a3b8' }}>Industry Tracks</div>
              </div>
              <div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#38bdf8' }}>100%</div>
                <div style={{ fontSize: '0.825rem', color: '#94a3b8' }}>Free Open Access</div>
              </div>
              <div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#38bdf8' }}>MERN</div>
                <div style={{ fontSize: '0.825rem', color: '#94a3b8' }}>Modern Stack</div>
              </div>
              <div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#38bdf8' }}>24/7</div>
                <div style={{ fontSize: '0.825rem', color: '#94a3b8' }}>Progress Tracking</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section style={{ padding: '4.5rem 0' }}>
        <div className="container">
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              marginBottom: '2.5rem',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <span
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: 'var(--primary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                Top Rated Curriculums
              </span>
              <h2 style={{ fontSize: '2.15rem', color: 'var(--navy-900)', marginTop: '0.35rem' }}>
                Featured Engineering Courses
              </h2>
            </div>
            <Link
              to="/courses"
              className="btn btn-outline-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              Browse All Courses <ArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <LoadingSpinner message="Loading popular courses..." />
          ) : featuredCourses.length > 0 ? (
            <div className="grid-cols-3">
              {featuredCourses.slice(0, 6).map((course) => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>
          ) : error ? (
            <div
              className="card card-padded"
              style={{ textAlign: 'center', padding: '3rem 1.5rem', backgroundColor: '#ffffff' }}
            >
              <BookOpen size={48} color="var(--danger)" style={{ margin: '0 auto 1rem' }} />
              <h3>Unable to load courses</h3>
              <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 1.5rem' }}>
                {error}
              </p>
              <button onClick={fetchCourses} className="btn btn-primary">
                Retry Loading
              </button>
            </div>
          ) : (
            <div
              className="card card-padded"
              style={{ textAlign: 'center', padding: '3rem 1.5rem', backgroundColor: '#ffffff' }}
            >
              <BookOpen size={48} color="var(--primary)" style={{ margin: '0 auto 1rem' }} />
              <h3>No courses found in database</h3>
              <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 1.5rem' }}>
                Run <code>npm run seed</code> in the backend folder or connect to MongoDB Atlas to populate data.
              </p>
              <Link to="/courses" className="btn btn-primary">
                View Catalog
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Cognevance LMS */}
      <section
        style={{
          backgroundColor: '#ffffff',
          padding: '4.5rem 0',
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 3.5rem' }}>
            <span
              style={{
                fontSize: '0.85rem',
                fontWeight: 700,
                color: 'var(--primary)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              Platform Highlights
            </span>
            <h2 style={{ fontSize: '2.15rem', color: 'var(--navy-900)', marginTop: '0.35rem' }}>
              Why Learn with Cognevance Technologies?
            </h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.75rem' }}>
              Engineered for seamless learning, instant lesson tracking, and comprehensive
              curriculum management.
            </p>
          </div>

          <div className="grid-cols-4">
            <div className="card card-padded" style={{ borderTop: '4px solid var(--primary)' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--primary-light)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <Code2 size={24} />
              </div>
              <h4 style={{ color: 'var(--navy-900)', marginBottom: '0.5rem' }}>
                Full MERN Architecture
              </h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                Powered by a RESTful Node/Express backend, robust MongoDB schemas, and React 19 on Vite.
              </p>
            </div>

            <div className="card card-padded" style={{ borderTop: '4px solid var(--success)' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--success-light)',
                  color: 'var(--success)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <TrendingUp size={24} />
              </div>
              <h4 style={{ color: 'var(--navy-900)', marginBottom: '0.5rem' }}>
                Real-Time Progress
              </h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                Mark completed lessons, track percentage completion, and resume seamlessly right where you left off.
              </p>
            </div>

            <div className="card card-padded" style={{ borderTop: '4px solid #f59e0b' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#fffbeb',
                  color: '#f59e0b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <ShieldCheck size={24} />
              </div>
              <h4 style={{ color: 'var(--navy-900)', marginBottom: '0.5rem' }}>
                Secure Auth & RBAC
              </h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                BCrypt password salting and stateless JWT tokens protect both student dashboards and admin tools.
              </p>
            </div>

            <div className="card card-padded" style={{ borderTop: '4px solid #8b5cf6' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#f5f3ff',
                  color: '#8b5cf6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <Users size={24} />
              </div>
              <h4 style={{ color: 'var(--navy-900)', marginBottom: '0.5rem' }}>
                Course Management
              </h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                Admins have full CRUD capabilities to publish courses, view real-time enrollments, and manage students.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section
        style={{
          background: 'linear-gradient(135deg, var(--navy-900) 0%, var(--primary) 100%)',
          color: '#ffffff',
          padding: '4.5rem 0',
          textAlign: 'center',
        }}
      >
        <div className="container" style={{ maxWidth: '750px' }}>
          <h2 style={{ color: '#ffffff', fontSize: '2.25rem', marginBottom: '1rem' }}>
            Start Building Your Technical Portfolio Today
          </h2>
          <p style={{ color: '#e0f2fe', fontSize: '1.05rem', marginBottom: '2rem' }}>
            Enroll in hands-on courses designed by industry engineers. Track your progress,
            complete interactive modules, and showcase your skills.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/courses" className="btn btn-secondary btn-lg" style={{ color: 'var(--navy-900)' }}>
              Browse Catalog
            </Link>
            {!isAuthenticated && (
              <Link to="/register" className="btn btn-navy btn-lg">
                Create Free Account
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
