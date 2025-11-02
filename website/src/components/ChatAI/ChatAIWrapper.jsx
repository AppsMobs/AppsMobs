import { Component } from 'react';
import ChatAI from './ChatAI';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ChatAI Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Silently fail - don't show error to user
      return null;
    }

    return this.props.children;
  }
}

export default function ChatAIWrapper() {
  // Ensure component renders even if there's an error
  try {
    return (
      <ErrorBoundary>
        <ChatAI />
      </ErrorBoundary>
    );
  } catch (error) {
    console.error('ChatAIWrapper error:', error);
    // Return a minimal fallback button
    return (
      <button
        onClick={() => alert('Chat AI is temporarily unavailable. Please refresh the page.')}
        className="fixed bottom-6 right-6 z-[9999] w-16 h-16 bg-cyan hover:bg-cyan-600 rounded-full shadow-2xl flex items-center justify-center"
        aria-label="Chat AI"
      >
        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>
    );
  }
}

