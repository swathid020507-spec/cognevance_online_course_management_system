import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import CourseCard from '../components/common/CourseCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AlertMessage from '../components/common/AlertMessage';
import { Search, Filter, BookOpen, RotateCcw, AlertCircle, RefreshCw } from 'lucide-react';

const CATEGORIES = [
  'All',
  'Web Development',
  'Data Science',
  'Cloud & DevOps',
  'Artificial Intelligence',
  'Mobile Development',
  'Cybersecurity',
  'UI/UX Design',
];

const LEVELS = ['All', 'Beginner', 'Intermediate', 'Advanced'];

const CoursesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCourses, setTotalCourses] = useState(0);

  // Filter & Search states (synced with URL params)
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [selectedLevel, setSelectedLevel] = useState(searchParams.get('level') || 'All');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');

  // Fetch courses dynamically from backend API
  const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      if (search.trim()) queryParams.set('search', search.trim());
      if (selectedCategory && selectedCategory !== 'All') queryParams.set('category', selectedCategory);
      if (selectedLevel && selectedLevel !== 'All') queryParams.set('level', selectedLevel);
      if (sortBy) queryParams.set('sort', sortBy);
      queryParams.set('limit', '24');

      const response = await api.get(`/courses?${queryParams.toString()}`);
      if (response.success) {
        setCourses(response.courses || []);
        setTotalCourses(response.total || 0);
      } else {
        throw new Error(response.message || 'Failed to fetch courses from server.');
      }
    } catch (err) {
      console.error('Failed to fetch courses:', err);
      setError(
        err.data?.message ||
          err.message ||
          'Unable to connect to the backend server. Please verify the backend is running on port 5000.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [selectedCategory, selectedLevel, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCourses();
  };

  const resetFilters = () => {
    setSearch('');
    setSelectedCategory('All');
    setSelectedLevel('All');
    setSortBy('newest');
    setSearchParams({});
  };

  const isFiltered = search.trim() !== '' || selectedCategory !== 'All' || selectedLevel !== 'All' || sortBy !== 'newest';

  return (
    <div style={{ padding: '3rem 0 5rem' }}>
      <div className="container">
        {/* Page Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <span
            style={{
              fontSize: '0.85rem',
              fontWeight: 700,
              color: 'var(--primary)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            Curriculum Catalog
          </span>
          <h1 style={{ fontSize: '2.5rem', color: 'var(--navy-900)', marginTop: '0.25rem' }}>
            Explore All Courses
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginTop: '0.5rem', maxWidth: '650px' }}>
            Browse through our industry-verified technical tracks, filter by category and skill level,
            and begin learning immediately.
          </p>
        </div>

        {/* Error Banner with Retry Button */}
        {error && (
          <div style={{ marginBottom: '2rem' }}>
            <div
              className="alert alert-error"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <AlertCircle size={22} style={{ flexShrink: 0 }} />
                <div>
                  <strong>Server Connection Error:</strong> {error}
                </div>
              </div>
              <button
                onClick={fetchCourses}
                className="btn btn-secondary btn-sm"
                style={{ backgroundColor: '#ffffff', color: 'var(--danger)' }}
              >
                <RefreshCw size={14} /> Retry Connection
              </button>
            </div>
          </div>
        )}

        {/* Search & Filter Bar */}
        <div
          className="card"
          style={{
            padding: '1.5rem',
            marginBottom: '2rem',
            backgroundColor: '#ffffff',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr auto',
              gap: '1rem',
              alignItems: 'center',
            }}
          >
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} style={{ position: 'relative' }}>
              <Search
                size={18}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-light)',
                }}
              />
              <input
                type="text"
                className="form-control"
                placeholder="Search courses by title, topic, or instructor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
              />
            </form>

            {/* Level Filter Dropdown */}
            <div>
              <select
                className="form-select"
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                aria-label="Filter by Difficulty Level"
              >
                {LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl === 'All' ? 'All Skill Levels' : `${lvl} Level`}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Options */}
            <div>
              <select
                className="form-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Sort courses"
              >
                <option value="newest">Sort: Newest First</option>
                <option value="rating">Sort: Highest Rated</option>
                <option value="title-asc">Sort: Title (A - Z)</option>
                <option value="title-desc">Sort: Title (Z - A)</option>
              </select>
            </div>

            {/* Action Search Button */}
            <button type="button" onClick={fetchCourses} className="btn btn-primary">
              <Search size={16} /> Search
            </button>
          </div>

          {/* Category Chips Carousel/Row */}
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              flexWrap: 'wrap',
              marginTop: '1.25rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid var(--border-subtle)',
            }}
          >
            <span
              style={{
                fontSize: '0.825rem',
                fontWeight: 700,
                color: 'var(--navy-700)',
                display: 'flex',
                alignItems: 'center',
                marginRight: '0.5rem',
              }}
            >
              Categories:
            </span>
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    border: '1px solid',
                    borderColor: active ? 'var(--primary)' : 'var(--border)',
                    backgroundColor: active ? 'var(--primary-light)' : '#ffffff',
                    color: active ? 'var(--primary)' : 'var(--navy-700)',
                    padding: '0.35rem 0.85rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.825rem',
                    fontWeight: active ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Metadata & Reset filters */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ fontSize: '0.925rem', color: 'var(--navy-700)', fontWeight: 600 }}>
            Showing <strong>{courses.length}</strong> of <strong>{totalCourses}</strong> courses
            {selectedCategory !== 'All' && <span> in <em>{selectedCategory}</em></span>}
          </div>

          {isFiltered && (
            <button
              onClick={resetFilters}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--danger)',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <RotateCcw size={14} /> Reset Filters
            </button>
          )}
        </div>

        {/* Courses Display Grid / Loading / Empty States */}
        {loading ? (
          <LoadingSpinner message="Fetching courses from backend server..." />
        ) : courses.length > 0 ? (
          <div className="grid-cols-3">
            {courses.map((course) => (
              <CourseCard key={course._id} course={course} />
            ))}
          </div>
        ) : isFiltered ? (
          /* Filtered empty state */
          <div
            className="card card-padded"
            style={{ textAlign: 'center', padding: '4rem 1.5rem', backgroundColor: '#ffffff' }}
          >
            <BookOpen size={48} color="var(--primary)" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ color: 'var(--navy-900)' }}>No matching courses found</h3>
            <p style={{ color: 'var(--text-muted)', margin: '0.5rem auto 1.5rem', maxWidth: '450px' }}>
              We could not find any courses matching your specific search filters. Try clearing your search keywords or resetting filters.
            </p>
            <button onClick={resetFilters} className="btn btn-primary">
              <RotateCcw size={16} /> Reset All Filters
            </button>
          </div>
        ) : (
          /* Entire database empty state */
          <div
            className="card card-padded"
            style={{ textAlign: 'center', padding: '4rem 1.5rem', backgroundColor: '#ffffff' }}
          >
            <BookOpen size={48} color="var(--primary)" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ color: 'var(--navy-900)' }}>No courses are currently available</h3>
            <p style={{ color: 'var(--text-muted)', margin: '0.5rem auto 1.5rem', maxWidth: '480px' }}>
              The database does not have any courses yet. You can seed the database with sample courses or create new courses using an Administrator account.
            </p>
            <button onClick={fetchCourses} className="btn btn-primary">
              <RefreshCw size={16} /> Refresh Catalog
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursesPage;
