import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../services/firebase';
import { useNavigate } from 'react-router-dom';
import { FiMail, FiLock } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';

const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6} lg={4}>
          <Card className="border-0 shadow-lg p-3">
            <Card.Body>
              <h2 className="text-center mb-4">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
              {error && <Alert variant="danger">{error}</Alert>}
              <Form onSubmit={handleAuth}>
                <Form.Group className="mb-3">
                  <Form.Label className="d-flex align-items-center">
                    <FiMail className="me-2" /> Email Address
                  </Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label className="d-flex align-items-center">
                    <FiLock className="me-2" /> Password
                  </Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </Form.Group>
                <div className="d-grid mt-4">
                  <Button variant="primary" type="submit" disabled={loading} size="lg">
                    {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Sign Up'}
                  </Button>
                </div>
              </Form>

              <div className="text-center my-4">
                <span className="text-muted">OR</span>
              </div>

              <div className="d-grid">
                <Button variant="outline-dark" onClick={handleGoogleLogin} className="d-flex align-items-center justify-content-center py-2">
                  <FcGoogle className="me-2 fs-4" /> Sign in with Google
                </Button>
              </div>

              <div className="text-center mt-4">
                <Button variant="link" onClick={() => setIsLogin(!isLogin)} className="text-decoration-none">
                  {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
