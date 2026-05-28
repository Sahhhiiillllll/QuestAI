'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { homeForRole } from '@/lib/rolePaths';

export default function RootPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const setHydrated = useAuthStore((s) => s.setHydrated);

  useEffect(() => {
    if (useAuthStore.persist.hasHydrated()) setHydrated();
    else useAuthStore.persist.onFinishHydration(() => setHydrated());
  }, [setHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    router.replace(user ? homeForRole(user.role) : '/login');
  }, [user, isHydrated, router]);

  return (
    <div className="auth-loading">
      <div className="auth-spinner" />
      <p>Loading QuestAI...</p>
    </div>
  );
}
