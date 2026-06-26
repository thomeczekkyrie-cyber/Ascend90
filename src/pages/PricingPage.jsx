import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext.jsx'

const FREE_FEATURES = ['Weight tracker', '4am wake-up log', 'Workout tracker', 'Up to 3 habits', 'Up to 3 goals', 'Up to 10 tasks', 'Dashboard overview']
const PRO_FEATURES = ['Everything in Free', 'Unlimited habits', 'Unlimited goals', 'Unlimited tasks', 'Daily journal (mood + wins)', 'Advanced charts & trends', 'Data export (CSV)', 'Priority support', 'Future features included']

export default function PricingPage() {
  const navigate = useNavigate()
  const { user, isPremium } = useAuth()

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', padding:'0 24px 80px' }}>
      <nav style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 8px', height:'64px', maxWidth:'900px', margin:'0 auto' }}>
        <Link to="/" style={{ fontSize:'18px', fontWeight:800, color:'var(--accent)', textDecoration:'none' }}>⚡ Ascend90</Link>
        <div style={{ display:'flex', gap:'10px' }}>
          {user ? <button className="btn btn-sm" onClick={() => navigate('/app')}>Go to app</button>
            : <button className="btn btn-sm" onClick={() => navigate('/auth?mode=signup')}>Start free</button>}
        </div>
      </nav>

      <div style={{ maxWidth:'720px', margin:'0 auto', paddingTop:'40px', textAlign:'center' }}>
        <h1 style={{ fontSize:'36px', fontWeight:800, letterSpacing:'-0.8px', marginBottom:'12px' }}>Simple pricing.</h1>
        <p style={{ color:'var(--text2)', fontSize:'16px', marginBottom:'48px' }}>Start free. Upgrade when you're ready for everything.</p>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:'16px', textAlign:'left' }}>
          {/* FREE */}
          <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'18px', padding:'28px' }}>
            <div style={{ fontSize:'13px', fontWeight:700, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'8px' }}>Free</div>
            <div style={{ fontSize:'40px', fontWeight:800, letterSpacing:'-1px', marginBottom:'4px' }}>$0</div>
            <div style={{ color:'var(--text3)', fontSize:'13px', marginBottom:'24px' }}>Forever free</div>
            <button className="btn-ghost" style={{ width:'100%', justifyContent:'center', marginBottom:'24px' }} onClick={() => navigate('/auth?mode=signup')}>
              Get started
            </button>
            <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
              {FREE_FEATURES.map(f => (
                <div key={f} style={{ display:'flex', gap:'10px', alignItems:'center', fontSize:'14px' }}>
                  <span style={{ color:'var(--green)', flexShrink:0 }}>✓</span> {f}
                </div>
              ))}
            </div>
          </div>

          {/* PRO */}
          <div style={{ background:'var(--surface)', border:'2px solid var(--accent)', borderRadius:'18px', padding:'28px', position:'relative' }}>
            <div style={{ position:'absolute', top:'-13px', left:'50%', transform:'translateX(-50%)', background:'var(--accent)', color:'#fff', fontSize:'11px', fontWeight:700, padding:'4px 14px', borderRadius:'20px', whiteSpace:'nowrap', letterSpacing:'0.8px', textTransform:'uppercase' }}>Most popular</div>
            <div style={{ fontSize:'13px', fontWeight:700, color:'var(--accent)', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'8px' }}>Premium</div>
            <div style={{ display:'flex', alignItems:'baseline', gap:'4px', marginBottom:'4px' }}>
              $15</span>
              <span style={{ color:'var(--text3)', fontSize:'14px' }}>/month</span>
            </div>
            <div style={{ color:'var(--text3)', fontSize:'13px', marginBottom:'24px' }}>or $59/year — save 38%</div>
            {isPremium
              ? <div style={{ background:'var(--green-soft)', color:'var(--green)', borderRadius:'8px', padding:'10px', textAlign:'center', fontWeight:600, fontSize:'14px', marginBottom:'24px' }}>✓ You're on Premium</div>
              : <button className="btn" style={{ width:'100%', justifyContent:'center', marginBottom:'24px' }} onClick={() => navigate(user ? '/app/account' : '/auth?mode=signup')}>
                  {user ? 'Upgrade now' : 'Start free, upgrade anytime'}
                </button>
            }
            <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
              {PRO_FEATURES.map(f => (
                <div key={f} style={{ display:'flex', gap:'10px', alignItems:'center', fontSize:'14px' }}>
                  <span style={{ color:'var(--accent)', flexShrink:0 }}>✓</span>
                  <span style={{ fontWeight: f === 'Everything in Free' ? 600 : 400 }}>{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <p style={{ marginTop:'32px', color:'var(--text3)', fontSize:'13px' }}>
          Payments powered by Stripe. Cancel anytime. Questions? <a href="mailto:hello@ascend90.com">Email us</a>.
        </p>
      </div>
    </div>
  )
}
