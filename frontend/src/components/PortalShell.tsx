'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Logo } from './Logo';
import { IconBell, IconMenu, IconClipboard, IconUsers, IconSparkle, IconBook, IconHome, IconSettings } from './icons';
import { useAuthStore, UserRole } from '@/store/authStore';
import { homeForRole } from '@/lib/rolePaths';

type NavItem = { href: string; label: string; icon: React.ComponentType<{ className?: string }> };

const NAV_BY_ROLE: Record<UserRole, NavItem[]> = {
  school: [
    { href: '/school', label: 'Dashboard', icon: IconHome },
    { href: '/school/teachers', label: 'Teachers', icon: IconUsers },
    { href: '/school/students', label: 'Students', icon: IconBook },
    { href: '/school/reports', label: 'Reports & Tests', icon: IconClipboard },
    { href: '/school/leaderboard', label: 'Leaderboard', icon: IconSparkle },
  ],
  teacher: [
    { href: '/teacher', label: 'Assignments', icon: IconClipboard },
    { href: '/teacher/new', label: 'Create Test', icon: IconSparkle },
  ],
  student: [
    { href: '/student', label: 'My Tests', icon: IconClipboard },
  ],
};

export function PortalShell({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [menuOpen, setMenuOpen] = useState(false);
  const role = user?.role ?? 'teacher';
  const nav = NAV_BY_ROLE[role];
  const home = homeForRole(role);

  return (
    <div className="app-shell">
      <aside className={`sidebar ${menuOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-top">
          <Logo href={home} />
          {role === 'teacher' && (
            <Link href="/teacher/new" className="btn-create-assignment">
              <IconSparkle className="btn-create-icon" /> Create Assignment
            </Link>
          )}
          {role === 'school' && (
            <div className="portal-role-pill">School Admin</div>
          )}
          {role === 'student' && (
            <div className="portal-role-pill student-pill">Student Portal</div>
          )}
          <nav className="sidebar-nav">
            {nav.map((item) => {
              const active = pathname === item.href || (item.href !== home && pathname.startsWith(item.href + '/'));
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href} className={`nav-item ${active ? 'nav-item-active' : ''}`} onClick={() => setMenuOpen(false)}>
                  <Icon /><span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="sidebar-bottom">
          <button type="button" className="nav-item nav-item-btn"><IconSettings /><span>Settings</span></button>
          <div className="school-card">
            <div className="school-avatar">{user?.name?.charAt(0) ?? 'U'}</div>
            <div className="school-info">
              <p className="school-name">{user?.schoolName}</p>
              <p className="school-meta">{user?.role} · {user?.schoolCode}</p>
            </div>
          </div>
        </div>
      </aside>

      {menuOpen && <button type="button" className="sidebar-overlay" onClick={() => setMenuOpen(false)} />}

      <div className="main-column">
        <header className="top-header">
          <div className="header-left">
            <div className="mobile-only"><Logo href={home} size="sm" /></div>
            <button type="button" className="icon-btn mobile-only" onClick={() => setMenuOpen(true)}><IconMenu /></button>
            <span className="breadcrumb hide-mobile">{user?.role === 'school' ? 'School Portal' : user?.role === 'student' ? 'Student' : 'Teacher'}</span>
          </div>
          <div className="header-right">
            <button type="button" className="icon-btn bell-btn"><IconBell /><span className="bell-dot" /></button>
            <button type="button" className="profile-btn" onClick={() => { logout(); router.push('/login'); }}>
              <span className="profile-avatar">{user?.name?.charAt(0)}</span>
              <span className="profile-name hide-mobile">{user?.name}</span>
            </button>
          </div>
        </header>

        {(title || subtitle) && (
          <div className="page-heading">
            {title && <h1>{title}</h1>}
            {subtitle && <p>{subtitle}</p>}
          </div>
        )}

        <div className="page-content">{children}</div>

        <nav className="mobile-bottom-nav">
          {nav.slice(0, 4).map((item) => {
            const active = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className={`mobile-nav-item ${active ? 'mobile-nav-active' : ''}`}>
                <Icon /><span>{item.label.split(' ')[0]}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
