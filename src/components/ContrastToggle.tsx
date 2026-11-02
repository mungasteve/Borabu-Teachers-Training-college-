'use client';

import { useEffect, useState } from 'react';
import { SunMoon } from 'lucide-react';

export default function ContrastToggle() {
  const [contrast, setContrast] = useState(false);

  useEffect(() => {
    const isContrast = localStorage.getItem('contrast-mode') === 'true';
    setContrast(isContrast);
    if (isContrast) {
      document.body.classList.add('theme-contrast');
    } else {
      document.body.classList.remove('theme-contrast');
    }
  }, []);

  const toggleContrast = () => {
    const nextState = !contrast;
    setContrast(nextState);
    localStorage.setItem('contrast-mode', String(nextState));
    if (nextState) {
      document.body.classList.add('theme-contrast');
    } else {
      document.body.classList.remove('theme-contrast');
    }
  };

  return (
    <button
      type="button"
      onClick={toggleContrast}
      title={contrast ? 'Switch to Standard Theme' : 'Switch to High Contrast Mode'}
      aria-label={contrast ? 'Switch to Standard Theme' : 'Switch to High Contrast Mode'}
      aria-pressed={contrast}
      style={{
        width: '38px',
        height: '38px',
        padding: 0,
        margin: 0,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 'var(--radius-sm)',
        border: contrast ? '2px solid var(--primary-blue)' : '1px solid var(--border-light)',
        background: contrast ? 'var(--primary-light)' : 'transparent',
        color: 'var(--text-dark)',
        cursor: 'pointer',
        flexShrink: 0,
        transition: 'var(--transition-fast)',
      }}
    >
      <SunMoon size={18} strokeWidth={2} />
    </button>
  );
}
