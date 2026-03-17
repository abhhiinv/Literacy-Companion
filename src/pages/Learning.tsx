import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Spinner, Alert, Card, Form, Badge } from 'react-bootstrap';
import { generateStory } from '../services/gemini';
import { useAuth } from '../context/AuthContext';
import { FiRotateCcw, FiArrowRight, FiCheckCircle, FiBookOpen, FiHelpCircle, FiPause, FiPlay, FiSquare } from 'react-icons/fi';
import { motion } from 'framer-motion';

const Learning: React.FC = () => {
  const { userData, currentUser, completeStory } = useAuth();
  const [level, setLevel] = useState(userData?.readingLevel || 'beginner');
  const [topic, setTopic] = useState('everyday life');
  const [loading, setLoading] = useState(false);
  const [story, setStory] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [highlightedWord, setHighlightedWord] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
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
    try {
      const result = await generateStory(level, topic);
      setStory(result);
    } catch (err) {
      setError('Could not generate story. Please check your API key.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSpeech = (text: string) => {
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.8;
    
    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handlePause = () => {
    window.speechSynthesis.pause();
    setIsPaused(true);
    setIsPlaying(false);
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  };

  const handleWordClick = (word: string) => {
    setHighlightedWord(word);
    const cleanWord = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
    
    // Independent short utterance for word clicks
    const utterance = new SpeechSynthesisUtterance(cleanWord);
    utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
    
    setTimeout(() => setHighlightedWord(null), 1000);
  };

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
      <Row className="justify-content-center">
        <Col md={10} lg={8}>
          {!story ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <h1 className="display-4 fw-bold mb-3 text-primary">What would you like to read today?</h1>
              <p className="lead mb-5 fs-4">Pick a topic and we'll create a story just for you.</p>

              <Row className="mb-5 text-start g-4">
                <Col md={6}>
                  <Card className="border-2 shadow-sm p-4 h-100 rounded-4 theme-bg-surface">
                    <Form.Group>
                      <Form.Label className="fw-bold h4 mb-3 d-flex align-items-center theme-text-primary">
                        <FiBookOpen className="me-2 text-primary" /> My Reading Level:
                      </Form.Label>
                      <Form.Select
                        value={level}
                        onChange={(e) => setLevel(e.target.value)}
                        size="lg"
                        className="border-2 py-3 px-4 fs-5 rounded-3 theme-bg-surface theme-text-primary"
                        style={{ border: '2px solid var(--border-color)' }}
                      >
                        <option value="beginner">Beginner (Simple Words)</option>
                        <option value="intermediate">Intermediate (Short Stories)</option>
                        <option value="advanced">Advanced (Detailed Stories)</option>
                      </Form.Select>
                      <Form.Text className="theme-text-secondary fs-6 mt-2 d-block">
                        Choose a level that feels comfortable for you.
                      </Form.Text>
                    </Form.Group>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className="border-2 shadow-sm p-4 h-100 rounded-4 theme-bg-surface">
                    <Form.Group>
                      <Form.Label className="fw-bold h4 mb-3 d-flex align-items-center theme-text-primary">
                        <FiHelpCircle className="me-2 text-primary" /> Story Topic:
                      </Form.Label>
                      <Form.Select
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        size="lg"
                        className="border-2 py-3 px-4 fs-5 rounded-3 theme-bg-surface theme-text-primary"
                        style={{ border: '2px solid var(--border-color)' }}
                      >
                        <option value="everyday life">🏠 Everyday Life</option>
                        <option value="work">💼 Working & Careers</option>
                        <option value="shopping">🛒 Practical Shopping</option>
                        <option value="family">👨‍👩‍👧 Family & Community</option>
                        <option value="hobbies">🎨 Hobbies & Fun</option>
                        <option value="health">🍎 Staying Healthy</option>
                      </Form.Select>
                      <Form.Text className="theme-text-secondary fs-6 mt-2 d-block">
                        What are you interested in reading about?
                      </Form.Text>
                    </Form.Group>
                  </Card>
                </Col>
              </Row>
              <Button
                variant="primary"
                size="lg"
                onClick={handleGenerateStory}
                disabled={loading}
                className="px-5 py-4 shadow-lg rounded-pill fw-bold fs-4"
                style={{ minWidth: '300px' }}
              >
                {loading ? (
                  <><Spinner animation="border" size="sm" className="me-3" /> Creating your story...</>
                ) : (
                  'Create My Story'
                )}
              </Button>
              {error && <Alert variant="danger" className="mt-5 border-2 fw-bold">{error}</Alert>}
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="animate-in"
            >
              <Card className="shadow-lg border-2 mb-5 overflow-hidden rounded-4">
                <Card.Header className="bg-primary text-white py-4 px-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
                  <div>
                    <Badge bg="light" text="dark" className="text-uppercase mb-2 px-3 py-2 fw-bold" style={{ letterSpacing: '1px' }}>
                      {level} level
                    </Badge>
                    <h2 className="h2 mb-0 fw-bold">{story.title}</h2>
                  </div>
                  <div className="d-flex gap-2">
                    {isPlaying ? (
                      <Button 
                        variant="light" 
                        size="lg" 
                        onClick={handlePause} 
                        className="rounded-circle shadow-sm p-3 hover-scale d-flex align-items-center justify-content-center"
                        title="Pause"
                        style={{ width: '64px', height: '64px' }}
                      >
                        <FiPause size={32} />
                      </Button>
                    ) : (
                      <Button 
                        variant="light" 
                        size="lg" 
                        onClick={() => handleSpeech(story.content)} 
                        className="rounded-circle shadow-sm p-3 hover-scale d-flex align-items-center justify-content-center"
                        title={isPaused ? "Resume" : "Read aloud"}
                        style={{ width: '64px', height: '64px' }}
                      >
                        <FiPlay size={32} />
                      </Button>
                    )}
                    {(isPlaying || isPaused) && (
                      <Button 
                        variant="outline-light" 
                        size="lg" 
                        onClick={handleStop} 
                        className="rounded-circle shadow-sm p-3 hover-scale d-flex align-items-center justify-content-center border-2"
                        title="Stop"
                        style={{ width: '64px', height: '64px' }}
                      >
                        <FiSquare size={32} />
                      </Button>
                    )}
                  </div>
                </Card.Header>
                <Card.Body className="p-4 p-md-5 theme-bg-surface">
                  <div className="story-content fs-3 lh-lg theme-text-primary fw-medium">
                    {story.content.split(' ').map((word: string, i: number) => (
                      <motion.span
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.02 }}
                        onClick={() => handleWordClick(word)}
                        className={`clickable-word me-1 rounded px-2 ${highlightedWord === word ? 'active-highlight' : ''}`}
                        role="button"
                        aria-label={`Read ${word}`}
                      >
                        {word}
                      </motion.span>
                    ))}
                  </div>
                  <div className="mt-5 p-4 theme-bg-body rounded-4 text-center">
                    <p className="mb-0 theme-text-secondary fs-5 fst-italic">
                      <FiBookOpen className="me-2 text-primary" /> 
                      Tip: Click any word to hear it spoken aloud.
                    </p>
                  </div>
                </Card.Body>
              </Card>

              <div className="mb-5 pt-4">
                <div className="d-flex align-items-center mb-5 justify-content-center">
                  <div className="bg-primary text-white rounded-circle p-3 me-3 shadow-lg">
                    <FiCheckCircle size={32} />
                  </div>
                  <h3 className="display-6 mb-0 fw-bold theme-text-primary">Let's check what we learned!</h3>
                </div>

                {story.questions.map((q: any, idx: number) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + idx * 0.1 }}
                  >
                    <Card className="mb-4 border-2 shadow-sm rounded-4 p-4 p-md-5 theme-bg-surface">
                      <Card.Body className="p-0">
                        <div className="d-flex align-items-start mb-4">
                          <Badge bg="primary" className="rounded-circle p-3 me-4 fs-5" style={{ width: '48px', height: '48px' }}>
                            {idx + 1}
                          </Badge>
                          <h4 className="display-6 mb-0 pt-1 lh-sm theme-text-primary">{q.question}</h4>
                        </div>
                        <Row className="g-4">
                          {q.options.map((option: string, oIdx: number) => (
                            <Col key={oIdx} sm={12}>
                              <Button
                                variant={
                                  showResults
                                    ? (oIdx === q.answerIndex ? 'success' : (answers[idx] === oIdx ? 'danger' : 'outline-light border-2 theme-text-secondary theme-bg-body'))
                                    : (answers[idx] === oIdx ? 'primary' : 'outline-primary border-2')
                                }
                                className={`w-100 text-start py-4 px-4 rounded-4 fs-4 d-flex justify-content-between align-items-center border-2 transition-all shadow-sm ${!showResults && answers[idx] === oIdx ? 'fw-bold' : ''}`}
                                onClick={() => !showResults && handleAnswer(idx, oIdx)}
                                disabled={showResults}
                              >
                                {option}
                                {showResults && oIdx === q.answerIndex && <FiCheckCircle size={28} />}
                              </Button>
                            </Col>
                          ))}
                        </Row>
                      </Card.Body>
                    </Card>
                  </motion.div>
                ))}

                {!showResults ? (
                  <div className="text-center mt-5 py-4">
                    <Button
                      variant="primary"
                      size="lg"
                      className="px-5 py-4 rounded-pill shadow-lg fs-4 fw-bold"
                      style={{ minWidth: '320px' }}
                      disabled={answers.length < story.questions.length}
                      onClick={handleShowResults}
                    >
                      Check My Answers <FiArrowRight className="ms-2" />
                    </Button>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <Card className="text-center p-5 border-2 shadow-lg rounded-4 theme-bg-surface mt-5 overflow-hidden">
                      <div className="display-1 mb-4">
                        {score === story.questions.length ? '🎉' : '👏'}
                      </div>
                      <h2 className="display-4 fw-bold mb-3 text-primary">
                        You got {score} out of {story.questions.length} right!
                      </h2>
                      <p className="lead fs-3 theme-text-secondary mb-5 px-md-5">
                        {score === story.questions.length 
                          ? "Perfect score! You're making amazing progress today." 
                          : "Great effort! Every story makes you a better reader."}
                      </p>
                      <div className="d-flex flex-column flex-md-row justify-content-center gap-4">
                        <Button 
                          variant="primary" 
                          size="lg" 
                          onClick={handleGenerateStory} 
                          className="px-5 py-4 rounded-pill fs-4 fw-bold shadow"
                        >
                          Read Next Story <FiArrowRight className="ms-2" />
                        </Button>
                        <Button 
                          variant="outline-primary" 
                          size="lg" 
                          onClick={() => setStory(null)} 
                          className="px-5 py-4 rounded-pill fs-4 fw-bold border-2"
                        >
                          <FiRotateCcw className="me-2" /> Change Topic
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default Learning;
