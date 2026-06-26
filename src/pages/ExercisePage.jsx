import { useState } from 'react'

const MUSCLE_GROUPS = {
  chest: { label: 'Chest', color: '#e03d3d', exercises: [
    { name: 'Push-ups', sets: '3x15', desc: 'Classic compound movement for chest, shoulders, and triceps.', tips: 'Keep core tight, lower chest to floor' },
    { name: 'Dumbbell Bench Press', sets: '4x10', desc: 'Primary chest builder with full range of motion.', tips: 'Feet flat on floor, slight arch in lower back' },
    { name: 'Dumbbell Flyes', sets: '3x12', desc: 'Isolation movement for chest stretch and squeeze.', tips: 'Slight bend in elbows, feel the stretch' },
    { name: 'Incline Push-ups', sets: '3x15', desc: 'Targets upper chest with elevated surface.', tips: 'Use a bench or sturdy surface' },
    { name: 'Cable Crossovers', sets: '3x15', desc: 'Great finisher for inner chest definition.', tips: 'Squeeze at the center of the movement' },
  ]},
  back: { label: 'Back', color: '#4a9eff', exercises: [
    { name: 'Pull-ups', sets: '4x8', desc: 'King of back exercises for width and strength.', tips: 'Full hang at bottom, chin over bar at top' },
    { name: 'Dumbbell Rows', sets: '4x10', desc: 'Builds lat thickness and rear delts.', tips: 'Keep back flat, elbow close to body' },
    { name: 'Superman Hold', sets: '3x30s', desc: 'Bodyweight lower back strengthener.', tips: 'Lift arms and legs simultaneously' },
    { name: 'Lat Pulldowns', sets: '4x12', desc: 'Machine alternative to pull-ups for lat width.', tips: 'Pull to upper chest, squeeze lats' },
    { name: 'Seated Cable Row', sets: '3x12', desc: 'Targets mid back for thickness.', tips: 'Keep back straight, pull to belly button' },
  ]},
  shoulders: { label: 'Shoulders', color: '#f5a623', exercises: [
    { name: 'Overhead Press', sets: '4x10', desc: 'Compound movement for all three delt heads.', tips: 'Press straight up, don\'t flare elbows' },
    { name: 'Lateral Raises', sets: '3x15', desc: 'Isolation for side delts for that wide look.', tips: 'Lead with elbows, stop at shoulder height' },
    { name: 'Front Raises', sets: '3x12', desc: 'Targets front delts for shoulder definition.', tips: 'Control the descent, don\'t swing' },
    { name: 'Arnold Press', sets: '3x10', desc: 'Rotational press that hits all delt heads.', tips: 'Start with palms facing you, rotate as you press' },
    { name: 'Rear Delt Flyes', sets: '3x15', desc: 'Often neglected but crucial for balanced shoulders.', tips: 'Hinge at hips, squeeze shoulder blades' },
  ]},
  arms: { label: 'Arms', color: '#22c97a', exercises: [
    { name: 'Bicep Curls', sets: '3x12', desc: 'Foundation of bicep building.', tips: 'Keep elbows fixed, full range of motion' },
    { name: 'Hammer Curls', sets: '3x12', desc: 'Builds brachialis for thicker arms.', tips: 'Neutral grip, controlled movement' },
    { name: 'Tricep Dips', sets: '3x15', desc: 'Bodyweight tricep mass builder.', tips: 'Lower until elbows at 90°, push through palms' },
    { name: 'Skull Crushers', sets: '3x12', desc: 'Isolation for long tricep head.', tips: 'Keep upper arms still, lower to forehead' },
    { name: 'Concentration Curls', sets: '3x10', desc: 'Peak bicep contraction for definition.', tips: 'Elbow on inner thigh, twist at top' },
  ]},
  core: { label: 'Core', color: '#7c5cfc', exercises: [
    { name: 'Plank', sets: '3x60s', desc: 'Full core stabilization exercise.', tips: 'Straight line from head to heels, breathe' },
    { name: 'Crunches', sets: '3x20', desc: 'Classic upper ab movement.', tips: 'Exhale as you crunch, don\'t pull neck' },
    { name: 'Russian Twists', sets: '3x20', desc: 'Oblique strengthener for rotational power.', tips: 'Feet off floor for more challenge' },
    { name: 'Leg Raises', sets: '3x15', desc: 'Lower ab focus exercise.', tips: 'Control the descent, don\'t let feet touch floor' },
    { name: 'Mountain Climbers', sets: '3x30s', desc: 'Dynamic core exercise with cardio benefit.', tips: 'Keep hips low, drive knees to chest' },
  ]},
  legs: { label: 'Legs', color: '#f06292', exercises: [
    { name: 'Squats', sets: '4x12', desc: 'King of leg exercises. Builds quads, glutes, and hamstrings.', tips: 'Knees track over toes, depth below parallel' },
    { name: 'Lunges', sets: '3x12ea', desc: 'Unilateral movement for leg balance.', tips: 'Front knee doesn\'t pass toes, upright torso' },
    { name: 'Romanian Deadlift', sets: '4x10', desc: 'Hamstring and glute focus with hip hinge.', tips: 'Hinge at hips, feel hamstring stretch' },
    { name: 'Calf Raises', sets: '4x20', desc: 'Often neglected calf builder.', tips: 'Full range, hold at top, slow descent' },
    { name: 'Wall Sit', sets: '3x60s', desc: 'Isometric quad burner.', tips: 'Thighs parallel to floor, back flat on wall' },
  ]},
  glutes: { label: 'Glutes', color: '#fbbf24', exercises: [
    { name: 'Hip Thrusts', sets: '4x12', desc: 'Best glute activation exercise.', tips: 'Shoulders on bench, squeeze at top' },
    { name: 'Glute Bridges', sets: '3x20', desc: 'Bodyweight hip thrust variation.', tips: 'Squeeze glutes, don\'t use lower back' },
    { name: 'Donkey Kicks', sets: '3x15ea', desc: 'Isolation for glute max.', tips: 'Keep hips square, squeeze at top' },
    { name: 'Sumo Squats', sets: '3x15', desc: 'Wide stance shifts focus to inner thighs and glutes.', tips: 'Toes pointed out, knees tracking toes' },
    { name: 'Step-ups', sets: '3x12ea', desc: 'Functional glute and quad builder.', tips: 'Drive through heel of elevated foot' },
  ]},
}

const BODY_PARTS = [
  { id:'shoulders', cx:200, cy:100, rx:22, ry:14, label:'Shoulders' },
  { id:'chest', cx:200, cy:148, rx:30, ry:22, label:'Chest' },
  { id:'arms', cx:154, cy:155, rx:14, ry:30, label:'Arms' },
  { id:'arms', cx:246, cy:155, rx:14, ry:30, label:'Arms' },
  { id:'core', cx:200, cy:200, rx:22, ry:28, label:'Core' },
  { id:'back', cx:200, cy:330, rx:30, ry:22, label:'Back' },
  { id:'glutes', cx:200, cy:368, rx:24, ry:18, label:'Glutes' },
  { id:'legs', cx:185, cy:430, rx:18, ry:40, label:'Legs' },
  { id:'legs', cx:215, cy:430, rx:18, ry:40, label:'Legs' },
]

export default function ExercisePage() {
  const [selected, setSelected] = useState(null)
  const [aiPlan, setAiPlan] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [daysPerWeek, setDaysPerWeek] = useState(3)
  const [level, setLevel] = useState('beginner')
  const [showAI, setShowAI] = useState(false)
  const [expandedEx, setExpandedEx] = useState(null)

  const selectedGroup = selected ? MUSCLE_GROUPS[selected] : null

  async function generatePlan() {
    setAiLoading(true); setAiPlan(null)
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': '', 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 3000,
          system: 'You are a certified personal trainer. Return ONLY valid JSON, no markdown.',
          messages: [{
            role: 'user',
            content: `Create a ${daysPerWeek}-day per week workout plan for a ${level}. 
Return this JSON:
{
  "days": [
    {
      "day": "Day 1",
      "focus": "muscle group focus",
      "exercises": [
        { "name": "", "sets": "", "reps": "", "rest": "", "notes": "" }
      ]
    }
  ],
  "tips": ["tip1", "tip2", "tip3"]
}
Make it realistic, progressive, and effective for the level.`
          }]
        })
      })
      const data = await res.json()
      const text = data.content?.[0]?.text || ''
      setAiPlan(JSON.parse(text.replace(/```json|```/g, '').trim()))
    } catch (err) { console.error(err) }
    setAiLoading(false)
  }

  return (
    <div style={{ maxWidth:'900px' }}>
      <div className="page-header"><h1>Exercise library</h1><p>Tap a muscle group to explore exercises. Generate a full AI workout plan below.</p></div>

      <div style={{ display:'flex', gap:'20px', flexWrap:'wrap', alignItems:'flex-start' }}>
        {/* Body map */}
        <div style={{ flex:'0 0 260px' }}>
          <div className="card" style={{ padding:'12px' }}>
            <p className="card-title" style={{ marginBottom:'8px' }}>Tap a muscle group</p>
            <svg viewBox="0 0 400 520" style={{ width:'100%' }}>
              {/* Body outline front */}
              <ellipse cx="200" cy="72" rx="32" ry="38" fill="#2a2a32" stroke="var(--border2)" strokeWidth="1.5"/>
              <rect x="162" y="108" width="76" height="110" rx="10" fill="#2a2a32" stroke="var(--border2)" strokeWidth="1.5"/>
              <rect x="134" y="115" width="32" height="90" rx="10" fill="#2a2a32" stroke="var(--border2)" strokeWidth="1.5"/>
              <rect x="234" y="115" width="32" height="90" rx="10" fill="#2a2a32" stroke="var(--border2)" strokeWidth="1.5"/>
              <rect x="168" y="215" width="30" height="100" rx="8" fill="#2a2a32" stroke="var(--border2)" strokeWidth="1.5"/>
              <rect x="202" y="215" width="30" height="100" rx="8" fill="#2a2a32" stroke="var(--border2)" strokeWidth="1.5"/>
              <rect x="170" y="312" width="26" height="90" rx="8" fill="#2a2a32" stroke="var(--border2)" strokeWidth="1.5"/>
              <rect x="204" y="312" width="26" height="90" rx="8" fill="#2a2a32" stroke="var(--border2)" strokeWidth="1.5"/>

              {/* Clickable muscle zones */}
              {Object.entries(MUSCLE_GROUPS).map(([id, g]) => {
                const parts = BODY_PARTS.filter(p => p.id === id)
                return parts.map((p, i) => (
                  <ellipse key={`${id}-${i}`} cx={p.cx} cy={p.cy} rx={p.rx} ry={p.ry}
                    fill={selected === id ? `${g.color}55` : `${g.color}22`}
                    stroke={selected === id ? g.color : `${g.color}66`}
                    strokeWidth={selected === id ? 2.5 : 1.5}
                    style={{ cursor:'pointer', transition:'all 0.15s' }}
                    onClick={() => setSelected(selected === id ? null : id)}
                  />
                ))
              })}

              {/* Labels */}
              {Object.entries(MUSCLE_GROUPS).map(([id, g]) => {
                const parts = BODY_PARTS.filter(p => p.id === id)
                const first = parts[0]
                return (
                  <text key={id} x={first.cx} y={first.cy + 4} textAnchor="middle" fontSize="9"
                    fill={selected === id ? g.color : 'var(--text3)'}
                    style={{ pointerEvents:'none', fontWeight: selected === id ? 700 : 400 }}>
                    {g.label}
                  </text>
                )
              })}
            </svg>

            <div style={{ display:'flex', flexWrap:'wrap', gap:'5px', marginTop:'8px' }}>
              {Object.entries(MUSCLE_GROUPS).map(([id, g]) => (
                <button key={id} onClick={() => setSelected(selected === id ? null : id)}
                  style={{ fontSize:'11px', padding:'4px 10px', borderRadius:'20px', border:'none', cursor:'pointer', fontFamily:'inherit', fontWeight: selected===id ? 700 : 400,
                    background: selected===id ? g.color : 'var(--surface2)', color: selected===id ? '#fff' : 'var(--text2)' }}>
                  {g.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Exercise list */}
        <div style={{ flex:1, minWidth:'280px' }}>
          {!selected ? (
            <div className="card" style={{ textAlign:'center', padding:'40px 20px' }}>
              <div style={{ fontSize:'36px', marginBottom:'12px' }}>👆</div>
              <div style={{ fontSize:'15px', fontWeight:600, marginBottom:'6px' }}>Select a muscle group</div>
              <div style={{ fontSize:'13px', color:'var(--text2)' }}>Tap on the body map or use the buttons to explore exercises for each muscle group.</div>
            </div>
          ) : (
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'12px' }}>
                <div style={{ width:10, height:10, borderRadius:'50%', background:selectedGroup.color }} />
                <h2 style={{ fontSize:'18px', fontWeight:700 }}>{selectedGroup.label}</h2>
                <span style={{ fontSize:'13px', color:'var(--text3)' }}>{selectedGroup.exercises.length} exercises</span>
              </div>
              {selectedGroup.exercises.map((ex, i) => (
                <div key={i} style={{ background:'var(--surface)', border:`1px solid ${expandedEx===`${selected}-${i}` ? selectedGroup.color : 'var(--border)'}`, borderRadius:'12px', padding:'14px', marginBottom:'8px', transition:'border-color 0.15s', cursor:'pointer' }}
                  onClick={() => setExpandedEx(expandedEx===`${selected}-${i}` ? null : `${selected}-${i}`)}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div style={{ fontWeight:600, fontSize:'14px' }}>{ex.name}</div>
                    <span style={{ background:`${selectedGroup.color}22`, color:selectedGroup.color, fontSize:'12px', fontWeight:700, padding:'3px 10px', borderRadius:'20px' }}>{ex.sets}</span>
                  </div>
                  {expandedEx===`${selected}-${i}` && (
                    <div style={{ marginTop:'10px' }}>
                      <p style={{ fontSize:'13px', color:'var(--text2)', lineHeight:1.6, marginBottom:'8px' }}>{ex.desc}</p>
                      <div style={{ background:'var(--surface2)', borderRadius:'8px', padding:'10px' }}>
                        <div style={{ fontSize:'11px', fontWeight:700, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.7px', marginBottom:'4px' }}>Pro tip</div>
                        <div style={{ fontSize:'13px', color:'var(--text)' }}>💡 {ex.tips}</div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* AI Workout Generator */}
      <div className="card" style={{ marginTop:'8px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: showAI ? '16px' : 0 }}>
          <div>
            <p className="card-title" style={{ marginBottom:'2px' }}>AI workout plan generator</p>
            {!showAI && <p style={{ fontSize:'13px', color:'var(--text2)' }}>Get a personalized full-body regimen built for you.</p>}
          </div>
          <button className="btn-ghost btn-sm" onClick={() => setShowAI(!showAI)}>{showAI ? 'Hide' : 'Generate plan ✨'}</button>
        </div>

        {showAI && (
          <div>
            <div className="form-grid-2 form-row">
              <div>
                <label className="form-label">Fitness level</label>
                <select value={level} onChange={e => setLevel(e.target.value)}>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label className="form-label">Days per week</label>
                <select value={daysPerWeek} onChange={e => setDaysPerWeek(parseInt(e.target.value))}>
                  {[2,3,4,5,6].map(d => <option key={d} value={d}>{d} days</option>)}
                </select>
              </div>
            </div>
            <button className="btn" onClick={generatePlan} disabled={aiLoading}>
              {aiLoading ? '🤖 Building your plan...' : '✨ Generate my workout plan'}
            </button>

            {aiPlan && (
              <div style={{ marginTop:'20px' }}>
                <div style={{ display:'grid', gap:'12px' }}>
                  {aiPlan.days.map((day, i) => (
                    <div key={i} style={{ background:'var(--surface2)', borderRadius:'12px', padding:'16px', border:'1px solid var(--border)' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'10px' }}>
                        <span style={{ fontWeight:700, fontSize:'15px' }}>{day.day}</span>
                        <span style={{ fontSize:'12px', color:'var(--accent)', fontWeight:600, background:'var(--accent-soft)', padding:'2px 10px', borderRadius:'20px' }}>{day.focus}</span>
                      </div>
                      {day.exercises.map((ex, j) => (
                        <div key={j} style={{ display:'flex', gap:'10px', alignItems:'flex-start', padding:'7px 0', borderBottom:'1px solid var(--border)' }}>
                          <div style={{ flex:1 }}>
                            <div style={{ fontSize:'13px', fontWeight:600 }}>{ex.name}</div>
                            {ex.notes && <div style={{ fontSize:'11px', color:'var(--text3)', marginTop:'2px' }}>{ex.notes}</div>}
                          </div>
                          <div style={{ textAlign:'right', flexShrink:0, fontSize:'12px', color:'var(--text2)' }}>
                            <div>{ex.sets} sets × {ex.reps}</div>
                            <div style={{ color:'var(--text3)' }}>{ex.rest} rest</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
                {aiPlan.tips && (
                  <div style={{ marginTop:'14px', background:'var(--surface2)', borderRadius:'12px', padding:'14px' }}>
                    <div style={{ fontSize:'12px', fontWeight:700, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.7px', marginBottom:'8px' }}>Tips for success</div>
                    {aiPlan.tips.map((tip, i) => (
                      <div key={i} style={{ fontSize:'13px', color:'var(--text2)', marginBottom:'5px' }}>💡 {tip}</div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
