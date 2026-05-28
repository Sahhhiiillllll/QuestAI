'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Logo } from './Logo';
import {
  IconHome,
  IconUsers,
  IconClipboard,
  IconSparkle,
  IconBook,
  IconSettings,
  IconBell,
  IconMenu,
} from './icons';
import { useAuthStore } from '@/store/authStore';

const NAV = [
  { href: '/assignments', label: 'Assignments', icon: IconClipboard, badge: null as number | null },
  { href: '#', label: 'Home', icon: IconHome, badge: null },
  { href: '#', label: 'My Groups', icon: IconUsers, badge: null },
  { href: '#', label: "AI Teacher's Toolkit", icon: IconSparkle, badge: null },
  { href: '#', label: 'My Library', icon: IconBook, badge: 32 },
];

const MOBILE_NAV = [
  { href: '#', label: 'Home', icon: IconHome },
  { href: '/assignments', label: 'Assignments', icon: IconClipboard },
  { href: '#', label: 'Library', icon: IconBook },
  { href: '#', label: 'AI Toolkit', icon: IconSparkle },
];

export function AppShell({
  children,
  title,
  subtitle,
  breadcrumb = 'Assignment',
  showBack,
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  breadcrumb?: string;
  showBack?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const assignmentCount = pathname.startsWith('/assignments') ? 10 : null;

  return (
    <div className="app-shell">
      {/* Desktop sidebar */}
      <aside className={`sidebar ${menuOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-top">
          <Logo href="/assignments" />
          <Link href="/assignments/new" className="btn-create-assignment">
            <IconSparkle className="btn-create-icon" />
            Create Assignment
          </Link>
          <nav className="sidebar-nav">
            {NAV.map((item) => {
              const active = item.href !== '#' && pathname.startsWith(item.href);
              const badge = item.label === 'Assignments' ? assignmentCount : item.badge;
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`nav-item ${active ? 'nav-item-active' : ''}`}
                  onClick={() => setMenuOpen(false)}
                >
                  <Icon />
                  <span>{item.label}</span>
                  {badge != null && <span className="nav-badge">{badge}</span>}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="sidebar-bottom">
          <button type="button" className="nav-item nav-item-btn">
            <IconSettings />
            <span>Settings</span>
          </button>
          <div className="school-card">
            <div className="school-avatar">{user?.schoolName?.charAt(0) ?? 'D'}</div>
            <div className="school-info">
              <p className="school-name">{user?.schoolName ?? 'Delhi Public School'}</p>
              <p className="school-meta">{user?.schoolCode ?? 'Bokaro Steel City'}</p>
            </div>
          </div>
        </div>
      </aside>

      {menuOpen && <button type="button" className="sidebar-overlay" aria-label="Close menu" onClick={() => setMenuOpen(false)} />}

      <div className="main-column">
        <header className="top-header">
          <div className="header-left">
            <div className="mobile-only" style={{ marginRight: 4 }}>
              <Logo href="/assignments" size="sm" />
            </div>
            <button type="button" className="icon-btn mobile-only" onClick={() => setMenuOpen(true)} aria-label="Menu">
              <IconMenu />
            </button>
            {showBack && (
              <button type="button" className="icon-btn" onClick={() => router.back()} aria-label="Back">
                ←
              </button>
            )}
            <span className="breadcrumb hide-mobile">{breadcrumb}</span>
          </div>
          <div className="header-right">
            <button type="button" className="icon-btn bell-btn" aria-label="Notifications">
              <IconBell />
              <span className="bell-dot" />
            </button>
            <div className="profile-wrap">
              <button type="button" className="profile-btn" onClick={() => setProfileOpen(!profileOpen)}>
                <span className="profile-avatar">{user?.name?.charAt(0) ?? 'J'}</span>
                <span className="profile-name hide-mobile">{user?.name ?? 'John Doe'}</span>
                <span className="profile-chevron hide-mobile">▾</span>
              </button>
              {profileOpen && (
                <div className="profile-dropdown">
                  <p className="profile-dropdown-email">{user?.email}</p>
                  <p className="profile-dropdown-role">{user?.role === 'school' ? 'School Admin' : user?.role === 'student' ? 'Student' : 'Teacher'}</p>
                  <button type="button" onClick={() => { logout(); router.push('/login'); }}>Sign out</button>
                </div>
              )}
            </div>
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
          {MOBILE_NAV.map((item) => {
            const active = item.href !== '#' && pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link key={item.label} href={item.href} className={`mobile-nav-item ${active ? 'mobile-nav-active' : ''}`}>
                <Icon />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
