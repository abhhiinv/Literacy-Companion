import { useState, useEffect, useCallback } from 'react';

export const useSpeech = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState<number | null>(null);

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const handleSpeech = useCallback((text: string) => {
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    window.speechSynthesis.cancel();
    const trimmedText = text.trim();
    const utterance = new SpeechSynthesisUtterance(trimmedText);
    utterance.rate = 0.8;
    utterance.lang = 'en-US';
    
    // Split words exactly like the UI does
    const words = trimmedText.split(/\s+/);
    
    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };

    utterance.onboundary = (event) => {
      if (event.name === 'word' || !event.name) {
        const charIndex = event.charIndex;
        let currentPos = 0;
        
        for (let i = 0; i < words.length; i++) {
          const word = words[i];
          // Find the actual start of this word in the text starting from currentPos
          const wordStart = trimmedText.indexOf(word, currentPos);
          
          if (charIndex >= wordStart && charIndex < wordStart + word.length) {
            setCurrentWordIndex(i);
            break;
          }
          currentPos = wordStart + word.length;
        }
      }
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentWordIndex(null);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentWordIndex(null);
    };

    window.speechSynthesis.speak(utterance);
  }, [isPaused]);

  const handlePause = useCallback(() => {
    window.speechSynthesis.pause();
    setIsPaused(true);
    setIsPlaying(false);
  }, []);

  const handleStop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentWordIndex(null);
  }, []);

  const handleWordClick = useCallback((word: string, index: number) => {
    // We don't want to interrupt full narration if possible, 
    // but usually clicking a word implies focusing on it.
    // However, to keep it simple and non-disruptive to the state:
    const cleanWord = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanWord);
    utterance.rate = 0.8;
    
    // If not currently narrating full story, show highlight
    if (!isPlaying && !isPaused) {
        setCurrentWordIndex(index);
        utterance.onend = () => setCurrentWordIndex(null);
        // Fallback
        setTimeout(() => setCurrentWordIndex(null), 1000);
    }
    
    window.speechSynthesis.speak(utterance);
  }, [isPlaying, isPaused]);

  return {
    isPlaying,
    isPaused,
    currentWordIndex,
    handleSpeech,
    handlePause,
    handleStop,
    handleWordClick,
    setCurrentWordIndex
  };
};
