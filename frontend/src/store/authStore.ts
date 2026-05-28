import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'school' | 'teacher' | 'student';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  schoolName: string;
  schoolCode: string;
  rollNumber?: string;
  className?: string;
}

export interface SignupData {
  name: string;
  email: string;
  password: string;
  schoolName: string;
  schoolCode: string;
  role: UserRole;
  rollNumber?: string;
  className?: string;
}

const USERS_KEY = 'questai_users';

export function loadAllUsers(): Array<AuthUser & { password: string }> {
  if (typeof window === 'undefined') return getSeedUsers();
  try {
    const raw = localStorage.getItem(USERS_KEY);
    const users = raw ? JSON.parse(raw) : [];
    if (!users.length) {
      const seed = getSeedUsers();
      localStorage.setItem(USERS_KEY, JSON.stringify(seed));
      return seed;
    }
    return users;
  } catch {
    return getSeedUsers();
  }
}

function getSeedUsers(): Array<AuthUser & { password: string }> {
  return [
    {
      id: 'school-1',
      name: 'DPS Admin',
      email: 'school@dpsbokaro.edu',
      password: 'demo123',
      role: 'school',
      schoolName: 'Delhi Public School, Bokaro Steel City',
      schoolCode: 'DPS-BOK',
    },
    {
      id: 'teacher-1',
      name: 'John Doe',
      email: 'teacher@dpsbokaro.edu',
      password: 'demo123',
      role: 'teacher',
      schoolName: 'Delhi Public School, Bokaro Steel City',
      schoolCode: 'DPS-BOK',
    },
    {
      id: 'student-1',
      name: 'Lakshya Sharma',
      email: 'student@dpsbokaro.edu',
      password: 'demo123',
      role: 'student',
      schoolName: 'Delhi Public School, Bokaro Steel City',
      schoolCode: 'DPS-BOK',
      rollNumber: '24',
      className: 'Class 8',
    },
  ];
}

function saveAllUsers(users: Array<AuthUser & { password: string }>) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function getUsersBySchool(schoolCode: string): AuthUser[] {
  return loadAllUsers()
    .filter((u) => u.schoolCode === schoolCode.toUpperCase())
    .map(({ password: _, ...u }) => u);
}

export function getRoleHome(role: UserRole): string {
  if (role === 'school') return '/school';
  if (role === 'teacher') return '/teacher';
  return '/student';
}

interface AuthStore {
  user: AuthUser | null;
  isHydrated: boolean;
  login: (email: string, password: string, role?: UserRole) => Promise<boolean>;
  signup: (data: SignupData) => Promise<string | null>;
  logout: () => void;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isHydrated: false,
      setHydrated: () => set({ isHydrated: true }),

      login: async (email, password, role) => {
        const normalized = email.trim().toLowerCase();
        const found = loadAllUsers().find(
          (u) =>
            u.email.toLowerCase() === normalized &&
            u.password === password &&
            (!role || u.role === role)
        );
        if (!found) return false;
        const { password: _, ...user } = found;
        set({ user });
        return true;
      },

      signup: async (data) => {
        const users = loadAllUsers();
        const email = data.email.trim().toLowerCase();
        if (users.some((u) => u.email.toLowerCase() === email)) {
          return 'An account with this email already exists.';
        }
        if (data.role === 'school' && users.some((u) => u.role === 'school' && u.schoolCode === data.schoolCode.toUpperCase())) {
          return 'This school code is already registered.';
        }

        const user: AuthUser & { password: string } = {
          id: crypto.randomUUID(),
          name: data.name.trim(),
          email,
          password: data.password,
          role: data.role,
          schoolName: data.schoolName.trim(),
          schoolCode: data.schoolCode.trim().toUpperCase(),
          rollNumber: data.rollNumber?.trim(),
          className: data.className?.trim(),
        };
        users.push(user);
        saveAllUsers(users);
        const { password: _, ...safe } = user;
        set({ user: safe });
        return null;
      },

      logout: () => set({ user: null }),
    }),
    {
      name: 'questai-auth',
      partialize: (s) => ({ user: s.user }),
      onRehydrateStorage: () => (state) => state?.setHydrated(),
    }
  )
);
