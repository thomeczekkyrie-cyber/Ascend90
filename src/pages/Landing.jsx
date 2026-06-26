import { Link } from 'react-router-dom'
import { Crown, Check, Zap, Scale, AlarmClock, Dumbbell, Target, BookOpen } from 'lucide-react'

const FEATURES_FREE = ['Weight tracker', '4am wake-up log', 'Workout logger', 'Up to 3 habits']
const FEATURES_PRO = ['Everything in Free', 'Unlimited habits + streaks', 'Goals board', 'Daily journal (mood + energy)', 'Task tracker', 'Cloud sync across devices', 'CSV data export']

const TESTIMONIALS = [
  { name: 'Sarah M.', text: 'Lost 18 lbs in my first 90 days. The streak system keeps me honest.', role: 'Entrepreneur' },
  { name: 'James T.', text: "The 4am wake-up tracker alone changed my life. I haven't missed a day in 6 weeks.", role: 'Fitness coach' },
  { name: 'Priya K.', text: "I've tried every planner app. This one actually sticks because it's built for real goals.", role: 'Business owner' },
]

export default function Landing() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Nav */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 32px', height: 62,
        borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0, background: 'rgba(7,7,10,0.9)',
        backdropFilter: 'blur(12px)', zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>⚡</span>
          <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: '-0.3px' }}>Ascend 90</span>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Link to="/login" className="btn-ghost" style={{ fontSize: 13, padding: '7px 16px' }}>Sign in</Link>
          <Link to="/signup" className="btn" style={{ fontSize: 13, padding: '8px 18px' }}>Start free</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ textAlign: 'center', padding: '80px 24px 60px', maxWidth: 700, margin: '0 auto' }}>
        <div className="badge badge-accent" style={{ marginBottom: 20, fontSize: 12 }}>
          <Zap size={11} /> 90 days. Real results.
        </div>
        <h1 style={{
          fontSize: 'clamp(38px, 7vw, 62px)', fontWeight: 800,
          letterSpacing: '-1.5px', lineHeight: 1.1, marginBottom: 20,
        }}>
          Track everything.<br />
          <span style={{ color: 'var(--accent)' }}>Build the version</span><br />
          of you that wins.
        </h1>
        <p style={{ fontSize: 17, color: 'var(--text2)', lineHeight: 1.7, marginBottom: 36, maxWidth: 520, margin: '0 auto 36px' }}>
          Ascend 90 is a self-improvement tracker built for people who are serious — weight, wake-ups, workouts, habits, goals, and daily reflection all in one place.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/signup" className="btn" style={{ fontSize: 15, padding: '13px 28px' }}>
            Start your 90 days — free
          </Link>
          <Link to="/login" className="btn-ghost" style={{ fontSize: 15, padding: '13px 24px' }}>
            Sign in
          </Link>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 14 }}>No credit card required. Free tier available.</p>
      </section>

      {/* Feature icons */}
      <section style={{ maxWidth: 860, margin: '0 auto', padding: '0 24px 70px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
          {[
            { icon: Scale, label: 'Weight tracker', color: 'var(--accent)' },
            { icon: AlarmClock, label: '4am wake-up log', color: 'var(--amber)' },
            { icon: Dumbbell, label: 'Workout logger', color: 'var(--blue)' },
            { icon: Check, label: 'Daily habits', color: 'var(--green)' },
            { icon: Target, label: 'Goals board', color: 'var(--pink)', pro: true },
            { icon: BookOpen, label: 'Daily journal', color: 'var(--pink)', pro: true },
          ].map(({ icon: Icon, label, color, pro }) => (
            <div key={label} style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 12, padding: '16px', textAlign: 'center',
              position: 'relative',
            }}>
              {pro && (
                <div style={{ position: 'absolute', top: 8, right: 8 }}>
                  <Crown size={12} style={{ color: 'var(--amber)' }} />
                </div>
              )}
              <div style={{
                width: 38, height: 38, borderRadius: 10,
                background: color + '18',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 10px',
              }}>
                <Icon size={18} style={{ color }} />
              </div>
              <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)' }}>{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section style={{ maxWidth: 700, margin: '0 auto', padding: '0 24px 80px' }}>
        <h2 style={{ textAlign: 'center', fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 8 }}>Simple pricing</h2>
        <p style={{ textAlign: 'center', color: 'var(--text2)', fontSize: 15, marginBottom: 40 }}>Start free. Go Pro when you're ready.</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {/* Free */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '24px 22px' }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 8 }}>Free</p>
            <p style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-1px', marginBottom: 4 }}>$0</p>
            <p style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 20 }}>Forever free</p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 9 }}>
              {FEATURES_FREE.map(f => (
                <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text2)' }}>
                  <Check size={14} style={{ color: 'var(--green)', flexShrink: 0 }} /> {f}
                </li>
              ))}
            </ul>
            <Link to="/signup" className="btn-ghost" style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>Get started</Link>
          </div>

          {/* Pro */}
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--accent)',
            borderRadius: 16, padding: '24px 22px', position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 3,
              background: 'linear-gradient(90deg, var(--accent), var(--pink))',
            }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.7px' }}>Pro</p>
              <span className="badge badge-accent" style={{ fontSize: 10 }}>Most popular</span>
            </div>
            <p style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-1px', marginBottom: 4 }}>$7.99<span style={{ fontSize: 15, fontWeight: 500, color: 'var(--text3)' }}>/mo</span></p>
            <p style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 20 }}>or $59/year (save 38%)</p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 9 }}>
              {FEATURES_PRO.map(f => (
                <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text)' }}>
                  <Check size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} /> {f}
                </li>
              ))}
            </ul>
            <Link to="/signup" className="btn-pro" style={{ display: 'flex', justifyContent: 'center', marginTop: 20, fontSize: 13 }}>
              <Crown size={14} /> Start Pro free trial
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ maxWidth: 860, margin: '0 auto', padding: '0 24px 80px' }}>
        <h2 style={{ textAlign: 'center', fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 32 }}>Real people, real 90 days</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
          {TESTIMONIALS.map(t => (
            <div key={t.name} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px' }}>
              <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.6, marginBottom: 14, fontStyle: 'italic' }}>"{t.text}"</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'var(--accent-soft)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 700, color: 'var(--accent)',
                }}>{t.name[0]}</div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600 }}>{t.name}</p>
                  <p style={{ fontSize: 11, color: 'var(--text3)' }}>{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ textAlign: 'center', padding: '0 24px 100px' }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 12 }}>Day 1 starts today.</h2>
        <p style={{ color: 'var(--text2)', marginBottom: 28, fontSize: 15 }}>90 days from now, you'll be glad you started.</p>
        <Link to="/signup" className="btn-pro" style={{ fontSize: 15, padding: '13px 32px' }}>
          <Zap size={16} /> Start your 90 days free
        </Link>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '20px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <span style={{ fontSize: 13, color: 'var(--text3)' }}>⚡ Ascend 90 — All rights reserved</span>
        <div style={{ display: 'flex', gap: 16 }}>
          <Link to="/privacy" style={{ fontSize: 12, color: 'var(--text3)' }}>Privacy</Link>
          <Link to="/terms" style={{ fontSize: 12, color: 'var(--text3)' }}>Terms</Link>
        </div>
      </footer>
    </div>
  )
}
