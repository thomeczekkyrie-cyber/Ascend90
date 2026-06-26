import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { signIn, signUp } from '../lib/supabase.js'
import { useAuth } from '../lib/AuthContext.jsx'

export default function AuthPage() {
  const [params] = useSearchParams()
  const [mode, setMode] = useState(params.get('mode') || 'login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => { if (user) navigate('/app') }, [user])

  async function handleSubmit(e) {
    e.preventDefault()
    setError(''); setLoading(true)
    if (mode === 'signup') {
      const { error } = await signUp(email, password, name)
      if (error) setError(error.message)
      else setSuccess('Check your email to confirm your account, then sign in.')
    } else {
      const { error } = await signIn(email, password)
      if (error) setError(error.message)
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px', background:'var(--bg)' }}>
      <div style={{ width:'100%', maxWidth:'420px' }}>
        <div style={{ textAlign:'center', marginBottom:'32px' }}>
          <Link to="/" style={{ fontSize:'20px', fontWeight:800, color:'var(--accent)', textDecoration:'none' }}>⚡ Ascend90</Link>
          <p style={{ color:'var(--text2)', marginTop:'8px', fontSize:'15px' }}>
            {mode === 'login' ? 'Welcome back. Keep moving.' : 'Start your 90-day transformation.'}
          </p>
        </div>

        <div className="card" style={{ padding:'28px' }}>
          <div style={{ display:'flex', gap:'6px', marginBottom:'24px' }}>
            <button onClick={() => setMode('login')} style={{ flex:1, padding:'8px', borderRadius:'8px', border:'none', background: mode==='login' ? 'var(--accent)' : 'var(--surface2)', color: mode==='login' ? '#fff' : 'var(--text2)', fontWeight:600, fontSize:'14px', cursor:'pointer' }}>Sign in</button>
            <button onClick={() => setMode('signup')} style={{ flex:1, padding:'8px', borderRadius:'8px', border:'none', background: mode==='signup' ? 'var(--accent)' : 'var(--surface2)', color: mode==='signup' ? '#fff' : 'var(--text2)', fontWeight:600, fontSize:'14px', cursor:'pointer' }}>Create account</button>
          </div>

          {success ? (
            <div style={{ background:'var(--green-soft)', border:'1px solid rgba(34,201,122,0.25)', borderRadius:'8px', padding:'14px', color:'var(--green)', fontSize:'14px', marginBottom:'16px' }}>{success}</div>
          ) : (
            <form onSubmit={handleSubmit}>
              {mode === 'signup' && (
                <div className="form-row">
                  <label className="form-label">Your name</label>
                  <input type="text" placeholder="First name" value={name} onChange={e => setName(e.target.value)} required />
                </div>
              )}
              <div className="form-row">
                <label className="form-label">Email</label>
                <input type="email" placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div className="form-row" style={{ marginBottom:'20px' }}>
                <label className="form-label">Password</label>
                <input type="password" placeholder={mode === 'signup' ? 'At least 8 characters' : '••••••••'} value={password} onChange={e => setPassword(e.target.value)} required minLength={8} />
              </div>
              {error && <div style={{ background:'var(--red-soft)', border:'1px solid rgba(240,90,90,0.25)', borderRadius:'8px', padding:'12px', color:'var(--red)', fontSize:'13px', marginBottom:'16px' }}>{error}</div>}
              <button className="btn" type="submit" disabled={loading} style={{ width:'100%', justifyContent:'center', padding:'11px' }}>
                {loading ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}
              </button>
            </form>
          )}
        </div>
        <p style={{ textAlign:'center', marginTop:'16px', fontSize:'13px', color:'var(--text3)' }}>
          By signing up you agree to our <a href="#">Terms</a> and <a href="#">Privacy Policy</a>.
        </p>
      </div>
    </div>
  )
}
