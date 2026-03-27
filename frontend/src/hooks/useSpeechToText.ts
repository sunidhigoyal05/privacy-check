import { useState, useCallback, useRef } from 'react';

interface UseSpeechToTextReturn {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  startListening: (onResult: (text: string, isFinal: boolean) => void) => void;
  stopListening: () => void;
}

// Web Speech API types
interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  [index: number]: { transcript: string; confidence: number };
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: { results: SpeechRecognitionResultList; resultIndex: number }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

export function useSpeechToText(): UseSpeechToTextReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const callbackRef = useRef<((text: string, isFinal: boolean) => void) | null>(null);
  const finalTranscriptRef = useRef('');
  const stoppingRef = useRef(false);

  const SpeechRecognitionAPI = typeof window !== 'undefined' 
    ? (window.SpeechRecognition || window.webkitSpeechRecognition) 
    : null;
  const isSupported = !!SpeechRecognitionAPI;

  const stopListening = useCallback(() => {
    if (!recognitionRef.current || stoppingRef.current) return;
    
    stoppingRef.current = true;
    
    // Use stop() instead of abort() to allow final processing
    try {
      recognitionRef.current.stop();
    } catch (e) {
      // Recognition might already be stopped
      console.log('Stop called on inactive recognition');
    }
  }, []);

  const startListening = useCallback((onResult: (text: string, isFinal: boolean) => void) => {
    if (!SpeechRecognitionAPI) {
      console.log('Speech API not supported');
      return;
    }
    if (recognitionRef.current) {
      console.log('Already listening');
      return;
    }

    // Reset state
    finalTranscriptRef.current = '';
    stoppingRef.current = false;
    callbackRef.current = onResult;
    setTranscript('');

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;  // Enable interim results for real-time feedback
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let newFinalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result && result[0]) {
          const text = result[0].transcript;
          if (result.isFinal) {
            newFinalTranscript += text;
          } else {
            interimTranscript += text;
          }
        }
      }
      
      // Update final transcript
      if (newFinalTranscript) {
        finalTranscriptRef.current += newFinalTranscript;
      }
      
      // Build full transcript for display
      const fullTranscript = finalTranscriptRef.current + interimTranscript;
      setTranscript(fullTranscript);
      
      // Call callback with current state
      if (callbackRef.current) {
        callbackRef.current(fullTranscript, false);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech error:', event.error);
      // Don't treat no-speech or aborted as fatal errors
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        recognitionRef.current = null;
        setIsListening(false);
        stoppingRef.current = false;
      }
    };

    recognition.onend = () => {
      const wasStopping = stoppingRef.current;
      const finalText = finalTranscriptRef.current.trim();
      
      if (wasStopping) {
        // User requested stop - send final result
        if (finalText && callbackRef.current) {
          callbackRef.current(finalText, true);
        }
        recognitionRef.current = null;
        setIsListening(false);
        setTranscript('');
        finalTranscriptRef.current = '';
        stoppingRef.current = false;
      } else if (recognitionRef.current) {
        // Auto-restart for continuous listening
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.error('Restart failed:', e);
          recognitionRef.current = null;
          setIsListening(false);
        }
      }
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
      setIsListening(true);
      console.log('Started listening');
    } catch (err) {
      console.error('Failed to start:', err);
      recognitionRef.current = null;
    }
  }, [SpeechRecognitionAPI]);

  return {
    isListening,
    isSupported,
    transcript,
    startListening,
    stopListening,
  };
}
