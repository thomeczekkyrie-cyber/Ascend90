import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, Scale, AlarmClock, Dumbbell,
  CheckSquare, Target, ListTodo, BookOpen,
  Crown, LogOut, Menu, X, ChevronRight
} from 'lucide-react'

const NAV = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/weight', label: 'Weight', icon: Scale },
  { path: '/wakeup', label: '4am Wake-up', icon: AlarmClock },
  { path: '/workouts', label: 'Workouts', icon: Dumbbell },
  { path: '/habits', label: 'Habits', icon: CheckSquare, proOnly: false },
  { path: '/goals', label: 'Goals', icon: Target, proOnly: true },
  { path: '/tasks', label: 'Tasks', icon: ListTodo, proOnly: true },
  { path: '/journal', label: 'Journal', icon: BookOpen, proOnly: true },
]

export default function Layout({ children }) {
  const { user, profile, isPro, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  const day = profile?.start_date
    ? Math.min(90, Math.max(1, Math.floor((new Date() - new Date(profile.start_date)) / 86400000) + 1))
    : 1

  const pct = Math.round((day / 90) * 100)

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 40 }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside style={{
        width: 'var(--sidebar-w)',
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0, left: 0, bottom: 0,
        zIndex: 50,
        transform: mobileOpen ? 'translateX(0)' : undefined,
        transition: 'transform 0.25s ease',
      }}
      className="sidebar"
      >
        {/* Brand */}
        <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'var(--accent-soft)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16
            }}>⚡</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.3px' }}>Ascend 90</div>
              <div style={{ fontSize: 10, color: 'var(--text3)', letterSpacing: '0.5px' }}>DAY {day} OF 90</div>
            </div>
          </div>

          {/* Progress */}
          <div style={{ marginTop: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
              <span style={{ fontSize: 10, color: 'var(--text3)' }}>Progress</span>
              <span style={{ fontSize: 10, color: 'var(--accent)', fontWeight: 600 }}>{pct}%</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: pct + '%' }} />
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, padding: '10px 8px', overflowY: 'auto' }}>
          {NAV.map(({ path, label, icon: Icon, proOnly }) => {
            const active = location.pathname === path
            const locked = proOnly && !isPro
            return (
              <Link
                key={path}
                to={locked ? '/upgrade' : path}
                onClick={() => setMobileOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 9,
                  padding: '9px 10px',
                  borderRadius: 8,
                  marginBottom: 2,
                  fontSize: 13,
                  fontWeight: active ? 600 : 400,
                  color: active ? 'var(--accent)' : locked ? 'var(--text3)' : 'var(--text2)',
                  background: active ? 'var(--accent-glow)' : 'transparent',
                  transition: 'all 0.15s',
                  textDecoration: 'none',
                }}
              >
                <Icon size={16} style={{ flexShrink: 0 }} />
                <span style={{ flex: 1 }}>{label}</span>
                {locked && <Crown size={12} style={{ color: 'var(--amber)' }} />}
              </Link>
            )
          })}
        </nav>

        {/* Bottom */}
        <div style={{ padding: '12px 8px', borderTop: '1px solid var(--border)' }}>
          {!isPro && (
            <Link to="/upgrade" onClick={() => setMobileOpen(false)}>
              <div style={{
                background: 'linear-gradient(135deg, rgba(124,92,252,0.15), rgba(232,121,160,0.1))',
                border: '1px solid rgba(124,92,252,0.25)',
                borderRadius: 10,
                padding: '10px 12px',
                marginBottom: 10,
                cursor: 'pointer',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <Crown size={13} style={{ color: 'var(--amber)' }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>Upgrade to Pro</span>
                </div>
                <p style={{ fontSize: 11, color: 'var(--text2)', lineHeight: 1.4 }}>
                  Unlock goals, journal, tasks & more
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)' }}>$7.99/mo</span>
                  <ChevronRight size={11} style={{ color: 'var(--accent)' }} />
                </div>
              </div>
            </Link>
          )}
          {isPro && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', marginBottom: 8 }}>
              <Crown size={13} style={{ color: 'var(--amber)' }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--amber)' }}>Pro member</span>
            </div>
          )}
          <div style={{ padding: '6px 10px' }}>
            <div style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 500, marginBottom: 2 }}>
              {profile?.full_name || user?.email?.split('@')[0]}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text3)' }}>{user?.email}</div>
          </div>
          <button
            onClick={handleSignOut}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              width: '100%', padding: '8px 10px',
              background: 'none', border: 'none',
              color: 'var(--text3)', fontSize: 13, borderRadius: 8,
              marginTop: 4, transition: 'all 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}
          >
            <LogOut size={15} /> Sign out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div style={{
        display: 'none',
        position: 'fixed',
        top: 0, left: 0, right: 0,
        height: 54,
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        alignItems: 'center',
        padding: '0 16px',
        gap: 12,
        zIndex: 30,
      }} className="mobile-topbar">
        <button
          onClick={() => setMobileOpen(true)}
          style={{ background: 'none', border: 'none', color: 'var(--text2)', padding: 4 }}
        >
          <Menu size={20} />
        </button>
        <span style={{ fontSize: 14, fontWeight: 700 }}>⚡ Ascend 90</span>
        <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text3)' }}>Day {day}</span>
      </div>

      {/* Main content */}
      <main style={{
        flex: 1,
        marginLeft: 'var(--sidebar-w)',
        minHeight: '100vh',
        padding: '28px 28px 48px',
        maxWidth: 'calc(100vw - var(--sidebar-w))',
      }} className="main-content">
        {children}
      </main>

      <style>{`
        @media (max-width: 768px) {
          .sidebar { transform: translateX(-100%); }
          .sidebar.open { transform: translateX(0) !important; }
          .mobile-topbar { display: flex !important; }
          .main-content { margin-left: 0 !important; max-width: 100vw !important; padding-top: 70px !important; padding-left: 16px !important; padding-right: 16px !important; }
        }
      `}</style>
    </div>
  )
}
