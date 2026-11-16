import { GraduationCap, Award, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          {/* Brand info */}
          <div className="footer-brand">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  backgroundColor: 'var(--primary)',
                  color: '#ffffff',
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <GraduationCap size={22} />
              </div>
              <div>
                <h3 style={{ color: '#ffffff', fontSize: '1.2rem', fontWeight: 800 }}>
                  COGNEVANCE
                </h3>
                <span style={{ color: '#38bdf8', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em' }}>
                  ONLINE COURSE MANAGEMENT SYSTEM
                </span>
              </div>
            </div>
            <p>
              Developed for the <strong>Cognevance Technologies Level 2 Full Stack Web Developer Internship</strong>.
              A comprehensive MERN stack platform featuring role-based course authoring, real-time student enrollment, and granular progress tracking.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="footer-col-title">Navigation</h4>
            <ul className="footer-links">
              <li><Link to="/">Home Overview</Link></li>
              <li><Link to="/courses">Course Catalog</Link></li>
              <li><Link to="/login">Student Sign In</Link></li>
              <li><Link to="/register">Create Account</Link></li>
            </ul>
          </div>

          {/* Core Categories */}
          <div>
            <h4 className="footer-col-title">Top Tracks</h4>
            <ul className="footer-links">
              <li><Link to="/courses?category=Web+Development">Web Development</Link></li>
              <li><Link to="/courses?category=Data+Science">Data Science & ML</Link></li>
              <li><Link to="/courses?category=Cloud+%26+DevOps">Cloud & DevOps</Link></li>
              <li><Link to="/courses?category=Artificial+Intelligence">Generative AI</Link></li>
            </ul>
          </div>

          {/* Project Highlights */}
          <div>
            <h4 className="footer-col-title">Internship Verification</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1' }}>
                <CheckCircle size={16} color="var(--success)" />
                <span>Level 2 Full Stack Developer Task</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1' }}>
                <CheckCircle size={16} color="var(--success)" />
                <span>MERN Architecture & Security</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1' }}>
                <CheckCircle size={16} color="var(--success)" />
                <span>Role-Based Access Control</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1' }}>
                <Award size={16} color="#38bdf8" />
                <span>Cognevance Evaluation Ready</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer bottom bar */}
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Cognevance Technologies LMS. All rights reserved.</p>
          <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>Built with React 19, Node.js, Express & MongoDB</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
