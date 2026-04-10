import React, { useState } from 'react';
import { Container, Card, Row, Col, Form, Button, Alert, ListGroup, Badge, Spinner, Modal } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import type { SavedStory } from '../context/AuthContext';
import { useSpeech } from '../hooks/useSpeech';
import { FiUser, FiLogOut, FiCheckCircle, FiBook, FiTrash2, FiPlay, FiPause, FiSquare, FiChevronRight } from 'react-icons/fi';
import { auth } from '../services/firebase';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Profile: React.FC = () => {
  const { currentUser, userData, updateReadingLevel, savedStories, deleteStory } = useAuth();
  const { isPlaying, isPaused, currentWordIndex, handleSpeech, handlePause, handleStop, handleWordClick } = useSpeech();
  const [level, setLevel] = useState(userData?.readingLevel || 'beginner');
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [selectedStory, setSelectedStory] = useState<SavedStory | null>(null);
  const [showStoryModal, setShowStoryModal] = useState(false);
  
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);

  const navigate = useNavigate();

  const handleUpdateLevel = async () => {
    setUpdating(true);
    try {
      await updateReadingLevel(level);
      setMessage('Settings updated successfully!');
    } catch (err) {
      setMessage('Failed to update settings.');
    } finally {
      setUpdating(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const openStory = (story: SavedStory) => {
    setSelectedStory(story);
    setShowStoryModal(true);
    setAnswers([]);
    setShowResults(false);
  };

  const closeStory = () => {
    handleStop();
    setShowStoryModal(false);
    setSelectedStory(null);
  };

  const handleAnswer = (qIdx: number, oIdx: number) => {
    const newAnswers = [...answers];
    newAnswers[qIdx] = oIdx;
    setAnswers(newAnswers);
  };

  const score = selectedStory?.questions.reduce((acc: number, q: any, idx: number) => {
    return acc + (answers[idx] === q.answerIndex ? 1 : 0);
  }, 0);

  if (!currentUser) {
    return (
      <Container className="py-5 text-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h2 className="display-4 fw-bold mb-4">Please log in to see your library</h2>
          <Button onClick={() => navigate('/login')} variant="primary" size="lg" className="px-5 py-4 shadow-lg">
            Sign In Now
          </Button>
        </motion.div>
      </Container>
    );
  }

  return (
    <Container className="py-5 py-lg-6">
      <Row className="g-5">
        <Col lg={4}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card className="border-theme border-2 shadow-xl p-4 p-md-5 text-center rounded-5 sticky-lg-top" style={{ top: '120px' }}>
              <div className="theme-bg-primary-subtle rounded-circle d-inline-flex p-4 mx-auto mb-4 border-theme border-4">
                <FiUser size={64} className="text-primary" />
              </div>
              <h2 className="display-6 fw-bold mb-2">
                {userData?.displayName || currentUser.email?.split('@')[0]}
              </h2>
              <p className="fs-5 theme-text-secondary mb-5">
                {currentUser.email}
              </p>
              
              <div className="d-grid gap-3 mb-5 theme-bg-body p-4 rounded-4 border-theme border-2">
                <div className="d-flex justify-content-between align-items-center">
                  <span className="fw-bold theme-text-secondary">Current Streak</span>
                  <span className="fs-3 fw-bold text-primary">{userData?.streak || 0} Days</span>
                </div>
                <hr className="my-0 border-theme opacity-10" />
                <div className="d-flex justify-content-between align-items-center">
                  <span className="fw-bold theme-text-secondary">Reading Level</span>
                  <Badge bg="primary-subtle" text="primary" className="fs-5 text-capitalize">{userData?.readingLevel || 'Beginner'}</Badge>
                </div>
              </div>

              <Button 
                variant="outline-danger" 
                onClick={handleLogout} 
                className="w-100 py-3 rounded-pill fw-bold border-2 d-flex align-items-center justify-content-center"
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
            {/* Library Section */}
            <Card className="border-theme border-2 shadow-xl p-4 p-md-5 mb-5 rounded-5">
              <div className="d-flex justify-content-between align-items-center mb-5">
                <h3 className="display-5 fw-bold mb-0">My Library</h3>
                <Badge bg="primary" className="rounded-pill px-3 py-2 fs-5">{savedStories.length}</Badge>
              </div>
              
              {savedStories.length === 0 ? (
                <div className="text-center py-5">
                  <FiBook size={64} className="text-muted mb-4 opacity-25" />
                  <p className="fs-4 theme-text-muted mb-4">Your library is empty. Start reading to save stories!</p>
                  <Button onClick={() => navigate('/learning')} variant="primary" size="lg" className="px-5 py-3 shadow-lg">
                    Discover Stories
                  </Button>
                </div>
              ) : (
                <ListGroup variant="flush">
                  <AnimatePresence>
                    {savedStories.map((story) => (
                      <ListGroup.Item 
                        key={story.id} 
                        as={motion.div}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="px-0 py-4 border-bottom border-theme d-flex align-items-center justify-content-between theme-bg-surface gap-3"
                      >
                        <div className="d-flex align-items-center cursor-pointer flex-grow-1" onClick={() => openStory(story)}>
                          <div className="theme-bg-primary-subtle p-3 rounded-4 me-4 border-theme border-2 d-none d-sm-block">
                            <FiBook size={28} className="text-primary" />
                          </div>
                          <div>
                            <h4 className="fs-3 fw-bold mb-1">{story.title}</h4>
                            <div className="d-flex gap-2">
                              <Badge bg="light" text="dark" className="text-capitalize border border-theme">{story.level}</Badge>
                              <Badge bg="light" text="dark" className="text-capitalize border border-theme">{story.topic}</Badge>
                            </div>
                          </div>
                        </div>
                        <div className="d-flex gap-2">
                          <Button variant="primary" onClick={() => openStory(story)} className="rounded-pill px-4 fw-bold">
                            Read
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            onClick={() => deleteStory(story.id)} 
                            className="rounded-circle p-2 d-flex align-items-center justify-content-center border-2"
                          >
                            <FiTrash2 size={20} />
                          </Button>
                        </div>
                      </ListGroup.Item>
                    ))}
                  </AnimatePresence>
                </ListGroup>
              )}
            </Card>

            {/* Progress/Preferences Section */}
            <Card className="border-theme border-2 shadow-xl p-4 p-md-5 mb-5 rounded-5">
              <h3 className="display-5 fw-bold mb-5">Preferences</h3>
              
              {message && (
                <Alert variant="success" className="mb-5 border-2 fw-bold fs-5 rounded-4 shadow-sm px-4">
                  <FiCheckCircle className="me-2" /> {message}
                </Alert>
              )}
              
              <Form.Group className="mb-4">
                <Form.Label className="fw-bold fs-4 mb-3">Adjust Reading Level:</Form.Label>
                <Form.Select 
                  value={level} 
                  onChange={(e) => setLevel(e.target.value)}
                  className="form-select-lg border-2 mb-4"
                >
                  <option value="beginner">Beginner (Short words & simple sentences)</option>
                  <option value="intermediate">Intermediate (Compound sentences)</option>
                  <option value="advanced">Advanced (Short paragraphs & complex stories)</option>
                </Form.Select>
                <Button 
                  variant="primary" 
                  onClick={handleUpdateLevel} 
                  disabled={updating}
                  className="px-5 py-3 fs-5 shadow-lg"
                >
                  {updating ? <Spinner animation="border" size="sm" /> : 'Save Preferences'}
                </Button>
              </Form.Group>
            </Card>

            {/* Achievements Section */}
            <Card className="border-theme border-2 shadow-xl p-4 p-md-5 rounded-5">
              <h3 className="display-5 fw-bold mb-5">Achievements</h3>
              <Row className="g-4">
                {[
                  {
                    icon: "🔥",
                    title: "First Spark",
                    desc: "Read your first daily story.",
                    unlocked: (userData?.streak || 0) > 0
                  },
                  {
                    icon: "📚",
                    title: "Bookworm",
                    desc: "Complete stories 3 days in a row.",
                    unlocked: (userData?.streak || 0) >= 3
                  }
                ].map((ach, i) => (
                  <Col md={12} key={i}>
                    <div className={`p-4 rounded-4 border-theme border-2 d-flex align-items-center gap-4 ${ach.unlocked ? 'theme-bg-surface' : 'opacity-50 grayscale'}`} style={{ filter: ach.unlocked ? 'none' : 'grayscale(1)' }}>
                      <div className={`p-4 rounded-circle shadow-sm border-theme border-2 fs-2 d-flex align-items-center justify-content-center`} style={{ width: '80px', height: '80px', background: 'var(--ui-bg)' }}>
                        {ach.icon}
                      </div>
                      <div className="flex-grow-1">
                        <h4 className="fs-3 fw-bold mb-1">{ach.title}</h4>
                        <p className="fs-5 theme-text-secondary mb-0">{ach.desc}</p>
                      </div>
                      {ach.unlocked && <FiCheckCircle className="text-success" size={32} />}
                    </div>
                  </Col>
                ))}
              </Row>
            </Card>
          </motion.div>
        </Col>
      </Row>

      {/* Story Reading Modal */}
      <Modal show={showStoryModal} onHide={closeStory} size="lg" centered className="story-modal">
        <Modal.Header closeButton className="border-bottom-2 p-4">
          <Modal.Title className="fw-bold display-6">{selectedStory?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4 p-lg-5 theme-bg-body">
          {selectedStory && (
            <>
              <div className="d-flex justify-content-center gap-3 bg-light p-3 rounded-pill shadow-inner border border-theme mb-5 mx-auto" style={{ width: 'fit-content' }}>
                {isPlaying ? (
                  <Button variant="primary" onClick={handlePause} className="rounded-circle p-3 shadow" style={{ width: '64px', height: '64px' }}>
                    <FiPause size={32} />
                  </Button>
                ) : (
                  <Button variant="primary" onClick={() => handleSpeech(selectedStory.content)} className="rounded-circle p-3 shadow" style={{ width: '64px', height: '64px' }}>
                    <FiPlay size={32} />
                  </Button>
                )}
                {(isPlaying || isPaused) && (
                  <Button variant="outline-danger" onClick={handleStop} className="rounded-circle p-3 border-2" style={{ width: '64px', height: '64px' }}>
                    <FiSquare size={32} />
                  </Button>
                )}
              </div>
              
              <div className="story-content fs-3 lh-lg theme-text-primary mb-6" style={{ fontSize: '1.5rem', lineHeight: '2.2' }}>
                {selectedStory.content.trim().split(/\s+/).map((word, i) => (
                  <span 
                    key={i} 
                    className={`clickable-word me-1 rounded px-2 ${currentWordIndex === i ? 'active-highlight' : ''}`}
                    onClick={() => handleWordClick(word, i)}
                    role="button"
                  >
                    {word}
                  </span>
                ))}
              </div>

              <div className="text-center my-6">
                <hr className="border-theme opacity-10" />
                <Badge bg="primary-subtle" text="primary" className="px-4 py-2 rounded-pill fs-5">Quiz Time</Badge>
              </div>

              {selectedStory.questions.map((q, idx) => (
                <div key={idx} className="mb-5 p-4 theme-bg-surface rounded-5 border-theme border-2">
                  <h4 className="display-6 fw-bold mb-4">{idx + 1}. {q.question}</h4>
                  <Row className="g-3">
                    {q.options.map((option: string, oIdx: number) => (
                      <Col key={oIdx} sm={12}>
                        <Button
                          variant={
                            showResults
                              ? (oIdx === q.answerIndex ? 'success' : (answers[idx] === oIdx ? 'danger' : 'outline-theme'))
                              : (answers[idx] === oIdx ? 'primary shadow-md' : 'outline-theme')
                          }
                          className="w-100 text-start py-4 px-4 rounded-4 fs-4 border-2"
                          onClick={() => !showResults && handleAnswer(idx, oIdx)}
                          disabled={showResults}
                        >
                          {option}
                        </Button>
                      </Col>
                    ))}
                  </Row>
                </div>
              ))}
              
              {!showResults ? (
                <Button 
                  variant="primary" 
                  size="lg" 
                  className="w-100 py-4 fs-3 shadow-xl"
                  disabled={answers.length < selectedStory.questions.length}
                  onClick={() => setShowResults(true)}
                >
                  Check My Answers <FiChevronRight />
                </Button>
              ) : (
                <div className="text-center theme-bg-surface p-5 rounded-5 border-theme border-4 shadow-xl">
                  <h4 className="display-4 fw-bold text-primary mb-4">You got {score}/{selectedStory.questions.length}!</h4>
                  <Button variant="outline-primary" onClick={() => setShowResults(false)} className="px-5 py-3 fs-5 border-2 fw-bold">
                    Practice Again
                  </Button>
                </div>
              )}
            </>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default Profile;
