'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { PortalShell } from '@/components/PortalShell';
import { useAssignmentStore } from '@/store/assignmentStore';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useAuthStore } from '@/store/authStore';
import { Question, Section } from '@/types';
import { downloadPaperAsPDF } from '@/lib/pdfExport';

const difficultyLabel = (d: string) => {
  if (d === 'easy') return 'Easy';
  if (d === 'hard') return 'Challenging';
  return 'Moderate';
};

const difficultyClass = (d: string) => {
  if (d === 'easy') return 'tag-easy';
  if (d === 'hard') return 'tag-hard';
  return 'tag-medium';
};

export default function AssignmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const user = useAuthStore((s) => s.user);
  const { currentAssignment, isLoading, generationProgress, fetchAssignment, regenerateAssignment } = useAssignmentStore();
  useWebSocket(id);

  const [studentName, setStudentName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [sectionInput, setSectionInput] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => { fetchAssignment(id); }, [id, fetchAssignment]);

  useEffect(() => {
    if (currentAssignment?.status === 'processing' || currentAssignment?.status === 'pending') {
      const interval = setInterval(() => fetchAssignment(id), 3000);
      return () => clearInterval(interval);
    }
  }, [currentAssignment?.status, id, fetchAssignment]);

  const handleDownloadPDF = async () => {
    if (!currentAssignment?.generatedPaper) return;
    setIsDownloading(true);
    try {
      await downloadPaperAsPDF(
        currentAssignment.generatedPaper,
        { name: studentName, rollNumber, section: sectionInput },
        currentAssignment.title
      );
    } finally {
      setIsDownloading(false);
    }
  };

  const a = currentAssignment;
  const schoolName = user?.schoolName ?? 'Delhi Public School, Sector-4, Bokaro';

  if (isLoading && !a) {
    return (
      <PortalShell>
        <p style={{ textAlign: 'center', padding: 48, color: 'var(--text-secondary)' }}>Loading...</p>
      </PortalShell>
    );
  }

  return (
      <PortalShell title={a?.title}>
      {(a?.status === 'pending' || a?.status === 'processing') && (
        <div className="create-card" style={{ textAlign: 'center', padding: 48 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✦</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Generating Question Paper</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
            {generationProgress?.message || 'AI is crafting your question paper...'}
          </p>
          <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, maxWidth: 400, margin: '0 auto' }}>
            <div style={{ height: '100%', width: `${generationProgress?.progress || 0}%`, background: 'var(--green)', borderRadius: 3, transition: 'width 0.3s' }} />
          </div>
          <p style={{ marginTop: 12, fontSize: 13, color: 'var(--text-muted)' }}>{generationProgress?.progress || 0}%</p>
        </div>
      )}

      {a?.status === 'failed' && (
        <div className="create-card" style={{ textAlign: 'center', padding: 48 }}>
          <h2 style={{ color: 'var(--red)', marginBottom: 8 }}>Generation Failed</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>{a.error}</p>
          <button type="button" className="btn-dark" onClick={() => regenerateAssignment(id)}>Try Again</button>
        </div>
      )}

      {a?.status === 'completed' && a.generatedPaper && (
        <>
          <div className="ai-banner">
            <p>
              Certainly, {user?.name?.split(' ')[0] ?? 'Teacher'}! Here is your customized question paper for{' '}
              <strong>{a.generatedPaper.className}</strong> {a.generatedPaper.subject}:
            </p>
            <button type="button" className="btn-dark" onClick={handleDownloadPDF} disabled={isDownloading} style={{ flexShrink: 0 }}>
              {isDownloading ? 'Exporting...' : 'Download as PDF'}
            </button>
          </div>

          <div className="exam-paper">
            <div className="exam-header">
              <h2>{schoolName}</h2>
              <div className="exam-meta">
                <span>Subject: <strong>{a.generatedPaper.subject}</strong></span>
                <span>Class: <strong>{a.generatedPaper.className}</strong></span>
                <span>Time Allowed: <strong>{a.generatedPaper.duration}</strong></span>
                <span>Maximum Marks: <strong>{a.generatedPaper.totalMarks}</strong></span>
              </div>
            </div>

            <div className="student-fields">
              <div className="student-field">
                <label>Name</label>
                <input value={studentName} onChange={(e) => setStudentName(e.target.value)} placeholder="________________" />
              </div>
              <div className="student-field">
                <label>Roll Number</label>
                <input value={rollNumber} onChange={(e) => setRollNumber(e.target.value)} placeholder="________________" />
              </div>
              <div className="student-field">
                <label>Section</label>
                <input value={sectionInput} onChange={(e) => setSectionInput(e.target.value)} placeholder="________________" />
              </div>
            </div>

            {a.generatedPaper.sections.map((section: Section, si: number) => (
              <div key={si} className="section-block">
                <h3>{section.title}</h3>
                <p className="section-instruction">{section.instruction}</p>
                {section.questions.map((q: Question, qi: number) => (
                  <div key={q.id} className="question-item">
                    <span className="question-num">{qi + 1}.</span>
                    <div className="question-body">
                      <p>{q.text}</p>
                      <div className="question-tags">
                        <span className={`tag ${difficultyClass(q.difficulty)}`}>[{difficultyLabel(q.difficulty)}]</span>
                        <span className="tag tag-marks">[{q.marks} {q.marks === 1 ? 'Mark' : 'Marks'}]</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}

            <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 32 }}>
              Generated by QuestAI • {format(new Date(a.generatedPaper.generatedAt), 'MMMM d, yyyy')}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
            <button type="button" className="btn-outline" onClick={() => regenerateAssignment(id)}>↺ Regenerate</button>
            <button type="button" className="btn-dark" onClick={handleDownloadPDF} disabled={isDownloading}>
              ↓ Download PDF
            </button>
            <Link href={`/teacher/insights/${id}`} className="btn-outline">Submission insights</Link>
            <Link href="/teacher" className="btn-outline" style={{ marginLeft: 'auto' }}>← All Assignments</Link>
          </div>
        </>
      )}
    </PortalShell>
  );
}
