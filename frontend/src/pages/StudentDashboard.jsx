import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import CourseCard from '../components/common/CourseCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AlertMessage from '../components/common/AlertMessage';
import {
  BookOpen,
  CheckCircle,
  Clock,
  TrendingUp,
  Award,
  Compass,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();

  const [enrollments, setEnrollments] = useState([]);
  const [stats, setStats] = useState({
    totalEnrolled: 0,
    completedCount: 0,
    ongoingCount: 0,
    averageProgress: 0,
  });
  const [filter, setFilter] = useState('all'); // 'all', 'ongoing', 'completed'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEnrollments = async () => {
    setLoading(true);
    try {
      const response = await api.get('/enrollments/my');
      if (response.success) {
        setEnrollments(response.enrollments || []);
        if (response.stats) {
          setStats(response.stats);
        }
      }
    } catch (err) {
      setError(err.data?.message || err.message || 'Failed to fetch enrolled courses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrollments();
  }, []);

  // Filter enrollments according to active tab
  const filteredEnrollments = enrollments.filter((e) => {
    if (filter === 'ongoing') return e.status === 'ongoing';
    if (filter === 'completed') return e.status === 'completed';
    return true;
  });

  return (
    <div style={{ padding: '2.5rem 0 5rem' }}>
      <div className="container">
        {/* Welcome Greeting Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, var(--navy-900) 0%, #1e3a8a 100%)',
            color: '#ffffff',
            borderRadius: 'var(--radius-xl)',
            padding: '2.5rem 2rem',
            marginBottom: '2.5rem',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.5rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span className="badge badge-beginner">Student Dashboard</span>
              <span style={{ fontSize: '0.8rem', color: '#93c5fd' }}>Level 2 Internship Portal</span>
            </div>
            <h1 style={{ color: '#ffffff', fontSize: '2.25rem', marginBottom: '0.5rem' }}>
              Welcome Back, {user?.name}!
            </h1>
            <p style={{ color: '#bfdbfe', fontSize: '1rem', maxWidth: '580px' }}>
              Track your ongoing curriculum progress, resume completed modules, and advance your engineering capabilities.
            </p>
          </div>

          <div>
            <Link to="/courses" className="btn btn-primary btn-lg" style={{ backgroundColor: '#ffffff', color: 'var(--navy-900)' }}>
              <Compass size={18} /> Browse More Courses
            </Link>
          </div>
        </div>

        {error && (
          <div style={{ marginBottom: '2rem' }}>
            <AlertMessage type="error" message={error} onClose={() => setError(null)} />
          </div>
        )}

        {/* Dynamic Statistics KPI Cards */}
        <div className="grid-cols-4" style={{ marginBottom: '2.5rem' }}>
          {/* Total Enrolled */}
          <div className="stat-card">
            <div className="stat-icon-wrapper" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
              <BookOpen size={24} />
            </div>
            <div>
              <div className="stat-value">{stats.totalEnrolled}</div>
              <div className="stat-label">Enrolled Courses</div>
            </div>
          </div>

          {/* In Progress */}
          <div className="stat-card">
            <div className="stat-icon-wrapper" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
              <Clock size={24} />
            </div>
            <div>
              <div className="stat-value">{stats.ongoingCount}</div>
              <div className="stat-label">In-Progress</div>
            </div>
          </div>

          {/* Completed */}
          <div className="stat-card">
            <div className="stat-icon-wrapper" style={{ backgroundColor: 'var(--success-light)', color: 'var(--success)' }}>
              <CheckCircle size={24} />
            </div>
            <div>
              <div className="stat-value">{stats.completedCount}</div>
              <div className="stat-label">Completed Courses</div>
            </div>
          </div>

          {/* Overall Average Progress */}
          <div className="stat-card">
            <div className="stat-icon-wrapper" style={{ backgroundColor: '#fffbeb', color: '#f59e0b' }}>
              <TrendingUp size={24} />
            </div>
            <div>
              <div className="stat-value">{stats.averageProgress}%</div>
              <div className="stat-label">Average Completion</div>
            </div>
          </div>
        </div>

        {/* Courses Section with Tabs */}
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.75rem',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <h2 style={{ fontSize: '1.75rem', color: 'var(--navy-900)' }}>Your Courses</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Manage and resume your enrolled learning paths
              </p>
            </div>

            {/* Filter Tabs */}
            <div
              style={{
                display: 'inline-flex',
                backgroundColor: '#ffffff',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '4px',
              }}
            >
              <button
                onClick={() => setFilter('all')}
                style={{
                  padding: '0.45rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  backgroundColor: filter === 'all' ? 'var(--navy-900)' : 'transparent',
                  color: filter === 'all' ? '#ffffff' : 'var(--navy-700)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                All ({enrollments.length})
              </button>
              <button
                onClick={() => setFilter('ongoing')}
                style={{
                  padding: '0.45rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  backgroundColor: filter === 'ongoing' ? 'var(--navy-900)' : 'transparent',
                  color: filter === 'ongoing' ? '#ffffff' : 'var(--navy-700)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                Ongoing ({stats.ongoingCount})
              </button>
              <button
                onClick={() => setFilter('completed')}
                style={{
                  padding: '0.45rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  backgroundColor: filter === 'completed' ? 'var(--navy-900)' : 'transparent',
                  color: filter === 'completed' ? '#ffffff' : 'var(--navy-700)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                Completed ({stats.completedCount})
              </button>
            </div>
          </div>

          {/* Enrolled Courses Grid */}
          {loading ? (
            <LoadingSpinner message="Loading your enrolled courses..." />
          ) : filteredEnrollments.length > 0 ? (
            <div className="grid-cols-3">
              {filteredEnrollments.map((item) => (
                <CourseCard
                  key={item._id}
                  course={item.course}
                  enrollment={item}
                />
              ))}
            </div>
          ) : (
            <div
              className="card card-padded"
              style={{ textAlign: 'center', padding: '4rem 1.5rem', backgroundColor: '#ffffff' }}
            >
              <BookOpen size={48} color="var(--primary)" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ color: 'var(--navy-900)' }}>
                {filter === 'all'
                  ? 'You are not enrolled in any courses yet'
                  : `No ${filter} courses found`}
              </h3>
              <p style={{ color: 'var(--text-muted)', margin: '0.5rem auto 1.5rem', maxWidth: '460px' }}>
                Explore our catalog of web development, data science, and cloud computing curriculums to start learning.
              </p>
              <Link to="/courses" className="btn btn-primary">
                <Compass size={18} /> Explore Course Catalog
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
