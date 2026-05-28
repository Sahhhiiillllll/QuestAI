import { AuthGuard } from '@/components/AuthGuard';

export default function SchoolLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard allowedRoles={['school']}>{children}</AuthGuard>;
}
