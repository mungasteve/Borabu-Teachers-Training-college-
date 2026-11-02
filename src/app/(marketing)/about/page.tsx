import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Target, Eye, Award, ArrowRight } from 'lucide-react';

import campusHeroImg from '@/assets/images/campus_hero_exterior_1793627510692.jpg';
import graduationImg from '@/assets/images/college_graduation_ceremony_1793627517314.jpg';

export const metadata: Metadata = {
  title: 'About the College',
  description: 'Learn about the history, vision, mission, pedagogical mandate, and administrative leadership of Borabu Teachers Training College (BTTC).',
};

export default function AboutPage() {
  const leaders = [
    {
      initials: 'GO',
      name: 'Dr. George Ondieki',
      role: 'Chief Principal',
      unit: 'Secretary to Board of Governors & Accounting Officer',
      bio: 'Provides executive strategic leadership, institutional policy governance, and serves as primary liaison with the Ministry of Education, TSC, and educational partners.',
      accent: 'var(--primary-navy)',
    },
    {
      initials: 'AN',
      name: 'Agnes Nyaboke',
      role: 'Deputy Principal (Academics)',
      unit: 'Curriculum Implementation & Academic Affairs',
      bio: 'Supervises instructional timetabling, academic departments, micro-teaching laboratories, continuous assessment moderation, and KNEC examination standards.',
      accent: 'var(--primary-blue)',
    },
    {
      initials: 'FM',
      name: 'Francis Mogaka',
      role: 'Deputy Principal (Administration)',
      unit: 'Operations, HR & Institutional Development',
      bio: 'Coordinates non-teaching personnel, campus security, infrastructural expansions, boarding facilities, procurement, and physical asset management.',
      accent: 'var(--accent-gold)',
    },
    {
      initials: 'NK',
      name: 'Nancy Kemunto',
      role: 'College Registrar',
      unit: 'Admissions & Academic Records Office',
      bio: 'Leads student intake, verification of KCSE credentials, issuance of official digital admission letters, registration registers, and transcript archiving.',
      accent: 'var(--accent-teal)',
    },
    {
      initials: 'PN',
      name: 'Peter Nyakundi',
      role: 'Dean of Teaching Practicum',
      unit: 'School Attachment & Practicum Placement',
      bio: 'Coordinates trainee school attachments across partner primary and junior schools, manages field supervisor assessment panels, and oversees micro-teaching clinics.',
      accent: '#4338ca',
    },
    {
      initials: 'DO',
      name: 'David Omwansa',
      role: 'Dean of Trainee Welfare',
      unit: 'Student Life, Boarding & Guidance',
      bio: 'Oversees trainee affairs, hostel accommodation, student council governance, sports and clubs, guidance and counseling, and chaplaincy services.',
      accent: '#0f766e',
    },
  ];

  return (
    <div className="container" style={{ padding: '64px 24px 84px', maxWidth: '1160px' }}>
      <header className="section-header" style={{ marginBottom: '48px' }}>
        <span className="section-tag">Our History &amp; Mandate</span>
        <h1 className="section-title">About Borabu Teachers Training College</h1>
        <p className="section-desc">
          Established to prepare competent, ethical, and transformative educators equipped with
          pedagogical mastery, Competency-Based Curriculum (CBC) expertise, and strong professional ethics.
        </p>
      </header>

      {/* History & Campus Photography Split */}
      <section
        className="about-split-grid"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-light)',
          padding: '36px',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '44px',
        }}
      >
        <div style={{ lineHeight: 1.7 }}>
          <h2
            style={{
              fontSize: '25px',
              marginBottom: '16px',
              borderBottom: '2px solid var(--primary-light)',
              paddingBottom: '10px',
              color: 'var(--primary-navy)',
            }}
          >
            College History &amp; Strategic Mandate
          </h2>
          <p style={{ color: 'var(--text-main)', fontSize: '15px', marginBottom: '14px' }}>
            <strong>Borabu Teachers Training College (BTTC)</strong> is a public teacher education
            institution situated in Borabu Constituency, Nyamira County, Kenya. Registered under the
            Ministry of Education and aligned with the Teachers Service Commission (TSC) and the Kenya
            Institute of Curriculum Development (KICD), the college prepares qualified educators for
            primary and early childhood classrooms across Kenya.
          </p>
          <p style={{ color: 'var(--text-main)', fontSize: '15px', marginBottom: '14px' }}>
            BTTC leads in implementing Competency-Based Teacher Education (CBTE), offering the{' '}
            <strong>Diploma in Primary Teacher Education (DPTE)</strong>,{' '}
            <strong>Diploma in Early Childhood Teacher Education (DECTE)</strong>, Upgrade Diploma
            programmes for practicing P1 and ECDE teachers, and Special Needs Education pathways.
          </p>
          <p style={{ color: 'var(--text-main)', fontSize: '15px' }}>
            Located off the Kisii–Kericho highway near Kebirigo Town, the campus features dedicated
            micro-teaching clinics, modern science and ICT hubs, creative arts studios, and active
            practicum partnerships across Nyanza, Rift Valley, and Western regions.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '16 / 10',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              background: 'var(--primary-navy)',
              border: '1px solid var(--border-light)',
            }}
          >
            <Image
              src={campusHeroImg}
              alt="Borabu TTC main academic complex in Nyamira County"
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              referrerPolicy="no-referrer"
              style={{ objectFit: 'cover' }}
            />
          </div>
          <div
            style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '16 / 9',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              background: 'var(--primary-navy)',
              border: '1px solid var(--border-light)',
            }}
          >
            <Image
              src={graduationImg}
              alt="Graduating teacher trainees at Borabu Teachers Training College"
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              referrerPolicy="no-referrer"
              style={{ objectFit: 'cover' }}
            />
          </div>
        </div>
      </section>

      {/* Vision, Mission, Motto */}
      <section
        className="card-grid"
        style={{
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
          marginBottom: '48px',
        }}
      >
        <div className="card">
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--primary-light)',
              color: 'var(--primary-blue)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
            }}
          >
            <Target size={22} />
          </div>
          <h3 style={{ fontSize: '20px', marginBottom: '10px', color: 'var(--primary-navy)' }}>
            Our Mission
          </h3>
          <p style={{ color: 'var(--text-light)', fontSize: '14.5px', lineHeight: 1.6, margin: 0 }}>
            To prepare competent, ethical, and resourceful teachers through practical pedagogical
            training, supervised school mentorship, educational inquiry, and community service.
          </p>
        </div>

        <div className="card">
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--primary-light)',
              color: 'var(--primary-blue)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
            }}
          >
            <Eye size={22} />
          </div>
          <h3 style={{ fontSize: '20px', marginBottom: '10px', color: 'var(--primary-navy)' }}>
            Our Vision
          </h3>
          <p style={{ color: 'var(--text-light)', fontSize: '14.5px', lineHeight: 1.6, margin: 0 }}>
            To be a premier national center of excellence in Teacher Education, Competency-Based
            Pedagogy, and Educational Leadership.
          </p>
        </div>

        <div className="card">
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--primary-light)',
              color: 'var(--accent-gold-text)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
            }}
          >
            <Award size={22} />
          </div>
          <h3 style={{ fontSize: '20px', marginBottom: '10px', color: 'var(--primary-navy)' }}>
            College Motto
          </h3>
          <p
            style={{
              color: 'var(--text-dark)',
              fontSize: '15px',
              lineHeight: 1.6,
              fontStyle: 'italic',
              fontWeight: 600,
              marginBottom: '8px',
            }}
          >
            &ldquo;Pedagogy, Integrity, and Excellence in Educational Leadership.&rdquo;
          </p>
          <p style={{ color: 'var(--text-light)', fontSize: '13.5px', margin: 0 }}>
            Nurturing head, heart, and hands to serve generations of Kenyan learners.
          </p>
        </div>
      </section>

      {/* Core Values */}
      <section style={{ marginBottom: '52px' }}>
        <h2
          style={{
            fontSize: '24px',
            marginBottom: '20px',
            borderBottom: '2px solid var(--primary-light)',
            paddingBottom: '10px',
            color: 'var(--primary-navy)',
          }}
        >
          Institutional Core Values
        </h2>
        <div
          className="card-grid"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '20px' }}
        >
          <div className="card" style={{ padding: '24px' }}>
            <h4 style={{ color: 'var(--primary-blue)', marginBottom: '8px', fontSize: '17px' }}>
              01. Integrity &amp; Ethics
            </h4>
            <p style={{ fontSize: '13.5px', color: 'var(--text-light)', lineHeight: 1.55, margin: 0 }}>
              Upholding honesty, accountability, and professional conduct across academic and public service.
            </p>
          </div>
          <div className="card" style={{ padding: '24px' }}>
            <h4 style={{ color: 'var(--primary-blue)', marginBottom: '8px', fontSize: '17px' }}>
              02. Pedagogical Mastery
            </h4>
            <p style={{ fontSize: '13.5px', color: 'var(--text-light)', lineHeight: 1.55, margin: 0 }}>
              Deep subject mastery paired with child-centered instructional methods and fair assessment.
            </p>
          </div>
          <div className="card" style={{ padding: '24px' }}>
            <h4 style={{ color: 'var(--primary-blue)', marginBottom: '8px', fontSize: '17px' }}>
              03. Inclusivity &amp; Equity
            </h4>
            <p style={{ fontSize: '13.5px', color: 'var(--text-light)', lineHeight: 1.55, margin: 0 }}>
              Supporting diverse learner needs, differentiated instruction, and Special Needs Education.
            </p>
          </div>
          <div className="card" style={{ padding: '24px' }}>
            <h4 style={{ color: 'var(--primary-blue)', marginBottom: '8px', fontSize: '17px' }}>
              04. Digital Readiness
            </h4>
            <p style={{ fontSize: '13.5px', color: 'var(--text-light)', lineHeight: 1.55, margin: 0 }}>
              Integrating practical ICT tools and instructional media into everyday classroom teaching.
            </p>
          </div>
        </div>
      </section>

      {/* College Administration Structure */}
      <section style={{ marginBottom: '52px' }}>
        <div style={{ marginBottom: '26px' }}>
          <span className="section-tag">Governance &amp; Leadership</span>
          <h2 style={{ fontSize: '28px', color: 'var(--primary-navy)', marginTop: '4px', marginBottom: '8px' }}>
            College Administration
          </h2>
          <p style={{ color: 'var(--text-light)', fontSize: '15px' }}>
            Borabu Teachers Training College operates under an experienced academic and administrative
            governance team.
          </p>
        </div>

        <div
          className="card-grid"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}
        >
          {leaders.map((leader) => (
            <div key={leader.name} className="card" style={{ borderTop: `3px solid ${leader.accent}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                <div
                  style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: 'var(--radius-sm)',
                    background: leader.accent,
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    fontWeight: 700,
                    fontFamily: 'var(--font-heading)',
                    flexShrink: 0,
                    letterSpacing: '0.04em',
                  }}
                >
                  {leader.initials}
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', margin: 0, color: 'var(--text-dark)' }}>
                    {leader.name}
                  </h3>
                  <span
                    style={{
                      fontSize: '12px',
                      color: 'var(--primary-blue)',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {leader.role}
                  </span>
                </div>
              </div>
              <p style={{ fontStyle: 'italic', fontSize: '13px', color: 'var(--text-light)', marginBottom: '10px' }}>
                {leader.unit}
              </p>
              <p style={{ fontSize: '13.5px', color: 'var(--text-main)', lineHeight: 1.55, margin: 0 }}>
                {leader.bio}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Box */}
      <section
        className="dark-surface"
        style={{
          background: 'var(--primary-navy)',
          color: '#ffffff',
          padding: '44px 32px',
          borderRadius: 'var(--radius-lg)',
          textAlign: 'center',
        }}
      >
        <h2 style={{ fontSize: '28px', marginBottom: '12px', color: '#ffffff' }}>
          Join Borabu Teachers Training College
        </h2>
        <p
          style={{
            color: 'rgba(255, 255, 255, 0.82)',
            maxWidth: '640px',
            margin: '0 auto 26px',
            fontSize: '15px',
          }}
        >
          Explore our accredited teacher education programmes and apply online for the upcoming academic intake.
        </p>
        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            href="/register"
            className="btn btn-accent"
            style={{
              background: '#f3c669',
              borderColor: '#f3c669',
              color: '#101d2d',
              padding: '12px 24px',
            }}
          >
            <span>Apply for Admission</span>
            <ArrowRight size={15} />
          </Link>
          <Link
            href="/programmes"
            className="btn btn-secondary"
            style={{ color: '#ffffff', borderColor: 'rgba(255, 255, 255, 0.4)', padding: '12px 22px' }}
          >
            View Programmes
          </Link>
        </div>
      </section>
    </div>
  );
}
