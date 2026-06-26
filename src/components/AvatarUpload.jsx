import { useState, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase.js'

export default function AvatarUpload({ userId, currentUrl, onUpdate }) {
  const [uploading, setUploading] = useState(false)
  const [cropMode, setCropMode] = useState(false)
  const [imgSrc, setImgSrc] = useState(null)
  const [cropPos, setCropPos] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [scale, setScale] = useState(1)
  const fileRef = useRef()
  const canvasRef = useRef()
  const imgRef = useRef()

  function handleFileSelect(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setImgSrc(ev.target.result)
      setCropMode(true)
      setCropPos({ x: 0, y: 0 })
      setScale(1)
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  function onMouseDown(e) {
    setDragging(true)
    setDragStart({ x: e.clientX - cropPos.x, y: e.clientY - cropPos.y })
  }

  function onMouseMove(e) {
    if (!dragging) return
    setCropPos({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y })
  }

  function onMouseUp() { setDragging(false) }

  async function handleSave() {
    if (!canvasRef.current || !imgRef.current) return
    setUploading(true)

    const canvas = canvasRef.current
    const size = 200
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')

    ctx.beginPath()
    ctx.arc(size/2, size/2, size/2, 0, Math.PI*2)
    ctx.clip()

    const img = imgRef.current
    const displaySize = 160
    const imgW = img.naturalWidth * scale * (displaySize / Math.max(img.naturalWidth, img.naturalHeight))
    const imgH = img.naturalHeight * scale * (displaySize / Math.max(img.naturalWidth, img.naturalHeight))
    const sx = (cropPos.x / displaySize) * img.naturalWidth / scale
    const sy = (cropPos.y / displaySize) * img.naturalHeight / scale

    ctx.drawImage(img, -cropPos.x * (img.naturalWidth / imgW), -cropPos.y * (img.naturalHeight / imgH),
      img.naturalWidth / scale * (size / displaySize) * scale,
      img.naturalHeight / scale * (size / displaySize) * scale)

    canvas.toBlob(async (blob) => {
      try {
        const path = `avatars/${userId}.png`
        await supabase.storage.from('avatars').upload(path, blob, { upsert: true, contentType: 'image/png' })
        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
        await supabase.from('profiles').upsert({ id: userId, avatar_url: publicUrl + '?t=' + Date.now() })
        onUpdate(publicUrl + '?t=' + Date.now())
        setCropMode(false)
        setImgSrc(null)
      } catch (err) { console.error(err) }
      setUploading(false)
    }, 'image/png')
  }

  function handleCancel() {
    setCropMode(false)
    setImgSrc(null)
  }

  return (
    <>
      <canvas ref={canvasRef} style={{ display:'none' }} />
      <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleFileSelect} />

      {/* Avatar display */}
      <div style={{ position:'relative', cursor:'pointer', width:60, height:60, flexShrink:0 }} onClick={() => fileRef.current.click()}>
        {currentUrl
          ? <img src={currentUrl} style={{ width:60, height:60, borderRadius:'50%', objectFit:'cover', border:'2px solid var(--accent)', display:'block' }} />
          : <div style={{ width:60, height:60, borderRadius:'50%', background:'var(--accent-soft)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px', fontWeight:700, color:'var(--accent)', border:'2px solid var(--accent)' }}>K</div>
        }
        <div style={{ position:'absolute', bottom:0, right:0, background:'var(--accent)', borderRadius:'50%', width:20, height:20, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px' }}>📷</div>
      </div>

      {/* Crop modal */}
      {cropMode && imgSrc && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', zIndex:1000, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'20px' }}>
          <div style={{ background:'var(--surface)', borderRadius:'16px', padding:'24px', maxWidth:'380px', width:'100%' }}>
            <h3 style={{ fontSize:'16px', fontWeight:700, marginBottom:'16px' }}>Crop your photo</h3>

            {/* Crop area */}
            <div style={{ position:'relative', width:'200px', height:'200px', margin:'0 auto 16px', borderRadius:'50%', overflow:'hidden', border:'2px solid var(--accent)', cursor:'move', background:'var(--surface2)' }}
              onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}>
              <img ref={imgRef} src={imgSrc} draggable={false}
                style={{ position:'absolute', transform:`translate(${cropPos.x}px, ${cropPos.y}px) scale(${scale})`, transformOrigin:'center', maxWidth:'none', height:'200px', userSelect:'none', pointerEvents:'none' }} />
            </div>

            {/* Zoom */}
            <div style={{ marginBottom:'16px' }}>
              <label style={{ fontSize:'12px', color:'var(--text2)', display:'block', marginBottom:'6px' }}>Zoom</label>
              <input type="range" min="0.5" max="3" step="0.05" value={scale} onChange={e => setScale(parseFloat(e.target.value))} style={{ width:'100%' }} />
            </div>

            <p style={{ fontSize:'12px', color:'var(--text3)', marginBottom:'16px' }}>Drag the image to reposition. Use the slider to zoom.</p>

            <div style={{ display:'flex', gap:'8px' }}>
              <button className="btn" onClick={handleSave} disabled={uploading} style={{ flex:1, justifyContent:'center' }}>
                {uploading ? 'Saving...' : 'Save photo'}
              </button>
              <button className="btn-ghost" onClick={handleCancel} style={{ flex:1, justifyContent:'center' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
