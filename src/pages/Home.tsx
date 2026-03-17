import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiBookOpen, FiZap, FiWifiOff, FiArrowRight } from 'react-icons/fi';

const Home: React.FC = () => {
  return (
    <Container className="py-5">
      <Row className="justify-content-center align-items-center mb-5 pb-lg-5">
        <Col lg={8} className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="display-2 fw-bold mb-4 text-primary" style={{ letterSpacing: '-1px' }}>
              Your journey to <br /> confident reading starts here.
            </h1>
            <p className="lead mb-5 fs-3 text-secondary px-lg-5">
              Empowering adults to read and write through personalized, interactive stories that matter to you.
            </p>
            <div className="d-flex flex-column flex-sm-row justify-content-center gap-4">
              <Link to="/learning" className="btn btn-primary btn-lg px-5 py-4 rounded-pill fs-4 fw-bold shadow-lg">
                Start Learning Now <FiArrowRight className="ms-2" />
              </Link>
              <Link to="/profile" className="btn btn-outline-primary btn-lg px-5 py-4 rounded-pill fs-4 fw-bold border-2">
                View My Progress
              </Link>
            </div>
          </motion.div>
        </Col>
      </Row>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2, duration: 0.8 }}
      >
        <Row className="mt-5 pt-lg-5 g-4">
          <Col md={4}>
            <Card className="h-100 border-2 shadow-sm p-4 rounded-4 transition-all hover-scale">
              <Card.Body className="text-center">
                <div className="bg-primary-subtle text-primary rounded-circle p-4 d-inline-block mb-4">
                  <FiBookOpen size={48} />
                </div>
                <h3 className="h2 fw-bold mb-3">Adaptive Stories</h3>
                <p className="fs-5 text-muted">
                  Stories that grow with you. We personalize every lesson to your current reading level.
                </p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="h-100 border-2 shadow-sm p-4 rounded-4 transition-all hover-scale">
              <Card.Body className="text-center">
                <div className="bg-success-subtle text-success rounded-circle p-4 d-inline-block mb-4">
                  <FiZap size={48} />
                </div>
                <h3 className="h2 fw-bold mb-3">Build Confidence</h3>
                <p className="fs-5 text-muted">
                  Practice every day, track your progress, and celebrate every new word you learn.
                </p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="h-100 border-2 shadow-sm p-4 rounded-4 transition-all hover-scale">
              <Card.Body className="text-center">
                <div className="bg-warning-subtle text-warning rounded-circle p-4 d-inline-block mb-4">
                  <FiWifiOff size={48} />
                </div>
                <h3 className="h2 fw-bold mb-3">Learn Anywhere</h3>
                <p className="fs-5 text-muted">
                  Works even without internet. Download lessons and keep learning on the go.
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </motion.div>

      <motion.div 
        className="mt-5 pt-5 text-center"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="bg-white p-5 rounded-5 border-2 shadow-sm border-primary-subtle">
          <h2 className="display-4 fw-bold mb-4">Supporting Global Literacy</h2>
          <p className="lead fs-4 mb-0 text-muted mx-auto" style={{ maxWidth: '800px' }}>
            Built to support UN Sustainable Development Goal 4.6 — eliminating illiteracy among adults worldwide.
          </p>
        </div>
      </motion.div>
    </Container>
  );
};

export default Home;
