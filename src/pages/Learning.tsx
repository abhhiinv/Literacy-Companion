import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Spinner, Alert, Card, Form, ProgressBar } from 'react-bootstrap';
import { generateStory } from '../services/gemini';
import { useAuth } from '../context/AuthContext';
import { FiVolume2, FiRotateCcw, FiArrowRight, FiCheckCircle } from 'react-icons/fi';

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

  useEffect(() => {
    if (userData?.readingLevel) {
      setLevel(userData.readingLevel);
    }
  }, [userData]);

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
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.8; // Slower for learning
    window.speechSynthesis.speak(utterance);
  };

  const handleWordClick = (word: string) => {
    setHighlightedWord(word);
    const cleanWord = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
    handleSpeech(cleanWord);
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
            <div className="text-center">
              <h1 className="display-5 fw-bold mb-4">What would you like to read today?</h1>
              <p className="lead text-muted mb-5">Pick a topic and we'll create a story just for you.</p>

              <Row className="mb-4 text-start">
                <Col sm={6}>
                  <Card className="border-0 shadow-sm p-3 mb-3">
                    <Form.Group>
                      <Form.Label className="fw-bold h5">My Level:</Form.Label>
                      <Form.Select
                        value={level}
                        onChange={(e) => setLevel(e.target.value)}
                        size="lg"
                        className="border-0 bg-light"
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </Form.Select>
                    </Form.Group>
                  </Card>
                </Col>
                <Col sm={6}>
                  <Card className="border-0 shadow-sm p-3 mb-3">
                    <Form.Group>
                      <Form.Label className="fw-bold h5">Story Topic:</Form.Label>
                      <Form.Select
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        size="lg"
                        className="border-0 bg-light"
                      >
                        <option value="everyday life">🏠 Everyday Life</option>
                        <option value="work">💼 Working</option>
                        <option value="shopping">🛒 Shopping</option>
                        <option value="family">👨‍👩‍👧 Family</option>
                        <option value="hobbies">🎨 Hobbies</option>
                        <option value="health">🍎 Health</option>
                      </Form.Select>
                    </Form.Group>
                  </Card>
                </Col>
              </Row>
              <Button
                variant="primary"
                size="lg"
                onClick={handleGenerateStory}
                disabled={loading}
                className="px-5 py-3 shadow rounded-pill"
              >
                {loading ? <><Spinner animation="border" size="sm" className="me-2" /> Creating your story...</> : 'Generate My Story'}
              </Button>
              {error && <Alert variant="danger" className="mt-4">{error}</Alert>}
            </div>
          ) : (
            <div className="animate__animated animate__fadeIn">
              <Card className="shadow-lg border-0 mb-5 overflow-hidden rounded-4">
                <Card.Header className="bg-primary text-white py-4 px-4 d-flex justify-content-between align-items-center">
                  <h2 className="h3 mb-0">{story.title}</h2>
                  <Button variant="light" size="sm" onClick={() => handleSpeech(story.content)} className="rounded-circle p-2">
                    <FiVolume2 size={24} />
                  </Button>
                </Card.Header>
                <Card.Body className="p-4 p-md-5">
                  <div className="story-content fs-3 lh-lg text-dark">
                    {story.content.split(' ').map((word: string, i: number) => (
                      <span
                        key={i}
                        onClick={() => handleWordClick(word)}
                        className={`clickable-word me-1 rounded px-1 cursor-pointer transition-all ${highlightedWord === word ? 'bg-warning' : 'hover-bg-light'}`}
                        style={{ cursor: 'pointer', transition: 'background-color 0.2s' }}
                      >
                        {word}
                      </span>
                    ))}
                  </div>
                </Card.Body>
              </Card>

              <div className="mb-5">
                <div className="d-flex align-items-center mb-4">
                  <div className="bg-primary text-white rounded-circle p-2 me-3">
                    <FiCheckCircle size={24} />
                  </div>
                  <h3 className="mb-0">Quiz Time</h3>
                </div>

                {story.questions.map((q: any, idx: number) => (
                  <Card key={idx} className="mb-4 border-0 shadow-sm rounded-4 p-3">
                    <Card.Body>
                      <h4 className="mb-4">{q.question}</h4>
                      <Row className="g-3">
                        {q.options.map((option: string, oIdx: number) => (
                          <Col key={oIdx} sm={12}>
                            <Button
                              variant={
                                showResults
                                  ? (oIdx === q.answerIndex ? 'success' : (answers[idx] === oIdx ? 'danger' : 'outline-secondary'))
                                  : (answers[idx] === oIdx ? 'primary' : 'outline-primary')
                              }
                              className="w-100 text-start py-3 px-4 rounded-3 fs-5 d-flex justify-content-between align-items-center"
                              onClick={() => !showResults && handleAnswer(idx, oIdx)}
                              disabled={showResults}
                            >
                              {option}
                              {showResults && oIdx === q.answerIndex && <FiCheckCircle />}
                            </Button>
                          </Col>
                        ))}
                      </Row>
                    </Card.Body>
                  </Card>
                ))}

                {!showResults ? (
                  <div className="text-center mt-5">
                    <Button
                      variant="primary"
                      size="lg"
                      className="px-5 py-3 rounded-pill shadow"
                      disabled={answers.length < story.questions.length}
                      onClick={handleShowResults}
                    >
                      Check My Answers <FiArrowRight className="ms-2" />
                    </Button>
                  </div>
                ) : (
                  <Card className="text-center p-5 border-0 shadow rounded-4 bg-white mt-5">
                    <div className="display-1 mb-3">
                      {score === story.questions.length ? '🎉' : '👏'}
                    </div>
                    <h2 className="mb-3">You got {score} out of {story.questions.length} right!</h2>
                    <p className="lead text-muted mb-4">Great job practicing today. Every bit counts!</p>
                    <div className="d-flex justify-content-center gap-3">
                      <Button variant="primary" size="lg" onClick={handleGenerateStory} className="px-4 rounded-pill">
                        Next Story <FiArrowRight className="ms-2" />
                      </Button>
                      <Button variant="outline-secondary" size="lg" onClick={() => setStory(null)} className="px-4 rounded-pill">
                        <FiRotateCcw className="me-2" /> Change Topic
                      </Button>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default Learning;
