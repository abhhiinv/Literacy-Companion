import React from 'react';
import { Routes, Route, Link, NavLink, Navigate } from 'react-router-dom';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import Home from './pages/Home';
import Learning from './pages/Learning';
import Login from './pages/Login';
import Profile from './pages/Profile';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';
import { signOut } from 'firebase/auth';
import { auth } from './services/firebase';
import { FiBookOpen, FiMoon, FiSun } from 'react-icons/fi';
import './App.css';

const App: React.FC = () => {
  const { currentUser } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <div className="app-container d-flex flex-column min-vh-100 theme-bg-body">
      <Navbar expand="lg" className="sticky-top shadow-sm">
        <Container>
          <Navbar.Brand as={Link} to="/" className="fw-bold fs-3 text-primary d-flex align-items-center">
            <FiBookOpen className="me-3" size={32} />
            <span style={{ letterSpacing: '-0.03em', fontFamily: 'var(--font-display)' }}>Literacy Companion</span>
          </Navbar.Brand>
          <div className="d-flex align-items-center ms-auto ms-lg-0 order-lg-last">
            <Button 
              variant="link" 
              onClick={toggleTheme} 
              className="text-secondary p-2 me-2 rounded-circle hover-bg-light"
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              style={{ fontSize: '1.5rem' }}
            >
              {theme === 'light' ? <FiMoon /> : <FiSun />}
            </Button>
            <Navbar.Toggle aria-controls="basic-navbar-nav" className="border-0 shadow-none p-0" />
          </div>
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto align-items-center gap-2 mt-3 mt-lg-0">
              <Nav.Link as={NavLink} to="/" className="mx-2 px-3 py-2 fs-5 fw-bold d-flex align-items-center rounded-3">
                Home
              </Nav.Link>
              <Nav.Link as={NavLink} to="/learning" className="mx-2 px-3 py-2 fs-5 fw-bold d-flex align-items-center rounded-3">
                Learning
              </Nav.Link>
              <Nav.Link as={NavLink} to="/profile" className="mx-2 px-3 py-2 fs-5 fw-bold d-flex align-items-center rounded-3">
                Library
              </Nav.Link>
              {currentUser ? (
                <Button onClick={handleLogout} variant="outline-danger" className="ms-lg-3 rounded-pill px-4 py-2 fs-5 d-flex align-items-center border-2 fw-bold">
                  Sign Out
                </Button>
              ) : (
                <Link to="/login" className="btn btn-primary ms-lg-3 rounded-pill px-4 py-2 fs-5 fw-bold shadow">
                  Sign In
                </Link>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <main className="flex-grow-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/learning" element={<Learning />} />
          <Route path="/profile" element={currentUser ? <Profile /> : <Navigate to="/login" />} />
          <Route path="/login" element={!currentUser ? <Login /> : <Navigate to="/" />} />
          <Route path="*" element={<div className="text-center py-5">404 - Not Found</div>} />
        </Routes>
      </main>

      <footer className="theme-bg-surface py-5 mt-auto border-top border-theme">
        <Container className="text-center">
          <p className="mb-2 fw-bold theme-text-primary" style={{ fontFamily: 'var(--font-display)' }}>Literacy Companion</p>
          <p className="mb-0 theme-text-secondary small">&copy; {new Date().getFullYear()} | Entropic Minds for UN SDG 4.6</p>
        </Container>
      </footer>
    </div>
  );
};

export default App;