import { Link } from 'react-router-dom'
import { Crown, Lock } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function ProGate({ children, feature = 'This feature' }) {
  const { isPro } = useAuth()

  if (isPro) return children

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ filter: 'blur(4px)', pointerEvents: 'none', userSelect: 'none', opacity: 0.4 }}>
        {children}
      </div>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 12, textAlign: 'center',
      }}>
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border2)',
          borderRadius: 16, padding: '24px 32px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: '50%',
            background: 'var(--amber-soft)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Crown size={20} style={{ color: 'var(--amber)' }} />
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{feature} is Pro</p>
            <p style={{ fontSize: 12, color: 'var(--text2)', maxWidth: 200, lineHeight: 1.5 }}>
              Upgrade to unlock this and everything else.
            </p>
          </div>
          <Link to="/upgrade" className="btn-pro" style={{ fontSize: 13, padding: '8px 18px' }}>
            <Crown size={14} /> Upgrade — $7.99/mo
          </Link>
        </div>
      </div>
    </div>
  )
}
