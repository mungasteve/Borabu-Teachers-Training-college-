import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import NotificationBell from "@/components/NotificationBell";
import ContrastToggle from "@/components/ContrastToggle";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login?redirect=/dashboard");
  }

  if (user.role !== "applicant") {
    redirect("/admin");
  }

  return (
    <div className="app-container" style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column', background: 'var(--bg-main)' }}>
      {/* Portal Header */}
      <header className="main-header" style={{ position: 'static' }}>
        <div className="container nav-container" style={{ height: 'auto', minHeight: '70px', padding: '10px 20px', flexWrap: 'wrap', gap: '12px' }}>
          <Link href="/" className="logo-link">
            <div className="logo-icon">B</div>
            <div className="logo-text">
              <h1 className="logo-title">BORABU TTC</h1>
              <div className="logo-tagline">Trainee Admissions Portal</div>
            </div>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <ContrastToggle />
            <NotificationBell />
            <span style={{ fontSize: '13px', color: 'var(--text-light)' }} className="portal-user-welcome">
              Welcome, <strong>{user.fullName}</strong>
            </span>
            <Link href="/" className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
              College Site
            </Link>
          </div>
        </div>
      </header>

      {/* Main Panel layout */}
      <div className="container portal-layout-grid">
        {/* Sidebar Nav */}
        <aside className="portal-sidebar-nav">
          <div style={{ padding: '8px 12px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-light)', letterSpacing: '1px' }}>
            Trainee Portal
          </div>
          <Link 
            href="/dashboard" 
            className="btn portal-nav-link" 
            style={{ 
              justifyContent: 'flex-start', 
              padding: '10px 14px', 
              fontSize: '13px',
              border: 'none',
              background: 'transparent',
              color: 'var(--text-dark)',
            }}
          >
            📊 Portal Dashboard
          </Link>
          <Link 
            href="/dashboard/apply" 
            className="btn btn-primary portal-apply-btn" 
            style={{ 
              justifyContent: 'center', 
              padding: '10px 14px', 
              fontSize: '13px',
              margin: '4px 0',
            }}
          >
            ➕ Apply For a Course
          </Link>
          <Link 
            href="/dashboard/settings" 
            className="btn portal-nav-link" 
            style={{ 
              justifyContent: 'flex-start', 
              padding: '10px 14px', 
              fontSize: '13px',
              border: 'none',
              background: 'transparent',
              color: 'var(--text-dark)',
            }}
          >
            ⚙️ Account Settings
          </Link>
          <Link 
            href="/dashboard/tickets" 
            className="btn portal-nav-link" 
            style={{ 
              justifyContent: 'flex-start', 
              padding: '10px 14px', 
              fontSize: '13px',
              border: 'none',
              background: 'transparent',
              color: 'var(--text-dark)',
            }}
          >
            💬 Support Tickets
          </Link>
          
          <div className="portal-help-box" style={{ marginTop: 'auto', borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
            <div style={{ padding: '8px 12px', background: 'rgba(37, 99, 235, 0.05)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(37, 99, 235, 0.1)' }}>
              <h5 style={{ fontSize: '12px', color: 'var(--primary-blue)', marginBottom: '4px' }}>Admissions Helpdesk</h5>
              <p style={{ fontSize: '11px', color: 'var(--text-light)', margin: 0 }}>
                Direct Hotline: <br />
                <strong>0746 211 764 / 0727 433 205</strong>
              </p>
            </div>
          </div>
        </aside>

        {/* Content body */}
        <main style={{ minWidth: 0, width: '100%' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
