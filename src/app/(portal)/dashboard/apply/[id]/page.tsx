'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/components/Toast';

interface Document {
  id: string;
  type: string;
  fileName: string;
  fileUrl: string;
}

interface Application {
  id: string;
  status: string;
  kcseIndexNo: string;
  kcseYear: number;
  kcseMeanGrade: string;
  personalDetails: any;
  subjectGrades: Record<string, string>;
  submittedAt: string | null;
  paymentStatus: string;
  paymentMethod: string | null;
  paymentReference: string | null;
  paymentReceiptUrl: string | null;
  secondaryProgrammeId: string | null;
  programme: {
    id: string;
    name: string;
    code: string;
    level: string;
    minGradeRequirement: {
      meanGrade: string;
      subjects: Record<string, string>;
    };
  };
  secondaryProgramme: {
    id: string;
    name: string;
    code: string;
  } | null;
  documents: Document[];
}

interface Programme {
  id: string;
  name: string;
  code: string;
  level: string;
}

export default function ApplicationWizardPage() {
  const router = useRouter();
  const params = useParams();
  const applicationId = params.id as string;
  const { showToast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [app, setApp] = useState<Application | null>(null);
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Step 1: Personal Details & Preferences
  const [personalDetails, setPersonalDetails] = useState({
    dob: '',
    gender: '',
    idNumber: '',
    county: '',
    guardianContact: '',
  });
  const [secondaryProgrammeId, setSecondaryProgrammeId] = useState<string>('');

  // Step 2: KCSE details
  const [kcseIndexNo, setKcseIndexNo] = useState('');
  const [kcseYear, setKcseYear] = useState<number | string>('');
  const [kcseMeanGrade, setKcseMeanGrade] = useState('');

  // Step 3: Subject Grades
  const [subjectGrades, setSubjectGrades] = useState<Record<string, string>>({
    english: '',
    kiswahili: '',
    mathematics: '',
    science: '',
  });

  // Track latest form state in Ref to avoid stale closures in the 30-second interval
  const formStateRef = useRef({
    personalDetails,
    kcseIndexNo,
    kcseYear,
    kcseMeanGrade,
    subjectGrades,
    secondaryProgrammeId,
  });

  useEffect(() => {
    formStateRef.current = {
      personalDetails,
      kcseIndexNo,
      kcseYear,
      kcseMeanGrade,
      subjectGrades,
      secondaryProgrammeId,
    };
  }, [personalDetails, kcseIndexNo, kcseYear, kcseMeanGrade, subjectGrades, secondaryProgrammeId]);

  // Step 4: Documents Upload states
  const [uploadProgress, setUploadProgress] = useState<Record<string, { status: string; percent: number }>>({});
  const [dragging, setDragging] = useState<Record<string, boolean>>({});
  
  // OCR Scan state
  const [scanningOCR, setScanningOCR] = useState(false);

  // In-Browser Document Previewer Modal state
  const [previewDocUrl, setPreviewDocUrl] = useState<string | null>(null);
  const [previewDocName, setPreviewDocName] = useState<string>('');

  // Step 5: Payment state
  const [paymentOption, setPaymentOption] = useState<'stk' | 'manual'>('stk');
  const [stkPhone, setStkPhone] = useState('');
  const [manualMethod, setManualMethod] = useState<'mpesa' | 'bank'>('mpesa');
  const [manualCode, setManualCode] = useState('');
  const [depositSlipFile, setDepositSlipFile] = useState<File | null>(null);
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [stkSent, setStkSent] = useState(false);

  const GRADE_OPTIONS = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'E'];

  const loadApplication = async () => {
    try {
      // 1. Fetch application details
      const res = await fetch(`/api/applications/${applicationId}`);
      if (!res.ok) {
        router.push('/dashboard');
        return;
      }
      const data = await res.json();
      const loadedApp: Application = data.application;
      
      if (loadedApp.status !== 'draft') {
        router.push('/dashboard');
        return;
      }

      setApp(loadedApp);
      
      // Load form states without forcing generic defaults
      if (loadedApp.personalDetails && Object.keys(loadedApp.personalDetails).length > 0) {
        setPersonalDetails({
          dob: loadedApp.personalDetails.dob || '',
          gender: loadedApp.personalDetails.gender || '',
          idNumber: loadedApp.personalDetails.idNumber || '',
          county: loadedApp.personalDetails.county || '',
          guardianContact: loadedApp.personalDetails.guardianContact || '',
        });
      }
      setKcseIndexNo(loadedApp.kcseIndexNo || '');
      setKcseYear(loadedApp.kcseYear && loadedApp.kcseYear > 0 ? loadedApp.kcseYear : '');
      setKcseMeanGrade(loadedApp.kcseMeanGrade || '');
      setSecondaryProgrammeId(loadedApp.secondaryProgrammeId || '');

      if (loadedApp.subjectGrades && Object.keys(loadedApp.subjectGrades).length > 0) {
        setSubjectGrades({
          english: loadedApp.subjectGrades.english || '',
          kiswahili: loadedApp.subjectGrades.kiswahili || '',
          mathematics: loadedApp.subjectGrades.mathematics || '',
          science: loadedApp.subjectGrades.science || '',
        });
      }

      // 2. Fetch other programmes for secondary selection
      const progRes = await fetch('/api/programmes');
      if (progRes.ok) {
        const progData = await progRes.json();
        setProgrammes(progData.programmes || []);
      }
    } catch (err) {
      console.error('Failed to load application draft:', err);
      setError('Could not retrieve application data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (applicationId) {
      loadApplication();
    }
  }, [applicationId]);

  // Auto-Save Mechanism: runs every 30 seconds to prevent data loss during long application entries
  useEffect(() => {
    if (!applicationId || !app || app.status !== 'draft') return;

    const autoSaveTimer = setInterval(async () => {
      const currentState = formStateRef.current;
      // Only auto-save if applicant has started filling something
      const hasContent = 
        Boolean(currentState.kcseIndexNo) || 
        Boolean(currentState.kcseMeanGrade) || 
        Boolean(currentState.kcseYear) ||
        Object.values(currentState.personalDetails).some(v => Boolean(v && v.trim())) ||
        Object.values(currentState.subjectGrades).some(Boolean);

      if (!hasContent) return;

      setAutoSaveStatus('saving');
      try {
        const res = await fetch(`/api/applications/${applicationId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            personalDetails: currentState.personalDetails,
            kcseIndexNo: currentState.kcseIndexNo,
            kcseYear: currentState.kcseYear,
            kcseMeanGrade: currentState.kcseMeanGrade,
            subjectGrades: currentState.subjectGrades,
            secondaryProgrammeId: currentState.secondaryProgrammeId || null,
          }),
        });

        if (res.ok) {
          setLastSaved(new Date());
          setAutoSaveStatus('saved');
        } else {
          setAutoSaveStatus('error');
        }
      } catch (err) {
        console.warn('Auto-save background write failed:', err);
        setAutoSaveStatus('error');
      }
    }, 30000); // 30,000 milliseconds = 30 seconds

    return () => clearInterval(autoSaveTimer);
  }, [applicationId, app]);

  const saveDraft = async (silent = false) => {
    if (!silent) {
      setSaving(true);
      setError('');
    }
    try {
      const res = await fetch(`/api/applications/${applicationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personalDetails,
          kcseIndexNo,
          kcseYear,
          kcseMeanGrade,
          subjectGrades,
          secondaryProgrammeId: secondaryProgrammeId || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save application draft.');
      }
      
      setLastSaved(new Date());
      setAutoSaveStatus('saved');
      if (!silent) {
        showToast('Application draft saved successfully.', 'success');
      }
      return true;
    } catch (err: any) {
      if (!silent) {
        showToast(err.message || 'Failed to save changes.', 'error');
      }
      setAutoSaveStatus('error');
      return false;
    } finally {
      if (!silent) {
        setSaving(false);
      }
    }
  };

  const handleNextStep = async () => {
    // Step 1: Personal Details validation
    if (currentStep === 1) {
      if (!personalDetails.dob || !personalDetails.gender || !personalDetails.idNumber || !personalDetails.county) {
        showToast('Please fill in all personal details including gender, date of birth, and county.', 'error');
        return;
      }
      if (!/^\d{7,10}$/.test(personalDetails.idNumber.trim())) {
        showToast('Please enter a valid National ID / Birth Certificate number (7-10 digits).', 'error');
        return;
      }
      if (!personalDetails.guardianContact.trim() || !/^\+?254\d{9}$|^\d{10}$/.test(personalDetails.guardianContact.replace(/[\s-]/g, ''))) {
        showToast('Please enter a valid emergency contact telephone number (e.g. 0711223344).', 'error');
        return;
      }
    }

    // Step 2: KCSE details validation
    if (currentStep === 2) {
      if (!kcseIndexNo.trim()) {
        showToast('Please enter your KCSE Index Number.', 'error');
        return;
      }
      if (!/^\d{11}$|^\d{11}\/\d{4}$/.test(kcseIndexNo.trim())) {
        showToast('Please enter a valid KCSE Index format (e.g. 40732101001 or 40732101001/2024).', 'error');
        return;
      }
      const numYear = Number(kcseYear);
      if (!kcseYear || isNaN(numYear) || numYear < 1980 || numYear > 2026) {
        showToast('Please enter a valid KCSE examination year (between 1980 and 2026).', 'error');
        return;
      }
      if (!kcseMeanGrade) {
        showToast('Please select your KCSE Mean Grade.', 'error');
        return;
      }
    }

    // Step 3: Subject specific grades validation
    if (currentStep === 3) {
      if (!subjectGrades.english || !subjectGrades.kiswahili || !subjectGrades.mathematics || !subjectGrades.science) {
        showToast('Please select grades for all required subjects (English, Kiswahili, Math, Science).', 'error');
        return;
      }
    }

    // Step 5: Payment validation check
    if (currentStep === 5) {
      if (app?.paymentStatus !== 'paid') {
        showToast('Please complete and verify the KES 1,000 application fee payment before proceeding.', 'error');
        return;
      }
    }

    const saved = await saveDraft();
    if (saved) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevStep = () => {
    setError('');
    setCurrentStep((prev) => prev - 1);
  };

  const handleFileUpload = async (type: string, file: File) => {
    if (!file) return;

    // Strict file type restrictions
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      showToast('Invalid file format. Only PDF, JPG, and PNG are allowed.', 'error');
      return;
    }

    // Strict file size limits
    const maxSizeBytes = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSizeBytes) {
      showToast('File is too large. Maximum file size is 5MB.', 'error');
      return;
    }

    setError('');
    setUploadProgress((prev) => ({ ...prev, [type]: { status: 'Uploading...', percent: 10 } }));

    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        const current = prev[type]?.percent || 10;
        const next = Math.min(current + Math.floor(Math.random() * 15) + 5, 95);
        if (next >= 95) {
          clearInterval(progressInterval);
        }
        return { ...prev, [type]: { status: 'Uploading...', percent: next } };
      });
    }, 120);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    try {
      const res = await fetch(`/api/applications/${applicationId}/documents`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      clearInterval(progressInterval);

      if (!res.ok) {
        throw new Error(data.error || 'Upload failed.');
      }

      setUploadProgress((prev) => ({ ...prev, [type]: { status: 'Success', percent: 100 } }));
      showToast('Document uploaded successfully!', 'success');
      await loadApplication();
    } catch (err: any) {
      clearInterval(progressInterval);
      showToast(err.message || 'File upload failed.', 'error');
      setUploadProgress((prev) => ({ ...prev, [type]: { status: 'Error', percent: 0 } }));
    }
  };

  // Simulated OCR scan and prefill
  const triggerOCR = async () => {
    setScanningOCR(true);
    try {
      const res = await fetch(`/api/applications/${applicationId}/ocr`, {
        method: 'POST',
      });

      const data = await res.json();
      if (res.ok) {
        setKcseIndexNo(data.kcseIndexNo);
        setKcseYear(data.kcseYear);
        setKcseMeanGrade(data.kcseMeanGrade);
        setSubjectGrades(data.subjectGrades);
        showToast('🤖 OCR Slip scan completed! Index number, year, and subject grades prefilled.', 'success');
        
        // Auto navigate to Step 2 to let them review
        setCurrentStep(2);
      } else {
        showToast(data.error || 'OCR scanning failed.', 'error');
      }
    } catch (err) {
      showToast('Could not reach OCR parsing service.', 'error');
    } finally {
      setScanningOCR(false);
    }
  };

  // Payment triggers
  const triggerMpesaStkPush = async () => {
    if (!stkPhone.trim()) {
      showToast('Please enter a valid M-Pesa phone number.', 'error');
      return;
    }
    setVerifyingPayment(true);
    setError('');
    
    try {
      const res = await fetch('/api/payments/stk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId,
          phone: stkPhone.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setStkSent(true);
        showToast('📲 STK prompt dispatched! Please enter your PIN on your phone and then click Verify.', 'info');
      } else {
        showToast(data.error || 'Payment failed.', 'error');
      }
    } catch (err) {
      showToast('Error processing STK push payment.', 'error');
    } finally {
      setVerifyingPayment(false);
    }
  };

  const verifyMpesaStatus = async () => {
    setVerifyingPayment(true);
    setError('');
    try {
      const res = await fetch(`/api/payments/stk/status?id=${applicationId}`);
      const data = await res.json();
      if (res.ok && data.status === 'paid') {
        showToast('💳 M-Pesa payment received and verified successfully!', 'success');
        setStkSent(false);
        await loadApplication();
      } else {
        showToast(data.message || 'Payment is still pending. Please verify you entered your PIN.', 'info');
      }
    } catch (err) {
      showToast('Error verifying payment status.', 'error');
    } finally {
      setVerifyingPayment(false);
    }
  };

  const triggerManualPayment = async () => {
    if (manualMethod === 'bank' && !depositSlipFile) {
      showToast('Please select the bank deposit slip file to upload.', 'error');
      return;
    }
    if (!manualCode.trim()) {
      showToast('Please enter the transaction reference code.', 'error');
      return;
    }

    setVerifyingPayment(true);
    try {
      const formData = new FormData();
      formData.append('applicationId', applicationId);
      formData.append('paymentMethod', manualMethod);
      formData.append('paymentReference', manualCode.trim());
      if (depositSlipFile) {
        formData.append('file', depositSlipFile);
      }

      const res = await fetch('/api/payments/manual', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        showToast('Manual payment verified successfully via automated check!', 'success');
        await loadApplication();
      } else {
        showToast(data.error || 'Payment verification failed.', 'error');
      }
    } catch (err) {
      showToast('Error submitting manual verification details.', 'error');
    } finally {
      setVerifyingPayment(false);
    }
  };

  const handleSubmitApplication = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/applications/${applicationId}/submit`, {
        method: 'POST',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit application.');
      }

      showToast('Application filed successfully! Download summary receipt below.', 'success');
      router.push('/dashboard');
    } catch (err: any) {
      showToast(err.message || 'Failed to submit application.', 'error');
      setSaving(false);
    }
  };

  // Helper check if file is uploaded
  const getUploadedFile = (type: string) => {
    return app?.documents.find((d) => d.type === type);
  };

  // Real-time precheck comparison
  const runLocalCheck = () => {
    if (!app) return { eligible: false, message: '' };
    if (!kcseMeanGrade) {
      return {
        eligible: false,
        message: 'ℹ️ Please fill in your KCSE details in Step 2 to compute provisional eligibility.',
        meanPassed: false,
        subjectsPassed: false,
      };
    }
    const requiredMean = app.programme.minGradeRequirement.meanGrade;
    const grades = GRADE_OPTIONS;
    const meanVal = grades.indexOf(kcseMeanGrade);
    const reqMeanVal = grades.indexOf(requiredMean);
    const meanPassed = meanVal <= reqMeanVal && meanVal !== -1;

    let subjectsPassed = true;
    const details: string[] = [];

    Object.entries(app.programme.minGradeRequirement.subjects).forEach(([sub, minG]) => {
      const appG = subjectGrades[sub.toLowerCase()];
      if (!appG) {
        subjectsPassed = false;
        details.push(`${sub}: Not yet selected`);
      } else {
        const val = grades.indexOf(appG);
        const reqVal = grades.indexOf(minG as string);
        const passed = val <= reqVal && val !== -1;
        if (!passed) subjectsPassed = false;
        details.push(`${sub.charAt(0).toUpperCase() + sub.slice(1)}: ${appG} vs required ${minG} (${passed ? 'Pass' : 'Fail'})`);
      }
    });

    const eligible = meanPassed && subjectsPassed;
    return {
      eligible,
      message: eligible 
        ? '✅ Provisional precheck passed. Your entered credentials meet the minimum requirements for this programme.' 
        : `❌ Precheck criteria: (Mean grade check: ${meanPassed ? 'Pass' : 'Fail'}). Details: ${details.join(', ')}`,
      meanPassed,
      subjectsPassed
    };
  };

  const precheck = runLocalCheck();

  // Progress calculations
  const progressPercentage = Math.round(((currentStep - 1) / 5) * 100);
  const getEstTimeRemaining = () => {
    if (currentStep <= 3) return 'Estimated time: 4 mins remaining';
    if (currentStep === 4) return 'Estimated time: 2 mins remaining';
    if (currentStep === 5) return 'Estimated time: 1 min remaining';
    return 'Final Step';
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        Loading draft editor panel...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', background: 'var(--bg-card)', border: '1px solid var(--border-light)', padding: '30px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
      
      {/* Wizard progress details bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', fontSize: '12px', color: 'var(--text-light)', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span>Progress: <strong>{progressPercentage}% complete</strong></span>
          <span>&bull;</span>
          <span>{getEstTimeRemaining()}</span>
        </div>
        
        {/* Auto-save live indicator pill */}
        <div 
          id="autosave-status-pill"
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '6px', 
            fontSize: '11px', 
            color: 'var(--text-dark)', 
            background: 'var(--bg-main)', 
            padding: '3px 10px', 
            borderRadius: '20px', 
            border: '1px solid var(--border-light)' 
          }}
        >
          {autoSaveStatus === 'saving' ? (
            <>
              <span style={{ display: 'inline-block', width: '7px', height: '7px', borderRadius: '50%', background: 'var(--accent-gold)' }} />
              <span style={{ color: 'var(--accent-gold)', fontWeight: '600' }}>Auto-saving draft...</span>
            </>
          ) : autoSaveStatus === 'error' ? (
            <>
              <span style={{ display: 'inline-block', width: '7px', height: '7px', borderRadius: '50%', background: 'hsl(0, 72%, 51%)' }} />
              <span style={{ color: 'hsl(0, 72%, 51%)' }}>Auto-save paused</span>
            </>
          ) : lastSaved ? (
            <>
              <span style={{ display: 'inline-block', width: '7px', height: '7px', borderRadius: '50%', background: 'var(--accent-teal)' }} />
              <span style={{ color: 'var(--text-light)' }}>
                Auto-saved at <strong>{lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</strong>
              </span>
            </>
          ) : (
            <>
              <span style={{ display: 'inline-block', width: '7px', height: '7px', borderRadius: '50%', background: 'var(--accent-teal)' }} />
              <span style={{ color: 'var(--text-light)' }}>Auto-save active (30s)</span>
            </>
          )}
        </div>
      </div>
      
      {/* Progress Bar visual indicator */}
      <div style={{ width: '100%', height: '6px', background: 'var(--bg-main)', borderRadius: '3px', overflow: 'hidden', marginBottom: '30px' }}>
        <div style={{ width: `${progressPercentage}%`, height: '100%', background: 'linear-gradient(90deg, var(--primary-blue), var(--accent-teal))', transition: 'width 0.3s ease' }} />
      </div>

      {/* Steps Stepper */}
      <div className="step-indicator" style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '30px', marginBottom: '30px' }}>
        {[
          { step: 1, label: 'Personal' },
          { step: 2, label: 'KCSE Info' },
          { step: 3, label: 'Grades' },
          { step: 4, label: 'Uploads' },
          { step: 5, label: 'Payment' },
          { step: 6, label: 'Review' },
        ].map((s) => {
          const isCompleted = currentStep > s.step;
          const isActive = currentStep === s.step;
          return (
            <div key={s.step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexGrow: s.step < 6 ? 1 : 0, position: 'relative' }}>
              <div 
                style={{ 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '50%', 
                  background: isCompleted ? 'var(--accent-teal)' : isActive ? 'var(--primary-blue)' : 'var(--bg-main)',
                  color: isCompleted || isActive ? 'white' : 'var(--text-light)',
                  border: isCompleted || isActive ? 'none' : '1px solid var(--border-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '700',
                  fontSize: '13px',
                  zIndex: 2,
                }}
              >
                {isCompleted ? '✓' : s.step}
              </div>
              <span style={{ fontSize: '11px', marginTop: '6px', color: isActive ? 'var(--primary-blue)' : isCompleted ? 'var(--accent-teal)' : 'var(--text-light)', fontWeight: isActive || isCompleted ? '600' : '400' }}>
                {s.label}
              </span>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '20px', color: 'var(--text-dark)' }}>
          Step {currentStep} of 6: {
            currentStep === 1 ? 'Personal Particulars' :
            currentStep === 2 ? 'KCSE Certification Details' :
            currentStep === 3 ? 'Subject Specific Grades' :
            currentStep === 4 ? 'Document Upload Center' :
            currentStep === 5 ? 'Application Processing Fee' :
            'Summary Review & Submit'
          }
        </h2>
        <span style={{ fontSize: '12px', background: 'var(--primary-light)', color: 'var(--primary-blue)', padding: '4px 10px', borderRadius: '4px', fontWeight: '700' }}>
          {app?.programme.code} Application
        </span>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ padding: '12px 16px', fontSize: '13px' }}>
          <div>⚠️ {error}</div>
        </div>
      )}

      {/* Step Components */}
      <form onSubmit={(e) => e.preventDefault()} style={{ minHeight: '260px' }}>
        
        {/* Step 1: Personal details & Secondary Preference */}
        {currentStep === 1 && (
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Date of Birth *</label>
              <input
                type="date"
                required
                value={personalDetails.dob}
                onChange={(e) => setPersonalDetails({ ...personalDetails, dob: e.target.value })}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Gender *</label>
              <select
                value={personalDetails.gender}
                onChange={(e) => setPersonalDetails({ ...personalDetails, gender: e.target.value })}
                className="form-input"
              >
                <option value="">-- Select Gender --</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">National ID / Birth Cert Number *</label>
              <input
                type="text"
                required
                placeholder="Enter ID / Birth Certificate No"
                value={personalDetails.idNumber}
                onChange={(e) => setPersonalDetails({ ...personalDetails, idNumber: e.target.value })}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">County of Residence *</label>
              <input
                type="text"
                required
                placeholder="Enter County of Residence"
                value={personalDetails.county}
                onChange={(e) => setPersonalDetails({ ...personalDetails, county: e.target.value })}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Guardian / Sponsor Emergency Contact *</label>
              <input
                type="tel"
                required
                placeholder="Enter Guardian / Sponsor Phone (e.g. 0712345678)"
                value={personalDetails.guardianContact}
                onChange={(e) => setPersonalDetails({ ...personalDetails, guardianContact: e.target.value })}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Secondary Program Choice (Optional)</label>
              <select
                value={secondaryProgrammeId}
                onChange={(e) => setSecondaryProgrammeId(e.target.value)}
                className="form-input"
                style={{ fontWeight: '600' }}
              >
                <option value="">-- Select Secondary Preference --</option>
                {programmes
                  .filter((p) => p.id !== app?.programme.id)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.code})
                    </option>
                  ))}
              </select>
            </div>
          </div>
        )}

        {/* Step 2: KCSE Index */}
        {currentStep === 2 && (
          <div className="form-grid">
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">KCSE Index Number *</label>
              <input
                type="text"
                required
                placeholder="Enter 11-digit KNEC Index Number (e.g. 40732101001)"
                value={kcseIndexNo}
                onChange={(e) => setKcseIndexNo(e.target.value)}
                className="form-input"
                style={{ textTransform: 'uppercase', fontWeight: '600' }}
              />
              <span style={{ fontSize: '11px', color: 'var(--text-light)', marginTop: '4px', display: 'block' }}>
                Enter the 11-digit KNEC index number (format: 40732101001 or 40732101001/2024).
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">KCSE Examination Year *</label>
              <input
                type="number"
                required
                min={1990}
                max={2026}
                placeholder="e.g. 2024"
                value={kcseYear}
                onChange={(e) => setKcseYear(e.target.value === '' ? '' : Number(e.target.value))}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">KCSE Mean Grade *</label>
              <select
                value={kcseMeanGrade}
                onChange={(e) => setKcseMeanGrade(e.target.value)}
                className="form-input"
                style={{ fontWeight: '700' }}
              >
                <option value="">-- Select KCSE Mean Grade --</option>
                {GRADE_OPTIONS.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Step 3: Subject Grades */}
        {currentStep === 3 && (
          <div>
            <p style={{ fontSize: '13px', color: 'var(--text-light)', marginBottom: '20px' }}>
              Select grades received in key academic subject groups. These values will be validated by the admissions panel against original result slips.
            </p>
            <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div>
                <label className="form-label">English Grade *</label>
                <select
                  value={subjectGrades.english}
                  onChange={(e) => setSubjectGrades({ ...subjectGrades, english: e.target.value })}
                  className="form-input"
                >
                  <option value="">-- Select Grade --</option>
                  {GRADE_OPTIONS.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">Kiswahili Grade *</label>
                <select
                  value={subjectGrades.kiswahili}
                  onChange={(e) => setSubjectGrades({ ...subjectGrades, kiswahili: e.target.value })}
                  className="form-input"
                >
                  <option value="">-- Select Grade --</option>
                  {GRADE_OPTIONS.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">Mathematics Grade *</label>
                <select
                  value={subjectGrades.mathematics}
                  onChange={(e) => setSubjectGrades({ ...subjectGrades, mathematics: e.target.value })}
                  className="form-input"
                >
                  <option value="">-- Select Grade --</option>
                  {GRADE_OPTIONS.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">Science (Biology/Chem/Physics) Grade *</label>
                <select
                  value={subjectGrades.science}
                  onChange={(e) => setSubjectGrades({ ...subjectGrades, science: e.target.value })}
                  className="form-input"
                >
                  <option value="">-- Select Grade --</option>
                  {GRADE_OPTIONS.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Uploads & OCR prefills */}
        {currentStep === 4 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <p style={{ fontSize: '13px', color: 'var(--text-light)', margin: 0 }}>
                Drag and drop your files directly into the areas below, or click to upload. (Max size: 5MB. Formats: PDF, JPG, PNG).
              </p>
              
              {/* OCR scanner trigger */}
              <button
                type="button"
                className="btn btn-secondary"
                disabled={scanningOCR || !getUploadedFile('kcse_cert')}
                onClick={triggerOCR}
                style={{
                  background: 'var(--primary-light)',
                  color: 'var(--primary-blue)',
                  borderColor: 'var(--primary-blue)',
                  fontSize: '12px',
                  padding: '8px 16px',
                  opacity: getUploadedFile('kcse_cert') ? 1 : 0.65,
                }}
                title={getUploadedFile('kcse_cert') ? 'Extract details' : 'Upload KCSE slip first to extract details'}
              >
                {scanningOCR ? '🤖 Scanning Slip...' : '🤖 Scan & Prefill via OCR'}
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {[
                { type: 'id_copy', label: 'Copy of National ID / Birth Certificate' },
                { type: 'kcse_cert', label: 'KCSE Certificate or Certified Result Slip' },
                { type: 'photo', label: 'Recent Passport-size Photograph' },
                { type: 'birth_cert', label: 'Official Birth Certificate Scan' },
              ].map((docType) => {
                const uploaded = getUploadedFile(docType.type);
                const progress = uploadProgress[docType.type];
                const isDragActive = dragging[docType.type] || false;
                const isImage = uploaded && /\.(jpg|jpeg|png)$/i.test(uploaded.fileName);

                return (
                  <div 
                    key={docType.type} 
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragging(prev => ({ ...prev, [docType.type]: true }));
                    }}
                    onDragLeave={() => {
                      setDragging(prev => ({ ...prev, [docType.type]: false }));
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragging(prev => ({ ...prev, [docType.type]: false }));
                      const file = e.dataTransfer.files?.[0];
                      if (file) handleFileUpload(docType.type, file);
                    }}
                    style={{ 
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      background: isDragActive ? 'rgba(37, 99, 235, 0.05)' : 'var(--bg-main)', 
                      padding: '20px', 
                      borderRadius: 'var(--radius-md)',
                      border: isDragActive ? '2px dashed var(--primary-blue)' : '1px solid var(--border-light)',
                      transition: 'all 0.2s ease',
                      boxShadow: isDragActive ? 'var(--shadow-glow)' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {uploaded ? (
                          isImage ? (
                            <img 
                              src={uploaded.fileUrl} 
                              alt="preview" 
                              style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border-light)' }} 
                            />
                          ) : (
                            <div style={{ width: '40px', height: '40px', background: 'var(--primary-light)', color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', borderRadius: '4px', fontWeight: 'bold' }}>
                              📄
                            </div>
                          )
                        ) : (
                          <div style={{ width: '40px', height: '40px', background: 'var(--border-light)', color: 'var(--text-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', borderRadius: '4px' }}>
                            📁
                          </div>
                        )}
                        
                        <div>
                          <strong style={{ fontSize: '14px', color: 'var(--text-dark)' }}>{docType.label}</strong>
                          <div style={{ fontSize: '11px', color: 'var(--text-light)' }}>
                            {uploaded ? `✓ Uploaded: ${uploaded.fileName}` : 'Drag & drop file here or use selection button'}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(docType.type, file);
                          }}
                          style={{ display: 'none' }}
                          id={`file-${docType.type}`}
                        />
                        <label 
                          htmlFor={`file-${docType.type}`}
                          className="btn btn-secondary" 
                          style={{ display: 'inline-flex', padding: '8px 14px', fontSize: '12px', cursor: 'pointer', margin: 0 }}
                        >
                          {uploaded ? '🔄 Replace' : '📤 Choose File'}
                        </label>

                        <div style={{ minWidth: '80px', textAlign: 'right' }}>
                          {uploaded ? (
                            <button
                              type="button"
                              onClick={() => {
                                setPreviewDocUrl(uploaded.fileUrl);
                                setPreviewDocName(uploaded.fileName);
                              }}
                              className="btn-link"
                              style={{ fontSize: '12px', color: 'var(--primary-blue)', fontWeight: '600', background: 'transparent', border: 'none', cursor: 'pointer' }}
                            >
                              👁️ Preview
                            </button>
                          ) : progress?.status === 'Uploading...' ? (
                            <span style={{ fontSize: '12px', color: 'var(--primary-blue)', fontWeight: '600' }}>
                              {progress.percent}%
                            </span>
                          ) : progress?.status === 'Error' ? (
                            <span style={{ fontSize: '12px', color: 'hsl(0, 72%, 51%)', fontWeight: '600' }}>
                              Error
                            </span>
                          ) : (
                            <span style={{ fontSize: '12px', color: 'var(--text-light)' }}>Required</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {progress?.status === 'Uploading...' && (
                      <div style={{ width: '100%', height: '4px', background: 'var(--border-light)', borderRadius: '2px', overflow: 'hidden', marginTop: '4px' }}>
                        <div 
                          style={{ 
                            width: `${progress.percent}%`, 
                            height: '100%', 
                            background: 'var(--primary-blue)', 
                            borderRadius: '2px',
                            transition: 'width 0.15s ease-out' 
                          }} 
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 5: Application Processing Fee Payment */}
        {currentStep === 5 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ background: 'var(--bg-main)', border: '1px solid var(--border-light)', padding: '20px', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ fontSize: '14px', color: 'var(--text-dark)' }}>Application Processing Fee</strong>
                <p style={{ fontSize: '12px', color: 'var(--text-light)', margin: 0 }}>Required to cover academic verification and transcript indexing costs.</p>
              </div>
              <span style={{ fontSize: '20px', fontWeight: '800', color: 'var(--primary-blue)' }}>KES 1,000.00</span>
            </div>

            {app?.paymentStatus === 'paid' ? (
              <div className="alert alert-success" style={{ display: 'flex', flexDirection: 'column', gap: '10px', margin: 0 }}>
                <div>
                  <strong>✅ Payment Received & Verified</strong>
                  <p style={{ fontSize: '13px', marginTop: '4px' }}>
                    Your fee payment has been successfully recorded. Transaction reference: <strong>{app.paymentReference}</strong>.
                  </p>
                </div>
                {app.paymentReceiptUrl && (
                  <a 
                    href={app.paymentReceiptUrl} 
                    download
                    className="btn btn-secondary" 
                    style={{ fontSize: '12px', padding: '6px 12px', alignSelf: 'flex-start', background: 'white' }}
                  >
                    📄 Download PDF Payment Receipt
                  </a>
                )}
              </div>
            ) : (
              <div style={{ border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                {/* Tabs */}
                <div style={{ display: 'flex', background: 'var(--bg-main)', borderBottom: '1px solid var(--border-light)' }}>
                  <button
                    type="button"
                    onClick={() => setPaymentOption('stk')}
                    style={{
                      flexGrow: 1,
                      padding: '12px',
                      background: paymentOption === 'stk' ? 'var(--bg-card)' : 'transparent',
                      border: 'none',
                      borderRight: '1px solid var(--border-light)',
                      fontWeight: '700',
                      cursor: 'pointer',
                      color: paymentOption === 'stk' ? 'var(--primary-blue)' : 'var(--text-light)',
                    }}
                  >
                    📲 M-Pesa STK Push
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentOption('manual')}
                    style={{
                      flexGrow: 1,
                      padding: '12px',
                      background: paymentOption === 'manual' ? 'var(--bg-card)' : 'transparent',
                      border: 'none',
                      fontWeight: '700',
                      cursor: 'pointer',
                      color: paymentOption === 'manual' ? 'var(--primary-blue)' : 'var(--text-light)',
                    }}
                  >
                    🏛️ Manual Verification (Bank/Code)
                  </button>
                </div>

                <div style={{ padding: '24px' }}>
                  {paymentOption === 'stk' ? (
                    <div>
                      <p style={{ fontSize: '13px', color: 'var(--text-light)', marginBottom: '16px' }}>
                        Enter your active M-Pesa phone number. We will dispatch an automated prompt directly to your phone requesting you to input your M-Pesa PIN.
                      </p>
                      
                      <div className="form-group" style={{ maxWidth: '380px' }}>
                        <label className="form-label">M-Pesa Mobile Number *</label>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <input
                            type="tel"
                            placeholder="e.g. 0712345678"
                            value={stkPhone}
                            onChange={(e) => setStkPhone(e.target.value)}
                            className="form-input"
                            style={{ fontWeight: '600' }}
                            disabled={stkSent}
                          />
                          <button
                            type="button"
                            className="btn btn-primary"
                            disabled={verifyingPayment || stkSent}
                            onClick={triggerMpesaStkPush}
                            style={{ flexShrink: 0, padding: '10px 16px' }}
                          >
                            {verifyingPayment && !stkSent ? 'Sending...' : 'Pay KES 1,000'}
                          </button>
                        </div>
                      </div>

                      {stkSent && (
                        <div style={{ marginTop: '16px', background: 'var(--bg-main)', border: '1px dashed var(--accent-gold)', padding: '16px', borderRadius: 'var(--radius-md)', maxWidth: '380px' }}>
                          <p style={{ fontSize: '12.5px', color: 'var(--text-dark)', margin: '0 0 12px 0', lineHeight: '1.4' }}>
                            📲 STK Push prompt sent! Please unlock your phone and input your M-Pesa PIN, then click below to verify the transaction status.
                          </p>
                          <button
                            type="button"
                            className="btn btn-primary"
                            disabled={verifyingPayment}
                            onClick={verifyMpesaStatus}
                            style={{ background: 'var(--accent-gold)', borderColor: 'var(--accent-gold)', width: '100%' }}
                          >
                            {verifyingPayment ? 'Verifying status with Safaricom...' : '🔄 Verify Payment Status'}
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <div className="form-group">
                        <label className="form-label">Payment Channel *</label>
                        <div style={{ display: 'flex', gap: '20px' }}>
                          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                            <input
                              type="radio"
                              name="manualMethod"
                              checked={manualMethod === 'mpesa'}
                              onChange={() => setManualMethod('mpesa')}
                            />
                            <span>M-Pesa Code Entry</span>
                          </label>
                          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                            <input
                              type="radio"
                              name="manualMethod"
                              checked={manualMethod === 'bank'}
                              onChange={() => setManualMethod('bank')}
                            />
                            <span>Co-op Bank Deposit Slip</span>
                          </label>
                        </div>
                      </div>

                      <div className="form-grid">
                        <div className="form-group">
                          <label className="form-label">
                            {manualMethod === 'mpesa' ? 'M-Pesa Confirmation Code *' : 'Bank Slip Reference ID *'}
                          </label>
                          <input
                            type="text"
                            placeholder={manualMethod === 'mpesa' ? 'e.g. QRC1234567' : 'e.g. COOP-449382'}
                            value={manualCode}
                            onChange={(e) => setManualCode(e.target.value)}
                            className="form-input"
                            style={{ textTransform: 'uppercase', fontWeight: '700' }}
                          />
                        </div>

                        {manualMethod === 'bank' && (
                          <div className="form-group">
                            <label className="form-label">Upload Slip Copy Scan *</label>
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) setDepositSlipFile(file);
                              }}
                              className="form-input"
                            />
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        className="btn btn-primary"
                        disabled={verifyingPayment}
                        onClick={triggerManualPayment}
                        style={{ alignSelf: 'flex-start', padding: '10px 20px' }}
                      >
                        {verifyingPayment ? 'Verifying Reference...' : 'Submit & Verify Payment'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 6: Review & Final Submit */}
        {currentStep === 6 && (
          <div>
            <p style={{ fontSize: '13px', color: 'var(--text-light)', marginBottom: '20px' }}>
              Please review all entries before submitting. Submissions are locked and cannot be edited.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', background: 'var(--bg-main)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', fontSize: '13px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div><strong>Selected Course:</strong> {app?.programme.name}</div>
                <div><strong>Secondary Preference:</strong> {app?.secondaryProgramme?.name || 'None Selected'}</div>
                <div><strong>ID / Certificate Number:</strong> {personalDetails.idNumber}</div>
                <div><strong>Date of Birth:</strong> {personalDetails.dob}</div>
                <div><strong>Gender:</strong> {personalDetails.gender}</div>
                <div><strong>County of Residence:</strong> {personalDetails.county}</div>
                <div><strong>Guardian Emergency Contact:</strong> {personalDetails.guardianContact}</div>
              </div>
              <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div><strong>KCSE Index Number:</strong> {kcseIndexNo}</div>
                <div><strong>KCSE Exam Year:</strong> {kcseYear}</div>
                <div><strong>KCSE Mean Grade:</strong> {kcseMeanGrade}</div>
              </div>
              <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '12px' }}>
                <strong>Subject Specific Grades:</strong>
                <div style={{ display: 'flex', gap: '20px', marginTop: '6px' }}>
                  <span>English: <strong>{subjectGrades.english}</strong></span>
                  <span>Kiswahili: <strong>{subjectGrades.kiswahili}</strong></span>
                  <span>Mathematics: <strong>{subjectGrades.mathematics}</strong></span>
                  <span>Science: <strong>{subjectGrades.science}</strong></span>
                </div>
              </div>
              <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '12px' }}>
                <strong>Uploaded Credentials Checklist:</strong>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '6px' }}>
                  {['id_copy', 'kcse_cert', 'photo', 'birth_cert'].map((t) => (
                    <span key={t} style={{ fontSize: '11px', background: getUploadedFile(t) ? 'hsl(142, 70%, 92%)' : 'hsl(0, 72%, 95%)', color: getUploadedFile(t) ? 'hsl(142, 76%, 15%)' : 'hsl(0, 72%, 25%)', padding: '2px 8px', borderRadius: '4px', fontWeight: '600' }}>
                      {t.replace('_', ' ').toUpperCase()}: {getUploadedFile(t) ? '✓ OK' : '❌ MISSING'}
                    </span>
                  ))}
                </div>
              </div>
              <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '12px' }}>
                <strong>Processing Fee Payment Checklist:</strong>
                <div style={{ marginTop: '6px' }}>
                  <span style={{ fontSize: '11px', background: app?.paymentStatus === 'paid' ? 'hsl(142, 70%, 92%)' : 'hsl(0, 72%, 95%)', color: app?.paymentStatus === 'paid' ? 'hsl(142, 76%, 15%)' : 'hsl(0, 72%, 25%)', padding: '2px 8px', borderRadius: '4px', fontWeight: '600' }}>
                    PAYMENT STATUS: {app?.paymentStatus.toUpperCase()} {app?.paymentStatus === 'paid' ? `(${app.paymentReference})` : ''}
                  </span>
                </div>
              </div>
            </div>

            {/* Real-time precheck status */}
            <div style={{ marginTop: '20px' }}>
              <div className={precheck.eligible ? 'alert alert-success' : 'alert alert-danger'} style={{ margin: 0, fontSize: '13px' }}>
                <div>
                  <strong>Academic Eligibility Pre-check:</strong>
                  <p style={{ marginTop: '4px' }}>{precheck.message}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </form>

      {/* Action Footer buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-light)', paddingTop: '20px', marginTop: '30px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {currentStep > 1 ? (
            <button onClick={handlePrevStep} disabled={saving} className="btn btn-secondary" id="wizard-prev-step-btn">
              &larr; Back
            </button>
          ) : (
            <Link href="/dashboard" className="btn btn-secondary" id="wizard-cancel-btn">
              Cancel & Return
            </Link>
          )}

          <button 
            type="button" 
            onClick={() => saveDraft(false)} 
            disabled={saving} 
            className="btn btn-secondary"
            id="wizard-manual-save-draft-btn"
            title="Save draft immediately"
            style={{ fontSize: '13px', padding: '8px 14px' }}
          >
            {saving ? '💾 Saving...' : '💾 Save Draft'}
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {lastSaved && (
            <span style={{ fontSize: '12px', color: 'var(--text-light)' }} className="wizard-saved-timestamp">
              Last saved: {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          )}

          {currentStep < 6 ? (
            <button 
              onClick={handleNextStep} 
              disabled={saving || (currentStep === 4 && (!app?.documents || app.documents.length < 4))} 
              className="btn btn-primary"
              id="wizard-next-step-btn"
            >
              {saving ? 'Saving...' : 'Save & Continue &rarr;'}
            </button>
          ) : (
            <button 
              onClick={handleSubmitApplication} 
              disabled={saving || !app?.documents || app.documents.length < 4 || app.paymentStatus !== 'paid'} 
              className="btn btn-primary"
              id="wizard-submit-app-btn"
              style={{ background: 'var(--accent-teal)', borderColor: 'var(--accent-teal)' }}
            >
              {saving ? 'Submitting...' : 'Confirm & Submit Application'}
            </button>
          )}
        </div>
      </div>

      {currentStep === 4 && (!app?.documents || app.documents.length < 4) && (
        <p style={{ color: 'hsl(0, 72%, 51%)', fontSize: '12px', marginTop: '10px', textAlign: 'right' }}>
          * You must upload all 4 required credentials before continuing.
        </p>
      )}

      {/* In-Browser Document Previewer Modal */}
      {previewDocUrl && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            width: '90%',
            maxWidth: '750px',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-main)' }}>
              <span style={{ fontWeight: '700', color: 'var(--text-dark)', fontSize: '14px' }}>Document Preview: <strong>{previewDocName}</strong></span>
              <button 
                onClick={() => {
                  setPreviewDocUrl(null);
                  setPreviewDocName('');
                }}
                className="btn btn-secondary"
                style={{ padding: '4px 10px', fontSize: '12px', margin: 0 }}
              >
                Close Preview
              </button>
            </div>
            <div style={{ background: '#0f172a', padding: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
              {previewDocUrl.toLowerCase().endsWith('.pdf') ? (
                <iframe
                  src={`${previewDocUrl}#toolbar=0`}
                  style={{ width: '100%', height: '500px', border: 'none' }}
                />
              ) : (
                <img 
                  src={previewDocUrl} 
                  alt="Credential Slip Scan" 
                  style={{ maxWidth: '100%', maxHeight: '500px', objectFit: 'contain' }}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
