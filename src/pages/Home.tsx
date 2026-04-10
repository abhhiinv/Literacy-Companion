import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import { FiBookOpen, FiZap, FiWifiOff, FiArrowRight } from 'react-icons/fi';

const Home: React.FC = () => {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="py-5 py-lg-7 position-relative">
        <Container>
          <Row className="justify-content-center">
            <Col lg={10} xl={8} className="text-center">
              <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
              >
                <motion.div variants={itemVariants}>
                  <Badge bg="primary-subtle" text="primary" className="px-3 py-2 rounded-pill mb-4 fw-bold text-uppercase border border-primary border-opacity-25" style={{ letterSpacing: '0.1em' }}>
                    Literacy for All
                  </Badge>
                  <h1 className="display-1 fw-bold mb-4" style={{ letterSpacing: '-0.04em' }}>
                    Read with <span className="text-primary">Confidence</span>.
                  </h1>
                </motion.div>
                <motion.p variants={itemVariants} className="lead fs-3 theme-text-secondary mb-5 px-lg-5">
                  An AI-powered companion designed for adult learners to master reading through interactive, personal stories.
                </motion.p>
                <motion.div variants={itemVariants} className="d-flex flex-column flex-sm-row justify-content-center gap-4">
                  <Link to="/learning" className="btn btn-primary btn-lg px-5 py-4 fs-4 shadow-xl">
                    Start Learning <FiArrowRight className="ms-2" />
                  </Link>
                  <Link to="/login" className="btn btn-outline-primary btn-lg px-5 py-4 fs-4">
                    Create Account
                  </Link>
                </motion.div>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Feature Section */}
      <section className="py-5 py-lg-6 theme-bg-surface">
        <Container>
          <div className="text-center mb-5 pb-lg-4">
            <h2 className="display-3 fw-bold mb-3">Designed for You</h2>
            <p className="fs-4 theme-text-secondary mx-auto" style={{ maxWidth: '700px' }}>
              We've built every feature with accessibility and dignity in mind, ensuring a premium experience for every learner.
            </p>
          </div>
          <Row className="g-4 g-lg-5">
            {[
              {
                icon: <FiBookOpen size={40} />,
                title: "Adaptive Stories",
                desc: "Stories that grow with you. We personalize every lesson to your current reading level and interests.",
                color: "primary"
              },
              {
                icon: <FiZap size={40} />,
                title: "Voice Assistance",
                desc: "Hear any word or sentence spoken aloud. Build confidence with real-time audio support.",
                color: "success"
              },
              {
                icon: <FiWifiOff size={40} />,
                title: "Offline Ready",
                desc: "Learn anywhere, even without internet. Your progress stays with you wherever you go.",
                color: "warning"
              }
            ].map((feat, i) => (
              <Col md={4} key={i}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="h-100"
                >
                  <Card className="h-100 border-theme border-2 hover-scale text-center p-4 p-lg-5">
                    <div className={`theme-bg-${feat.color}-subtle text-${feat.color} rounded-4 p-4 d-inline-flex align-items-center justify-content-center mb-4 border border-${feat.color} border-opacity-25 shadow-sm mx-auto`} style={{ width: '80px', height: '80px' }}>
                      {feat.icon}
                    </div>
                    <h3 className="h2 fw-bold mb-3">{feat.title}</h3>
                    <p className="fs-5 theme-text-secondary mb-0">
                      {feat.desc}
                    </p>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Mission Section */}
      <section className="py-5 py-lg-6">
        <Container>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="theme-bg-primary-subtle p-5 p-lg-6 rounded-5 border-theme border-4 shadow-xl text-center"
          >
            <h2 className="display-4 fw-bold mb-4 text-primary">A Global Commitment</h2>
            <p className="fs-3 theme-text-primary mb-0 mx-auto" style={{ maxWidth: '850px', lineHeight: '1.4' }}>
              "Built to support <strong>UN Sustainable Development Goal 4.6</strong> — ensuring that all youth and a substantial proportion of adults achieve literacy and numeracy."
            </p>
          </motion.div>
        </Container>
      </section>
    </div>
  );
};

// Internal Badge component if not imported
const Badge: React.FC<{bg: string, text: string, className?: string, style?: React.CSSProperties, children: React.ReactNode}> = ({bg, text, className, style, children}) => (
  <span className={`badge bg-${bg} text-${text} ${className}`} style={style}>{children}</span>
);

export default Home;
