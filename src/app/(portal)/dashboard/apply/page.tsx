'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Programme {
  id: string;
  name: string;
  code: string;
  level: string;
  duration: string;
  minGradeRequirement: {
    meanGrade: string;
    subjects: Record<string, string>;
  };
}

export default function ApplyPage() {
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    async function loadProgrammes() {
      try {
        const res = await fetch('/api/programmes');
        if (res.ok) {
          const data = await res.json();
          setProgrammes(data.programmes || []);
        }
      } catch (err) {
        console.error('Failed to load programmes:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProgrammes();
  }, []);

  const handleStartApplication = async (programmeId: string) => {
    setError('');
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ programmeId }),
      });

      const data = await res.json();

      if (res.ok || res.status === 409) {
        // Redirect to draft editor (if 409, we already have an active application draft or file, let's redirect to it)
        const id = data.applicationId;
        if (id) {
          router.push(`/dashboard/apply/${id}`);
        } else {
          setError(data.error || 'You have an active application file.');
        }
      } else {
        setError(data.error || 'Failed to start application draft.');
      }
    } catch (err) {
      console.error('Failed to instantiate application:', err);
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div style={{ maxWidth: '850px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px' }}>Select a Programme of Study</h1>
        <p style={{ color: 'var(--text-light)', fontSize: '14px' }}>Choose the course you want to apply for. You can only have one active application file under review.</p>
      </div>

      {error && (
        <div className="alert alert-danger">
          <div>⚠️ {error}</div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-light)' }}>
          Loading available college courses...
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {programmes.map((prog) => (
            <div 
              key={prog.id}
              style={{ 
                background: 'var(--bg-card)', 
                border: '1px solid var(--border-light)', 
                borderRadius: 'var(--radius-lg)', 
                padding: '24px',
                display: 'grid',
                gridTemplateColumns: '1fr 180px',
                gap: '20px',
                alignItems: 'center'
              }}
            >
              <div>
                <span style={{ fontSize: '10px', background: 'var(--primary-light)', color: 'var(--primary-blue)', padding: '2px 8px', borderRadius: '4px', fontWeight: '700', textTransform: 'uppercase', display: 'inline-block', marginBottom: '8px' }}>
                  {prog.level}
                </span>
                <h3 style={{ fontSize: '18px', color: 'var(--text-dark)' }}>{prog.name}</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-light)', marginTop: '4px' }}>
                  Course Code: <strong>{prog.code}</strong> | Duration: <strong>{prog.duration}</strong>
                </p>
                <div style={{ marginTop: '10px', fontSize: '12px', color: 'var(--text-main)' }}>
                  Requirements Checklist: Minimum Grade of <strong>{prog.minGradeRequirement.meanGrade}</strong>.
                </div>
              </div>
              <div>
                <button 
                  onClick={() => handleStartApplication(prog.id)} 
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '12px 16px' }}
                >
                  Start Application
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
