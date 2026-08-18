'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

interface Application {
  id: string;
  status: string;
  kcseIndexNo: string;
  kcseMeanGrade: string;
  submittedAt: string | null;
  user: {
    fullName: string;
    email: string;
    phone: string;
  };
  programme: {
    id: string;
    name: string;
    code: string;
  };
  eligibilityResult: any;
}

interface Programme {
  id: string;
  name: string;
  code: string;
}

interface BulkResult {
  message: string;
  decision: 'approve' | 'reject';
  successCount: number;
  failedCount: number;
  results: Array<{ id: string; applicantName: string; status: string; serialNumber?: string; error?: string }>;
}

export default function AdminPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & filter states
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('submitted'); // default to pending submitted queue
  const [progFilter, setProgFilter] = useState('All');

  // Pagination states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const limit = 10;

  // Bulk selection states
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const [bulkActionModal, setBulkActionModal] = useState<'approve' | 'reject' | null>(null);
  const [bulkNotes, setBulkNotes] = useState('');
  const [bulkFeedback, setBulkFeedback] = useState<BulkResult | null>(null);

  const loadData = useCallback(async (targetPage = 1) => {
    setLoading(true);
    try {
      // Load programmes on first mount
      if (programmes.length === 0) {
        const progRes = await fetch('/api/programmes');
        if (progRes.ok) {
          const progData = await progRes.json();
          setProgrammes(progData.programmes || []);
        }
      }

      // Construct request url with params
      const params = new URLSearchParams();
      if (statusFilter !== 'All') params.append('status', statusFilter);
      if (progFilter !== 'All') params.append('programmeId', progFilter);
      if (search.trim()) params.append('search', search.trim());
      params.append('page', String(targetPage));
      params.append('limit', String(limit));

      const appRes = await fetch(`/api/applications/admin?${params.toString()}`);
      if (appRes.ok) {
        const appData = await appRes.json();
        setApplications(appData.applications || []);
        
        // Load pagination details
        if (appData.pagination) {
          setPage(appData.pagination.page);
          setTotalPages(appData.pagination.pages);
          setTotalRecords(appData.pagination.total);
        }
      }
    } catch (err) {
      console.error('Failed to load admin queue:', err);
    } finally {
      setLoading(false);
    }
  }, [programmes.length, statusFilter, progFilter, search, limit]);

  // Re-fetch data on filter changes (resets page to 1 & clears selection)
  useEffect(() => {
    setPage(1);
    setSelectedIds([]);
    loadData(1);
  }, [statusFilter, progFilter, loadData]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSelectedIds([]);
    loadData(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    setSelectedIds([]);
    loadData(newPage);
  };

  // Checkbox Selection Helpers
  const isAllOnPageSelected = applications.length > 0 && applications.every((app) => selectedIds.includes(app.id));
  const isSomeOnPageSelected = applications.some((app) => selectedIds.includes(app.id)) && !isAllOnPageSelected;

  const toggleSelectAllPage = () => {
    if (isAllOnPageSelected) {
      const pageIds = applications.map((a) => a.id);
      setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      const pageIds = applications.map((a) => a.id);
      setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const toggleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  // Execute Bulk Decision
  const handleExecuteBulkDecision = async () => {
    if (!bulkActionModal || selectedIds.length === 0) return;
    setIsBulkProcessing(true);
    setBulkFeedback(null);

    try {
      const res = await fetch('/api/applications/bulk-decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationIds: selectedIds,
          decision: bulkActionModal,
          notes: bulkNotes,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setBulkFeedback(data);
        setSelectedIds([]);
        setBulkActionModal(null);
        setBulkNotes('');
        await loadData(page);
      } else {
        alert(data.error || 'Failed to process bulk decision.');
      }
    } catch (err: any) {
      console.error('Bulk decision error:', err);
      alert('An unexpected error occurred while executing bulk decision.');
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      draft: { bg: 'hsl(210, 16%, 93%)', text: 'var(--text-light)', label: 'Draft' },
      submitted: { bg: 'hsl(38, 92%, 96%)', text: 'var(--accent-gold)', label: 'Submitted (Review)' },
      eligibility_failed: { bg: 'hsl(0, 72%, 97%)', text: 'hsl(0, 72%, 30%)', label: 'Ineligible' },
      rejected: { bg: 'hsl(0, 72%, 97%)', text: 'hsl(0, 72%, 30%)', label: 'Rejected' },
      letter_issued: { bg: 'hsl(142, 70%, 92%)', text: 'hsl(142, 76%, 15%)', label: 'Admitted' },
    };

    const badge = badges[status] || { bg: 'var(--border-light)', text: 'var(--text-light)', label: status };
    return (
      <span style={{ fontSize: '11px', background: badge.bg, color: badge.text, padding: '3px 8px', borderRadius: '4px', fontWeight: '700', whiteSpace: 'nowrap' }}>
        {badge.label}
      </span>
    );
  };

  const selectedApplications = applications.filter((app) => selectedIds.includes(app.id));

  return (
    <div style={{ position: 'relative', paddingBottom: selectedIds.length > 0 ? '110px' : '30px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px' }}>Admissions Registry Queue</h1>
        <p style={{ color: 'var(--text-light)', fontSize: '14px' }}>Evaluate applicant profiles and issue digital admission letters with batch actions.</p>
      </div>

      {/* Bulk Result Banner */}
      {bulkFeedback && (
        <div 
          style={{ 
            background: bulkFeedback.decision === 'approve' ? 'hsl(142, 70%, 95%)' : 'hsl(0, 72%, 96%)',
            border: `1px solid ${bulkFeedback.decision === 'approve' ? 'hsl(142, 70%, 75%)' : 'hsl(0, 72%, 75%)'}`,
            borderRadius: 'var(--radius-md)',
            padding: '16px 20px',
            marginBottom: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div>
            <div style={{ fontWeight: '700', color: bulkFeedback.decision === 'approve' ? 'hsl(142, 76%, 20%)' : 'hsl(0, 72%, 30%)', fontSize: '15px' }}>
              {bulkFeedback.decision === 'approve' ? '🎉 Batch Approval & Admission Letters Completed' : '⚠️ Batch Rejection Processed'}
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-dark)' }}>
              {bulkFeedback.message}
            </p>
          </div>
          <button 
            onClick={() => setBulkFeedback(null)}
            className="btn btn-secondary"
            style={{ padding: '6px 12px', fontSize: '12px', margin: 0 }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', padding: '20px', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--accent-gold)' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-light)', fontWeight: '600' }}>ACTIVE FILTERED</div>
          <h2 style={{ fontSize: '28px', margin: '4px 0 0', color: 'var(--text-dark)' }}>{totalRecords}</h2>
        </div>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', padding: '20px', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--accent-teal)' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-light)', fontWeight: '600' }}>SELECTED IN QUEUE</div>
          <h2 style={{ fontSize: '28px', margin: '4px 0 0', color: selectedIds.length > 0 ? 'var(--primary-blue)' : 'var(--text-dark)' }}>
            {selectedIds.length}
          </h2>
        </div>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', padding: '20px', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--primary-blue)' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-light)', fontWeight: '600' }}>PAGES TOTAL</div>
          <h2 style={{ fontSize: '28px', margin: '4px 0 0', color: 'var(--text-dark)' }}>{totalPages}</h2>
        </div>
      </div>

      {/* Filter and Search Panel */}
      <div 
        style={{ 
          background: 'var(--bg-card)', 
          border: '1px solid var(--border-light)', 
          padding: '20px', 
          borderRadius: 'var(--radius-lg)', 
          marginBottom: '30px',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flexGrow: 1, minWidth: '220px' }}>
            <label className="form-label">Search Applicant</label>
            <input
              type="text"
              placeholder="Name, Index Number, or Email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input"
            />
          </div>

          <div style={{ width: '180px' }}>
            <label className="form-label">Filter by Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-input"
            >
              <option value="All">All Applications</option>
              <option value="submitted">Submitted (Pending)</option>
              <option value="letter_issued">Admitted (Issued)</option>
              <option value="rejected">Rejected</option>
              <option value="eligibility_failed">Ineligible (Auto-failed)</option>
              <option value="draft">Drafts</option>
            </select>
          </div>

          <div style={{ width: '180px' }}>
            <label className="form-label">Filter by Programme</label>
            <select
              value={progFilter}
              onChange={(e) => setProgFilter(e.target.value)}
              className="form-input"
            >
              <option value="All">All Courses</option>
              {programmes.map((p) => (
                <option key={p.id} value={p.id}>{p.code}</option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn btn-primary" style={{ padding: '12px 20px' }}>
            🔍 Query
          </button>
        </form>
      </div>

      {/* Queue Table */}
      <div 
        style={{ 
          background: 'var(--bg-card)', 
          border: '1px solid var(--border-light)', 
          borderRadius: 'var(--radius-lg)', 
          boxShadow: 'var(--shadow-sm)',
          overflow: 'hidden'
        }}
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px', color: 'var(--text-light)' }}>
            Loading queue records...
          </div>
        ) : applications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px', color: 'var(--text-light)' }}>
            No applications match the search query parameters.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--primary-navy)', color: 'white' }}>
                  <th style={{ width: '44px', padding: '12px 14px', textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      id="select-all-queue-checkbox"
                      aria-label="Select all applicants on page"
                      checked={isAllOnPageSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = isSomeOnPageSelected;
                      }}
                      onChange={toggleSelectAllPage}
                      style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: 'var(--primary-blue)' }}
                    />
                  </th>
                  <th style={{ padding: '12px 16px' }}>Applicant Name</th>
                  <th style={{ padding: '12px 16px' }}>Course</th>
                  <th style={{ padding: '12px 16px' }}>KCSE Index No.</th>
                  <th style={{ padding: '12px 16px' }}>Mean</th>
                  <th style={{ padding: '12px 16px' }}>Pre-Check</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                  <th style={{ padding: '12px 16px' }}>Submitted Date</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => {
                  const isSelected = selectedIds.includes(app.id);
                  return (
                    <tr 
                      key={app.id} 
                      style={{ 
                        borderBottom: '1px solid var(--border-light)', 
                        transition: 'background-color 0.15s ease',
                        backgroundColor: isSelected ? 'rgba(37, 99, 235, 0.08)' : undefined
                      }}
                    >
                      <td style={{ width: '44px', padding: '12px 14px', textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          id={`select-app-${app.id}`}
                          aria-label={`Select ${app.user.fullName}`}
                          checked={isSelected}
                          onChange={() => toggleSelectRow(app.id)}
                          style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: 'var(--primary-blue)' }}
                        />
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: '600', color: 'var(--text-dark)' }}>
                        {app.user.fullName}
                        <div style={{ fontSize: '11px', color: 'var(--text-light)', fontWeight: '400' }}>{app.user.email}</div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <strong style={{ color: 'var(--primary-blue)' }}>{app.programme.code}</strong>
                      </td>
                      <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontWeight: '600' }}>{app.kcseIndexNo || 'N/A'}</td>
                      <td style={{ padding: '12px 16px', fontWeight: '700' }}>{app.kcseMeanGrade || 'N/A'}</td>
                      <td style={{ padding: '12px 16px' }}>
                        {app.eligibilityResult?.eligible ? (
                          <span style={{ color: 'var(--accent-teal)', fontWeight: '700' }}>Pass</span>
                        ) : app.status === 'draft' ? (
                          <span style={{ color: 'var(--text-light)' }}>Draft</span>
                        ) : (
                          <span style={{ color: 'hsl(0, 72%, 51%)', fontWeight: '700' }}>Fail</span>
                        )}
                      </td>
                      <td style={{ padding: '12px 16px' }}>{getStatusBadge(app.status)}</td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-light)' }}>
                        {app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        {app.status === 'draft' ? (
                          <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>No Action</span>
                        ) : (
                          <Link 
                            href={`/admin/applications/${app.id}`} 
                            className="btn btn-primary"
                            style={{ padding: '6px 12px', fontSize: '11px', margin: 0 }}
                          >
                            Review File &rarr;
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderTop: '1px solid var(--border-light)', background: 'var(--bg-main)' }}>
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="btn btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '12px', margin: 0 }}
                >
                  &larr; Previous Page
                </button>
                <span style={{ fontSize: '12.5px', color: 'var(--text-light)' }}>
                  Showing Page <strong>{page}</strong> of <strong>{totalPages}</strong> ({totalRecords} records total)
                </span>
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className="btn btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '12px', margin: 0 }}
                >
                  Next Page &rarr;
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Persistent Floating Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div
          id="bulk-floating-action-bar"
          style={{
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'calc(100% - 40px)',
            maxWidth: '1020px',
            background: 'var(--primary-navy)',
            color: 'white',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.35), 0 4px 12px rgba(0, 0, 0, 0.2)',
            padding: '14px 22px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            zIndex: 1000,
            animation: 'slideUp 0.25s ease-out'
          }}
        >
          {/* Left Selection Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <div 
              style={{ 
                background: 'var(--primary-blue)', 
                color: 'white', 
                padding: '6px 12px', 
                borderRadius: 'var(--radius-sm)', 
                fontWeight: '700',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>✓</span>
              <span>{selectedIds.length} Selected</span>
            </div>

            <button
              onClick={clearSelection}
              className="btn btn-secondary"
              style={{ 
                padding: '5px 10px', 
                fontSize: '11.5px', 
                background: 'rgba(255, 255, 255, 0.12)', 
                color: 'white', 
                borderColor: 'rgba(255, 255, 255, 0.25)', 
                margin: 0 
              }}
            >
              Clear
            </button>

            <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)' }}>
              Registry batch evaluation
            </span>
          </div>

          {/* Right Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button
              id="bulk-reject-button"
              onClick={() => {
                setBulkNotes('');
                setBulkActionModal('reject');
              }}
              disabled={isBulkProcessing}
              className="btn btn-danger"
              style={{
                padding: '9px 16px',
                fontSize: '12.5px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                margin: 0
              }}
            >
              <span>✕</span>
              <span>Bulk Reject ({selectedIds.length})</span>
            </button>

            <button
              id="bulk-approve-button"
              onClick={() => {
                setBulkNotes('');
                setBulkActionModal('approve');
              }}
              disabled={isBulkProcessing}
              className="btn btn-primary"
              style={{
                padding: '9px 18px',
                fontSize: '12.5px',
                fontWeight: '700',
                background: 'var(--accent-gold)',
                color: 'var(--primary-navy)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                margin: 0
              }}
            >
              <span>✓</span>
              <span>Bulk Approve & Issue Letters ({selectedIds.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* Bulk Action Confirmation Modal */}
      {bulkActionModal && (
        <div
          id="bulk-confirmation-modal-backdrop"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: '20px'
          }}
        >
          <div
            id="bulk-confirmation-modal-content"
            style={{
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-lg)',
              padding: '28px',
              maxWidth: '540px',
              width: '100%',
              boxShadow: 'var(--shadow-md)',
              border: '1px solid var(--border-light)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div 
                style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '50%', 
                  background: bulkActionModal === 'approve' ? 'hsl(142, 70%, 92%)' : 'hsl(0, 72%, 94%)',
                  color: bulkActionModal === 'approve' ? 'hsl(142, 76%, 25%)' : 'hsl(0, 72%, 40%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  fontWeight: 'bold',
                  flexShrink: 0
                }}
              >
                {bulkActionModal === 'approve' ? '✓' : '⚠️'}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '19px', color: 'var(--text-dark)' }}>
                  Confirm Bulk {bulkActionModal === 'approve' ? 'Approval & Admission' : 'Rejection'}
                </h3>
                <p style={{ margin: '3px 0 0', fontSize: '13px', color: 'var(--text-light)' }}>
                  You are about to process {selectedIds.length} application(s) in a single batch.
                </p>
              </div>
            </div>

            {bulkActionModal === 'approve' ? (
              <div style={{ background: 'hsl(142, 70%, 96%)', padding: '14px', borderRadius: 'var(--radius-md)', fontSize: '13px', color: 'hsl(142, 76%, 20%)', marginBottom: '18px' }}>
                <strong>Important:</strong> This will automatically assign official admission serial numbers (e.g. <code>BORABU/2026/...</code>), generate downloadable admission letters with verification QR codes, and notify all approved candidates.
              </div>
            ) : (
              <div style={{ background: 'hsl(0, 72%, 97%)', padding: '14px', borderRadius: 'var(--radius-md)', fontSize: '13px', color: 'hsl(0, 72%, 35%)', marginBottom: '18px' }}>
                <strong>Warning:</strong> This will set all selected submitted applications to <em>Rejected</em> status and trigger regret notifications to the applicants.
              </div>
            )}

            {/* Selected Summary preview */}
            <div style={{ maxHeight: '140px', overflowY: 'auto', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)', padding: '10px', marginBottom: '18px', background: 'var(--bg-main)', fontSize: '12px' }}>
              <div style={{ fontWeight: '600', marginBottom: '6px', color: 'var(--text-light)' }}>Applicants targeted in current view:</div>
              {selectedApplications.map((app) => (
                <div key={app.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px dashed var(--border-light)' }}>
                  <span style={{ fontWeight: '600' }}>{app.user.fullName}</span>
                  <span style={{ color: 'var(--primary-blue)', fontWeight: '700' }}>{app.programme.code} ({app.kcseMeanGrade || 'N/A'})</span>
                </div>
              ))}
              {selectedIds.length > selectedApplications.length && (
                <div style={{ color: 'var(--text-light)', fontStyle: 'italic', marginTop: '4px' }}>
                  + {selectedIds.length - selectedApplications.length} other selected applicant(s) across pagination
                </div>
              )}
            </div>

            {/* Notes Input */}
            <div style={{ marginBottom: '24px' }}>
              <label className="form-label" style={{ fontSize: '13px' }}>
                Batch Decision Notes {bulkActionModal === 'approve' ? '(Optional)' : '(Required / Recommended)'}
              </label>
              <textarea
                rows={2}
                placeholder={bulkActionModal === 'approve' ? 'e.g. Approved during registry committee review panel.' : 'e.g. KCSE subject cluster prerequisites not satisfied.'}
                value={bulkNotes}
                onChange={(e) => setBulkNotes(e.target.value)}
                className="form-input"
                style={{ resize: 'none', fontSize: '13px' }}
              />
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setBulkActionModal(null)}
                disabled={isBulkProcessing}
                className="btn btn-secondary"
                style={{ padding: '8px 16px', fontSize: '13px', margin: 0 }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteBulkDecision}
                disabled={isBulkProcessing}
                className={bulkActionModal === 'approve' ? 'btn btn-primary' : 'btn btn-danger'}
                style={{
                  padding: '8px 20px',
                  fontSize: '13px',
                  fontWeight: '700',
                  margin: 0,
                  background: bulkActionModal === 'approve' ? 'var(--accent-gold)' : undefined,
                  color: bulkActionModal === 'approve' ? 'var(--primary-navy)' : undefined,
                }}
              >
                {isBulkProcessing ? 'Processing Batch...' : `Confirm Bulk ${bulkActionModal === 'approve' ? 'Approve' : 'Reject'}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
