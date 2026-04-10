import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert, Row, Col, Spinner } from 'react-bootstrap';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../services/firebase';
import { useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiUserPlus, FiLogIn, FiChevronRight } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { motion, AnimatePresence } from 'framer-motion';

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
    <Container className="py-5 py-lg-6">
      <Row className="justify-content-center">
        <Col md={8} lg={6} xl={5}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-theme border-2 shadow-xl p-4 p-md-5 rounded-5 overflow-hidden">
              <div className="text-center mb-5">
                <h1 className="display-4 fw-bold mb-3">
                  {isLogin ? 'Welcome Back' : 'Create Account'}
                </h1>
                <p className="fs-5 theme-text-secondary">
                  {isLogin ? 'Sign in to continue your journey.' : 'Join us to start learning today.'}
                </p>
              </div>

              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <Alert variant="danger" className="mb-4 border-2 fw-bold rounded-4">
                      {error}
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <Form onSubmit={handleAuth}>
                <Form.Group className="mb-4">
                  <Form.Label className="fw-bold fs-5 mb-2">Email Address</Form.Label>
                  <div className="position-relative">
                    <FiMail className="position-absolute top-50 translate-middle-y ms-3 theme-text-muted" size={20} />
                    <Form.Control
                      type="email"
                      placeholder="name@example.com"
                      className="py-3 ps-5 border-2"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </Form.Group>
                
                <Form.Group className="mb-5">
                  <Form.Label className="fw-bold fs-5 mb-2">Password</Form.Label>
                  <div className="position-relative">
                    <FiLock className="position-absolute top-50 translate-middle-y ms-3 theme-text-muted" size={20} />
                    <Form.Control
                      type="password"
                      placeholder="••••••••"
                      className="py-3 ps-5 border-2"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </Form.Group>

                <Button 
                  variant="primary" 
                  type="submit" 
                  disabled={loading} 
                  className="w-100 py-3 fs-4 fw-bold shadow-lg rounded-pill"
                >
                  {loading ? (
                    <Spinner animation="border" size="sm" />
                  ) : isLogin ? (
                    <><FiLogIn className="me-2" /> Sign In</>
                  ) : (
                    <><FiUserPlus className="me-2" /> Sign Up</>
                  )}
                </Button>
              </Form>

              <div className="text-center my-5 position-relative">
                <hr className="border-theme opacity-10" />
                <span className="theme-bg-surface px-3 theme-text-muted fw-bold position-absolute top-50 start-50 translate-middle small">
                  OR CONTINUE WITH
                </span>
              </div>

              <Button 
                variant="outline-theme" 
                onClick={handleGoogleLogin} 
                className="w-100 py-3 rounded-pill fs-5 border-2 fw-bold d-flex align-items-center justify-content-center hover-scale"
                style={{ background: 'var(--ui-surface)', borderColor: 'var(--ui-border)' }}
              >
                <FcGoogle className="me-3 fs-3" /> Google
              </Button>

              <div className="text-center mt-5">
                <p className="theme-text-secondary mb-0">
                  {isLogin ? "New to Literacy Companion?" : "Already have an account?"}
                  <Button 
                    variant="link" 
                    onClick={() => setIsLogin(!isLogin)} 
                    className="fw-bold p-0 ms-2 text-decoration-none text-primary"
                  >
                    {isLogin ? "Sign Up Free" : "Sign In Here"} <FiChevronRight />
                  </Button>
                </p>
              </div>
            </Card>
          </motion.div>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
