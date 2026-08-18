'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ContrastToggle from '../ContrastToggle';

interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function checkSession() {
      try {
        const res = await fetch('/api/auth/me', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (isMounted) setUser(data.user);
        } else {
          if (isMounted) setUser(null);
        }
      } catch {
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    checkSession();

    return () => {
      isMounted = false;
    };
  }, []);

  // Close mobile drawer whenever route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        setUser(null);
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      console.error('Failed to logout:', err);
    }
  };

  const isLinkActive = (path: string) => {
    return pathname === path ? 'active' : '';
  };

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/programmes', label: 'Programmes' },
    { href: '/admissions', label: 'Admissions' },
    { href: '/fees', label: 'Fees' },
    { href: '/gallery', label: 'Gallery' },
    { href: '/news', label: 'News' },
    { href: '/faqs', label: 'FAQs' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <header className="main-header" id="site-main-header">
      <div className="container nav-container">
        <Link href="/" className="logo-link" id="nav-brand-logo">
          <div className="logo-icon">B</div>
          <div className="logo-text">
            <h1 className="logo-title">BORABU TTC</h1>
            <div className="logo-tagline">Teachers Training College</div>
          </div>
        </Link>

        {/* Desktop Menu */}
        <nav className="desktop-nav" aria-label="Main Desktop Navigation">
          <ul className="nav-menu">
            {navLinks.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={`nav-link ${isLinkActive(item.href)}`}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Desktop CTA & Controls */}
        <div className="nav-cta desktop-cta">
          <ContrastToggle />
          {loading ? (
            <span style={{ fontSize: '14px', color: 'var(--text-light)' }}>Loading...</span>
          ) : user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Link 
                href={user.role === 'applicant' ? '/dashboard' : '/admin'} 
                className="btn btn-secondary"
                style={{ fontSize: '13px', padding: '8px 16px' }}
                id="nav-user-dashboard-btn"
              >
                {user.role === 'applicant' ? 'Portal Dashboard' : 'Admin Area'}
              </Link>
              <button 
                onClick={handleLogout} 
                className="btn btn-primary"
                style={{ fontSize: '13px', padding: '8px 16px', background: 'hsl(0, 72%, 51%)' }}
                id="nav-user-logout-btn"
              >
                Logout
              </button>
            </div>
          ) : (
            <>
              <Link href="/login" className="btn btn-secondary" id="nav-login-btn">
                Login
              </Link>
              <Link href="/register" className="btn btn-primary" id="nav-apply-btn">
                Apply Now
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger & Action Button */}
        <div className="mobile-nav-toggle-wrap">
          <ContrastToggle />
          <button
            type="button"
            className="mobile-hamburger-btn"
            id="mobile-menu-toggle-button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <span style={{ fontSize: '24px', lineHeight: 1 }}>✕</span>
            ) : (
              <span style={{ fontSize: '24px', lineHeight: 1 }}>☰</span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer / Overlay Navigation */}
      {mobileMenuOpen && (
        <div className="mobile-nav-drawer" id="mobile-navigation-drawer">
          <nav aria-label="Mobile Navigation">
            <ul className="mobile-nav-list">
              {navLinks.map((item) => (
                <li key={item.href}>
                  <Link 
                    href={item.href} 
                    className={`mobile-nav-link ${isLinkActive(item.href)}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mobile-nav-actions">
              {user ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
                  <Link 
                    href={user.role === 'applicant' ? '/dashboard' : '/admin'} 
                    className="btn btn-secondary"
                    style={{ width: '100%', padding: '12px' }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {user.role === 'applicant' ? '📊 Trainee Dashboard' : '⚙️ Admin Area'}
                  </Link>
                  <button 
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }} 
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '12px', background: 'hsl(0, 72%, 51%)' }}
                  >
                    Log Out
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
                  <Link 
                    href="/login" 
                    className="btn btn-secondary"
                    style={{ width: '100%', padding: '12px' }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Applicant Login
                  </Link>
                  <Link 
                    href="/register" 
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '12px' }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Apply for Admission
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
