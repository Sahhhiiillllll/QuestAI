import { UserRole } from '@/store/authStore';

export function homeForRole(role: UserRole): string {
  if (role === 'school') return '/school';
  if (role === 'teacher') return '/teacher';
  return '/student';
}

export function canAccessPath(role: UserRole, path: string): boolean {
  if (role === 'school') return path.startsWith('/school');
  if (role === 'teacher') return path.startsWith('/teacher');
  return path.startsWith('/student');
}
