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
import { FiBookOpen, FiUser, FiActivity, FiHome, FiLogOut, FiMoon, FiSun } from 'react-icons/fi';
import './App.css';

const App: React.FC = () => {
  const { currentUser } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <div className="app-container d-flex flex-column min-vh-100 bg-light">
      <Navbar bg="white" expand="lg" className="shadow-sm py-3 py-lg-4 sticky-top border-bottom border-2">
        <Container>
          <Navbar.Brand as={Link} to="/" className="fw-bold fs-3 text-primary d-flex align-items-center">
            <FiBookOpen className="me-3" size={36} />
            <span style={{ letterSpacing: '-0.5px' }}>Literacy Companion</span>
          </Navbar.Brand>
          <div className="d-flex align-items-center ms-auto ms-lg-0 order-lg-last">
            <Button 
              variant="link" 
              onClick={toggleTheme} 
              className="text-secondary p-2 me-2 rounded-circle hover-bg-light"
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {theme === 'light' ? <FiMoon size={28} /> : <FiSun size={28} />}
            </Button>
            <Navbar.Toggle aria-controls="basic-navbar-nav" className="border-0 shadow-none p-0" />
          </div>
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto align-items-center gap-2 mt-3 mt-lg-0">
              <Nav.Link as={NavLink} to="/" className="mx-2 px-3 py-2 fs-5 fw-medium d-flex align-items-center rounded-3">
                <FiHome className="me-2" /> Home
              </Nav.Link>
              <Nav.Link as={NavLink} to="/learning" className="mx-2 px-3 py-2 fs-5 fw-medium d-flex align-items-center rounded-3">
                <FiActivity className="me-2" /> Start Learning
              </Nav.Link>
              <Nav.Link as={NavLink} to="/profile" className="mx-2 px-3 py-2 fs-5 fw-medium d-flex align-items-center rounded-3">
                <FiUser className="me-2" /> My Profile
              </Nav.Link>
              {currentUser ? (
                <Button onClick={handleLogout} variant="outline-danger" className="ms-lg-3 rounded-pill px-4 py-2 fs-5 d-flex align-items-center border-2 fw-bold">
                  <FiLogOut className="me-2" /> Sign Out
                </Button>
              ) : (
                <Link to="/login" className="btn btn-primary ms-lg-3 rounded-pill px-5 py-2 fs-5 fw-bold shadow">
                  Login
                </Link>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <main className="flex-grow-1 py-4 py-lg-5">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/learning" element={<Learning />} />
          <Route path="/profile" element={currentUser ? <Profile /> : <Navigate to="/login" />} />
          <Route path="/login" element={!currentUser ? <Login /> : <Navigate to="/" />} />
          <Route path="*" element={<div className="text-center py-5">404 - Not Found</div>} />
        </Routes>
      </main>

      <footer className="bg-white py-4 mt-auto border-top">
        <Container className="text-center text-muted">
          <p className="mb-0">&copy; {new Date().getFullYear()} Literacy Companion | Entropic Minds</p>
        </Container>
      </footer>
    </div>
  );
};

export default App;