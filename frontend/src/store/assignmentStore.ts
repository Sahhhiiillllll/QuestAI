import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Assignment, AssignmentFormData, WSMessage } from '@/types';
import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

interface GenerationProgress {
  status: string;
  message: string;
  progress: number;
}

interface AssignmentStore {
  assignments: Assignment[];
  currentAssignment: Assignment | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  generationProgress: GenerationProgress | null;
  wsConnected: boolean;

  // Actions
  fetchAssignments: (params?: { schoolCode?: string; teacherId?: string; published?: boolean; className?: string }) => Promise<void>;
  fetchAssignment: (id: string) => Promise<void>;
  createAssignment: (data: AssignmentFormData) => Promise<string | null>;
  regenerateAssignment: (id: string) => Promise<void>;
  deleteAssignment: (id: string) => Promise<void>;
  setCurrentAssignment: (assignment: Assignment | null) => void;
  handleWSMessage: (msg: WSMessage) => void;
  setWsConnected: (connected: boolean) => void;
  clearError: () => void;
}

export const useAssignmentStore = create<AssignmentStore>()(
  devtools(
    (set, get) => ({
      assignments: [],
      currentAssignment: null,
      isLoading: false,
      isSubmitting: false,
      error: null,
      generationProgress: null,
      wsConnected: false,

      fetchAssignments: async (params?: { schoolCode?: string; teacherId?: string; published?: boolean; className?: string }) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await axios.get(`${API_BASE}/api/assignments`, { params });
          set({ assignments: data, isLoading: false });
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : 'Failed to fetch assignments';
          set({ error: msg, isLoading: false });
        }
      },

      fetchAssignment: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await axios.get(`${API_BASE}/api/assignments/${id}`);
          set({ currentAssignment: data, isLoading: false });
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : 'Failed to fetch assignment';
          set({ error: msg, isLoading: false });
        }
      },

      createAssignment: async (formData: AssignmentFormData) => {
        set({ isSubmitting: true, error: null });
        try {
          const fd = new FormData();
          fd.append('title', formData.title);
          fd.append('subject', formData.subject);
          fd.append('className', formData.className);
          fd.append('dueDate', formData.dueDate);
          formData.questionTypes.forEach((t) => fd.append('questionTypes', t));
          fd.append('totalQuestions', String(formData.totalQuestions));
          fd.append('totalMarks', String(formData.totalMarks));
          fd.append('difficulty', formData.difficulty);
          if (formData.additionalInstructions) {
            fd.append('additionalInstructions', formData.additionalInstructions);
          }
          if (formData.file) {
            fd.append('file', formData.file);
          }
          if (formData.schoolCode) fd.append('schoolCode', formData.schoolCode);
          if (formData.teacherId) fd.append('teacherId', formData.teacherId);
          if (formData.teacherName) fd.append('teacherName', formData.teacherName);
          fd.append('published', String(formData.published !== false));

          const { data } = await axios.post(`${API_BASE}/api/assignments`, fd);
          set({ isSubmitting: false });
          await get().fetchAssignments();
          return data.assignmentId;
        } catch (e: unknown) {
          const msg = axios.isAxiosError(e)
            ? e.response?.data?.error || e.message
            : 'Failed to create assignment';
          set({ error: msg, isSubmitting: false });
          return null;
        }
      },

      regenerateAssignment: async (id: string) => {
        set({ generationProgress: { status: 'pending', message: 'Queuing regeneration...', progress: 0 } });
        try {
          await axios.post(`${API_BASE}/api/assignments/${id}/regenerate`);
          await get().fetchAssignment(id);
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : 'Failed to regenerate';
          set({ error: msg });
        }
      },

      deleteAssignment: async (id: string) => {
        try {
          await axios.delete(`${API_BASE}/api/assignments/${id}`);
          set((state) => ({
            assignments: state.assignments.filter((a) => a._id !== id),
          }));
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : 'Failed to delete';
          set({ error: msg });
        }
      },

      setCurrentAssignment: (assignment) => set({ currentAssignment: assignment }),

      handleWSMessage: (msg: WSMessage) => {
        if (msg.type === 'progress' || msg.type === 'status_update') {
          set({
            generationProgress: {
              status: msg.status || 'processing',
              message: msg.message || '',
              progress: msg.progress || 0,
            },
          });
        } else if (msg.type === 'completed' && msg.assignmentId) {
          set({ generationProgress: { status: 'completed', message: 'Done!', progress: 100 } });
          // Refresh the assignment
          get().fetchAssignment(msg.assignmentId);
        } else if (msg.type === 'failed') {
          set({
            generationProgress: {
              status: 'failed',
              message: msg.message || 'Generation failed',
              progress: 0,
            },
          });
        }
      },

      setWsConnected: (connected) => set({ wsConnected: connected }),
      clearError: () => set({ error: null }),
    }),
    { name: 'assignment-store' }
  )
);
