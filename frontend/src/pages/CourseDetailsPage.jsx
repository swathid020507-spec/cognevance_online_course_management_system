import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AlertMessage from '../components/common/AlertMessage';
import {
  Clock,
  User,
  Star,
  BookOpen,
  CheckCircle,
  PlayCircle,
  Users,
  ShieldCheck,
  Award,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

const CourseDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin } = useAuth();

  const [course, setCourse] = useState(null);
  const [enrolledStudentsCount, setEnrolledStudentsCount] = useState(0);
  const [enrollment, setEnrollment] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [message, setMessage] = useState(null);

  // Fetch course details & enrollment status
  useEffect(() => {
    const fetchCourseData = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/courses/${id}`);
        if (response.success && response.course) {
          setCourse(response.course);
          setEnrolledStudentsCount(response.enrolledStudentsCount || 0);
        }

        // Check if student is enrolled
        if (isAuthenticated && !isAdmin) {
          try {
            const enrollCheck = await api.get(`/enrollments/check/${id}`);
            if (enrollCheck.success && enrollCheck.isEnrolled) {
              setIsEnrolled(true);
              setEnrollment(enrollCheck.enrollment);
            }
          } catch (e) {
            console.warn('Could not verify enrollment status:', e.message);
          }
        }
      } catch (err) {
        setMessage({ type: 'error', text: err.data?.message || err.message || 'Course not found.' });
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [id, isAuthenticated, isAdmin]);

  // Handle enrollment button click
  const handleEnroll = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/courses/${id}` } } });
      return;
    }

    if (isAdmin) {
      setMessage({ type: 'info', text: 'Administrators have full access to review courses without formal student enrollment.' });
      return;
    }

    setEnrolling(true);
    setMessage(null);

    try {
      const response = await api.post(`/enrollments/${id}`);
      if (response.success) {
        setIsEnrolled(true);
        setEnrollment(response.enrollment);
        setEnrolledStudentsCount((prev) => prev + 1);
        setMessage({
          type: 'success',
          text: '🎉 Congratulations! You have successfully enrolled in this course.',
        });
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.data?.message || err.message || 'Failed to enroll in course. Please try again.',
      });
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullPage message="Loading course curriculum..." />;
  }

  if (!course) {
    return (
      <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>
        <h2>Course Not Found</h2>
        <p style={{ color: 'var(--text-muted)', margin: '1rem 0 2rem' }}>
          The requested course could not be located in our catalog.
        </p>
        <Link to="/courses" className="btn btn-primary">
          Return to Courses Catalog
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Top Breadcrumb & Hero */}
      <section
        style={{
          background: 'linear-gradient(135deg, #0a0f1d 0%, #0f172a 70%, #1e293b 100%)',
          color: '#ffffff',
          padding: '3.5rem 0 4rem',
        }}
      >
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1.25rem' }}>
            <Link to="/" style={{ color: '#94a3b8' }}>Home</Link>
            <span>/</span>
            <Link to="/courses" style={{ color: '#94a3b8' }}>Courses</Link>
            <span>/</span>
            <span style={{ color: '#38bdf8' }}>{course.category}</span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr',
              gap: '3rem',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <span className="badge badge-category">{course.category}</span>
                <span className={`badge ${
                  course.level === 'Beginner' ? 'badge-beginner' :
                  course.level === 'Intermediate' ? 'badge-intermediate' : 'badge-advanced'
                }`}>
                  {course.level} Level
                </span>
                {isEnrolled && (
                  <span className="badge badge-completed">
                    <CheckCircle size={12} /> Currently Enrolled
                  </span>
                )}
              </div>

              <h1 style={{ color: '#ffffff', fontSize: '2.4rem', lineHeight: 1.2, marginBottom: '1rem' }}>
                {course.title}
              </h1>

              <p style={{ color: '#cbd5e1', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                {course.description}
              </p>

              {/* Meta details bar */}
              <div
                style={{
                  display: 'flex',
                  gap: '1.5rem',
                  fontSize: '0.9rem',
                  color: '#94a3b8',
                  flexWrap: 'wrap',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <User size={16} color="#38bdf8" />
                  <span>Instructor: <strong style={{ color: '#f8fafc' }}>{course.instructor}</strong></span>
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Clock size={16} color="#38bdf8" />
                  <span>Duration: <strong style={{ color: '#f8fafc' }}>{course.duration}</strong></span>
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Star size={16} fill="#f59e0b" color="#f59e0b" />
                  <span>Rating: <strong style={{ color: '#f8fafc' }}>{course.rating || 4.8} / 5.0</strong></span>
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Users size={16} color="#38bdf8" />
                  <span><strong style={{ color: '#f8fafc' }}>{enrolledStudentsCount}</strong> Students Enrolled</span>
                </span>
              </div>
            </div>

            {/* Course Card Preview in Hero Header */}
            <div>
              <div
                className="card"
                style={{
                  overflow: 'hidden',
                  boxShadow: 'var(--shadow-xl)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                }}
              >
                <div style={{ height: '200px', overflow: 'hidden' }}>
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div style={{ padding: '1.5rem', backgroundColor: '#ffffff', color: 'var(--navy-900)' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--navy-900)' }}>
                      Free Access
                    </span>
                    <span className="badge badge-beginner">Cognevance Verified</span>
                  </div>

                  {isEnrolled ? (
                    <div>
                      <div
                        style={{
                          backgroundColor: 'var(--success-light)',
                          color: 'var(--success-dark)',
                          padding: '0.75rem 1rem',
                          borderRadius: 'var(--radius-md)',
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          marginBottom: '1rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                        }}
                      >
                        <CheckCircle size={18} />
                        You are actively enrolled in this course!
                      </div>

                      {enrollment && (
                        <div style={{ marginBottom: '1.25rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                            <span>Progress</span>
                            <span>{enrollment.progressPercentage || 0}% Complete</span>
                          </div>
                          <div className="progress-container">
                            <div
                              className="progress-bar"
                              style={{ width: `${enrollment.progressPercentage || 0}%` }}
                            ></div>
                          </div>
                        </div>
                      )}

                      <Link
                        to={`/learn/${course._id}`}
                        className="btn btn-primary btn-block btn-lg"
                      >
                        <PlayCircle size={20} />
                        Go to Learning Classroom
                      </Link>
                    </div>
                  ) : (
                    <div>
                      <button
                        onClick={handleEnroll}
                        disabled={enrolling}
                        className="btn btn-primary btn-block btn-lg"
                        style={{ marginBottom: '0.75rem' }}
                      >
                        {enrolling ? 'Enrolling...' : 'Enroll in Course (100% Free)'}
                      </button>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                        Includes lifetime syllabus access & progress tracking certificate.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area: Syllabus & Overview */}
      <section style={{ padding: '3.5rem 0 5rem' }}>
        <div className="container">
          {message && (
            <div style={{ marginBottom: '2rem' }}>
              <AlertMessage
                type={message.type}
                message={message.text}
                onClose={() => setMessage(null)}
              />
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '3rem' }}>
            {/* Left Column: What You'll Learn & Lessons Syllabus */}
            <div>
              {/* Learning Outcomes */}
              <div className="card card-padded" style={{ marginBottom: '2.5rem' }}>
                <h3 style={{ color: 'var(--navy-900)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Award size={22} color="var(--primary)" />
                  What You Will Learn & Build
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.9rem' }}>
                    <CheckCircle size={18} color="var(--success)" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>Real-world hands-on projects adhering to modern coding standards</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.9rem' }}>
                    <CheckCircle size={18} color="var(--success)" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>Production deployment strategies and performance optimizations</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.9rem' }}>
                    <CheckCircle size={18} color="var(--success)" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>Architectural best practices and design patterns</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.9rem' }}>
                    <CheckCircle size={18} color="var(--success)" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>Self-paced progression with permanent certificate eligibility</span>
                  </div>
                </div>
              </div>

              {/* Course Syllabus / Curriculum */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                  <div>
                    <h3 style={{ color: 'var(--navy-900)' }}>Course Curriculum Syllabus</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                      {course.lessons?.length || 0} comprehensive lessons & modules
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {course.lessons && course.lessons.length > 0 ? (
                    course.lessons.map((lesson, index) => {
                      const isLessonDone = enrollment?.completedLessons?.includes(lesson.title);
                      return (
                        <div
                          key={lesson._id || index}
                          className="card"
                          style={{
                            padding: '1.25rem 1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '1rem',
                            borderLeft: isLessonDone ? '4px solid var(--success)' : '4px solid var(--primary)',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div
                              style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                backgroundColor: isLessonDone ? 'var(--success-light)' : 'var(--primary-light)',
                                color: isLessonDone ? 'var(--success)' : 'var(--primary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 700,
                                fontSize: '0.85rem',
                                flexShrink: 0,
                              }}
                            >
                              {isLessonDone ? <CheckCircle size={18} /> : index + 1}
                            </div>
                            <div>
                              <h4 style={{ fontSize: '1.05rem', color: 'var(--navy-900)', marginBottom: '0.2rem' }}>
                                {lesson.title}
                              </h4>
                              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                                {lesson.content || 'Interactive lecture covering core principles with step-by-step instructions.'}
                              </p>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                            <span
                              style={{
                                fontSize: '0.825rem',
                                color: 'var(--text-muted)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                              }}
                            >
                              <Clock size={14} /> {lesson.duration || '20 mins'}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p style={{ color: 'var(--text-muted)' }}>No syllabus modules currently listed.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Instructor Profile & Features */}
            <div>
              {/* Instructor Card */}
              <div className="card card-padded" style={{ marginBottom: '2rem' }}>
                <h4 style={{ color: 'var(--navy-900)', marginBottom: '1.25rem' }}>About the Instructor</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <div
                    style={{
                      width: '54px',
                      height: '54px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--navy-900)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '1.25rem',
                    }}
                  >
                    {course.instructor?.charAt(0) || 'I'}
                  </div>
                  <div>
                    <h5 style={{ fontSize: '1.1rem', color: 'var(--navy-900)' }}>{course.instructor}</h5>
                    <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>
                      Senior Technical Lead & Curriculum Specialist
                    </span>
                  </div>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  Expert educator with multi-year production experience teaching full-stack architecture,
                  database scalability, and cloud engineering standards.
                </p>
              </div>

              {/* Course Includes List */}
              <div className="card card-padded">
                <h4 style={{ color: 'var(--navy-900)', marginBottom: '1.25rem' }}>Course Highlights</h4>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.875rem', color: 'var(--navy-700)' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <BookOpen size={16} color="var(--primary)" />
                    <span>{course.lessons?.length || 0} On-Demand Lessons</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Clock size={16} color="var(--primary)" />
                    <span>{course.duration} Estimated Duration</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Sparkles size={16} color="var(--primary)" />
                    <span>Interactive Progress Tracking</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ShieldCheck size={16} color="var(--primary)" />
                    <span>Verified Level 2 Certificate Eligibility</span>
                  </li>
                </ul>

                {isEnrolled && (
                  <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                    <Link to={`/learn/${course._id}`} className="btn btn-primary btn-block">
                      <PlayCircle size={18} /> Resume Classroom
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CourseDetailsPage;
