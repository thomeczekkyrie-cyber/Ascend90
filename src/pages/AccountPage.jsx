import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../lib/AuthContext.jsx'
import { supabase } from '../lib/supabase.js'
import { signOut } from '../lib/supabase.js'
import { useNavigate } from 'react-router-dom'
import { THEMES, saveTheme, loadTheme } from '../lib/theme.js'

const SUPPORT_EMAIL = 'support@ascend-90.com'

export default function AccountPage() {
  const { user, profile, isPremium } = useAuth()
  const navigate = useNavigate()
  const [upgrading, setUpgrading] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [msg, setMsg] = useState('')
  const [msgType, setMsgType] = useState('error')
  const [subInfo, setSubInfo] = useState(null)
  const [currentTheme, setCurrentTheme] = useState(loadTheme())
  const [birthday, setBirthday] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [photoUrl, setPhotoUrl] = useState(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const fileRef = useRef()

  useEffect(() => {
    loadProfile()
    if (isPremium && profile?.stripe_customer_id) loadSubInfo()
  }, [isPremium, profile])

  async function loadProfile() {
    const { data } = await supabase.from('profiles').select('birthday, avatar_url').eq('id', user.id).single()
    if (data?.birthday) setBirthday(data.birthday)
    if (data?.avatar_url) setPhotoUrl(data.avatar_url)
  }

  async function loadSubInfo() {
    try {
      const res = await fetch('/api/subscription-info', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ customerId: profile.stripe_customer_id }) })
      const data = await res.json()
      if (data.subscription) setSubInfo(data.subscription)
    } catch {}
  }

  function handleTheme(themeId) {
    setCurrentTheme(themeId)
    saveTheme(themeId)
  }

  async function saveProfile() {
    setSavingProfile(true)
    await supabase.from('profiles').upsert({ id: user.id, birthday: birthday || null })
    setSavingProfile(false)
    setMsg('Profile saved!')
    setMsgType('success')
    setTimeout(() => setMsg(''), 2000)
  }

  async function handlePhotoUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploadingPhoto(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `avatars/${user.id}.${ext}`
      await supabase.storage.from('avatars').upload(path, file, { upsert: true })
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
      await supabase.from('profiles').upsert({ id: user.id, avatar_url: publicUrl })
      setPhotoUrl(publicUrl)
    } catch (err) { console.error(err) }
    setUploadingPhoto(false)
    e.target.value = ''
  }

  async function handleUpgrade() {
    setUpgrading(true); setMsg('')
    try {
      const res = await fetch('/api/create-checkout', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ userId: user.id, email: user.email }) })
      const { url, error } = await res.json()
      if (error) { setMsg('Could not start checkout. Contact ' + SUPPORT_EMAIL); setUpgrading(false); return }
      window.location.href = url
    } catch { setMsg('Checkout unavailable. Contact ' + SUPPORT_EMAIL); setUpgrading(false) }
  }

  async function handleManage() {
    try {
      const res = await fetch('/api/create-portal', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ customerId: profile?.stripe_customer_id }) })
      const { url } = await res.json()
      window.location.href = url
    } catch { setMsg('Could not open billing portal. Contact ' + SUPPORT_EMAIL) }
  }

  async function handleCancel() {
    setCancelling(true); setMsg('')
    try {
      const res = await fetch('/api/cancel-subscription', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ customerId: profile?.stripe_customer_id }) })
      const { success, error, subscription } = await res.json()
      if (error || !success) { setMsg('Could not cancel. Contact ' + SUPPORT_EMAIL); setMsgType('error') }
      else { setShowCancelConfirm(false); if (subscription) setSubInfo(subscription) }
    } catch { setMsg('Something went wrong. Email ' + SUPPORT_EMAIL); setMsgType('error') }
    setCancelling(false)
  }

  async function handleRestart() {
    setUpgrading(true)
    try {
      const res = await fetch('/api/create-checkout', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ userId: user.id, email: user.email }) })
      const { url } = await res.json()
      window.location.href = url
    } catch { setMsg('Could not restart. Contact ' + SUPPORT_EMAIL); setUpgrading(false) }
  }

  function daysUntil(ts) { return ts ? Math.max(0, Math.ceil((new Date(ts*1000) - new Date()) / 86400000)) : null }

  const isCancelled = subInfo?.cancel_at_period_end
  const daysLeft = isCancelled ? daysUntil(subInfo?.current_period_end) : null
  const periodEnd = subInfo?.current_period_end ? new Date(subInfo.current_period_end*1000).toLocaleDateString('en-US', { month:'long', day:'numeric', year:'numeric' }) : null

  return (
    <div style={{ maxWidth:'620px' }}>
      <div className="page-header"><h1>Account</h1></div>

      {msg && <div style={{ background: msgType==='success' ? 'var(--green-soft)' : 'var(--red-soft)', border:`1px solid ${msgType==='success' ? 'rgba(34,201,122,0.25)' : 'rgba(240,90,90,0.25)'}`, borderRadius:'8px', padding:'12px', color: msgType==='success' ? 'var(--green)' : 'var(--red)', fontSize:'13px', marginBottom:'16px' }}>{msg}</div>}

      {/* Profile */}
      <div className="card">
        <p className="card-title">Profile</p>
        <div style={{ display:'flex', alignItems:'center', gap:'16px', marginBottom:'16px' }}>
          <div style={{ position:'relative', cursor:'pointer' }} onClick={() => fileRef.current.click()}>
            {photoUrl
              ? <img src={photoUrl} style={{ width:60, height:60, borderRadius:'50%', objectFit:'cover', border:'2px solid var(--accent)' }} />
              : <div style={{ width:60, height:60, borderRadius:'50%', background:'var(--accent-soft)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px', fontWeight:700, color:'var(--accent)', border:'2px solid var(--accent)' }}>
                  {(user?.user_metadata?.full_name || user?.email || 'U')[0].toUpperCase()}
                </div>
            }
            <div style={{ position:'absolute', bottom:0, right:0, background:'var(--accent)', borderRadius:'50%', width:20, height:20, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'10px' }}>📷</div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handlePhotoUpload} />
          <div>
            <div style={{ fontWeight:600, fontSize:'15px' }}>{user?.user_metadata?.full_name || 'User'}</div>
            <div style={{ fontSize:'13px', color:'var(--text2)' }}>{user?.email}</div>
            <div style={{ fontSize:'11px', color:'var(--text3)', marginTop:'2px', cursor:'pointer' }} onClick={() => fileRef.current.click()}>
              {uploadingPhoto ? 'Uploading...' : 'Tap photo to change'}
            </div>
          </div>
        </div>

        <div className="form-row">
          <label className="form-label">Birthday (optional — for surprise on your special day 🎂)</label>
          <input type="date" value={birthday} onChange={e => setBirthday(e.target.value)} style={{ width:'auto' }} />
        </div>
        <div style={{ display:'flex', gap:'8px' }}>
          <button className="btn btn-sm" onClick={saveProfile} disabled={savingProfile}>{savingProfile ? 'Saving...' : 'Save profile'}</button>
          <button className="btn-ghost btn-sm" onClick={() => { signOut(); navigate('/') }}>Sign out</button>
        </div>
      </div>

      {/* Theme picker */}
      <div className="card">
        <p className="card-title">App theme</p>
        <p style={{ fontSize:'13px', color:'var(--text2)', marginBottom:'14px' }}>Pick your accent color. It applies instantly across the whole app.</p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:'8px' }}>
          {THEMES.map(t => (
            <button key={t.id} onClick={() => handleTheme(t.id)}
              style={{ padding:'10px', borderRadius:'10px', border:`2px solid ${currentTheme===t.id ? t.accent : 'var(--border)'}`, background: currentTheme===t.id ? `${t.accent}22` : 'var(--surface2)', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:'6px', transition:'all 0.15s' }}>
              <div style={{ width:28, height:28, borderRadius:'50%', background:t.accent, boxShadow: currentTheme===t.id ? `0 0 10px ${t.accent}66` : 'none' }} />
              <span style={{ fontSize:'11px', fontWeight:600, color: currentTheme===t.id ? t.accent : 'var(--text3)' }}>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Subscription */}
      <div className="card">
        <p className="card-title">Subscription</p>
        {isPremium ? (
          <div>
            {isCancelled ? (
              <div style={{ background:'var(--amber-soft)', border:'1px solid rgba(245,166,35,0.25)', borderRadius:'10px', padding:'14px', marginBottom:'16px' }}>
                <div style={{ fontSize:'14px', fontWeight:700, color:'var(--amber)', marginBottom:'6px' }}>⚠ Cancels {periodEnd}</div>
                <div style={{ fontSize:'13px', color:'var(--text2)' }}>You have <strong style={{ color:'var(--amber)' }}>{daysLeft} days</strong> of Premium remaining.</div>
              </div>
            ) : (
              <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'16px' }}>
                <span className="badge badge-accent" style={{ fontSize:'13px', padding:'4px 12px' }}>Premium active</span>
                {periodEnd && <span style={{ fontSize:'12px', color:'var(--text3)', marginLeft:'auto' }}>Renews {periodEnd}</span>}
              </div>
            )}
            <div style={{ background:'var(--surface2)', borderRadius:'12px', padding:'14px', marginBottom:'16px', fontSize:'13px', color:'var(--text2)', lineHeight:1.8 }}>
              <div>✓ Unlimited habits, goals, and tasks</div>
              <div>✓ Daily journal with mood tracking</div>
              <div>✓ Progress photos & measurements</div>
              <div>✓ AI meal plans & workout generator</div>
              <div>✓ All future features included</div>
            </div>
            {isCancelled ? (
              <button className="btn" style={{ background:'var(--green)' }} onClick={handleRestart} disabled={upgrading}>
                {upgrading ? 'Redirecting...' : '🔄 Restart subscription'}
              </button>
            ) : (
              <div>
                <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
                  <button className="btn-ghost" onClick={handleManage}>Manage billing →</button>
                  <button className="btn-ghost" style={{ color:'var(--red)', borderColor:'rgba(240,90,90,0.3)' }} onClick={() => setShowCancelConfirm(true)}>Cancel subscription</button>
                </div>
                {showCancelConfirm && (
                  <div style={{ marginTop:'16px', background:'var(--red-soft)', border:'1px solid rgba(240,90,90,0.25)', borderRadius:'12px', padding:'16px' }}>
                    <div style={{ fontSize:'14px', fontWeight:600, marginBottom:'8px' }}>Are you sure?</div>
                    <div style={{ fontSize:'13px', color:'var(--text2)', lineHeight:1.6, marginBottom:'14px' }}>You'll keep Premium until the end of your billing period, then move to the free plan. You can resubscribe anytime.</div>
                    <div style={{ display:'flex', gap:'8px' }}>
                      <button className="btn-danger" onClick={handleCancel} disabled={cancelling}>{cancelling ? 'Cancelling...' : 'Yes, cancel'}</button>
                      <button className="btn-ghost" onClick={() => setShowCancelConfirm(false)}>Keep Premium</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div>
            <div style={{ display:'flex', alignItems:'flex-start', gap:'16px', background:'var(--surface2)', borderRadius:'12px', padding:'16px', marginBottom:'16px' }}>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, fontSize:'15px', marginBottom:'6px' }}>Upgrade to Premium</div>
                <div style={{ fontSize:'13px', color:'var(--text2)', lineHeight:1.6 }}>Unlimited everything. AI meal plans. Workout generator. Progress photos. All future features.</div>
              </div>
              <div style={{ textAlign:'right', flexShrink:0 }}>
                <div style={{ fontSize:'28px', fontWeight:800, color:'var(--accent)' }}>$15</div>
                <div style={{ fontSize:'12px', color:'var(--text3)' }}>/month</div>
              </div>
            </div>
            <button className="btn" onClick={handleUpgrade} disabled={upgrading} style={{ fontSize:'15px', padding:'11px 24px' }}>
              {upgrading ? 'Redirecting...' : 'Upgrade now — $15/month →'}
            </button>
            <p style={{ fontSize:'12px', color:'var(--text3)', marginTop:'8px' }}>Secured by Stripe. Cancel anytime.</p>
          </div>
        )}
      </div>

      {/* Support */}
      <div className="card">
        <p className="card-title">Support</p>
        <p style={{ fontSize:'13px', color:'var(--text2)', lineHeight:1.6, marginBottom:'12px' }}>Have a question or need help? We're here for you.</p>
        <a href={`mailto:${SUPPORT_EMAIL}`} style={{ display:'inline-flex', alignItems:'center', gap:'6px', background:'var(--surface2)', border:'1px solid var(--border2)', borderRadius:'8px', color:'var(--text)', fontSize:'13px', padding:'8px 14px', textDecoration:'none', fontWeight:500 }}>
          📧 {SUPPORT_EMAIL}
        </a>
      </div>
    </div>
  )
}
