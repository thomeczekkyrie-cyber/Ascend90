import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff, Zap } from 'lucide-react'

function AuthLayout({ children, title, sub }) {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '24px',
      background: 'radial-gradient(ellipse at 50% 0%, rgba(124,92,252,0.08) 0%, transparent 60%)',
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', marginBottom: 36, textDecoration: 'none' }}>
          <span style={{ fontSize: 20 }}>⚡</span>
          <span style={{ fontWeight: 800, fontSize: 17 }}>Ascend 90</span>
        </Link>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, padding: '32px 28px' }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6, letterSpacing: '-0.3px' }}>{title}</h1>
          <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 24 }}>{sub}</p>
          {children}
        </div>
      </div>
    </div>
  )
}

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { signIn } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signIn(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Sign in failed. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Welcome back" sub="Sign in to your Ascend 90 account">
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label className="form-label">Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" required />
        </div>
        <div style={{ marginBottom: 20, position: 'relative' }}>
          <label className="form-label">Password</label>
          <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required style={{ paddingRight: 42 }} />
          <button type="button" onClick={() => setShowPw(!showPw)} style={{
            position: 'absolute', right: 12, bottom: 10,
            background: 'none', border: 'none', color: 'var(--text3)', padding: 0,
          }}>
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {error && <p style={{ fontSize: 13, color: 'var(--red)', marginBottom: 14, padding: '8px 12px', background: 'var(--red-soft)', borderRadius: 8 }}>{error}</p>}
        <button className="btn" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
      <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text3)', marginTop: 20 }}>
        No account? <Link to="/signup" style={{ color: 'var(--accent)', fontWeight: 600 }}>Sign up free</Link>
      </p>
    </AuthLayout>
  )
}

export function Signup() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { signUp } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    setLoading(true)
    try {
      await signUp(email, password, name)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Sign up failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Start your 90 days" sub="Create your free Ascend 90 account">
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label className="form-label">Your name</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="First name" required />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label className="form-label">Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" required />
        </div>
        <div style={{ marginBottom: 20, position: 'relative' }}>
          <label className="form-label">Password</label>
          <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="8+ characters" required style={{ paddingRight: 42 }} />
          <button type="button" onClick={() => setShowPw(!showPw)} style={{
            position: 'absolute', right: 12, bottom: 10,
            background: 'none', border: 'none', color: 'var(--text3)', padding: 0,
          }}>
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {error && <p style={{ fontSize: 13, color: 'var(--red)', marginBottom: 14, padding: '8px 12px', background: 'var(--red-soft)', borderRadius: 8 }}>{error}</p>}
        <button className="btn" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
          {loading ? 'Creating account...' : 'Create free account'}
        </button>
      </form>
      <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text3)', marginTop: 14, lineHeight: 1.6 }}>
        By signing up you agree to our <Link to="/terms" style={{ color: 'var(--accent)' }}>Terms</Link> and <Link to="/privacy" style={{ color: 'var(--accent)' }}>Privacy Policy</Link>
      </p>
      <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text3)', marginTop: 12 }}>
        Have an account? <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Sign in</Link>
      </p>
    </AuthLayout>
  )
}
