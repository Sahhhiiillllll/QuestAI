'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { PortalShell } from '@/components/PortalShell';
import { IconUpload } from '@/components/icons';
import { useAssignmentStore } from '@/store/assignmentStore';
import { useAuthStore } from '@/store/authStore';
import { AssignmentFormData, QuestionType, AssignmentDifficulty } from '@/types';

const FIGMA_TYPES: { value: QuestionType; label: string }[] = [
  { value: 'mcq', label: 'Multiple Choice Questions' },
  { value: 'short', label: 'Short Questions' },
  { value: 'long', label: 'Diagram/Graph-Based Questions' },
  { value: 'fill_blank', label: 'Numerical Problems' },
  { value: 'true_false', label: 'True/False Questions' },
];

interface TypeRow {
  type: QuestionType;
  label: string;
  count: number;
  marks: number;
}

function Stepper({ value, onChange, min = 0 }: { value: number; onChange: (n: number) => void; min?: number }) {
  return (
    <div className="stepper">
      <button type="button" onClick={() => onChange(Math.max(min, value - 1))}>−</button>
      <span>{value}</span>
      <button type="button" onClick={() => onChange(value + 1)}>+</button>
    </div>
  );
}

export default function NewAssignmentPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { createAssignment, isSubmitting, error, clearError } = useAssignmentStore();
  const fileRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [className, setClassName] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [difficulty, setDifficulty] = useState<AssignmentDifficulty>('mixed');
  const [instructions, setInstructions] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<TypeRow[]>([
    { type: 'mcq', label: 'Multiple Choice Questions', count: 5, marks: 1 },
    { type: 'short', label: 'Short Questions', count: 10, marks: 2 },
    { type: 'long', label: 'Diagram/Graph-Based Questions', count: 5, marks: 4 },
    { type: 'fill_blank', label: 'Numerical Problems', count: 5, marks: 4 },
  ]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const totalQuestions = rows.reduce((s, r) => s + r.count, 0);
  const totalMarks = rows.reduce((s, r) => s + r.count * r.marks, 0);

  const updateRow = (index: number, patch: Partial<TypeRow>) => {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  };

  const removeRow = (index: number) => {
    if (rows.length <= 1) return;
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  const addRow = () => {
    const next = FIGMA_TYPES.find((t) => !rows.some((r) => r.type === t.value));
    if (!next) return;
    setRows((prev) => [...prev, { type: next.value, label: next.label, count: 1, marks: 1 }]);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'Required';
    if (!subject.trim()) errs.subject = 'Required';
    if (!className.trim()) errs.className = 'Required';
    if (!dueDate) errs.dueDate = 'Required';
    if (totalQuestions < 1) errs.questions = 'Add at least one question';
    if (totalMarks < 1) errs.marks = 'Total marks must be positive';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    clearError();
    const questionTypes = [...new Set(rows.filter((r) => r.count > 0).map((r) => r.type))];
    const form: AssignmentFormData = {
      title,
      subject,
      className,
      dueDate,
      questionTypes: questionTypes.length ? questionTypes : ['short'],
      totalQuestions,
      totalMarks,
      difficulty,
      additionalInstructions: instructions || `Generate a question paper for ${user?.schoolName ?? 'school'}. ${rows.map((r) => `${r.label}: ${r.count} questions, ${r.marks} marks each`).join('; ')}`,
      file: file || undefined,
      schoolCode: user?.schoolCode,
      teacherId: user?.id,
      teacherName: user?.name,
      published: true,
    };
    const id = await createAssignment(form);
    if (id) router.push(`/teacher/${id}`);
  };

  return (
    <PortalShell title="Create Assignment" subtitle="Set up a new assignment for your students.">
      <div className="create-card">
        <div className="progress-dots">
          <div className="progress-dot active" />
          <div className="progress-dot" />
          <div className="progress-dot" />
        </div>

        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Assignment Details</h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 20 }}>
          <div className="auth-field">
            <label>Assignment Title</label>
            <input className="input-field" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Quiz on Electricity" />
            {errors.title && <span style={{ color: 'var(--red)', fontSize: 12 }}>{errors.title}</span>}
          </div>
          <div className="auth-field">
            <label>Subject</label>
            <input className="input-field" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Science" />
          </div>
          <div className="auth-field">
            <label>Class / Grade</label>
            <input className="input-field" value={className} onChange={(e) => setClassName(e.target.value)} placeholder="Class 8" />
          </div>
        </div>

        <div
          className="upload-zone"
          onClick={() => fileRef.current?.click()}
          onKeyDown={(e) => e.key === 'Enter' && fileRef.current?.click()}
          role="button"
          tabIndex={0}
        >
          <input ref={fileRef} type="file" accept=".txt,.pdf,.jpeg,.jpg,.png" hidden onChange={(e) => setFile(e.target.files?.[0] || null)} />
          <IconUpload />
          <p style={{ marginTop: 12, fontWeight: 500 }}>
            {file ? file.name : 'Choose a file or drag & drop it here'}
          </p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>PDF, TXT, JPEG, PNG — up to 10MB</p>
          <button type="button" className="btn-outline" style={{ marginTop: 16 }} onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}>
            Browse Files
          </button>
        </div>

        <div className="auth-field">
          <label>Due Date</label>
          <input type="datetime-local" className="input-field" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          {errors.dueDate && <span style={{ color: 'var(--red)', fontSize: 12 }}>{errors.dueDate}</span>}
        </div>

        <h3 style={{ fontSize: 16, fontWeight: 600, margin: '24px 0 12px' }}>Question Type</h3>

        <table className="q-type-table">
          <thead>
            <tr>
              <th>Question Type</th>
              <th>No. of Questions</th>
              <th>Marks</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={`${row.type}-${i}`}>
                <td>
                  <select
                    className="input-field"
                    value={row.type}
                    onChange={(e) => {
                      const t = FIGMA_TYPES.find((x) => x.value === e.target.value);
                      updateRow(i, { type: e.target.value as QuestionType, label: t?.label ?? row.label });
                    }}
                  >
                    {FIGMA_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </td>
                <td><Stepper value={row.count} onChange={(n) => updateRow(i, { count: n })} min={0} /></td>
                <td><Stepper value={row.marks} onChange={(n) => updateRow(i, { marks: n })} min={1} /></td>
                <td>
                  <button type="button" className="icon-btn" onClick={() => removeRow(i)} aria-label="Remove">×</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {rows.map((row, i) => (
          <div key={`m-${row.type}-${i}`} className="q-type-row-mobile">
            <p style={{ fontWeight: 600, marginBottom: 12 }}>{row.label}</p>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
              <div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>No. of Questions</p>
                <Stepper value={row.count} onChange={(n) => updateRow(i, { count: n })} min={0} />
              </div>
              <div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Marks</p>
                <Stepper value={row.marks} onChange={(n) => updateRow(i, { marks: n })} min={1} />
              </div>
              <button type="button" className="icon-btn" onClick={() => removeRow(i)}>×</button>
            </div>
          </div>
        ))}

        <button type="button" className="btn-outline" style={{ marginTop: 8 }} onClick={addRow}>
          + Add Question Type
        </button>

        <div style={{ display: 'flex', gap: 24, marginTop: 20, fontWeight: 600 }}>
          <span>Total Questions: {totalQuestions}</span>
          <span>Total Marks: {totalMarks}</span>
        </div>

        <div className="auth-field" style={{ marginTop: 24 }}>
          <label>Additional Information</label>
          <textarea
            className="input-field"
            rows={3}
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Generate a question paper for 3 hour exam duration..."
            style={{ resize: 'vertical' }}
          />
        </div>

        <div className="auth-field">
          <label>Difficulty</label>
          <select className="input-field" value={difficulty} onChange={(e) => setDifficulty(e.target.value as AssignmentDifficulty)}>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
            <option value="mixed">Mixed</option>
          </select>
        </div>

        {error && <div className="auth-error" style={{ marginTop: 16 }}>{error}</div>}
        {(errors.questions || errors.marks) && (
          <div className="auth-error">{errors.questions || errors.marks}</div>
        )}

        <div className="form-footer">
          <button type="button" className="btn-outline" onClick={() => router.back()}>Previous</button>
          <button type="button" className="btn-dark" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Generating...' : 'Next → Generate Paper'}
          </button>
        </div>
      </div>
    </PortalShell>
  );
}
