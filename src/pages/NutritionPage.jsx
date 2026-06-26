import { useState } from 'react'

export default function NutritionPage() {
  const [goal, setGoal] = useState('')
  const [restrictions, setRestrictions] = useState([])
  const [meals, setMeals] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('meals')
  const [expandedMeal, setExpandedMeal] = useState(null)

  const GOALS = ['Lose weight', 'Build muscle', 'Maintain weight', 'Eat cleaner', 'Increase energy']
  const RESTRICTIONS = ['None', 'Vegetarian', 'Vegan', 'Gluten-free', 'Dairy-free', 'Keto', 'Paleo', 'Nut-free']

  function toggleRestriction(r) {
    if (r === 'None') { setRestrictions(['None']); return }
    const filtered = restrictions.filter(x => x !== 'None')
    setRestrictions(filtered.includes(r) ? filtered.filter(x => x !== r) : [...filtered, r])
  }

  async function generate() {
    if (!goal) return
    setLoading(true); setMeals(null)
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': '', 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 4000,
          system: `You are a certified nutritionist. Return ONLY valid JSON, no markdown, no explanation.`,
          messages: [{
            role: 'user',
            content: `Generate a meal plan for someone with goal: "${goal}" and dietary restrictions: "${restrictions.join(', ') || 'None'}".

Return this exact JSON structure:
{
  "breakfasts": [
    { "name": "", "description": "", "calories": 0, "protein": 0, "carbs": 0, "fat": 0, "recipe": ["step1", "step2"] }
  ],
  "lunches": [...same 5 items...],
  "dinners": [...same 5 items...],
  "snacks": [
    { "name": "", "description": "", "calories": 0, "protein": 0, "carbs": 0, "fat": 0 }
  ]
}

Include 5 breakfasts, 5 lunches, 5 dinners, 10 snacks. Make them realistic, delicious, and aligned with the goal. Include macros for each.`
          }]
        })
      })
      const data = await res.json()
      const text = data.content?.[0]?.text || ''
      const clean = text.replace(/```json|```/g, '').trim()
      setMeals(JSON.parse(clean))
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  const MacroBadge = ({ label, val, color }) => (
    <span style={{ background:`${color}22`, color, fontSize:'11px', fontWeight:600, padding:'2px 7px', borderRadius:'5px', marginRight:'4px' }}>
      {label}: {val}g
    </span>
  )

  const MealCard = ({ item, idx }) => (
    <div style={{ background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:'10px', padding:'14px', marginBottom:'8px' }}>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'10px', marginBottom:'6px' }}>
        <div>
          <div style={{ fontWeight:600, fontSize:'14px', marginBottom:'3px' }}>{item.name}</div>
          <div style={{ fontSize:'12px', color:'var(--text2)' }}>{item.description}</div>
        </div>
        <div style={{ textAlign:'right', flexShrink:0 }}>
          <div style={{ fontSize:'15px', fontWeight:700, color:'var(--accent)' }}>{item.calories}</div>
          <div style={{ fontSize:'10px', color:'var(--text3)' }}>kcal</div>
        </div>
      </div>
      <div style={{ marginBottom: item.recipe ? '8px' : 0 }}>
        <MacroBadge label="P" val={item.protein} color="var(--green)" />
        <MacroBadge label="C" val={item.carbs} color="var(--blue)" />
        <MacroBadge label="F" val={item.fat} color="var(--amber)" />
      </div>
      {item.recipe && (
        <button onClick={() => setExpandedMeal(expandedMeal === `${activeTab}-${idx}` ? null : `${activeTab}-${idx}`)}
          style={{ background:'none', border:'none', color:'var(--accent)', fontSize:'12px', cursor:'pointer', fontFamily:'inherit', padding:0, marginTop:'4px' }}>
          {expandedMeal === `${activeTab}-${idx}` ? '▲ Hide recipe' : '▼ Show recipe'}
        </button>
      )}
      {expandedMeal === `${activeTab}-${idx}` && item.recipe && (
        <div style={{ marginTop:'10px', padding:'10px', background:'var(--surface3)', borderRadius:'8px' }}>
          <div style={{ fontSize:'11px', fontWeight:700, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.7px', marginBottom:'8px' }}>Recipe</div>
          {item.recipe.map((step, i) => (
            <div key={i} style={{ fontSize:'12px', color:'var(--text2)', marginBottom:'5px', display:'flex', gap:'8px' }}>
              <span style={{ color:'var(--accent)', fontWeight:700, flexShrink:0 }}>{i+1}.</span>
              <span>{step}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  const tabs = meals ? [
    { id:'breakfasts', label:'🍳 Breakfast', items: meals.breakfasts },
    { id:'lunches', label:'🥗 Lunch', items: meals.lunches },
    { id:'dinners', label:'🍽️ Dinner', items: meals.dinners },
    { id:'snacks', label:'🍎 Snacks', items: meals.snacks },
  ] : []

  return (
    <div style={{ maxWidth:'800px' }}>
      <div className="page-header"><h1>Nutrition & meal ideas</h1><p>AI-powered meal suggestions built around your goals.</p></div>

      <div className="card">
        <p className="card-title">Your preferences</p>
        <div className="form-row">
          <label className="form-label">Goal</label>
          <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
            {GOALS.map(g => (
              <button key={g} onClick={() => setGoal(g)}
                style={{ background: goal===g ? 'var(--accent-soft)' : 'var(--surface2)', border:`1px solid ${goal===g ? 'var(--accent)' : 'var(--border2)'}`, borderRadius:'8px', color: goal===g ? 'var(--accent)' : 'var(--text2)', cursor:'pointer', fontSize:'13px', padding:'7px 14px', fontFamily:'inherit', transition:'all 0.15s' }}>
                {g}
              </button>
            ))}
          </div>
        </div>
        <div className="form-row">
          <label className="form-label">Dietary restrictions</label>
          <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
            {RESTRICTIONS.map(r => (
              <button key={r} onClick={() => toggleRestriction(r)}
                style={{ background: restrictions.includes(r) ? 'var(--accent-soft)' : 'var(--surface2)', border:`1px solid ${restrictions.includes(r) ? 'var(--accent)' : 'var(--border2)'}`, borderRadius:'8px', color: restrictions.includes(r) ? 'var(--accent)' : 'var(--text2)', cursor:'pointer', fontSize:'13px', padding:'7px 14px', fontFamily:'inherit', transition:'all 0.15s' }}>
                {r}
              </button>
            ))}
          </div>
        </div>
        <button className="btn" onClick={generate} disabled={!goal || loading} style={{ marginTop:'4px' }}>
          {loading ? '🤖 Generating your meal plan...' : '✨ Generate meal ideas'}
        </button>
      </div>

      {meals && (
        <div>
          <div style={{ display:'flex', gap:'6px', marginBottom:'14px', flexWrap:'wrap' }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => { setActiveTab(t.id); setExpandedMeal(null) }}
                style={{ background: activeTab===t.id ? 'var(--accent)' : 'var(--surface2)', border:`1px solid ${activeTab===t.id ? 'var(--accent)' : 'var(--border2)'}`, borderRadius:'8px', color: activeTab===t.id ? '#fff' : 'var(--text2)', cursor:'pointer', fontSize:'13px', padding:'7px 16px', fontFamily:'inherit', fontWeight: activeTab===t.id ? 600 : 400 }}>
                {t.label}
              </button>
            ))}
          </div>
          {tabs.find(t => t.id === activeTab)?.items?.map((item, i) => (
            <MealCard key={i} item={item} idx={i} />
          ))}
        </div>
      )}
    </div>
  )
}
