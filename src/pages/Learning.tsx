import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Spinner, Alert, Card, Form, Badge } from 'react-bootstrap';
import { generateStory } from '../services/gemini';
import { useAuth } from '../context/AuthContext';
import { useSpeech } from '../hooks/useSpeech';
import { FiRotateCcw, FiArrowRight, FiCheckCircle, FiBookOpen, FiHelpCircle, FiPause, FiPlay, FiSquare, FiSave, FiCheck, FiChevronLeft } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Learning: React.FC = () => {
  const { userData, currentUser, completeStory, saveStory, savedStories } = useAuth();
  const { isPlaying, isPaused, currentWordIndex, handleSpeech, handlePause, handleStop, handleWordClick, setCurrentWordIndex } = useSpeech();
  const [level, setLevel] = useState(userData?.readingLevel || 'beginner');
  const [topic, setTopic] = useState('everyday life');
  const [loading, setLoading] = useState(false);
  const [story, setStory] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  const navigate = useNavigate();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleShowResults = async () => {
    setShowResults(true);
    if (currentUser) {
      await completeStory();
    }
  };

  const handleGenerateStory = async () => {
    setLoading(true);
    setError(null);
    setAnswers([]);
    setShowResults(false);
    setCurrentWordIndex(null);
    try {
      const result = await generateStory(level, topic);
      setStory(result);
    } catch (err: any) {
      console.error("Story Generation Error:", err);
      if (err.message?.includes('503') || err.status === 503) {
        setError('The AI service is currently overloaded. Please wait a moment and try again.');
      } else {
        setError('Could not create your story. Please check your connection or try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveStory = async () => {
    if (!story) return;
    setIsSaving(true);
    try {
      await saveStory(story, level, topic);
      setSaveMessage(true);
      setTimeout(() => setSaveMessage(false), 3000);
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const isStorySaved = savedStories.some(s => s.title === story?.title);

  const handleAnswer = (qIdx: number, oIdx: number) => {
    const newAnswers = [...answers];
    newAnswers[qIdx] = oIdx;
    setAnswers(newAnswers);
  };

  const score = story?.questions.reduce((acc: number, q: any, idx: number) => {
    return acc + (answers[idx] === q.answerIndex ? 1 : 0);
  }, 0);

  return (
    <Container className="py-5">
      <AnimatePresence mode="wait">
        {!story ? (
          <motion.div 
            key="setup"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center py-5"
          >
            <h1 className="display-3 fw-bold mb-4">What shall we read today?</h1>
            <p className="fs-4 theme-text-secondary mb-5 mx-auto" style={{ maxWidth: '600px' }}>
              Pick your level and a topic you enjoy. We'll create a story just for you.
            </p>

            <Row className="justify-content-center mb-5 g-4 text-start">
              <Col md={5} lg={4}>
                <Card className="h-100 border-theme border-2">
                  <Form.Group>
                    <Form.Label className="h4 fw-bold mb-3 d-flex align-items-center">
                      <FiBookOpen className="me-2 text-primary" /> Level
                    </Form.Label>
                    <Form.Select
                      value={level}
                      onChange={(e) => setLevel(e.target.value)}
                      className="form-select-lg border-2"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </Form.Select>
                    <Form.Text className="theme-text-muted mt-2 d-block">
                      Short words and simple sentences.
                    </Form.Text>
                  </Form.Group>
                </Card>
              </Col>
              <Col md={5} lg={4}>
                <Card className="h-100 border-theme border-2">
                  <Form.Group>
                    <Form.Label className="h4 fw-bold mb-3 d-flex align-items-center">
                      <FiHelpCircle className="me-2 text-primary" /> Topic
                    </Form.Label>
                    <Form.Select
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="form-select-lg border-2"
                    >
                      <option value="everyday life">🏠 Everyday Life</option>
                      <option value="work">💼 Working & Careers</option>
                      <option value="shopping">🛒 Practical Shopping</option>
                      <option value="family">👨‍👩‍👧 Family & Community</option>
                      <option value="hobbies">🎨 Hobbies & Fun</option>
                      <option value="health">🍎 Staying Healthy</option>
                    </Form.Select>
                    <Form.Text className="theme-text-muted mt-2 d-block">
                      Stories about things you do every day.
                    </Form.Text>
                  </Form.Group>
                </Card>
              </Col>
            </Row>

            <Button
              variant="primary"
              size="lg"
              onClick={handleGenerateStory}
              disabled={loading || !isOnline}
              className="px-5 py-4 fs-3 shadow-xl"
              style={{ minWidth: '320px' }}
            >
              {loading ? (
                <><Spinner animation="border" size="sm" className="me-3 text-white" /> <span className="text-white">Preparing Story...</span></>
              ) : (
                'Create My Story'
              )}
            </Button>

            {!isOnline && (
              <Alert variant="warning" className="mt-5 border-2 rounded-4 p-4 shadow-sm text-start mx-auto" style={{ maxWidth: '600px' }}>
                <FiBookOpen className="me-3 fs-3" />
                <strong>You are offline.</strong> You can still read stories saved in your 
                <Button variant="link" onClick={() => navigate('/profile')} className="p-0 ms-2 fw-bold align-baseline">Library</Button>.
              </Alert>
            )}
            {error && <Alert variant="danger" className="mt-5 border-2 fw-bold">{error}</Alert>}
          </motion.div>
        ) : (
          <motion.div 
            key="reader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="reader-container"
          >
            <div className="d-flex align-items-center mb-4">
              <Button variant="link" onClick={() => setStory(null)} className="text-secondary p-0 me-3 d-flex align-items-center fw-bold text-decoration-none fs-5">
                <FiChevronLeft className="me-1" /> Back
              </Button>
              <Badge bg="primary-subtle" text="primary" className="text-uppercase px-3 py-2 rounded-pill fw-bold border border-primary border-opacity-25">
                {level} level
              </Badge>
            </div>

            <Card className="shadow-xl border-theme border-2 mb-5 overflow-hidden rounded-5">
              <div className="theme-bg-surface p-4 p-lg-5 border-bottom border-theme">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-4">
                  <h2 className="display-4 fw-bold mb-0 text-center text-md-start" style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.03em' }}>
                    {story.title}
                  </h2>
                  <div className="d-flex gap-3 bg-light p-2 rounded-pill shadow-inner border border-theme">
                    <Button 
                      variant={isStorySaved || saveMessage ? "success" : "link"}
                      onClick={handleSaveStory} 
                      disabled={isStorySaved || isSaving}
                      className={`rounded-circle p-3 d-flex align-items-center justify-content-center ${isStorySaved || saveMessage ? '' : 'text-primary'}`}
                      style={{ width: '64px', height: '64px', background: isStorySaved || saveMessage ? '' : 'var(--ui-surface)' }}
                    >
                      {isStorySaved || saveMessage ? <FiCheck size={32} /> : <FiSave size={32} />}
                    </Button>
                    <div className="vr opacity-10 my-2"></div>
                    {isPlaying ? (
                      <Button 
                        variant="primary" 
                        onClick={handlePause} 
                        className="rounded-circle p-3 d-flex align-items-center justify-content-center shadow"
                        style={{ width: '64px', height: '64px' }}
                      >
                        <FiPause size={32} />
                      </Button>
                    ) : (
                      <Button 
                        variant="primary" 
                        onClick={() => handleSpeech(story.content)} 
                        className="rounded-circle p-3 d-flex align-items-center justify-content-center shadow"
                        style={{ width: '64px', height: '64px' }}
                      >
                        <FiPlay size={32} />
                      </Button>
                    )}
                    {(isPlaying || isPaused) && (
                      <Button 
                        variant="outline-danger" 
                        onClick={handleStop} 
                        className="rounded-circle p-3 d-flex align-items-center justify-content-center border-2"
                        style={{ width: '64px', height: '64px' }}
                      >
                        <FiSquare size={32} />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              <Card.Body className="p-4 p-md-5 py-lg-6 theme-bg-body">
                <div className="story-content fs-3 lh-lg theme-text-primary fw-medium" style={{ fontSize: '1.5rem', lineHeight: '2.2' }}>
                  {story.content.split(' ').map((word: string, i: number) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.01 }}
                      onClick={() => handleWordClick(word, i)}
                      className={`clickable-word me-1 rounded px-2 ${currentWordIndex === i ? 'active-highlight' : ''}`}
                      role="button"
                    >
                      {word}
                    </motion.span>
                  ))}
                </div>
                <div className="mt-5 p-4 theme-bg-surface rounded-4 text-center border border-theme border-opacity-50">
                  <p className="mb-0 theme-text-secondary fs-5">
                    <FiBookOpen className="me-2 text-primary" /> 
                    <strong>Tip:</strong> Click any word to hear it spoken.
                  </p>
                </div>
              </Card.Body>
            </Card>

            {/* Quiz Section */}
            <div className="py-5">
              <div className="text-center mb-5">
                <div className="bg-primary text-white rounded-circle d-inline-flex p-4 mb-4 shadow-lg">
                  <FiCheckCircle size={48} />
                </div>
                <h3 className="display-4 fw-bold">Let's see what you remember!</h3>
              </div>

              {story.questions.map((q: any, idx: number) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="mb-5 border-theme border-2 rounded-5 p-4 p-lg-5">
                    <div className="d-flex align-items-start mb-5">
                      <div className="bg-primary-subtle text-primary fw-bold rounded-circle d-flex align-items-center justify-content-center me-4 shadow-sm" style={{ width: '56px', height: '56px', flexShrink: 0, fontSize: '1.5rem' }}>
                        {idx + 1}
                      </div>
                      <h4 className="display-6 mb-0 fw-bold">{q.question}</h4>
                    </div>
                    <Row className="g-3">
                      {q.options.map((option: string, oIdx: number) => (
                        <Col key={oIdx} sm={12}>
                          <Button
                            variant={
                              showResults
                                ? (oIdx === q.answerIndex ? 'success' : (answers[idx] === oIdx ? 'danger' : 'outline-theme'))
                                : (answers[idx] === oIdx ? 'primary shadow-lg' : 'outline-theme')
                            }
                            className={`w-100 text-start py-4 px-4 rounded-4 fs-4 d-flex justify-content-between align-items-center border-2 transition-all ${!showResults && answers[idx] === oIdx ? 'fw-bold' : ''}`}
                            onClick={() => !showResults && handleAnswer(idx, oIdx)}
                            disabled={showResults}
                            style={{ 
                              borderColor: !showResults && answers[idx] === oIdx ? 'var(--ui-primary)' : 'var(--ui-border)',
                              background: !showResults && answers[idx] === oIdx ? 'var(--ui-primary-subtle)' : 'var(--ui-surface)',
                              color: !showResults && answers[idx] === oIdx ? 'var(--ui-primary)' : 'var(--ui-text-primary)'
                            }}
                          >
                            {option}
                            {showResults && oIdx === q.answerIndex && <FiCheckCircle size={32} className="text-success" />}
                            {!showResults && answers[idx] === oIdx && <FiCheck className="text-primary" size={32} />}
                          </Button>
                        </Col>
                      ))}
                    </Row>
                  </Card>
                </motion.div>
              ))}

              {!showResults ? (
                <div className="text-center mt-4">
                  <Button
                    variant="primary"
                    size="lg"
                    className="px-5 py-4 fs-3 shadow-xl"
                    style={{ minWidth: '320px' }}
                    disabled={answers.length < story.questions.length}
                    onClick={handleShowResults}
                  >
                    Check My Answers <FiArrowRight className="ms-2" />
                  </Button>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <Card className="text-center p-5 border-theme border-4 shadow-xl rounded-5 theme-bg-surface mt-5">
                    <div className="display-1 mb-4">
                      {score === story.questions.length ? '🏆' : '✨'}
                    </div>
                    <h2 className="display-3 fw-bold mb-3">
                      {score} out of {story.questions.length} Correct!
                    </h2>
                    <p className="fs-3 theme-text-secondary mb-5 px-md-5">
                      {score === story.questions.length 
                        ? "Outstanding work! You understood everything perfectly." 
                        : "Great effort! Every story you read makes you stronger."}
                    </p>
                    <div className="d-flex flex-column flex-md-row justify-content-center gap-4">
                      <Button 
                        variant="primary" 
                        size="lg" 
                        onClick={handleGenerateStory} 
                        className="px-5 py-4 fs-4 shadow"
                      >
                        Read Next Story <FiArrowRight className="ms-2" />
                      </Button>
                      <Button 
                        variant="outline-primary" 
                        size="lg" 
                        onClick={() => setStory(null)} 
                        className="px-5 py-4 fs-4"
                      >
                        <FiRotateCcw className="me-2" /> Pick New Topic
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Container>
  );
};

export default Learning;
