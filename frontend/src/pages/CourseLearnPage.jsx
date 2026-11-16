import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AlertMessage from '../components/common/AlertMessage';
import {
  CheckCircle,
  PlayCircle,
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  Clock,
  Sparkles,
  Check,
} from 'lucide-react';

const CourseLearnPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [alert, setAlert] = useState(null);

  // Fetch course and enrollment data
  useEffect(() => {
    const fetchLearningData = async () => {
      setLoading(true);
      try {
        // Fetch course
        const courseRes = await api.get(`/courses/${id}`);
        if (!courseRes.success || !courseRes.course) {
          throw new Error('Course not found');
        }
        setCourse(courseRes.course);

        // Fetch enrollment status
        const enrollRes = await api.get(`/enrollments/check/${id}`);
        if (enrollRes.success && enrollRes.isEnrolled && enrollRes.enrollment) {
          setEnrollment(enrollRes.enrollment);

          // Find first incomplete lesson to jump to, if any
          const completed = enrollRes.enrollment.completedLessons || [];
          const lessons = courseRes.course.lessons || [];
          const firstIncomplete = lessons.findIndex((l) => !completed.includes(l.title));
          if (firstIncomplete !== -1) {
            setActiveLessonIndex(firstIncomplete);
          }
        } else {
          // If not enrolled, redirect back to course details
          navigate(`/courses/${id}`);
        }
      } catch (err) {
        setAlert({ type: 'error', message: err.message || 'Unable to load course classroom.' });
      } finally {
        setLoading(false);
      }
    };

    fetchLearningData();
  }, [id, navigate]);

  // Toggle lesson completion
  const handleToggleLessonComplete = async (lessonTitle) => {
    if (!enrollment || updating) return;

    setUpdating(true);
    setAlert(null);

    try {
      const response = await api.put(`/enrollments/${id}/progress`, {
        lessonId: lessonTitle,
      });

      if (response.success && response.enrollment) {
        setEnrollment(response.enrollment);
        const isNowCompleted = response.enrollment.completedLessons?.includes(lessonTitle);

        if (response.enrollment.status === 'completed' && response.enrollment.progressPercentage === 100) {
          setAlert({
            type: 'success',
            message: '🎉 Congratulations! You have completed 100% of this course!',
          });
        } else if (isNowCompleted) {
          setAlert({
            type: 'success',
            message: `Marked "${lessonTitle}" as completed. Keep going!`,
          });
        }
      }
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.data?.message || err.message || 'Failed to update progress.',
      });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullPage message="Opening interactive classroom..." />;
  }

  if (!course || !enrollment) {
    return (
      <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>
        <h2>Classroom Access Error</h2>
        <p style={{ color: 'var(--text-muted)', margin: '1rem 0 2rem' }}>
          Please make sure you are enrolled in this course to access the classroom.
        </p>
        <Link to={`/courses/${id}`} className="btn btn-primary">
          Back to Course Details
        </Link>
      </div>
    );
  }

  const lessons = course.lessons || [];
  const currentLesson = lessons[activeLessonIndex] || lessons[0];
  const completedLessons = enrollment.completedLessons || [];
  const isCurrentLessonCompleted = currentLesson ? completedLessons.includes(currentLesson.title) : false;
  const progressPercentage = enrollment.progressPercentage || 0;
  const isAllFinished = enrollment.status === 'completed' || progressPercentage === 100;

  return (
    <div style={{ backgroundColor: 'var(--bg-main)', minHeight: 'calc(100vh - 72px)', padding: '2rem 0 4rem' }}>
      <div className="container">
        {/* Top Header & Navigation */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link
              to="/dashboard"
              className="btn btn-secondary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <ArrowLeft size={16} /> Back to Dashboard
            </Link>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
                {course.category}
              </span>
              <h2 style={{ fontSize: '1.4rem', color: 'var(--navy-900)' }}>{course.title}</h2>
            </div>
          </div>

          {/* Quick Progress Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--navy-700)' }}>
                Overall Progress
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: isAllFinished ? 'var(--success)' : 'var(--primary)' }}>
                {progressPercentage}% Completed
              </div>
            </div>
            <div style={{ width: '120px' }}>
              <div className="progress-container">
                <div
                  className={`progress-bar ${isAllFinished ? 'completed' : ''}`}
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {alert && (
          <div style={{ marginBottom: '1.5rem' }}>
            <AlertMessage
              type={alert.type}
              message={alert.message}
              onClose={() => setAlert(null)}
            />
          </div>
        )}

        {/* Learning Workspace: Left Player & Notes / Right Lessons List */}
        <div style={{ display: 'grid', gridTemplateColumns: '2.3fr 1fr', gap: '2rem' }}>
          {/* Main Stage: Lesson Video/Content */}
          <div>
            {/* Interactive Lesson Card */}
            <div className="card" style={{ overflow: 'hidden', marginBottom: '1.5rem', backgroundColor: '#ffffff' }}>
              {/* Video Player or Embed Screen */}
              <div
                style={{
                  position: 'relative',
                  backgroundColor: '#0a0f1d',
                  paddingTop: '56.25%', // 16:9 Aspect Ratio
                  width: '100%',
                }}
              >
                <iframe
                  title={currentLesson?.title || 'Lesson Video'}
                  src={currentLesson?.videoUrl || 'https://www.youtube.com/embed/7CqJlxBYj-M'}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    border: 'none',
                  }}
                ></iframe>
              </div>

              {/* Lesson Details & Action bar */}
              <div style={{ padding: '1.75rem' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1rem',
                    flexWrap: 'wrap',
                    gap: '1rem',
                  }}
                >
                  <div>
                    <span className="badge badge-intermediate" style={{ marginBottom: '0.4rem' }}>
                      Lesson {activeLessonIndex + 1} of {lessons.length}
                    </span>
                    <h3 style={{ fontSize: '1.5rem', color: 'var(--navy-900)' }}>
                      {currentLesson?.title}
                    </h3>
                  </div>

                  {/* Mark as Completed Button */}
                  <button
                    onClick={() => handleToggleLessonComplete(currentLesson?.title)}
                    disabled={updating}
                    className={`btn ${isCurrentLessonCompleted ? 'btn-navy' : 'btn-primary'}`}
                    style={{ minWidth: '200px' }}
                  >
                    {isCurrentLessonCompleted ? (
                      <>
                        <Check size={18} color="#10b981" /> Completed (Click to Undo)
                      </>
                    ) : (
                      <>
                        <CheckCircle size={18} /> Mark as Completed
                      </>
                    )}
                  </button>
                </div>

                {/* Lesson Description & Text Content */}
                <div
                  style={{
                    paddingTop: '1.25rem',
                    borderTop: '1px solid var(--border)',
                    color: 'var(--navy-800)',
                    lineHeight: 1.7,
                  }}
                >
                  <h4 style={{ fontSize: '1rem', color: 'var(--navy-900)', marginBottom: '0.5rem' }}>
                    Lesson Notes & Summary
                  </h4>
                  <p style={{ color: 'var(--text-body)', marginBottom: '1rem' }}>
                    {currentLesson?.content || 'In this lesson, you will master the foundational paradigms, review clean architecture principles, and build real-world examples.'}
                  </p>

                  <div
                    style={{
                      backgroundColor: 'var(--bg-main)',
                      padding: '1rem 1.25rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border)',
                      fontSize: '0.875rem',
                    }}
                  >
                    <strong style={{ color: 'var(--navy-900)' }}>Estimated Duration:</strong> {currentLesson?.duration || '20 mins'}
                    <span style={{ margin: '0 0.5rem', color: 'var(--border)' }}>|</span>
                    <strong style={{ color: 'var(--navy-900)' }}>Status:</strong>{' '}
                    <span style={{ color: isCurrentLessonCompleted ? 'var(--success)' : 'var(--primary)', fontWeight: 600 }}>
                      {isCurrentLessonCompleted ? 'Completed' : 'Pending Completion'}
                    </span>
                  </div>
                </div>

                {/* Lesson Navigation Footer */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: '2rem',
                    paddingTop: '1.25rem',
                    borderTop: '1px solid var(--border)',
                  }}
                >
                  <button
                    onClick={() => setActiveLessonIndex((prev) => Math.max(0, prev - 1))}
                    disabled={activeLessonIndex === 0}
                    className="btn btn-secondary"
                  >
                    <ArrowLeft size={16} /> Previous Lesson
                  </button>

                  <button
                    onClick={() => setActiveLessonIndex((prev) => Math.min(lessons.length - 1, prev + 1))}
                    disabled={activeLessonIndex === lessons.length - 1}
                    className="btn btn-secondary"
                  >
                    Next Lesson <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Lessons Syllabus Drawer */}
          <div>
            <div className="card" style={{ padding: '1.5rem', position: 'sticky', top: '90px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h4 style={{ color: 'var(--navy-900)', fontSize: '1.1rem' }}>Course Curriculum</h4>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  {completedLessons.length} / {lessons.length} Done
                </span>
              </div>

              {/* Progress Bar inside Drawer */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div className="progress-container">
                  <div
                    className={`progress-bar ${isAllFinished ? 'completed' : ''}`}
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </div>

              {/* List of lessons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '550px', overflowY: 'auto' }}>
                {lessons.map((lesson, idx) => {
                  const done = completedLessons.includes(lesson.title);
                  const active = idx === activeLessonIndex;

                  return (
                    <button
                      key={lesson._id || idx}
                      onClick={() => setActiveLessonIndex(idx)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        textAlign: 'left',
                        padding: '0.85rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid',
                        borderColor: active ? 'var(--primary)' : 'var(--border)',
                        backgroundColor: active
                          ? 'var(--primary-light)'
                          : done
                          ? '#f0fdf4'
                          : '#ffffff',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div
                          style={{
                            width: '26px',
                            height: '26px',
                            borderRadius: '50%',
                            backgroundColor: done ? 'var(--success)' : active ? 'var(--primary)' : 'var(--border)',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          {done ? <Check size={14} /> : idx + 1}
                        </div>
                        <div>
                          <div
                            style={{
                              fontSize: '0.875rem',
                              fontWeight: active ? 700 : 600,
                              color: active ? 'var(--primary)' : 'var(--navy-900)',
                              lineHeight: 1.3,
                            }}
                          >
                            {lesson.title}
                          </div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {lesson.duration || '15 mins'}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Course Completed Celebration Banner */}
              {isAllFinished && (
                <div
                  style={{
                    marginTop: '1.5rem',
                    padding: '1rem',
                    backgroundColor: 'var(--success-light)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid #a7f3d0',
                    textAlign: 'center',
                  }}
                >
                  <Award size={32} color="var(--success)" style={{ margin: '0 auto 0.5rem' }} />
                  <h5 style={{ color: 'var(--success-dark)', fontWeight: 800 }}>Course Completed!</h5>
                  <p style={{ fontSize: '0.8rem', color: '#065f46', marginTop: '0.25rem' }}>
                    Great work! You have finished all syllabus modules for this curriculum.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseLearnPage;
