import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './app/App';
import { initializeObservability } from './shared/lib/observability';
import './styles/globals.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element was not found.');
}

initializeObservability();

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
