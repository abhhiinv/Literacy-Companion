import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert, Row, Col, Spinner } from 'react-bootstrap';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../services/firebase';
import { useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiUserPlus, FiLogIn } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { motion } from 'framer-motion';

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
      <Row className="justify-content-center pt-lg-5">
        <Col md={8} lg={6} xl={5}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="border-2 shadow-lg p-4 p-md-5 rounded-5 overflow-hidden bg-white">
              <Card.Body className="p-0">
                <div className="text-center mb-5">
                  <h1 className="display-5 fw-bold mb-3 text-primary">
                    {isLogin ? 'Welcome Back' : 'Create Account'}
                  </h1>
                  <p className="lead fs-5 text-muted">
                    {isLogin ? 'Sign in to continue your reading journey.' : 'Join us to start learning today.'}
                  </p>
                </div>

                {error && <Alert variant="danger" className="mb-4 border-2 fw-bold">{error}</Alert>}
                
                <Form onSubmit={handleAuth}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold fs-5 d-flex align-items-center mb-2">
                      <FiMail className="me-2 text-primary" /> Email Address
                    </Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="e.g. name@example.com"
                      size="lg"
                      className="py-3 px-4 border-2 rounded-3 fs-5"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      style={{ border: '2px solid #e2e8f0' }}
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-5">
                    <Form.Label className="fw-bold fs-5 d-flex align-items-center mb-2">
                      <FiLock className="me-2 text-primary" /> Password
                    </Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="••••••••"
                      size="lg"
                      className="py-3 px-4 border-2 rounded-3 fs-5"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      style={{ border: '2px solid #e2e8f0' }}
                    />
                  </Form.Group>

                  <div className="d-grid gap-3">
                    <Button 
                      variant="primary" 
                      type="submit" 
                      disabled={loading} 
                      className="py-3 rounded-pill fs-4 fw-bold shadow shadow-primary"
                    >
                      {loading ? (
                        <><Spinner animation="border" size="sm" className="me-3" /> Please wait...</>
                      ) : isLogin ? (
                        <><FiLogIn className="me-2" /> Sign In</>
                      ) : (
                        <><FiUserPlus className="me-2" /> Sign Up</>
                      )}
                    </Button>
                  </div>
                </Form>

                <div className="text-center my-5 position-relative">
                  <hr className="my-0 border-2" />
                  <span className="bg-white px-3 text-muted fw-bold position-absolute top-50 start-50 translate-middle">
                    OR
                  </span>
                </div>

                <div className="d-grid">
                  <Button 
                    variant="outline-primary" 
                    onClick={handleGoogleLogin} 
                    className="d-flex align-items-center justify-content-center py-3 rounded-pill fs-5 border-2 fw-bold bg-white"
                  >
                    <FcGoogle className="me-3 fs-3" /> Continue with Google
                  </Button>
                </div>

                <div className="text-center mt-5">
                  <Button 
                    variant="link" 
                    onClick={() => setIsLogin(!isLogin)} 
                    className="text-decoration-none fs-5 fw-bold p-0"
                    style={{ borderBottom: '2px solid currentColor' }}
                  >
                    {isLogin ? "Need an account? Sign Up" : "Already have an account? Sign In"}
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </motion.div>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
