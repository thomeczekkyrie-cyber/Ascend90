import { useState, useEffect } from 'react'
import { getTasks, insertTask, toggleTask, deleteTask } from '../lib/db.js'
import { CAT_COLORS } from '../lib/utils.js'

const CATS = ['health','fitness','mindset','business','financial','personal']
const PRIORITY_BADGE = { high:'badge-red', medium:'badge-amber', low:'badge-accent' }

export default function TasksPage() {
  const [tasks, setTasks] = useState([])
  const [text, setText] = useState('')
  const [cat, setCat] = useState('personal')
  const [priority, setPriority] = useState('medium')
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [])

  async function load() {
    const t = await getTasks()
    setTasks(t); setLoading(false)
  }

  async function handleAdd() {
    if (!text.trim()) return
    await insertTask({ text: text.trim(), cat, priority })
    setText('')
    setTasks(await getTasks())
  }

  async function handleToggle(id, done) {
    await toggleTask(id, !done)
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !done } : t))
  }

  async function handleDelete(id) {
    await deleteTask(id)
    setTasks(tasks.filter(t => t.id !== id))
  }

  const active = tasks.filter(t => !t.done)
  const done = tasks.filter(t => t.done)

  const renderTask = t => {
    const c = CAT_COLORS[t.cat] || CAT_COLORS.personal
    return (
      <div key={t.id} style={{ display:'flex', alignItems:'flex-start', gap:'10px', padding:'11px 0', borderBottom:'1px solid var(--border)' }}>
        <div onClick={() => handleToggle(t.id, t.done)}
          style={{ width:20, height:20, borderRadius:4, flexShrink:0, cursor:'pointer', marginTop:'2px', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.15s',
            background: t.done ? 'var(--accent)' : 'transparent',
            border: `1.5px solid ${t.done ? 'var(--accent)' : 'var(--border2)'}` }}>
          {t.done && <span style={{ color:'#fff', fontSize:'11px', fontWeight:700 }}>✓</span>}
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:'14px', textDecoration: t.done ? 'line-through' : 'none', color: t.done ? 'var(--text3)' : 'var(--text)' }}>{t.text}</div>
          <div style={{ display:'flex', gap:'5px', marginTop:'4px', flexWrap:'wrap' }}>
            <span style={{ fontSize:'11px', fontWeight:700, padding:'2px 7px', borderRadius:'4px', background:c.bg, color:c.text, textTransform:'uppercase', letterSpacing:'0.5px' }}>{t.cat}</span>
            <span className={`badge ${PRIORITY_BADGE[t.priority]||'badge-accent'}`} style={{ fontSize:'10px' }}>{t.priority}</span>
          </div>
        </div>
        <button className="btn-danger" onClick={() => handleDelete(t.id)}>✕</button>
      </div>
    )
  }

  if (loading) return <div className="empty">Loading...</div>

  return (
    <div style={{ maxWidth:'800px' }}>
      <div className="page-header"><h1>Task tracker</h1><p>What's moving today?</p></div>

      <div className="card">
        <p className="card-title">Add task</p>
        <div className="form-row"><label className="form-label">Task</label><input type="text" placeholder="e.g. Follow up on 5 leads" value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleAdd()} /></div>
        <div className="form-grid-2 form-row">
          <div><label className="form-label">Category</label>
            <select value={cat} onChange={e=>setCat(e.target.value)}>
              {CATS.map(c=><option key={c}>{c}</option>)}
            </select>
          </div>
          <div><label className="form-label">Priority</label>
            <select value={priority} onChange={e=>setPriority(e.target.value)}>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
        <button className="btn" onClick={handleAdd}>Add task</button>
      </div>

      <div style={{ marginBottom:'16px' }}>
        <div style={{ fontSize:'11px', fontWeight:700, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'8px' }}>Active ({active.length})</div>
        <div className="card" style={{ padding:'4px 16px', marginBottom:0 }}>
          {!active.length ? <p className="empty" style={{ padding:'20px 0' }}>No active tasks. Add one above.</p> : active.map(renderTask)}
        </div>
      </div>

      {done.length > 0 && (
        <div>
          <div style={{ fontSize:'11px', fontWeight:700, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'8px' }}>Completed ({done.length})</div>
          <div className="card" style={{ padding:'4px 16px' }}>
            {done.map(renderTask)}
          </div>
        </div>
      )}
    </div>
  )
}
