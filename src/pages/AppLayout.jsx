import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext.jsx'
import { signOut } from '../lib/supabase.js'

const NAV = [
  { to: '/app', label: '📊 Dashboard', end: true },
  { to: '/app/weight', label: '⚖️ Weight' },
  { to: '/app/wakeup', label: '⏰ Wake-up' },
  { to: '/app/workouts', label: '💪 Workouts' },
  { to: '/app/habits', label: '✅ Habits' },
  { to: '/app/goals', label: '🎯 Goals' },
  { to: '/app/tasks', label: '📋 Tasks' },
  { to: '/app/journal', label: '📓 Journal' },
  { to: '/app/progress', label: '📸 Progress' },
  { to: '/app/nutrition', label: '🥗 Nutrition' },
  { to: '/app/measurements', label: '📏 Measurements' },
  { to: '/app/water', label: '💧 Water' },
  { to: '/app/sleep', label: '😴 Sleep' },
  { to: '/app/exercise', label: '🏋️ Exercise' },
]

export default function AppLayout() {
  const { user, isPremium } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut(); navigate('/')
  }

  return (
    <div style={{ display:'flex', minHeight:'100vh' }}>
      <aside style={{ width:'220px', background:'var(--surface)', borderRight:'1px solid var(--border)', display:'flex', flexDirection:'column', position:'fixed', top:0, left:0, bottom:0, zIndex:50, overflowY:'auto' }} className="sidebar">
        <div style={{ padding:'20px 16px 16px', borderBottom:'1px solid var(--border)' }}>
          <img src="/logo.png" alt="Ascend90" style={{ height:'110px', objectFit:'contain', maxWidth:'200px' }} />
          <div style={{ fontSize:'12px', color:'var(--text3)', marginTop:'4px' }}>{user?.user_metadata?.full_name || user?.email}</div>
          {isPremium && <span className="badge badge-accent" style={{ marginTop:'6px', display:'inline-block' }}>Premium</span>}
        </div>
        <nav style={{ flex:1, padding:'12px 8px' }}>
          {NAV.map(n => (
            <NavLink key={n.to} to={n.to} end={n.end}
              style={({ isActive }) => ({
                display:'block', padding:'8px 12px', borderRadius:'8px', fontSize:'13px', fontWeight:500,
                color: isActive ? 'var(--accent)' : 'var(--text2)',
                background: isActive ? 'var(--accent-soft)' : 'transparent',
                textDecoration:'none', marginBottom:'1px', transition:'all 0.15s'
              })}>
              {n.label}
              {(n.label.includes('Journal')) && !isPremium && <span style={{ marginLeft:'6px', fontSize:'10px', color:'var(--amber)' }}>PRO</span>}
            </NavLink>
          ))}
        </nav>
        <div style={{ padding:'12px 8px', borderTop:'1px solid var(--border)' }}>
          {!isPremium && (
            <div style={{ background:'var(--accent-soft)', border:'1px solid rgba(224,61,61,0.2)', borderRadius:'10px', padding:'12px', marginBottom:'10px' }}>
              <div style={{ fontSize:'12px', fontWeight:600, color:'var(--accent)', marginBottom:'4px' }}>Upgrade to Premium</div>
              <div style={{ fontSize:'11px', color:'var(--text2)', marginBottom:'8px' }}>Unlock unlimited habits, journal, goals & more.</div>
              <button className="btn btn-sm" style={{ width:'100%', justifyContent:'center', fontSize:'12px' }} onClick={() => navigate('/app/account')}>Upgrade — $15/mo</button>
            </div>
          )}
          <button className="btn-ghost btn-sm" style={{ width:'100%', justifyContent:'center' }} onClick={() => navigate('/app/account')}>Account</button>
          <button className="btn-ghost btn-sm" style={{ width:'100%', justifyContent:'center', marginTop:'6px' }} onClick={handleSignOut}>Sign out</button>
        </div>
      </aside>

      <div style={{ display:'none' }} className="mobile-nav">
        <nav style={{ position:'fixed', bottom:0, left:0, right:0, background:'var(--surface)', borderTop:'1px solid var(--border)', display:'flex', overflowX:'auto', zIndex:100, padding:'4px 2px' }}>
          {NAV.slice(0, 8).map(n => (
            <NavLink key={n.to} to={n.to} end={n.end}
              style={({ isActive }) => ({
                display:'flex', flexDirection:'column', alignItems:'center', padding:'5px 8px', borderRadius:'6px', fontSize:'9px', fontWeight:500,
                color: isActive ? 'var(--accent)' : 'var(--text3)', textDecoration:'none', whiteSpace:'nowrap', minWidth:'48px'
              })}>
              <span style={{ fontSize:'16px', marginBottom:'1px' }}>{n.label.split(' ')[0]}</span>
              <span>{n.label.split(' ').slice(1).join(' ')}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <main style={{ marginLeft:'220px', flex:1, minHeight:'100vh', padding:'28px 28px 28px' }} className="app-main">
        <Outlet />
      </main>

      <style>{`
        @media (max-width: 768px) {
          .sidebar { display: none !important; }
          .mobile-nav { display: block !important; }
          .app-main { margin-left: 0 !important; padding: 16px 14px 90px !important; }
        }
      `}</style>
    </div>
  )
}
