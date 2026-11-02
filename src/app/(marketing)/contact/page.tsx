'use client';

import { useState } from 'react';
import Image from 'next/image';
import { MapPin, Mail, Phone, Clock, ExternalLink } from 'lucide-react';
import campusHeroImg from '@/assets/images/campus_hero_exterior_1793627510692.jpg';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setSubmitting(true);
    setTimeout(() => {
      setSuccess(true);
      setSubmitting(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 800);
  };

  return (
    <div className="container" style={{ padding: '64px 24px 84px', maxWidth: '1080px' }}>
      <header className="section-header">
        <span className="section-tag">Admissions Desk</span>
        <h1 className="section-title">Contact Borabu TTC</h1>
        <p className="section-desc">
          Have questions regarding entry requirements, application review timelines, or term fees?
          Reach our Registry and Admissions Office directly.
        </p>
      </header>

      <div className="contact-split-grid" style={{ marginTop: '40px' }}>
        {/* Contact Form */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-light)',
            padding: '32px',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <h2 style={{ fontSize: '22px', marginBottom: '20px', color: 'var(--text-dark)' }}>
            Send an Admissions Inquiry
          </h2>

          {success && (
            <div className="alert alert-success">
              <div>
                <strong>Inquiry Received.</strong> Thank you for contacting Borabu TTC. An admissions
                officer will respond via email shortly.
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                required
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label">Subject</label>
              <input
                type="text"
                placeholder="e.g. DPTE Intake Qualification or Fee Structure"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label">Message *</label>
              <textarea
                required
                rows={5}
                placeholder="Write your inquiry..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="form-input"
                style={{ resize: 'vertical' }}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '8px', padding: '12px' }}
            >
              {submitting ? 'Submitting Inquiry...' : 'Submit Inquiry'}
            </button>
          </form>
        </div>

        {/* Contact details & Campus Location Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-light)',
              padding: '28px',
              borderRadius: 'var(--radius-lg)',
            }}
          >
            <h2 style={{ fontSize: '20px', marginBottom: '20px', color: 'var(--text-dark)' }}>
              Campus Registry Details
            </h2>

            <ul
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                listStyle: 'none',
                fontSize: '14px',
              }}
            >
              <li style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <MapPin size={18} style={{ color: 'var(--primary-blue)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ display: 'block', color: 'var(--text-dark)' }}>Physical Location</strong>
                  <span style={{ color: 'var(--text-light)' }}>
                    Nyamira County, off Kisii–Kericho Highway, alight at Nyangoge near Kebirigo Town
                  </span>
                </div>
              </li>
              <li style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <Mail size={18} style={{ color: 'var(--primary-blue)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ display: 'block', color: 'var(--text-dark)' }}>Postal &amp; Official Email</strong>
                  <span style={{ color: 'var(--text-light)' }}>
                    P.O. BOX 9 - 40506, Kebirigo &bull; info@borabuttc.ac.ke
                  </span>
                </div>
              </li>
              <li style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <Phone size={18} style={{ color: 'var(--primary-blue)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ display: 'block', color: 'var(--text-dark)' }}>Admissions Hotlines</strong>
                  <span style={{ color: 'var(--text-light)' }}>
                    0746 211 764 &nbsp;|&nbsp; 0727 433 205 &nbsp;|&nbsp; 0725 533 426
                  </span>
                </div>
              </li>
              <li style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <Clock size={18} style={{ color: 'var(--primary-blue)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ display: 'block', color: 'var(--text-dark)' }}>Office Hours</strong>
                  <span style={{ color: 'var(--text-light)' }}>
                    Monday – Friday: 8:00 AM – 5:00 PM (EAT)
                  </span>
                </div>
              </li>
            </ul>
          </div>

          {/* Campus Photo & Directions Card */}
          <div
            className="dark-surface"
            style={{
              background: 'var(--primary-navy)',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              border: '1px solid var(--border-light)',
            }}
          >
            <div style={{ position: 'relative', height: '175px', width: '100%' }}>
              <Image
                src={campusHeroImg}
                alt="Borabu TTC campus near Kebirigo Town, Nyamira County"
                fill
                sizes="(max-width: 1024px) 100vw, 38vw"
                referrerPolicy="no-referrer"
                style={{ objectFit: 'cover' }}
              />
            </div>
            <div style={{ padding: '20px 24px', color: '#ffffff' }}>
              <h3 style={{ fontSize: '18px', color: '#ffffff', marginBottom: '6px' }}>
                Visiting the Campus
              </h3>
              <p style={{ color: 'rgba(255, 255, 255, 0.78)', fontSize: '13.5px', lineHeight: 1.55, marginBottom: '14px' }}>
                Situated along the Kisii–Kericho corridor at Nyangoge junction near Kebirigo Town, Nyamira County.
              </p>
              <a
                href="https://maps.google.com/?q=Kebirigo+Nyamira+Kenya"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#f3c669',
                }}
              >
                <span>Open Directions in Google Maps</span>
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
