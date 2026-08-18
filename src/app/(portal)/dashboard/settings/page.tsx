'use client';

import { useEffect, useState } from 'react';
import { useToast } from '@/components/Toast';

export default function SettingsPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [mailingAddress, setMailingAddress] = useState('');
  const [kinName, setKinName] = useState('');
  const [kinPhone, setKinPhone] = useState('');
  const [kinRelation, setKinRelation] = useState('');
  
  // Security
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mfaEnabled, setMfaEnabled] = useState(false);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/auth/profile');
      if (res.ok) {
        const data = await res.json();
        const user = data.user;
        setFullName(user.fullName || '');
        setEmail(user.email || '');
        setPhone(user.phone || '');
        setMailingAddress(user.mailingAddress || '');
        setKinName(user.kinName || '');
        setKinPhone(user.kinPhone || '');
        setKinRelation(user.kinRelation || '');
        setMfaEnabled(user.mfaEnabled || false);
      } else {
        showToast('Failed to load settings profile.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error loading profile.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          phone,
          mailingAddress,
          kinName,
          kinPhone,
          kinRelation,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast('Contact and kin settings saved successfully.', 'success');
      } else {
        showToast(data.error || 'Failed to update profile.', 'error');
      }
    } catch (err) {
      showToast('An error occurred. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateSecurity = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword) {
      if (newPassword !== confirmPassword) {
        showToast('Passwords do not match.', 'error');
        return;
      }
      if (newPassword.length < 6) {
        showToast('Password must be at least 6 characters.', 'error');
        return;
      }
    }

    setSaving(true);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: newPassword || undefined,
          mfaEnabled,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast('Security settings updated successfully.', 'success');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        showToast(data.error || 'Failed to update credentials.', 'error');
      }
    } catch (err) {
      showToast('An error occurred. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        Loading configuration panel...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <div>
        <h1 style={{ fontSize: '28px' }}>Account Settings</h1>
        <p style={{ color: 'var(--text-light)', fontSize: '14px' }}>Manage your portal contact details and account security preferences.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px', alignItems: 'start' }}>
        
        {/* Left Form: Profile & Kin */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', padding: '30px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
          <form onSubmit={handleUpdateProfile}>
            <h3 style={{ fontSize: '18px', color: 'var(--text-dark)', marginBottom: '20px', borderBottom: '1px solid var(--border-light)', paddingBottom: '10px' }}>
              👤 Profile & Contact Details
            </h3>

            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address (Read-only)</label>
              <input
                type="email"
                disabled
                value={email}
                className="form-input"
                style={{ background: 'var(--bg-main)', color: 'var(--text-light)', cursor: 'not-allowed' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number *</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Mailing Address / Postal Code</label>
              <input
                type="text"
                placeholder="e.g. P.O. Box 45 - 40205, Nyansiongo"
                value={mailingAddress}
                onChange={(e) => setMailingAddress(e.target.value)}
                className="form-input"
              />
            </div>

            <h3 style={{ fontSize: '18px', color: 'var(--text-dark)', marginTop: '30px', marginBottom: '20px', borderBottom: '1px solid var(--border-light)', paddingBottom: '10px' }}>
              👥 Next of Kin Emergency Contacts
            </h3>

            <div className="form-group">
              <label className="form-label">Next of Kin Full Name</label>
              <input
                type="text"
                placeholder="Enter next of kin full name"
                value={kinName}
                onChange={(e) => setKinName(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label className="form-label">Kin Phone Contact</label>
                <input
                  type="tel"
                  placeholder="Enter contact phone number"
                  value={kinPhone}
                  onChange={(e) => setKinPhone(e.target.value)}
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Kin Relationship</label>
                <select
                  value={kinRelation}
                  onChange={(e) => setKinRelation(e.target.value)}
                  className="form-input"
                >
                  <option value="">Select Relation</option>
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Guardian">Guardian</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <button type="submit" disabled={saving} className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
              {saving ? 'Saving changes...' : 'Save Contact & Kin Information'}
            </button>
          </form>
        </div>

        {/* Right Form: Password reset & MFA */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', padding: '30px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
            <form onSubmit={handleUpdateSecurity}>
              <h3 style={{ fontSize: '18px', color: 'var(--text-dark)', marginBottom: '20px', borderBottom: '1px solid var(--border-light)', paddingBottom: '10px' }}>
                🔒 Security & Password Update
              </h3>

              <div className="form-group">
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input
                  type="password"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="form-input"
                />
              </div>

              <div style={{ margin: '24px 0', borderTop: '1px solid var(--border-light)', paddingTop: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <input
                    type="checkbox"
                    id="mfa"
                    checked={mfaEnabled}
                    onChange={(e) => setMfaEnabled(e.target.checked)}
                    style={{ width: '18px', height: '18px', marginTop: '3px', cursor: 'pointer' }}
                  />
                  <div>
                    <label htmlFor="mfa" style={{ fontWeight: '600', fontSize: '14px', cursor: 'pointer', color: 'var(--text-dark)' }}>
                      🛡️ Enable Multi-Factor Authentication (MFA)
                    </label>
                    <p style={{ fontSize: '11px', color: 'var(--text-light)', marginTop: '4px' }}>
                      Require a secondary security code from your Google Authenticator/Duo app.
                    </p>
                  </div>
                </div>

                {mfaEnabled && (
                  <div style={{ marginTop: '20px', padding: '16px', background: 'var(--bg-main)', border: '1px dashed var(--accent-teal)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                    <p style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-dark)', marginBottom: '10px' }}>
                      MFA Scan Code Verification
                    </p>
                    
                    {/* Simulated SVG QR Code */}
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                      <svg width="120" height="120" viewBox="0 0 100 100" style={{ background: '#ffffff', padding: '6px', border: '1px solid var(--border-light)' }}>
                        <rect x="5" y="5" width="25" height="25" fill="#0f172a" />
                        <rect x="10" y="10" width="15" height="15" fill="#ffffff" />
                        <rect x="70" y="5" width="25" height="25" fill="#0f172a" />
                        <rect x="75" y="10" width="15" height="15" fill="#ffffff" />
                        <rect x="5" y="70" width="25" height="25" fill="#0f172a" />
                        <rect x="10" y="75" width="15" height="15" fill="#ffffff" />
                        <rect x="35" y="15" width="10" height="10" fill="#0f172a" />
                        <rect x="50" y="5" width="10" height="25" fill="#0f172a" />
                        <rect x="35" y="45" width="30" height="15" fill="#0f172a" />
                        <rect x="15" y="45" width="10" height="10" fill="#0f172a" />
                        <rect x="45" y="75" width="20" height="20" fill="#0f172a" />
                        <rect x="75" y="45" width="15" height="20" fill="#0f172a" />
                        <rect x="80" y="75" width="15" height="15" fill="#0f172a" />
                      </svg>
                    </div>
                    <code style={{ fontSize: '11px', color: 'var(--primary-blue)', fontWeight: 'bold' }}>
                      Secret: BORABU-MFA-MOCK-SEED
                    </code>
                    <p style={{ fontSize: '10px', color: 'var(--text-light)', marginTop: '6px' }}>
                      Use this seed to configure manually if scanner is unavailable.
                    </p>
                  </div>
                )}
              </div>

              <button type="submit" disabled={saving} className="btn btn-primary" style={{ width: '100%', background: 'var(--primary-navy)', borderColor: 'var(--primary-navy)' }}>
                {saving ? 'Updating credentials...' : 'Update Security Credentials'}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
