import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../lib/AuthContext.jsx'
import { supabase } from '../lib/supabase.js'
import { today, fmtDate } from '../lib/utils.js'

export default function ProgressPage() {
  const { user } = useAuth()
  const [photos, setPhotos] = useState([])
  const [uploading, setUploading] = useState(false)
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const fileRef = useRef()

  useEffect(() => { loadPhotos() }, [])

  async function loadPhotos() {
    const { data } = await supabase.from('progress_photos').select('*').eq('user_id', user.id).order('date', { ascending: false })
    setPhotos(data || [])
    setLoading(false)
  }

  async function handleUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `${user.id}/${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage.from('progress-photos').upload(path, file)
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage.from('progress-photos').getPublicUrl(path)
      await supabase.from('progress_photos').insert({ user_id: user.id, date: today(), url: publicUrl, path })
      await loadPhotos()
    } catch (err) { console.error(err) }
    setUploading(false)
    e.target.value = ''
  }

  async function handleDelete(photo) {
    await supabase.storage.from('progress-photos').remove([photo.path])
    await supabase.from('progress_photos').delete().eq('id', photo.id)
    setPhotos(photos.filter(p => p.id !== photo.id))
    if (selected?.id === photo.id) setSelected(null)
  }

  if (loading) return <div className="empty">Loading...</div>

  return (
    <div style={{ maxWidth:'800px' }}>
      <div className="page-header">
        <h1>Progress photos</h1>
        <p>Upload daily and watch your transformation unfold.</p>
      </div>

      <div className="card" style={{ display:'flex', alignItems:'center', gap:'16px', flexWrap:'wrap' }}>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:'14px', fontWeight:600, marginBottom:'4px' }}>Add today's photo</div>
          <div style={{ fontSize:'13px', color:'var(--text2)' }}>Same time, same place, same pose for the best comparison.</div>
        </div>
        <button className="btn" onClick={() => fileRef.current.click()} disabled={uploading}>
          {uploading ? 'Uploading...' : '📸 Upload photo'}
        </button>
        <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleUpload} />
      </div>

      {selected && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.9)', zIndex:200, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'20px' }} onClick={() => setSelected(null)}>
          <img src={selected.url} style={{ maxWidth:'90vw', maxHeight:'80vh', borderRadius:'12px', objectFit:'contain' }} />
          <div style={{ color:'var(--text2)', fontSize:'13px', marginTop:'12px' }}>{fmtDate(selected.date)} — tap to close</div>
        </div>
      )}

      {!photos.length ? (
        <p className="empty">No photos yet. Upload your first progress photo above.</p>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(160px, 1fr))', gap:'10px' }}>
          {photos.map(p => (
            <div key={p.id} style={{ position:'relative', borderRadius:'10px', overflow:'hidden', background:'var(--surface2)', border:'1px solid var(--border)', aspectRatio:'3/4' }}>
              <img src={p.url} style={{ width:'100%', height:'100%', objectFit:'cover', cursor:'pointer' }} onClick={() => setSelected(p)} />
              <div style={{ position:'absolute', bottom:0, left:0, right:0, background:'linear-gradient(transparent, rgba(0,0,0,0.8))', padding:'20px 8px 8px', display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
                <span style={{ fontSize:'11px', color:'#fff', fontWeight:600 }}>{fmtDate(p.date)}</span>
                <button className="btn-danger" style={{ padding:'2px 6px', fontSize:'11px' }} onClick={() => handleDelete(p)}>✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
