'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore, UserRole } from '@/store/authStore';
import { canAccessPath, homeForRole } from '@/lib/rolePaths';

export function AuthGuard({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const setHydrated = useAuthStore((s) => s.setHydrated);

  useEffect(() => {
    if (useAuthStore.persist.hasHydrated()) setHydrated();
    else useAuthStore.persist.onFinishHydration(() => setHydrated());
  }, [setHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    if (!user) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    if (!allowedRoles.includes(user.role)) {
      router.replace(homeForRole(user.role));
      return;
    }
    if (!canAccessPath(user.role, pathname)) {
      router.replace(homeForRole(user.role));
    }
  }, [user, isHydrated, router, pathname, allowedRoles]);

  if (!isHydrated || !user || !allowedRoles.includes(user.role)) {
    return (
      <div className="auth-loading">
        <div className="auth-spinner" />
        <p>Loading portal...</p>
      </div>
    );
  }

  return <>{children}</>;
}
