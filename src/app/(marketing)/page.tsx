import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, MapPin, BookOpen, CheckCircle2 } from 'lucide-react';

import campusHeroImg from '@/assets/images/campus_hero_exterior_1793627510692.jpg';
import microTeachingImg from '@/assets/images/micro_teaching_classroom_1793627515224.jpg';
import scienceLabImg from '@/assets/images/science_lab_session_1793627515726.jpg';
import ictLabImg from '@/assets/images/ict_computer_lab_1793627515818.jpg';
import libraryImg from '@/assets/images/college_library_interior_1793627511948.jpg';

export default function HomePage() {
  return (
    <div>
      {/* 1. Hero Section */}
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-content">
            <span className="section-tag">
              Ministry of Education &amp; TSC Accredited &bull; Nyamira County
            </span>
            <h1 className="hero-title">
              Shaping Future Educators in <span>Pedagogy &amp; Classroom Leadership</span>
            </h1>
            <p className="hero-subtitle">
              Borabu Teachers Training College prepares qualified primary and early childhood
              educators under Kenya&apos;s Competency-Based Curriculum (DPTE, DECTE, and Upgrade
              Diplomas), combining practical micro-teaching with school practicum mentorship.
            </p>
            <div className="hero-buttons">
              <Link href="/register" className="btn btn-primary" style={{ padding: '13px 24px', fontSize: '14.5px' }}>
                <span>Apply for 2026 Intake</span>
                <ArrowRight size={16} />
              </Link>
              <Link href="/programmes" className="btn btn-secondary" style={{ padding: '13px 22px', fontSize: '14.5px' }}>
                Explore Programmes
              </Link>
            </div>

            {/* Institutional Proof Metrics */}
            <div className="hero-stats">
              <div className="stat-item">
                <h3>3,500+</h3>
                <p>Accredited Graduates</p>
              </div>
              <div className="stat-item">
                <h3>98%</h3>
                <p>TSC Registration &amp; Placement</p>
              </div>
              <div className="stat-item">
                <h3>100%</h3>
                <p>KICD &amp; KNEC Curriculum Aligned</p>
              </div>
            </div>
          </div>

          <div className="hero-image-container">
            <Image
              src={campusHeroImg}
              alt="Borabu Teachers Training College campus grounds and academic block in Nyamira County"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 46vw"
              referrerPolicy="no-referrer"
              style={{ objectFit: 'cover' }}
            />
            <div className="hero-image-caption">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600 }}>
                <MapPin size={15} style={{ color: '#f3c669', flexShrink: 0 }} />
                <span>Main Campus &bull; Kebirigo, Nyamira County</span>
              </div>
              <Link
                href="/gallery"
                style={{
                  fontSize: '12.5px',
                  fontWeight: 600,
                  color: '#f3c669',
                  whiteSpace: 'nowrap',
                }}
              >
                Campus Tour &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Campus & Academic Facilities (Asymmetric Bento Grid) */}
      <section className="section">
        <div className="container">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              flexWrap: 'wrap',
              gap: '20px',
              marginBottom: '36px',
            }}
          >
            <div style={{ maxWidth: '640px' }}>
              <span className="section-tag">Academic Infrastructure</span>
              <h2 className="section-title" style={{ marginBottom: '10px', textAlign: 'left' }}>
                Purpose-Built Laboratories &amp; Teaching Clinics
              </h2>
              <p style={{ color: 'var(--text-light)', fontSize: '15.5px', lineHeight: 1.6 }}>
                Every Diploma and Certificate trainee gains hands-on instructional experience inside
                modern science labs, digital literacy centers, and supervised micro-teaching rooms.
              </p>
            </div>
            <Link href="/gallery" className="btn btn-secondary">
              <span>View Full Campus Gallery</span>
              <ArrowRight size={15} />
            </Link>
          </div>

          <div className="campus-bento-grid">
            {/* Marquee Span 7 */}
            <article className="bento-card bento-span-7">
              <div className="bento-image-wrap" style={{ height: '280px' }}>
                <Image
                  src={microTeachingImg}
                  alt="Teacher trainees practicing classroom instruction during a micro-teaching seminar"
                  fill
                  sizes="(max-width: 768px) 100vw, 58vw"
                  referrerPolicy="no-referrer"
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <div className="bento-body">
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-gold-text)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  01. Pedagogical Practice
                </span>
                <h3 style={{ fontSize: '21px' }}>Micro-Teaching &amp; CBC Demonstration Clinics</h3>
                <p style={{ color: 'var(--text-light)', fontSize: '14.5px', lineHeight: 1.6 }}>
                  Trainees rehearse lesson planning, learner-centered facilitation, and formative
                  assessment rubrics before embarking on partner-school teaching practicums.
                </p>
              </div>
            </article>

            {/* Supporting Span 5 */}
            <article className="bento-card bento-span-5">
              <div className="bento-image-wrap" style={{ height: '280px' }}>
                <Image
                  src={scienceLabImg}
                  alt="DPTE student-teachers conducting laboratory microscopy experiments"
                  fill
                  sizes="(max-width: 768px) 100vw, 42vw"
                  referrerPolicy="no-referrer"
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <div className="bento-body">
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-gold-text)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  02. Practical Sciences
                </span>
                <h3 style={{ fontSize: '20px' }}>Integrated Science Laboratories</h3>
                <p style={{ color: 'var(--text-light)', fontSize: '14.5px', lineHeight: 1.6 }}>
                  Fully outfitted biology, chemistry, and agriculture benches supporting experimental
                  inquiry for Primary and Junior School teacher trainees.
                </p>
              </div>
            </article>

            {/* Bottom Row: Span 5 + Span 7 */}
            <article className="bento-card bento-span-5">
              <div className="bento-image-wrap" style={{ height: '250px' }}>
                <Image
                  src={ictLabImg}
                  alt="College ICT laboratory with desktop workstations and lecturer guidance"
                  fill
                  sizes="(max-width: 768px) 100vw, 42vw"
                  referrerPolicy="no-referrer"
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <div className="bento-body">
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-gold-text)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  03. Digital Literacy
                </span>
                <h3 style={{ fontSize: '20px' }}>ICT &amp; Educational Media Lab</h3>
                <p style={{ color: 'var(--text-light)', fontSize: '14.5px', lineHeight: 1.6 }}>
                  Dedicated workstations for digital instructional design, KNEC portal readiness, and
                  computer-assisted classroom delivery.
                </p>
              </div>
            </article>

            <article className="bento-card bento-span-7">
              <div className="bento-image-wrap" style={{ height: '250px' }}>
                <Image
                  src={libraryImg}
                  alt="Borabu TTC library reading hall with textbooks and quiet study tables"
                  fill
                  sizes="(max-width: 768px) 100vw, 58vw"
                  referrerPolicy="no-referrer"
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <div className="bento-body">
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-gold-text)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  04. Academic Research
                </span>
                <h3 style={{ fontSize: '21px' }}>Modern Library &amp; Curriculum Resource Center</h3>
                <p style={{ color: 'var(--text-light)', fontSize: '14.5px', lineHeight: 1.6 }}>
                  Extensive KICD curriculum designs, educational psychology volumes, and quiet research
                  spaces overlooking the green Nyamira highlands.
                </p>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* 3. Streamlined Online Admissions Steps */}
      <section className="section section-bg">
        <div className="container" style={{ maxWidth: '960px' }}>
          <div className="section-header">
            <span className="section-tag">Online Admissions</span>
            <h2 className="section-title">Complete Your Application in Three Steps</h2>
            <p className="section-desc">
              Our digital admissions portal evaluates your KCSE subject grades immediately and issues
              verifiable admission letters upon registry approval.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', margin: '36px 0' }}>
            <div
              style={{
                display: 'flex',
                gap: '22px',
                alignItems: 'flex-start',
                background: 'var(--bg-main)',
                padding: '26px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)',
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--primary-navy)',
                  color: '#f3c669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  fontWeight: 700,
                  fontFamily: 'var(--font-heading)',
                  flexShrink: 0,
                }}
              >
                01
              </div>
              <div>
                <h3 style={{ fontSize: '19px', marginBottom: '6px' }}>Create Your Applicant Account</h3>
                <p style={{ color: 'var(--text-light)', fontSize: '14.5px', lineHeight: 1.6 }}>
                  Register with your full official name, email address, and Safaricom phone number to
                  activate your personal applicant dashboard.
                </p>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                gap: '22px',
                alignItems: 'flex-start',
                background: 'var(--bg-main)',
                padding: '26px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)',
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--primary-navy)',
                  color: '#f3c669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  fontWeight: 700,
                  fontFamily: 'var(--font-heading)',
                  flexShrink: 0,
                }}
              >
                02
              </div>
              <div>
                <h3 style={{ fontSize: '19px', marginBottom: '6px' }}>Select Programme &amp; Upload KCSE Credentials</h3>
                <p style={{ color: 'var(--text-light)', fontSize: '14.5px', lineHeight: 1.6 }}>
                  Choose DPTE, DECTE, or Upgrade Diploma, enter your KCSE grades for instant
                  eligibility verification, and upload scans of your National ID and result slip.
                </p>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                gap: '22px',
                alignItems: 'flex-start',
                background: 'var(--bg-main)',
                padding: '26px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)',
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--primary-navy)',
                  color: '#f3c669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  fontWeight: 700,
                  fontFamily: 'var(--font-heading)',
                  flexShrink: 0,
                }}
              >
                03
              </div>
              <div>
                <h3 style={{ fontSize: '19px', marginBottom: '6px' }}>Download Official QR-Coded Admission Letter</h3>
                <p style={{ color: 'var(--text-light)', fontSize: '14.5px', lineHeight: 1.6 }}>
                  Once verified by the Registrar&apos;s office, download your signed PDF admission letter
                  complete with reporting dates, fee schedule, and cryptographic QR verification.
                </p>
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '16px',
              flexWrap: 'wrap',
              marginTop: '36px',
            }}
          >
            <Link href="/register" className="btn btn-primary" style={{ padding: '14px 28px', fontSize: '15px' }}>
              <span>Start Online Application</span>
              <ArrowRight size={16} />
            </Link>
            <Link href="/admissions" className="btn btn-secondary" style={{ padding: '14px 24px', fontSize: '15px' }}>
              <BookOpen size={16} />
              <span>Review Entry Requirements</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Official Digital Verification Callout */}
      <section className="section">
        <div className="container" style={{ maxWidth: '880px' }}>
          <div
            className="dark-surface"
            style={{
              background: 'var(--primary-navy)',
              color: '#ffffff',
              borderRadius: 'var(--radius-lg)',
              padding: '44px 36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '28px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <div style={{ maxWidth: '520px' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#f3c669',
                  fontSize: '12px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  marginBottom: '10px',
                }}
              >
                <ShieldCheck size={16} />
                <span>Registry Verification Portal</span>
              </div>
              <h2 style={{ fontSize: '26px', marginBottom: '10px', color: '#ffffff' }}>
                Verify an Official Admission Letter
              </h2>
              <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14.5px', lineHeight: 1.6 }}>
                Sponsors, County Bursary committees, TSC officers, and Ministry officials can confirm
                the authenticity of any Borabu TTC admission serial number online in seconds.
              </p>
            </div>

            <Link
              href="/verify/check"
              className="btn btn-accent"
              style={{
                background: '#f3c669',
                borderColor: '#f3c669',
                color: '#101d2d',
                padding: '13px 24px',
                fontSize: '14px',
              }}
            >
              <CheckCircle2 size={16} />
              <span>Verify Letter Authenticity</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
