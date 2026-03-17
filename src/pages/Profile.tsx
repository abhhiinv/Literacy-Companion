import React, { useState } from 'react';
import { Container, Card, Row, Col, Form, Button, Alert, ListGroup, Badge, Spinner } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiAward, FiSettings, FiLogOut, FiCheckCircle } from 'react-icons/fi';
import { auth } from '../services/firebase';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Profile: React.FC = () => {
  const { currentUser, userData, updateReadingLevel } = useAuth();
  const [level, setLevel] = useState(userData?.readingLevel || 'beginner');
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleUpdateLevel = async () => {
    setUpdating(true);
    try {
      await updateReadingLevel(level);
      setMessage('Reading level updated successfully!');
    } catch (err) {
      console.error(err);
      setMessage('Failed to update reading level.');
    } finally {
      setUpdating(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  if (!currentUser) {
    return (
      <Container className="py-5 text-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h2 className="display-4 fw-bold mb-4">Please log in to view your profile</h2>
          <Button onClick={() => navigate('/login')} variant="primary" size="lg" className="px-5 py-3 rounded-pill fw-bold">
            Go to Login
          </Button>
        </motion.div>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row className="g-4 g-lg-5">
        <Col lg={4}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card className="border-2 shadow-lg p-4 p-md-5 text-center rounded-5 theme-bg-surface">
              <div className="theme-bg-primary-subtle rounded-circle d-inline-flex p-4 mx-auto mb-4 border border-primary border-2">
                <FiUser size={80} className="text-primary" />
              </div>
              <Card.Title className="display-6 fw-bold mb-2 theme-text-primary">
                {userData?.displayName || currentUser.email?.split('@')[0]}
              </Card.Title>
              <Card.Subtitle className="fs-5 theme-text-secondary mb-5">
                {currentUser.email}
              </Card.Subtitle>
              
              <div className="d-flex justify-content-center gap-4 mb-5 p-4 theme-bg-body rounded-4 border-2 border-theme">
                <div className="text-center">
                  <div className="display-5 mb-0 fw-bold text-primary">{userData?.streak || 0}</div>
                  <div className="theme-text-secondary fw-bold text-uppercase small" style={{ letterSpacing: '1px' }}>Day Streak</div>
                </div>
                <div className="vr opacity-10 mx-2 border-theme"></div>
                <div className="text-center">
                  <div className="display-5 mb-0 fw-bold text-primary text-capitalize">{userData?.readingLevel?.charAt(0) || 'B'}</div>
                  <div className="theme-text-secondary fw-bold text-uppercase small" style={{ letterSpacing: '1px' }}>Level</div>
                </div>
              </div>

              <Button 
                variant="outline-danger" 
                onClick={handleLogout} 
                className="w-100 d-flex align-items-center justify-content-center py-3 rounded-pill fs-5 border-2 fw-bold"
              >
                <FiLogOut className="me-2" /> Sign Out
              </Button>
            </Card>
          </motion.div>
        </Col>

        <Col lg={8}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card className="border-2 shadow-lg p-4 p-md-5 mb-5 rounded-5 theme-bg-surface">
              <h4 className="display-6 fw-bold d-flex align-items-center mb-5 text-primary">
                <FiSettings className="me-3" size={40} /> My Preferences
              </h4>
              
              {message && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                  <Alert variant="success" className="mb-5 border-2 fw-bold fs-5 px-4 py-3 shadow-sm rounded-4">
                    <FiCheckCircle className="me-2" /> {message}
                  </Alert>
                </motion.div>
              )}
              
              <Form.Group className="mb-5">
                <Form.Label className="fw-bold fs-4 mb-3 theme-text-primary">Adjust My Reading Level:</Form.Label>
                <Form.Select 
                  value={level} 
                  onChange={(e) => setLevel(e.target.value)}
                  size="lg"
                  className="mb-4 py-3 px-4 fs-5 border-2 rounded-3 theme-bg-surface theme-text-primary"
                  style={{ border: '2px solid var(--border-color)' }}
                >
                  <option value="beginner">Beginner (Short words & simple sentences)</option>
                  <option value="intermediate">Intermediate (Compound sentences)</option>
                  <option value="advanced">Advanced (Short paragraphs & complex stories)</option>
                </Form.Select>
                <Button 
                  variant="primary" 
                  onClick={handleUpdateLevel} 
                  disabled={updating}
                  size="lg"
                  className="px-5 py-3 rounded-pill fs-5 fw-bold shadow-lg"
                >
                  {updating ? <><Spinner animation="border" size="sm" className="me-2" /> Saving...</> : 'Save My Level'}
                </Button>
              </Form.Group>
            </Card>

            <Card className="border-2 shadow-lg p-4 p-md-5 rounded-5 theme-bg-surface">
              <h4 className="display-6 fw-bold d-flex align-items-center mb-5 text-primary">
                <FiAward className="me-3" size={40} /> My Achievements
              </h4>
              <ListGroup variant="flush">
                <ListGroup.Item className="px-0 py-4 border-bottom border-theme d-flex justify-content-between align-items-center theme-bg-surface">
                  <div className="d-flex align-items-center">
                    <div className="theme-bg-warning-subtle p-4 rounded-circle me-4 shadow-sm border border-warning border-2">
                      <span className="fs-3">🔥</span>
                    </div>
                    <div>
                      <h5 className="fs-3 fw-bold mb-1 theme-text-primary">First Spark</h5>
                      <p className="fs-5 theme-text-secondary mb-0">Completed your first daily story.</p>
                    </div>
                  </div>
                  {userData?.streak && userData.streak > 0 ? (
                    <Badge bg="success" className="fs-5 px-4 py-2 rounded-pill">Unlocked</Badge>
                  ) : (
                    <Badge bg="secondary" className="fs-5 px-4 py-2 rounded-pill opacity-50">Locked</Badge>
                  )}
                </ListGroup.Item>
                <ListGroup.Item className="px-0 py-4 border-0 d-flex justify-content-between align-items-center theme-bg-surface">
                  <div className="d-flex align-items-center">
                    <div className="theme-bg-primary-subtle p-4 rounded-circle me-4 shadow-sm border border-primary border-2">
                      <span className="fs-3">📚</span>
                    </div>
                    <div>
                      <h5 className="fs-3 fw-bold mb-1 theme-text-primary">Bookworm</h5>
                      <p className="fs-5 theme-text-secondary mb-0">Read stories 3 days in a row.</p>
                    </div>
                  </div>
                  {userData?.streak && userData.streak >= 3 ? (
                    <Badge bg="success" className="fs-5 px-4 py-2 rounded-pill">Unlocked</Badge>
                  ) : (
                    <Badge bg="secondary" className="fs-5 px-4 py-2 rounded-pill opacity-50">Locked</Badge>
                  )}
                </ListGroup.Item>
              </ListGroup>
            </Card>
          </motion.div>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;
