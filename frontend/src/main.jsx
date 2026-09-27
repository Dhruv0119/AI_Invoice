import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { ClerkProvider } from '@clerk/clerk-react';
import { BrowserRouter } from 'react-router-dom';
import logo from './assets/logo.png';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
if (!PUBLISHABLE_KEY) {
  throw new Error('Add your publishable key to the .env file');
}

const SplashGate = () => {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowSplash(false), 1750);
    return () => window.clearTimeout(timer);
  }, []);

  if (showSplash) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '1rem',
        background: 'linear-gradient(135deg, #eef2ff 0%, #f8fafc 100%)',
        color: '#4338ca',
        fontFamily: 'Inter, sans-serif'
      }}>
        <img src={logo} alt="AI Invoice logo" style={{ width: '96px', height: '96px', borderRadius: '24px', objectFit: 'cover', boxShadow: '0 20px 45px rgba(79, 70, 229, 0.18)' }} />
        <div style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.03em' }}>AIInvoice</div>
      </div>
    );
  }

  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ClerkProvider>
  );
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SplashGate />
  </StrictMode>
);

export default SplashGate;

