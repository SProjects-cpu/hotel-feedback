'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import styles from './admin.module.css';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: 'dashboard' },
  { href: '/admin/responses', label: 'Responses', icon: 'responses' },
  { href: '/admin/analytics', label: 'Analytics', icon: 'analytics' },
  { href: '/admin/bills', label: 'Bills', icon: 'bills' },
];

function NavIcon({ name }) {
  const icons = {
    dashboard: <path d="M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 0h7v7h-7v-7z" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>,
    responses: <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" strokeWidth="1.5" fill="none"/><path d="M14 2v6h6M8 13h8M8 17h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></>,
    analytics: <><path d="M18 20V10M12 20V4M6 20v-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></>,
    bills: <><path d="M4 4h16v16H4z" stroke="currentColor" strokeWidth="1.5" fill="none" rx="2"/><path d="M8 10h8M8 14h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></>,
  };
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none">{icons[name]}</svg>;
}

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Check if logged in
  if (typeof window !== 'undefined' && !pathname.startsWith('/admin/login')) {
    const token = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('admin_token') : null;
    if (!token && pathname !== '/admin/login') {
      // Will redirect on client
    }
  }

  // Don't show sidebar on login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const handleLogout = () => {
    sessionStorage.removeItem('admin_token');
    router.push('/admin/login');
  };

  return (
    <div className={styles.layout}>
      {/* Mobile header */}
      <div className={styles.mobileHeader}>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className={styles.menuBtn}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
        <span className={styles.mobileTitle}>Admin</span>
      </div>

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <svg width="24" height="24" viewBox="0 0 40 40" fill="none">
            <path d="M20 4L36 12V28L20 36L4 28V12L20 4Z" stroke="#1a1a2e" strokeWidth="2.5" fill="none"/>
            <path d="M20 16L24 18V22L20 24L16 22V18L20 16Z" fill="#1a1a2e"/>
          </svg>
          <span className={styles.logoText}>Feedback Admin</span>
        </div>

        <p className={styles.menuLabel}>MENU</p>
        <nav className={styles.nav}>
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}
                className={`${styles.navItem} ${isActive ? styles.navActive : ''}`}
                onClick={() => setSidebarOpen(false)}>
                <NavIcon name={item.icon} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userInfo}>
            <div className={styles.userAvatar}>A</div>
            <div className={styles.userDetails}>
              <span className={styles.userName}>Admin</span>
              <span className={styles.userRole}>Manager</span>
            </div>
            <button onClick={handleLogout} className={styles.logoutBtn} title="Logout">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 14H3a1 1 0 01-1-1V3a1 1 0 011-1h3M11 11l3-3-3-3M14 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {sidebarOpen && <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />}

      {/* Main content */}
      <div className={styles.mainArea}>
        {/* Top bar */}
        <div className={styles.topBar}>
          <div className={styles.searchWrapper}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input type="text" placeholder="Search..." className={styles.searchInput} />
          </div>
          <div className={styles.topActions}>
            <button className={styles.iconBtn}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M13.5 6.5a4.5 4.5 0 10-9 0c0 5-2.25 6.5-2.25 6.5h13.5s-2.25-1.5-2.25-6.5zM10.3 15a1.5 1.5 0 01-2.6 0" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <div className={styles.topAvatar}>A</div>
          </div>
        </div>
        <main className={styles.mainContent}>
          {children}
        </main>
      </div>
    </div>
  );
}
