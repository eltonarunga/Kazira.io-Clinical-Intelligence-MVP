import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';

// Global resilience handlers for iframe/cross-origin security and sandbox environments
window.addEventListener('error', (event) => {
  console.warn('Caught global window error:', event.message, 'at', event.filename, ':', event.lineno);
});

window.addEventListener('unhandledrejection', (event) => {
  console.warn('Caught global unhandled promise rejection:', event.reason);
});

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
}
