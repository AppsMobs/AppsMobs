import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function ChatAI() {
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '👋 Hello! I\'m your AppsMobs AI assistant. How can I help you today? You can ask me about installation, scripts, licenses, device connection, or anything AppsMobs-related!',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [needsHuman, setNeedsHuman] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(() => {
    // Load voice preference from localStorage, default to true
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('chatAI_voiceEnabled');
      return saved !== null ? JSON.parse(saved) : true;
    }
    return true;
  });
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);

  // Initialize speech recognition
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
          recognitionRef.current = new SpeechRecognition();
          recognitionRef.current.continuous = false;
          recognitionRef.current.interimResults = false;
          recognitionRef.current.lang = 'en-US';

          recognitionRef.current.onresult = (event) => {
            if (event.results && event.results[0] && event.results[0][0]) {
              const transcript = event.results[0][0].transcript;
              setInput(transcript);
            }
            setIsRecording(false);
          };

          recognitionRef.current.onerror = () => {
            setIsRecording(false);
          };

          recognitionRef.current.onend = () => {
            setIsRecording(false);
          };
        }
      }
    } catch (error) {
      console.warn('Speech recognition initialization error:', error);
    }
  }, []);

  const startRecording = () => {
    try {
      if (recognitionRef.current && !isRecording) {
        setIsRecording(true);
        recognitionRef.current.start();
      }
    } catch (error) {
      console.warn('Speech recognition start error:', error);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    try {
      if (recognitionRef.current && isRecording) {
        recognitionRef.current.stop();
        setIsRecording(false);
      }
    } catch (error) {
      console.warn('Speech recognition stop error:', error);
      setIsRecording(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input.trim();
    setInput('');
    setLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      const conversationHistory = messages
        .filter(m => m.role !== 'system')
        .map(m => ({ role: m.role, content: m.content }));

      const response = await fetch(`${API_URL}/api/chat-ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          message: currentInput,
          conversation_history: conversationHistory
        })
      });

      const data = await response.json();

      // Validation: s'assurer que la réponse existe et n'est pas vide
      if (!data || !data.response || typeof data.response !== 'string' || data.response.trim().length === 0) {
        console.error('Empty or invalid response from server:', data);
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'Désolé, je n\'ai pas pu générer de réponse. Veuillez réessayer ou contacter le support si le problème persiste. (Sorry, I couldn\'t generate a response. Please try again or contact support if the issue persists.)',
          timestamp: new Date(),
          error: true
        }]);
        setLoading(false);
        return;
      }

      const assistantMessage = {
        role: 'assistant',
        content: data.response.trim(),
        timestamp: new Date(),
        needsHuman: data.needsHuman
      };

      setMessages(prev => [...prev, assistantMessage]);
      setNeedsHuman(data.needsHuman || false);

      // Text-to-speech for assistant responses (optional, non-blocking)
      // Only if voice is enabled
      if (voiceEnabled && typeof window !== 'undefined' && 'speechSynthesis' in window && isOpen) {
        try {
          // Cancel any ongoing speech before starting new one
          window.speechSynthesis.cancel();
          const utterance = new window.SpeechSynthesisUtterance(data.response);
          utterance.rate = 0.9;
          utterance.pitch = 1;
          utterance.volume = 0.8;
          utterance.onerror = (e) => console.warn('TTS error:', e);
          window.speechSynthesis.speak(utterance);
        } catch (error) {
          // Silently fail - TTS is optional
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      
      // Détecter le type d'erreur
      let errorMessage;
      if (error.message?.includes('Failed to fetch') || error.message?.includes('ERR_CONNECTION_REFUSED')) {
        errorMessage = 'Le serveur backend n\'est pas accessible. Assurez-vous que le serveur d\'authentification est démarré sur le port 3001. (Backend server is not accessible. Make sure the auth server is running on port 3001.)';
      } else if (error.message?.includes('Network')) {
        errorMessage = 'Erreur de connexion réseau. Vérifiez votre connexion Internet. (Network connection error. Check your Internet connection.)';
      } else {
        errorMessage = 'Désolé, une erreur s\'est produite. Veuillez réessayer. (Sorry, an error occurred. Please try again.)';
      }
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: errorMessage,
        timestamp: new Date(),
        error: true
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([{
      role: 'assistant',
      content: '👋 Hello! I\'m your AppsMobs AI assistant. How can I help you today?',
      timestamp: new Date()
    }]);
    setNeedsHuman(false);
    // Cancel any ongoing speech when clearing chat
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  const toggleVoice = () => {
    const newValue = !voiceEnabled;
    setVoiceEnabled(newValue);
    // Save preference to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('chatAI_voiceEnabled', JSON.stringify(newValue));
    }
    // If disabling, cancel any ongoing speech
    if (!newValue && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  const supportsSpeech = typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);

  return (
    <>
      {/* Chat Button - Fixed Bottom Right */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-[9999] w-16 h-16 bg-gradient-to-br from-cyan to-cyan-600 hover:from-cyan-500 hover:to-cyan-700 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 group"
          aria-label="Open AI Chat"
          style={{ position: 'fixed' }}
        >
          <div className="relative">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            {/* Pulse animation */}
            <span className="absolute inset-0 rounded-full bg-cyan animate-ping opacity-75"></span>
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-[9999] w-[420px] h-[700px] bg-gradient-to-br from-bg via-bg/95 to-bg border border-cyan/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl" style={{ position: 'fixed' }}>
          {/* Header */}
          <div className="bg-gradient-to-r from-cyan/20 via-cyan/10 to-transparent border-b border-cyan/20 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan to-cyan-600 rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                {/* Online indicator */}
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-bg"></div>
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">AI Assistant</h3>
                <p className="text-xs text-cyan/80">AppsMobs Support</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={toggleVoice}
                className={`p-2 rounded-lg transition ${
                  voiceEnabled
                    ? 'text-cyan hover:text-cyan/80 hover:bg-cyan/10'
                    : 'text-white/40 hover:text-white/60 hover:bg-white/10'
                }`}
                title={voiceEnabled ? 'Disable voice (mute)' : 'Enable voice (unmute)'}
              >
                {voiceEnabled ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                  </svg>
                )}
              </button>
              <button
                onClick={clearChat}
                className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition"
                title="Clear chat"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
              <button
                onClick={() => {
                  // Cancel speech when closing
                  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                    window.speechSynthesis.cancel();
                  }
                  setIsOpen(false);
                }}
                className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition"
                title="Close chat"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-4 ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-cyan/30 to-cyan/20 text-white border border-cyan/30 shadow-lg'
                      : 'bg-white/5 backdrop-blur-sm text-white/90 border border-white/10 shadow-md'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  {msg.needsHuman && (
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <p className="text-xs text-yellow-300 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        For complex issues, contact our human support team
                      </p>
                    </div>
                  )}
                  <p className="text-xs text-white/40 mt-2">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                  <div className="flex gap-2">
                    <span className="w-2 h-2 bg-cyan rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-cyan rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-cyan rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-white/10 bg-bg/50 backdrop-blur-sm p-4">
            {needsHuman && (
              <div className="mb-3 p-3 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-lg">
                <p className="text-xs text-yellow-200 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  For urgent issues, contact support directly
                </p>
              </div>
            )}
            <div className="flex gap-2 items-end">
              {supportsSpeech && (
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  onMouseUp={isRecording ? stopRecording : undefined}
                  className={`p-2.5 rounded-lg transition ${
                    isRecording
                      ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30'
                      : 'bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/10'
                  }`}
                  title={isRecording ? 'Stop recording' : 'Voice input'}
                >
                  {isRecording ? (
                    <svg className="w-5 h-5 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 012 0v4a1 1 0 11-2 0V7zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              )}
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message or use voice..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan/50 focus:border-cyan/50 resize-none transition-all"
                rows={2}
                disabled={loading}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                className="p-2.5 bg-gradient-to-r from-cyan to-cyan-600 hover:from-cyan-500 hover:to-cyan-700 disabled:from-white/10 disabled:to-white/5 disabled:text-white/40 rounded-xl text-white transition-all shadow-lg disabled:shadow-none disabled:cursor-not-allowed"
              >
                {loading ? (
                  <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>
            </div>
            <p className="text-xs text-white/40 mt-2 flex items-center justify-between">
              <span>Free AI assistant • Press Enter to send</span>
              {supportsSpeech && (
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                  </svg>
                  Voice available
                </span>
              )}
            </p>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 212, 255, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 212, 255, 0.5);
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
