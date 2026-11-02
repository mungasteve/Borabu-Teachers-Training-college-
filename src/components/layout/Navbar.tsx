'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Menu, X, ArrowRight } from 'lucide-react';
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
  const [moreOpen, setMoreOpen] = useState(false);
  const dropdownRef = useRef<HTMLLIElement>(null);

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

  // Close menus whenever route changes
  useEffect(() => {
    setMobileMenuOpen(false);
    setMoreOpen(false);
  }, [pathname]);

  // Close desktop More dropdown on outside click or Escape
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setMoreOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

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
    if (path === '/') return pathname === '/' ? 'active' : '';
    return pathname === path || pathname.startsWith(`${path}/`) ? 'active' : '';
  };

  const primaryNavLinks = [
    { href: '/programmes', label: 'Programmes' },
    { href: '/admissions', label: 'Admissions' },
    { href: '/fees', label: 'Fee Structure' },
    { href: '/gallery', label: 'Campus Life' },
    { href: '/about', label: 'About' },
  ];

  const secondaryNavLinks = [
    { href: '/news', label: 'News & Notices' },
    { href: '/faqs', label: 'Admissions FAQs' },
    { href: '/verify/check', label: 'Verify Letter' },
    { href: '/contact', label: 'Contact Us' },
  ];

  const allMobileLinks = [
    { href: '/', label: 'Home' },
    ...primaryNavLinks,
    ...secondaryNavLinks,
  ];

  const isMoreActive = secondaryNavLinks.some((item) => isLinkActive(item.href) === 'active');

  return (
    <header className="main-header" id="site-main-header">
      <div className="container nav-container">
        {/* Zone 1: Clean Single-Line Brand Wordmark */}
        <Link href="/" className="logo-link" id="nav-brand-logo">
          <div className="logo-icon" aria-hidden="true">B</div>
          <span className="logo-title">BORABU TTC</span>
        </Link>

        {/* Zone 2: Concise Primary Navigation */}
        <nav className="desktop-nav" aria-label="Main Desktop Navigation">
          <ul className="nav-menu">
            {primaryNavLinks.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={`nav-link ${isLinkActive(item.href)}`}>
                  {item.label}
                </Link>
              </li>
            ))}

            {/* Secondary Institutional Pages Dropdown */}
            <li className="nav-dropdown" ref={dropdownRef}>
              <button
                type="button"
                className={`nav-link ${isMoreActive ? 'active' : ''}`}
                onClick={() => setMoreOpen((prev) => !prev)}
                aria-expanded={moreOpen}
                aria-haspopup="true"
              >
                <span>Resources</span>
                <ChevronDown
                  size={15}
                  style={{
                    transform: moreOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.15s ease',
                  }}
                />
              </button>

              {moreOpen && (
                <ul className="nav-dropdown-menu" role="menu">
                  {secondaryNavLinks.map((item) => (
                    <li key={item.href} role="none">
                      <Link
                        href={item.href}
                        role="menuitem"
                        className={`nav-dropdown-link ${isLinkActive(item.href)}`}
                        onClick={() => setMoreOpen(false)}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          </ul>
        </nav>

        {/* Zone 3: Compact Utility & Single Primary CTA */}
        <div className="nav-cta desktop-cta">
          <ContrastToggle />
          {loading ? (
            <span style={{ fontSize: '13px', color: 'var(--text-light)' }}>...</span>
          ) : user ? (
            <>
              <Link
                href={user.role === 'applicant' ? '/dashboard' : '/admin'}
                className="btn btn-secondary"
                style={{ padding: '8px 14px', fontSize: '13px' }}
                id="nav-user-dashboard-btn"
              >
                {user.role === 'applicant' ? 'Portal' : 'Admin'}
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="btn btn-danger"
                style={{ padding: '8px 14px', fontSize: '13px' }}
                id="nav-user-logout-btn"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="nav-signin-link" id="nav-login-btn">
                Sign In
              </Link>
              <Link href="/register" className="btn btn-primary" id="nav-apply-btn">
                <span>Apply Online</span>
                <ArrowRight size={15} />
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger & Contrast Button */}
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
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="mobile-nav-drawer" id="mobile-navigation-drawer">
          <nav aria-label="Mobile Navigation">
            <ul className="mobile-nav-list">
              {allMobileLinks.map((item) => (
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
                    {user.role === 'applicant' ? 'Applicant Dashboard' : 'Admin Dashboard'}
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="btn btn-danger"
                    style={{ width: '100%', padding: '12px' }}
                  >
                    Sign Out
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
