import React, { useState } from 'react';
import { Container, Card, Row, Col, Form, Button, Alert, ListGroup, Badge } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiAward, FiSettings, FiLogOut } from 'react-icons/fi';
import { auth } from '../services/firebase';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

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
        <h2>Please log in to view your profile</h2>
        <Button onClick={() => navigate('/login')} variant="primary" className="mt-4">Go to Login</Button>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row>
        <Col lg={4} className="mb-4">
          <Card className="border-0 shadow-sm p-4 text-center">
            <div className="bg-light rounded-circle d-inline-flex p-4 mx-auto mb-4">
              <FiUser size={60} className="text-primary" />
            </div>
            <Card.Title className="h3 mb-2">{userData?.displayName || currentUser.email?.split('@')[0]}</Card.Title>
            <Card.Subtitle className="text-muted mb-4">{currentUser.email}</Card.Subtitle>
            
            <div className="d-flex justify-content-center gap-3 mb-4">
              <div className="text-center">
                <div className="h4 mb-0 fw-bold">{userData?.streak || 0}</div>
                <div className="text-muted small">Day Streak</div>
              </div>
              <div className="vr mx-2"></div>
              <div className="text-center">
                <div className="h4 mb-0 fw-bold text-capitalize">{userData?.readingLevel || 'Beginner'}</div>
                <div className="text-muted small">Level</div>
              </div>
            </div>

            <Button variant="outline-danger" onClick={handleLogout} className="w-100 d-flex align-items-center justify-content-center">
              <FiLogOut className="me-2" /> Sign Out
            </Button>
          </Card>
        </Col>

        <Col lg={8}>
          <Card className="border-0 shadow-sm p-4 mb-4">
            <h4 className="d-flex align-items-center mb-4">
              <FiSettings className="me-2 text-primary" /> Learning Preferences
            </h4>
            {message && <Alert variant="success" className="mb-4">{message}</Alert>}
            <Form.Group className="mb-4">
              <Form.Label className="fw-bold">My Reading Level:</Form.Label>
              <Form.Select 
                value={level} 
                onChange={(e) => setLevel(e.target.value)}
                size="lg"
                className="mb-3"
              >
                <option value="beginner">Beginner (Short words & simple sentences)</option>
                <option value="intermediate">Intermediate (Compound sentences & common phrases)</option>
                <option value="advanced">Advanced (Short paragraphs & complex stories)</option>
              </Form.Select>
              <Button 
                variant="primary" 
                onClick={handleUpdateLevel} 
                disabled={updating}
                size="lg"
                className="px-4 shadow"
              >
                {updating ? 'Saving...' : 'Update Level'}
              </Button>
            </Form.Group>
          </Card>

          <Card className="border-0 shadow-sm p-4">
            <h4 className="d-flex align-items-center mb-4">
              <FiAward className="me-2 text-primary" /> My Achievements
            </h4>
            <ListGroup variant="flush">
              <ListGroup.Item className="px-0 py-3 border-0 d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <div className="bg-light p-3 rounded-circle me-3">🔥</div>
                  <div>
                    <h6 className="mb-1">First Streak</h6>
                    <p className="text-muted small mb-0">Complete your first daily story.</p>
                  </div>
                </div>
                {userData?.streak && userData.streak > 0 ? <Badge bg="success">Unlocked</Badge> : <Badge bg="secondary">Locked</Badge>}
              </ListGroup.Item>
              <ListGroup.Item className="px-0 py-3 border-0 d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <div className="bg-light p-3 rounded-circle me-3">📚</div>
                  <div>
                    <h6 className="mb-1">Avid Reader</h6>
                    <p className="text-muted small mb-0">Read 5 stories in one week.</p>
                  </div>
                </div>
                <Badge bg="secondary">Locked</Badge>
              </ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;
