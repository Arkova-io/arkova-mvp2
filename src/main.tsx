/**
 * Arkova Application Entry Point
 *
 * Sentry is initialized BEFORE React renders to capture all errors.
 * PII scrubbing is mandatory (Constitution 1.4 + 1.6).
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { initSentry } from './lib/sentry';
import { App } from './App';
import './index.css';

// Initialize Sentry before rendering — PII scrubbing enabled, sendDefaultPii=false
initSentry();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
