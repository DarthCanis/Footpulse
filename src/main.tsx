import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { MatchProvider } from './context/MatchContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MatchProvider>
      <App />
    </MatchProvider>
  </StrictMode>,
);
