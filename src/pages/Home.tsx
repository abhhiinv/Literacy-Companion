import React from 'react';
import { Container, Button, Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <Container className="py-5 text-center">
      <Row className="justify-content-center">
        <Col md={8}>
          <h1 className="display-4 fw-bold mb-4">Welcome to Literacy Companion</h1>
          <p className="lead mb-5">
            Empowering adults to read and write through personalized, interactive stories.
          </p>
          <div className="d-grid gap-3 d-sm-flex justify-content-sm-center">
            <Button as={Link} to="/learning" variant="primary" size="lg" className="px-4">
              Start Learning
            </Button>
            <Button as={Link} to="/profile" variant="outline-secondary" size="lg" className="px-4">
              My Progress
            </Button>
          </div>
        </Col>
      </Row>

      <Row className="mt-5 pt-5">
        <Col md={4} className="mb-4">
          <Card className="h-100 border-0 shadow-sm p-3">
            <Card.Body>
              <h3>📖 Adaptive Stories</h3>
              <p>Stories that grow with you, tailored to your reading level.</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-4">
          <Card className="h-100 border-0 shadow-sm p-3">
            <Card.Body>
              <h3>🔥 Daily Streaks</h3>
              <p>Keep your momentum going and watch your progress soar.</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-4">
          <Card className="h-100 border-0 shadow-sm p-3">
            <Card.Body>
              <h3>🌙 Offline First</h3>
              <p>Learn anytime, anywhere, even without internet access.</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Home;
