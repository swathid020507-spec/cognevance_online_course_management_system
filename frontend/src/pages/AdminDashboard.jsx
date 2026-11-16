import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AlertMessage from '../components/common/AlertMessage';
import {
  Users,
  BookOpen,
  GraduationCap,
  TrendingUp,
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle,
  Clock,
  Shield,
  Layers,
  X,
  Eye,
  Award,
} from 'lucide-react';

const CATEGORIES = [
  'Web Development',
  'Data Science',
  'Cloud & DevOps',
  'Artificial Intelligence',
  'Mobile Development',
  'Cybersecurity',
  'UI/UX Design',
];

const AdminDashboard = () => {
  const { user } = useAuth();

  // Active Tab: 'overview', 'courses', 'users'
  const [activeTab, setActiveTab] = useState('overview');

  // Dashboard Stats State
  const [stats, setStats] = useState(null);
  const [recentEnrollments, setRecentEnrollments] = useState([]);
  const [categoryDistribution, setCategoryDistribution] = useState([]);
  const [popularCourses, setPopularCourses] = useState([]);

  // Courses Management State
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [courseSearch, setCourseSearch] = useState('');

  // Users Management State
  const [usersList, setUsersList] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');

  // Modals & Forms State
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [courseFormData, setCourseFormData] = useState({
    title: '',
    description: '',
    instructor: '',
    category: 'Web Development',
    duration: '',
    level: 'Beginner',
    thumbnail: '',
    rating: 4.8,
  });

  const [deleteConfirmation, setDeleteConfirmation] = useState(null); // { type: 'course'|'user', id, name }

  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  // Fetch Dashboard Stats
  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/stats');
      if (response.success) {
        setStats(response.stats);
        setRecentEnrollments(response.recentEnrollments || []);
        setCategoryDistribution(response.categoryDistribution || []);
        setPopularCourses(response.popularCourses || []);
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.data?.message || err.message || 'Failed to load statistics.' });
    } finally {
      setLoading(false);
    }
  };

  // Fetch Courses
  const fetchCourses = async () => {
    setCoursesLoading(true);
    try {
      const query = courseSearch ? `?search=${encodeURIComponent(courseSearch)}` : '';
      const response = await api.get(`/courses${query}`);
      if (response.success) {
        setCourses(response.courses || []);
      }
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to fetch courses list.' });
    } finally {
      setCoursesLoading(false);
    }
  };

  // Fetch Users
  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const query = userSearch ? `?search=${encodeURIComponent(userSearch)}` : '';
      const response = await api.get(`/admin/users${query}`);
      if (response.success) {
        setUsersList(response.users || []);
      }
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to fetch users list.' });
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'courses') fetchCourses();
    if (activeTab === 'users') fetchUsers();
  }, [activeTab]);

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingCourseId(null);
    setCourseFormData({
      title: '',
      description: '',
      instructor: '',
      category: 'Web Development',
      duration: '8 Weeks',
      level: 'Beginner',
      thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
      rating: 4.8,
    });
    setIsCourseModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (course) => {
    setEditingCourseId(course._id);
    setCourseFormData({
      title: course.title,
      description: course.description,
      instructor: course.instructor,
      category: course.category,
      duration: course.duration,
      level: course.level,
      thumbnail: course.thumbnail,
      rating: course.rating || 4.8,
    });
    setIsCourseModalOpen(true);
  };

  // Save Course (Create or Update)
  const handleSaveCourse = async (e) => {
    e.preventDefault();
    try {
      if (editingCourseId) {
        // Update
        const response = await api.put(`/courses/${editingCourseId}`, courseFormData);
        if (response.success) {
          setAlert({ type: 'success', message: 'Course updated successfully!' });
        }
      } else {
        // Create
        const response = await api.post('/courses', courseFormData);
        if (response.success) {
          setAlert({ type: 'success', message: 'Course created successfully!' });
        }
      }
      setIsCourseModalOpen(false);
      fetchCourses();
      fetchStats();
    } catch (err) {
      setAlert({ type: 'error', message: err.data?.message || err.message || 'Failed to save course.' });
    }
  };

  // Delete Course
  const handleDeleteCourse = async (courseId) => {
    try {
      const response = await api.delete(`/courses/${courseId}`);
      if (response.success) {
        setAlert({ type: 'success', message: 'Course deleted successfully!' });
        fetchCourses();
        fetchStats();
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.data?.message || err.message || 'Failed to delete course.' });
    } finally {
      setDeleteConfirmation(null);
    }
  };

  // Update User Role
  const handleToggleUserRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'student' : 'admin';
    try {
      const response = await api.put(`/admin/users/${userId}/role`, { role: newRole });
      if (response.success) {
        setAlert({ type: 'success', message: response.message });
        fetchUsers();
        fetchStats();
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.data?.message || err.message || 'Failed to update user role.' });
    }
  };

  // Delete User
  const handleDeleteUser = async (userId) => {
    try {
      const response = await api.delete(`/admin/users/${userId}`);
      if (response.success) {
        setAlert({ type: 'success', message: 'User removed successfully.' });
        fetchUsers();
        fetchStats();
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.data?.message || err.message || 'Failed to delete user.' });
    } finally {
      setDeleteConfirmation(null);
    }
  };

  if (loading) {
    return <LoadingSpinner fullPage message="Loading administrator dashboard..." />;
  }

  return (
    <div style={{ padding: '2.5rem 0 5rem' }}>
      <div className="container">
        {/* Admin Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '2rem',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <span className="badge badge-admin">
                <Shield size={12} /> Administrator Portal
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Cognevance Level 2 Control Center
              </span>
            </div>
            <h1 style={{ fontSize: '2.25rem', color: 'var(--navy-900)' }}>Platform Administration</h1>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={handleOpenCreateModal} className="btn btn-primary">
              <Plus size={18} /> Add New Course
            </button>
          </div>
        </div>

        {alert && (
          <div style={{ marginBottom: '1.5rem' }}>
            <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
          </div>
        )}

        {/* Dashboard Navigation Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            borderBottom: '1px solid var(--border)',
            marginBottom: '2rem',
          }}
        >
          <button
            onClick={() => setActiveTab('overview')}
            style={{
              padding: '0.75rem 1.25rem',
              fontWeight: 700,
              fontSize: '0.925rem',
              color: activeTab === 'overview' ? 'var(--primary)' : 'var(--navy-700)',
              borderBottom: activeTab === 'overview' ? '3px solid var(--primary)' : '3px solid transparent',
              background: 'none',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <TrendingUp size={18} /> Overview & Analytics
          </button>

          <button
            onClick={() => setActiveTab('courses')}
            style={{
              padding: '0.75rem 1.25rem',
              fontWeight: 700,
              fontSize: '0.925rem',
              color: activeTab === 'courses' ? 'var(--primary)' : 'var(--navy-700)',
              borderBottom: activeTab === 'courses' ? '3px solid var(--primary)' : '3px solid transparent',
              background: 'none',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <BookOpen size={18} /> Course Management ({stats?.totalCourses || 0})
          </button>

          <button
            onClick={() => setActiveTab('users')}
            style={{
              padding: '0.75rem 1.25rem',
              fontWeight: 700,
              fontSize: '0.925rem',
              color: activeTab === 'users' ? 'var(--primary)' : 'var(--navy-700)',
              borderBottom: activeTab === 'users' ? '3px solid var(--primary)' : '3px solid transparent',
              background: 'none',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <Users size={18} /> User Management ({stats?.totalStudents || 0})
          </button>
        </div>

        {/* ================= TAB 1: OVERVIEW & ANALYTICS ================= */}
        {activeTab === 'overview' && (
          <div>
            {/* KPI Cards */}
            <div className="grid-cols-4" style={{ marginBottom: '2.5rem' }}>
              <div className="stat-card">
                <div className="stat-icon-wrapper" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
                  <Users size={24} />
                </div>
                <div>
                  <div className="stat-value">{stats?.totalStudents || 0}</div>
                  <div className="stat-label">Active Students</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon-wrapper" style={{ backgroundColor: '#f0fdf4', color: '#16a34a' }}>
                  <BookOpen size={24} />
                </div>
                <div>
                  <div className="stat-value">{stats?.totalCourses || 0}</div>
                  <div className="stat-label">Published Courses</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon-wrapper" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
                  <GraduationCap size={24} />
                </div>
                <div>
                  <div className="stat-value">{stats?.totalEnrollments || 0}</div>
                  <div className="stat-label">Total Enrollments</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon-wrapper" style={{ backgroundColor: '#f5f3ff', color: '#7c3aed' }}>
                  <Award size={24} />
                </div>
                <div>
                  <div className="stat-value">{stats?.completionRate || 0}%</div>
                  <div className="stat-label">Completion Rate</div>
                </div>
              </div>
            </div>

            {/* Category breakdown & Recent enrollments */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '2rem' }}>
              {/* Recent Enrollments Table */}
              <div className="card" style={{ padding: '1.5rem', backgroundColor: '#ffffff' }}>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--navy-900)', marginBottom: '1.25rem' }}>
                  Recent Student Enrollments
                </h3>
                <div className="table-responsive">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Course</th>
                        <th>Progress</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentEnrollments.length > 0 ? (
                        recentEnrollments.map((enr) => (
                          <tr key={enr._id}>
                            <td>
                              <div style={{ fontWeight: 700, color: 'var(--navy-900)' }}>
                                {enr.student?.name || 'Student'}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {enr.student?.email}
                              </div>
                            </td>
                            <td>
                              <div style={{ fontWeight: 600, color: 'var(--navy-800)', maxWidth: '220px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {enr.course?.title || 'Course'}
                              </div>
                              <span className="badge badge-category" style={{ fontSize: '0.65rem' }}>
                                {enr.course?.category}
                              </span>
                            </td>
                            <td style={{ minWidth: '110px' }}>
                              <div style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.2rem' }}>
                                {enr.progressPercentage || 0}%
                              </div>
                              <div className="progress-container">
                                <div
                                  className="progress-bar"
                                  style={{ width: `${enr.progressPercentage || 0}%` }}
                                ></div>
                              </div>
                            </td>
                            <td>
                              <span className={`badge ${enr.status === 'completed' ? 'badge-completed' : 'badge-ongoing'}`}>
                                {enr.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                            No enrollments recorded yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Course Categories Breakdown */}
              <div className="card" style={{ padding: '1.5rem', backgroundColor: '#ffffff' }}>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--navy-900)', marginBottom: '1.25rem' }}>
                  Curriculum Distribution
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {categoryDistribution.map((cat) => (
                    <div
                      key={cat._id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.75rem 1rem',
                        backgroundColor: 'var(--bg-main)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--navy-800)' }}>
                        {cat._id}
                      </span>
                      <span className="badge badge-beginner">{cat.count} Courses</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: COURSE MANAGEMENT ================= */}
        {activeTab === 'courses' && (
          <div>
            {/* Search and Action Bar */}
            <div
              className="card"
              style={{
                padding: '1.25rem',
                marginBottom: '1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
                backgroundColor: '#ffffff',
              }}
            >
              <div style={{ position: 'relative', width: '320px' }}>
                <Search
                  size={18}
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }}
                />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Filter courses..."
                  value={courseSearch}
                  onChange={(e) => setCourseSearch(e.target.value)}
                  onKeyUp={(e) => e.key === 'Enter' && fetchCourses()}
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>

              <button onClick={handleOpenCreateModal} className="btn btn-primary">
                <Plus size={16} /> Create Course
              </button>
            </div>

            {/* Courses Table */}
            {coursesLoading ? (
              <LoadingSpinner message="Loading courses..." />
            ) : (
              <div className="card" style={{ backgroundColor: '#ffffff', overflow: 'hidden' }}>
                <div className="table-responsive">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Course</th>
                        <th>Category</th>
                        <th>Level</th>
                        <th>Duration</th>
                        <th>Instructor</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {courses.map((course) => (
                        <tr key={course._id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                              <img
                                src={course.thumbnail}
                                alt={course.title}
                                style={{ width: '48px', height: '36px', borderRadius: '4px', objectFit: 'cover' }}
                              />
                              <div>
                                <div style={{ fontWeight: 700, color: 'var(--navy-900)' }}>
                                  {course.title}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                  {course.lessons?.length || 0} Lessons
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="badge badge-category">{course.category}</span>
                          </td>
                          <td>
                            <span className={`badge ${
                              course.level === 'Beginner' ? 'badge-beginner' :
                              course.level === 'Intermediate' ? 'badge-intermediate' : 'badge-advanced'
                            }`}>
                              {course.level}
                            </span>
                          </td>
                          <td>{course.duration}</td>
                          <td>{course.instructor}</td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                              <button
                                onClick={() => handleOpenEditModal(course)}
                                className="btn btn-secondary btn-sm"
                                title="Edit Course Details"
                              >
                                <Edit2 size={14} color="var(--primary)" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirmation({ type: 'course', id: course._id, name: course.title })}
                                className="btn btn-secondary btn-sm"
                                title="Delete Course"
                              >
                                <Trash2 size={14} color="var(--danger)" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 3: USER MANAGEMENT ================= */}
        {activeTab === 'users' && (
          <div>
            <div
              className="card"
              style={{
                padding: '1.25rem',
                marginBottom: '1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#ffffff',
              }}
            >
              <div style={{ position: 'relative', width: '320px' }}>
                <Search
                  size={18}
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }}
                />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by name or email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  onKeyUp={(e) => e.key === 'Enter' && fetchUsers()}
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>

              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Total Accounts: <strong>{usersList.length}</strong>
              </div>
            </div>

            {usersLoading ? (
              <LoadingSpinner message="Loading registered users..." />
            ) : (
              <div className="card" style={{ backgroundColor: '#ffffff', overflow: 'hidden' }}>
                <div className="table-responsive">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>User Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Enrollments</th>
                        <th>Registered Date</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usersList.map((u) => {
                        const isSelf = u._id === user?._id;
                        return (
                          <tr key={u._id}>
                            <td>
                              <div style={{ fontWeight: 700, color: 'var(--navy-900)' }}>
                                {u.name} {isSelf && <span style={{ color: 'var(--primary)', fontSize: '0.75rem' }}>(You)</span>}
                              </div>
                            </td>
                            <td>{u.email}</td>
                            <td>
                              <span className={`badge ${u.role === 'admin' ? 'badge-admin' : 'badge-student'}`}>
                                {u.role}
                              </span>
                            </td>
                            <td>
                              <strong>{u.enrollmentCount}</strong> courses
                            </td>
                            <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                              {new Date(u.createdAt).toLocaleDateString()}
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              {!isSelf && (
                                <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                                  <button
                                    onClick={() => handleToggleUserRole(u._id, u.role)}
                                    className="btn btn-secondary btn-sm"
                                    title={`Change role to ${u.role === 'admin' ? 'student' : 'admin'}`}
                                  >
                                    Switch to {u.role === 'admin' ? 'Student' : 'Admin'}
                                  </button>
                                  <button
                                    onClick={() => setDeleteConfirmation({ type: 'user', id: u._id, name: u.name })}
                                    className="btn btn-secondary btn-sm"
                                    title="Delete User Account"
                                  >
                                    <Trash2 size={14} color="var(--danger)" />
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= MODAL: CREATE / EDIT COURSE ================= */}
        {isCourseModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3 style={{ color: 'var(--navy-900)', fontSize: '1.35rem' }}>
                  {editingCourseId ? 'Edit Course Details' : 'Create New Technical Course'}
                </h3>
                <button
                  onClick={() => setIsCourseModalOpen(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveCourse}>
                <div className="modal-body">
                  <div className="form-group">
                    <label className="form-label">Course Title</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Mastering Next.js 15 & TypeScript"
                      value={courseFormData.title}
                      onChange={(e) => setCourseFormData({ ...courseFormData, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Comprehensive overview of curriculum and learning goals..."
                      value={courseFormData.description}
                      onChange={(e) => setCourseFormData({ ...courseFormData, description: e.target.value })}
                      required
                    ></textarea>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Instructor Name</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Dr. Sarah Mitchell"
                        value={courseFormData.instructor}
                        onChange={(e) => setCourseFormData({ ...courseFormData, instructor: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Category</label>
                      <select
                        className="form-select"
                        value={courseFormData.category}
                        onChange={(e) => setCourseFormData({ ...courseFormData, category: e.target.value })}
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Duration</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. 8 Weeks or 25 Hours"
                        value={courseFormData.duration}
                        onChange={(e) => setCourseFormData({ ...courseFormData, duration: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Difficulty Level</label>
                      <select
                        className="form-select"
                        value={courseFormData.level}
                        onChange={(e) => setCourseFormData({ ...courseFormData, level: e.target.value })}
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Thumbnail URL</label>
                    <input
                      type="url"
                      className="form-control"
                      placeholder="https://images.unsplash.com/..."
                      value={courseFormData.thumbnail}
                      onChange={(e) => setCourseFormData({ ...courseFormData, thumbnail: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    onClick={() => setIsCourseModalOpen(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingCourseId ? 'Save Changes' : 'Publish Course'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================= MODAL: DELETE CONFIRMATION ================= */}
        {deleteConfirmation && (
          <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '440px' }}>
              <div className="modal-header">
                <h4 style={{ color: 'var(--danger)', fontSize: '1.15rem' }}>Confirm Deletion</h4>
                <button
                  onClick={() => setDeleteConfirmation(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <X size={18} />
                </button>
              </div>
              <div className="modal-body">
                <p style={{ color: 'var(--navy-800)', fontSize: '0.95rem' }}>
                  Are you sure you want to permanently delete <strong>{deleteConfirmation.name}</strong>?
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                  This action will also remove any related enrollments and progress records.
                </p>
              </div>
              <div className="modal-footer">
                <button onClick={() => setDeleteConfirmation(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (deleteConfirmation.type === 'course') handleDeleteCourse(deleteConfirmation.id);
                    if (deleteConfirmation.type === 'user') handleDeleteUser(deleteConfirmation.id);
                  }}
                  className="btn btn-danger"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
