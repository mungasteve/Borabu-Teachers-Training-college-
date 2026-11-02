import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import libraryImg from '@/assets/images/college_library_interior_1793627511948.jpg';
import ictLabImg from '@/assets/images/ict_computer_lab_1793627515818.jpg';
import scienceLabImg from '@/assets/images/science_lab_session_1793627515726.jpg';
import sportsGroundsImg from '@/assets/images/campus_sports_grounds_1793627516788.jpg';
import graduationImg from '@/assets/images/college_graduation_ceremony_1793627517314.jpg';
import microTeachingImg from '@/assets/images/micro_teaching_classroom_1793627515224.jpg';
import campusHeroImg from '@/assets/images/campus_hero_exterior_1793627510692.jpg';

export const metadata: Metadata = {
  title: 'Campus Life & Gallery',
  description: 'Explore photographs of Borabu Teachers Training College campus grounds, laboratories, library, sports facilities, and graduation ceremonies in Nyamira County.',
};

export default function GalleryPage() {
  const items = [
    {
      title: 'Administration & Main Lecture Block',
      desc: 'Set in the serene green highlands of Borabu Constituency near Kebirigo Town, providing a calm academic environment.',
      category: 'Campus Grounds',
      image: campusHeroImg,
    },
    {
      title: 'Modern Library & Resource Center',
      desc: 'Housing thousands of physical teacher-education volumes, KICD curriculum guides, and digital research terminals.',
      category: 'Academic Facility',
      image: libraryImg,
    },
    {
      title: 'ICT & Computer Literacy Lab',
      desc: 'Equipped with modern desktop workstations for digital pedagogy, instructional media design, and online assessments.',
      category: 'Digital Learning',
      image: ictLabImg,
    },
    {
      title: 'DPTE Integrated Science Laboratory',
      desc: 'Hands-on laboratory benches with optical microscopes and apparatus for practical science instruction.',
      category: 'Academics',
      image: scienceLabImg,
    },
    {
      title: 'Micro-Teaching Seminar Rooms',
      desc: 'Collaborative teaching clinics where student-teachers refine classroom delivery and peer-reviewed lesson plans.',
      category: 'Pedagogy',
      image: microTeachingImg,
    },
    {
      title: 'Athletics Track & Sports Grounds',
      desc: 'Expansive outdoor pitches where trainees compete in KTTCA athletics, football, volleyball, and netball.',
      category: 'Student Life',
      image: sportsGroundsImg,
    },
    {
      title: 'Annual Congregation & Graduation',
      desc: 'Celebrating accredited Diploma and Certificate educators as they enter national classroom service.',
      category: 'Convocation',
      image: graduationImg,
    },
  ];

  return (
    <div className="container" style={{ padding: '64px 24px 84px' }}>
      <header className="section-header">
        <span className="section-tag">Campus Life &amp; Facilities</span>
        <h1 className="section-title">Explore Borabu TTC Campus</h1>
        <p className="section-desc">
          Take a visual tour through our learning facilities, practical laboratories, athletics
          grounds, and student life in Nyamira County.
        </p>
      </header>

      <div
        className="card-grid"
        style={{
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '28px',
          marginTop: '40px',
        }}
      >
        {items.map((item, idx) => (
          <article
            key={idx}
            className="card"
            style={{
              padding: 0,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                height: '230px',
                background: 'var(--primary-navy)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <Image
                src={item.image}
                alt={item.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                referrerPolicy="no-referrer"
                style={{ objectFit: 'cover' }}
              />
              <span
                style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  background: 'rgba(14, 26, 37, 0.82)',
                  color: '#f3c669',
                  fontSize: '11px',
                  padding: '5px 10px',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                {item.category}
              </span>
            </div>
            <div style={{ padding: '22px 24px', flexGrow: 1 }}>
              <h2 style={{ fontSize: '19px', marginBottom: '8px', color: 'var(--text-dark)' }}>
                {item.title}
              </h2>
              <p style={{ color: 'var(--text-light)', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>
                {item.desc}
              </p>
            </div>
          </article>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: '52px' }}>
        <Link href="/register" className="btn btn-primary" style={{ padding: '13px 28px', fontSize: '14.5px' }}>
          <span>Apply to Join Our Next Intake</span>
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
