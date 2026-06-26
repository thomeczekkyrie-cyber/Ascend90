import { useState, useRef, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'

export default function AvatarUpload({ userId, currentUrl, onUpdate }) {
  const [uploading, setUploading] = useState(false)
  const [cropMode, setCropMode] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [localUrl, setLocalUrl] = useState(currentUrl)
  const fileRef = useRef()
  const canvasRef = useRef()
  const imgRef = useRef(null)
  const CROP_SIZE = 220

  useEffect(() => { setLocalUrl(currentUrl) }, [currentUrl])

  function handleFileSelect(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const img = new Image()
      img.onload = () => {
        imgRef.current = img
        setZoom(1)
        setOffset({ x: 0, y: 0 })
        setCropMode(true)
        setTimeout(() => draw(img, 1, { x: 0, y: 0 }), 50)
      }
      img.src = ev.target.result
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  function draw(img, z, off) {
    const canvas = canvasRef.current
    if (!canvas || !img) return
    const ctx = canvas.getContext('2d')
    canvas.width = CROP_SIZE
    canvas.height = CROP_SIZE
    ctx.clearRect(0, 0, CROP_SIZE, CROP_SIZE)
    ctx.save()
    ctx.beginPath()
    ctx.arc(CROP_SIZE / 2, CROP_SIZE / 2, CROP_SIZE / 2, 0, Math.PI * 2)
    ctx.clip()
    const baseScale = Math.max(CROP_SIZE / img.width, CROP_SIZE / img.height)
    const scale = baseScale * z
    const w = img.width * scale
    const h = img.height * scale
    const x = (CROP_SIZE - w) / 2 + off.x
    const y = (CROP_SIZE - h) / 2 + off.y
    ctx.drawImage(img, x, y, w, h)
    ctx.restore()
  }

  useEffect(() => {
    if (cropMode && imgRef.current) draw(imgRef.current, zoom, offset)
  }, [zoom, offset, cropMode])

  function onMouseDown(e) {
    e.preventDefault()
    setDragging(true)
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y })
  }
  function onMouseMove(e) {
    if (!dragging) return
    setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y })
  }
  function onMouseUp() { setDragging(false) }
  function onTouchStart(e) {
    const t = e.touches[0]
    setDragging(true)
    setDragStart({ x: t.clientX - offset.x, y: t.clientY - offset.y })
  }
  function onTouchMove(e) {
    if (!dragging) return
    const t = e.touches[0]
    setOffset({ x: t.clientX - dragStart.x, y: t.clientY - dragStart.y })
  }

  async function handleSave() {
    const canvas = canvasRef.current
    if (!canvas) return
    setUploading(true)
    try {
      const blob = await new Promise((res, rej) => {
        canvas.toBlob(b => b ? res(b) : rej(new Error('Canvas empty')), 'image/png')
      })
      const path = `avatars/${userId}_${Date.now()}.png`
      const { error: upErr } = await supabase.storage.from('avatars').upload(path, blob, { contentType: 'image/png' })
      if (upErr) throw upErr
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
      const urlWithBust = publicUrl + '?t=' + Date.now()
      await supabase.from('profiles').upsert({ id: userId, avatar_url: urlWithBust })
      setLocalUrl(urlWithBust)
      onUpdate(urlWithBust)
      setCropMode(false)
    } catch (err) {
      console.error('Upload error:', err)
      alert('Upload failed: ' + err.message)
    }
    setUploading(false)
  }

  return (
    <>
      <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleFileSelect} />

      <div style={{ position:'relative', cursor:'pointer', width:60, height:60, flexShrink:0 }} onClick={() => fileRef.current.click()}>
        {localUrl
          ? <img src={localUrl} style={{ width:60, height:60, borderRadius:'50%', objectFit:'cover', border:'2px solid var(--accent)', display:'block' }} />
          : <div style={{ width:60, height:60, borderRadius:'50%', background:'var(--accent-soft)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px', fontWeight:700, color:'var(--accent)', border:'2px solid var(--accent)' }}>
              {userId?.[0]?.toUpperCase() || 'U'}
            </div>
        }
        <div style={{ position:'absolute', bottom:0, right:0, background:'var(--accent)', borderRadius:'50%', width:20, height:20, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px' }}>📷</div>
      </div>

      {cropMode && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.9)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
          <div style={{ background:'var(--surface)', borderRadius:'16px', padding:'24px', width:'100%', maxWidth:'320px' }}>
            <h3 style={{ fontSize:'16px', fontWeight:700, marginBottom:'16px', textAlign:'center' }}>Crop your photo</h3>
            <div style={{ display:'flex', justifyContent:'center', marginBottom:'16px' }}>
              <canvas ref={canvasRef}
                style={{ borderRadius:'50%', cursor: dragging ? 'grabbing' : 'grab', border:'3px solid var(--accent)', display:'block' }}
                width={CROP_SIZE} height={CROP_SIZE}
                onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
                onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onMouseUp} />
            </div>
            <div style={{ marginBottom:'16px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'6px' }}>
                <label style={{ fontSize:'12px', color:'var(--text2)' }}>Zoom</label>
                <span style={{ fontSize:'12px', color:'var(--text3)' }}>{Math.round(zoom * 100)}%</span>
              </div>
              <input type="range" min="1" max="4" step="0.05" value={zoom} onChange={e => setZoom(parseFloat(e.target.value))} style={{ width:'100%' }} />
            </div>
            <p style={{ fontSize:'11px', color:'var(--text3)', textAlign:'center', marginBottom:'16px' }}>Drag to reposition · Slider to zoom</p>
            <div style={{ display:'flex', gap:'8px' }}>
              <button className="btn" onClick={handleSave} disabled={uploading} style={{ flex:1, justifyContent:'center' }}>
                {uploading ? 'Saving...' : 'Save photo'}
              </button>
              <button className="btn-ghost" onClick={() => setCropMode(false)} style={{ flex:1, justifyContent:'center' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
