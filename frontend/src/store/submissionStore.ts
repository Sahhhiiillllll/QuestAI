import { create } from 'zustand';
import axios from 'axios';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export interface Submission {
  _id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  rollNumber: string;
  className: string;
  schoolCode: string;
  answers: { questionId: string; value: string }[];
  score: number;
  maxScore: number;
  submittedAt: string;
}

export interface SchoolStats {
  totalSubmissions: number;
  totalAssignments: number;
  uniqueStudents: number;
  byAssignment: Record<string, { submitted: number; avgScore: number }>;
  leaderboard: Array<{
    studentName: string;
    rollNumber: string;
    score: number;
    maxScore: number;
    assignmentId: string;
  }>;
}

interface SubmissionStore {
  submissions: Submission[];
  stats: SchoolStats | null;
  isLoading: boolean;
  fetchSubmissions: (params: { schoolCode?: string; assignmentId?: string; teacherId?: string }) => Promise<void>;
  fetchSchoolStats: (schoolCode: string) => Promise<void>;
  submitTest: (payload: {
    assignmentId: string;
    studentId: string;
    studentName: string;
    studentEmail: string;
    rollNumber: string;
    className: string;
    schoolCode: string;
    answers: { questionId: string; value: string }[];
  }) => Promise<{ ok: boolean; error?: string }>;
}

export const useSubmissionStore = create<SubmissionStore>((set) => ({
  submissions: [],
  stats: null,
  isLoading: false,

  fetchSubmissions: async (params) => {
    set({ isLoading: true });
    try {
      const { data } = await axios.get<Submission[]>(`${API}/api/submissions`, { params });
      set({ submissions: data, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  fetchSchoolStats: async (schoolCode) => {
    set({ isLoading: true });
    try {
      const { data } = await axios.get<SchoolStats>(`${API}/api/submissions/stats/${schoolCode}`);
      set({ stats: data, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  submitTest: async (payload) => {
    try {
      await axios.post(`${API}/api/submissions`, payload);
      return { ok: true };
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: string } } };
      return { ok: false, error: err.response?.data?.error || 'Submit failed' };
    }
  },
}));
