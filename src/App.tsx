import React from 'react';
import { Routes, Route, Link, NavLink, Navigate } from 'react-router-dom';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { FiBookOpen, FiUser, FiActivity, FiHome, FiLogOut } from 'react-icons/fi';
import Home from './pages/Home';
import Learning from './pages/Learning';
import Login from './pages/Login';
import Profile from './pages/Profile';
import { useAuth } from './context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from './services/firebase';
import './App.css';

const App: React.FC = () => {
  const { currentUser, userData } = useAuth();

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <div className="app-container d-flex flex-column min-vh-100 bg-light">
      <Navbar bg="white" expand="lg" className="shadow-sm py-3 sticky-top">
        <Container>
          <Navbar.Brand as={Link} to="/" className="fw-bold fs-4 text-primary d-flex align-items-center">
            <FiBookOpen className="me-2" />
            Literacy Companion
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto align-items-center">
              <Nav.Link as={NavLink} to="/" className="mx-2 d-flex align-items-center">
                <FiHome className="me-1" /> Home
              </Nav.Link>
              <Nav.Link as={NavLink} to="/learning" className="mx-2 d-flex align-items-center">
                <FiActivity className="me-1" /> Learning
              </Nav.Link>
              <Nav.Link as={NavLink} to="/profile" className="mx-2 d-flex align-items-center">
                <FiUser className="me-1" /> Profile
              </Nav.Link>
              {currentUser ? (
                <Button onClick={handleLogout} variant="outline-danger" className="ms-lg-3 rounded-pill px-4 d-flex align-items-center">
                  <FiLogOut className="me-1" /> Sign Out
                </Button>
              ) : (
                <Button as={Link} to="/login" variant="primary" className="ms-lg-3 rounded-pill px-4">
                  Login
                </Button>
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

      <footer className="bg-white py-4 mt-auto border-top">
        <Container className="text-center text-muted">
          <p className="mb-0">&copy; {new Date().getFullYear()} Literacy Companion. Supporting SDG 4.6.</p>
        </Container>
      </footer>
    </div>
  );
};

export default App;