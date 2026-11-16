import { Link } from 'react-router-dom';
import { Clock, Star, User, BookOpen, CheckCircle } from 'lucide-react';

const CourseCard = ({ course, enrollment = null }) => {
  if (!course) return null;

  const isCompleted = enrollment?.status === 'completed' || enrollment?.progressPercentage === 100;
  const progress = enrollment?.progressPercentage || 0;

  // Level badge class
  const getLevelBadgeClass = (level) => {
    switch (level?.toLowerCase()) {
      case 'beginner':
        return 'badge-beginner';
      case 'intermediate':
        return 'badge-intermediate';
      case 'advanced':
        return 'badge-advanced';
      default:
        return 'badge-beginner';
    }
  };

  return (
    <div className="course-card">
      {/* Thumbnail and badges */}
      <div className="course-card-image-wrapper">
        <img
          src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80'}
          alt={course.title}
          className="course-card-image"
          loading="lazy"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80';
          }}
        />
        <div className="course-card-badges">
          <span className={`badge ${getLevelBadgeClass(course.level)}`}>
            {course.level}
          </span>
          {enrollment && (
            <span className={`badge ${isCompleted ? 'badge-completed' : 'badge-ongoing'}`}>
              {isCompleted ? 'Completed' : `${progress}% Done`}
            </span>
          )}
        </div>
      </div>

      {/* Course Info */}
      <div className="course-card-body">
        <span className="course-card-category">{course.category}</span>
        <h3 className="course-card-title" title={course.title}>
          <Link to={`/courses/${course._id}`} style={{ color: 'inherit' }}>
            {course.title}
          </Link>
        </h3>
        <p className="course-card-desc">{course.description}</p>

        {/* Progress bar if enrolled */}
        {enrollment && (
          <div style={{ marginBottom: '1rem' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--navy-700)',
                marginBottom: '0.35rem',
              }}
            >
              <span>{isCompleted ? 'Finished Course' : 'Your Progress'}</span>
              <span>{progress}%</span>
            </div>
            <div className="progress-container">
              <div
                className={`progress-bar ${isCompleted ? 'completed' : ''}`}
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Course metadata */}
        <div className="course-card-meta">
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <User size={14} color="var(--primary)" />
            {course.instructor}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Clock size={14} />
            {course.duration}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#d97706', fontWeight: 600 }}>
            <Star size={14} fill="#f59e0b" color="#f59e0b" />
            {course.rating ? course.rating.toFixed(1) : '4.8'}
          </span>
        </div>
      </div>

      {/* Action footer */}
      <div className="course-card-footer">
        {enrollment ? (
          <Link
            to={`/learn/${course._id}`}
            className={`btn btn-block ${isCompleted ? 'btn-navy' : 'btn-primary'}`}
          >
            {isCompleted ? (
              <>
                <CheckCircle size={16} /> Review Lessons
              </>
            ) : (
              <>
                <BookOpen size={16} /> Resume Learning
              </>
            )}
          </Link>
        ) : (
          <Link to={`/courses/${course._id}`} className="btn btn-outline-primary btn-block">
            View Syllabus & Enroll
          </Link>
        )}
      </div>
    </div>
  );
};

export default CourseCard;
