import { useState, useMemo } from 'react'

const MEAL_DB = {
  breakfasts: [
    { name: 'Greek Yogurt Parfait', calories: 320, protein: 22, carbs: 38, fat: 8, goals: ['lose weight', 'maintain weight', 'eat cleaner', 'increase energy'], restrictions: [], desc: 'Greek yogurt layered with berries and granola.', recipe: ['Add 1 cup Greek yogurt to a bowl', 'Top with 1/2 cup mixed berries', 'Sprinkle 1/4 cup granola', 'Drizzle with 1 tsp honey'] },
    { name: 'Egg White Veggie Omelette', calories: 210, protein: 28, carbs: 8, fat: 6, goals: ['lose weight', 'build muscle', 'eat cleaner'], restrictions: [], desc: 'Fluffy egg white omelette loaded with peppers and spinach.', recipe: ['Whisk 4 egg whites with salt and pepper', 'Pour into non-stick pan over medium heat', 'Add diced peppers, spinach, and onion', 'Fold and serve'] },
    { name: 'Overnight Oats', calories: 380, protein: 14, carbs: 58, fat: 9, goals: ['maintain weight', 'increase energy', 'eat cleaner'], restrictions: [], desc: 'Creamy oats soaked overnight with chia seeds and fruit.', recipe: ['Combine 1/2 cup oats, 1 cup milk, 1 tbsp chia seeds', 'Add 1 tsp honey and vanilla', 'Refrigerate overnight', 'Top with fresh fruit in the morning'] },
    { name: 'Protein Smoothie', calories: 340, protein: 35, carbs: 32, fat: 6, goals: ['build muscle', 'increase energy'], restrictions: [], desc: 'High-protein banana peanut butter smoothie.', recipe: ['Blend 1 scoop protein powder', 'Add 1 banana, 1 tbsp peanut butter', 'Add 1 cup almond milk and ice', 'Blend until smooth'] },
    { name: 'Avocado Toast with Eggs', calories: 420, protein: 18, carbs: 36, fat: 22, goals: ['maintain weight', 'eat cleaner', 'increase energy'], restrictions: [], desc: 'Whole grain toast topped with avocado and poached eggs.', recipe: ['Toast 2 slices whole grain bread', 'Mash 1/2 avocado with lemon juice and salt', 'Poach 2 eggs for 3 minutes', 'Assemble and top with red pepper flakes'] },
    { name: 'Cottage Cheese Bowl', calories: 290, protein: 32, carbs: 18, fat: 7, goals: ['lose weight', 'build muscle'], restrictions: [], desc: 'High-protein cottage cheese with pineapple and seeds.', recipe: ['Scoop 1 cup cottage cheese into bowl', 'Add 1/2 cup pineapple chunks', 'Sprinkle 1 tbsp pumpkin seeds', 'Add cinnamon to taste'] },
    { name: 'Veggie Breakfast Burrito', calories: 440, protein: 24, carbs: 48, fat: 14, goals: ['build muscle', 'increase energy', 'maintain weight'], restrictions: [], desc: 'Whole wheat wrap with scrambled eggs and veggies.', recipe: ['Scramble 3 eggs with diced peppers and onions', 'Warm a whole wheat tortilla', 'Fill with eggs, black beans, and salsa', 'Roll and serve'] },
    { name: 'Chia Pudding', calories: 260, protein: 8, carbs: 30, fat: 12, goals: ['lose weight', 'eat cleaner'], restrictions: ['vegan', 'gluten-free'], desc: 'Thick chia pudding with coconut milk and mango.', recipe: ['Mix 3 tbsp chia seeds with 1 cup coconut milk', 'Stir well and refrigerate 4+ hours', 'Top with diced mango', 'Add a squeeze of lime'] },
    { name: 'Keto Bacon and Eggs', calories: 480, protein: 30, carbs: 2, fat: 38, goals: ['lose weight', 'build muscle'], restrictions: ['keto', 'gluten-free'], desc: 'Classic bacon and eggs — zero carb fuel.', recipe: ['Cook 3 strips bacon in pan until crispy', 'Fry 2 eggs in bacon fat', 'Season with salt and pepper', 'Serve with sliced avocado'] },
    { name: 'Steel Cut Oatmeal', calories: 350, protein: 12, carbs: 60, fat: 6, goals: ['increase energy', 'maintain weight', 'eat cleaner'], restrictions: ['vegan'], desc: 'Hearty oatmeal with walnuts, banana, and cinnamon.', recipe: ['Cook 1/2 cup steel cut oats in 2 cups water (20 min)', 'Stir in cinnamon and a pinch of salt', 'Top with sliced banana and walnuts', 'Add maple syrup if desired'] },
  ],
  lunches: [
    { name: 'Grilled Chicken Salad', calories: 380, protein: 42, carbs: 18, fat: 14, goals: ['lose weight', 'build muscle', 'eat cleaner'], restrictions: ['gluten-free'], desc: 'Mixed greens with grilled chicken, cherry tomatoes, and vinaigrette.', recipe: ['Grill 6oz chicken breast with seasoning', 'Slice and place over mixed greens', 'Add cherry tomatoes, cucumber, red onion', 'Drizzle with olive oil and lemon'] },
    { name: 'Turkey and Avocado Wrap', calories: 450, protein: 34, carbs: 42, fat: 16, goals: ['build muscle', 'maintain weight', 'increase energy'], restrictions: [], desc: 'Whole wheat wrap with turkey, avocado, and veggies.', recipe: ['Lay out whole wheat tortilla', 'Layer sliced turkey, avocado, lettuce, tomato', 'Add mustard or hummus', 'Roll tightly and slice in half'] },
    { name: 'Quinoa Buddha Bowl', calories: 420, protein: 18, carbs: 52, fat: 14, goals: ['eat cleaner', 'maintain weight', 'increase energy'], restrictions: ['vegan', 'gluten-free'], desc: 'Colorful bowl with quinoa, roasted veggies, and tahini.', recipe: ['Cook 1/2 cup quinoa', 'Roast sweet potato and broccoli at 400F for 25 min', 'Assemble with chickpeas', 'Drizzle with tahini dressing'] },
    { name: 'Tuna Lettuce Wraps', calories: 280, protein: 38, carbs: 8, fat: 9, goals: ['lose weight', 'eat cleaner'], restrictions: ['gluten-free', 'keto'], desc: 'Light tuna salad served in crisp lettuce cups.', recipe: ['Mix canned tuna with Greek yogurt, mustard, celery', 'Season with salt, pepper, and lemon', 'Spoon into large lettuce leaves', 'Top with sliced avocado'] },
    { name: 'Lentil Soup', calories: 360, protein: 22, carbs: 54, fat: 4, goals: ['lose weight', 'eat cleaner', 'increase energy'], restrictions: ['vegan', 'gluten-free'], desc: 'Hearty red lentil soup with cumin and spinach.', recipe: ['Sauté onion, garlic, and cumin in pot', 'Add 1 cup red lentils and 4 cups broth', 'Simmer 20 minutes until soft', 'Stir in spinach and lemon juice'] },
    { name: 'Steak and Rice Bowl', calories: 580, protein: 48, carbs: 52, fat: 16, goals: ['build muscle', 'increase energy'], restrictions: ['gluten-free'], desc: 'Lean sirloin over brown rice with roasted broccoli.', recipe: ['Season and grill 6oz sirloin to desired doneness', 'Slice thinly against the grain', 'Serve over 1 cup brown rice', 'Add roasted broccoli and soy sauce'] },
    { name: 'Mediterranean Chickpea Wrap', calories: 410, protein: 16, carbs: 58, fat: 12, goals: ['eat cleaner', 'maintain weight'], restrictions: ['vegan'], desc: 'Hummus wrap with chickpeas, cucumber, and feta.', recipe: ['Spread hummus on whole wheat wrap', 'Add chickpeas, diced cucumber, tomato', 'Crumble feta cheese (or skip for vegan)', 'Add olives and roll up'] },
    { name: 'Salmon Power Bowl', calories: 520, protein: 44, carbs: 38, fat: 22, goals: ['build muscle', 'eat cleaner', 'increase energy'], restrictions: ['gluten-free', 'keto'], desc: 'Baked salmon over greens with edamame and sesame.', recipe: ['Bake 6oz salmon at 400F for 12 minutes', 'Arrange over mixed greens', 'Add edamame, avocado, shredded carrot', 'Dress with sesame ginger dressing'] },
    { name: 'Egg Salad Lettuce Cups', calories: 310, protein: 20, carbs: 6, fat: 22, goals: ['lose weight', 'keto'], restrictions: ['gluten-free', 'keto'], desc: 'Classic egg salad in crispy romaine cups.', recipe: ['Hard boil 4 eggs and chop', 'Mix with mayo, mustard, celery, and dill', 'Season well', 'Spoon into romaine lettuce cups'] },
    { name: 'Black Bean Burrito Bowl', calories: 490, protein: 22, carbs: 68, fat: 12, goals: ['eat cleaner', 'maintain weight', 'increase energy'], restrictions: ['vegan'], desc: 'Rice bowl loaded with black beans, corn, and salsa.', recipe: ['Layer brown rice in bowl', 'Add warmed black beans and corn', 'Top with salsa, guacamole, and cilantro', 'Squeeze lime over everything'] },
  ],
  dinners: [
    { name: 'Baked Salmon with Asparagus', calories: 480, protein: 46, carbs: 12, fat: 26, goals: ['lose weight', 'build muscle', 'eat cleaner'], restrictions: ['gluten-free', 'keto'], desc: 'Herb-crusted salmon with roasted asparagus.', recipe: ['Season salmon with lemon, garlic, and herbs', 'Place on baking sheet with asparagus', 'Drizzle with olive oil', 'Bake at 400F for 15 minutes'] },
    { name: 'Chicken Stir Fry', calories: 440, protein: 42, carbs: 38, fat: 12, goals: ['build muscle', 'eat cleaner', 'increase energy'], restrictions: ['gluten-free'], desc: 'Lean chicken with colorful veggies in savory sauce.', recipe: ['Slice chicken breast thin and season', 'Stir fry in hot wok with oil 5-6 min', 'Add broccoli, peppers, snap peas', 'Toss with low-sodium soy sauce and ginger'] },
    { name: 'Turkey Meatballs with Zucchini Noodles', calories: 390, protein: 38, carbs: 16, fat: 18, goals: ['lose weight', 'eat cleaner'], restrictions: ['gluten-free', 'keto'], desc: 'Lean turkey meatballs over spiralized zucchini.', recipe: ['Mix ground turkey with egg, garlic, herbs', 'Roll into balls and bake 20 min at 375F', 'Spiralize zucchini and sauté briefly', 'Top with marinara and meatballs'] },
    { name: 'Beef and Broccoli', calories: 520, protein: 46, carbs: 28, fat: 22, goals: ['build muscle', 'increase energy'], restrictions: [], desc: 'Classic takeout-style beef and broccoli at home.', recipe: ['Slice flank steak thin and marinate in soy sauce', 'Stir fry beef in hot pan until browned', 'Add broccoli florets and cook 3 min', 'Toss with oyster sauce and serve over rice'] },
    { name: 'Shrimp Tacos', calories: 420, protein: 34, carbs: 42, fat: 12, goals: ['eat cleaner', 'maintain weight'], restrictions: [], desc: 'Seasoned shrimp in corn tortillas with slaw.', recipe: ['Season shrimp with cumin, chili powder, garlic', 'Cook in hot pan 2 min per side', 'Warm corn tortillas', 'Top with cabbage slaw, avocado, and lime'] },
    { name: 'Stuffed Bell Peppers', calories: 380, protein: 28, carbs: 36, fat: 12, goals: ['eat cleaner', 'lose weight', 'maintain weight'], restrictions: ['gluten-free'], desc: 'Peppers stuffed with ground turkey, rice, and tomatoes.', recipe: ['Cut tops off bell peppers and remove seeds', 'Mix cooked turkey, rice, diced tomatoes, spices', 'Fill peppers and place in baking dish', 'Bake covered at 375F for 35 minutes'] },
    { name: 'Lemon Herb Chicken Thighs', calories: 460, protein: 40, carbs: 4, fat: 30, goals: ['build muscle', 'keto'], restrictions: ['gluten-free', 'keto'], desc: 'Juicy oven-roasted chicken thighs with herbs.', recipe: ['Season chicken thighs with lemon zest, garlic, rosemary', 'Sear skin-side down in oven-safe pan', 'Flip and roast at 425F for 25 minutes', 'Rest 5 minutes before serving'] },
    { name: 'Vegetable Curry', calories: 360, protein: 14, carbs: 52, fat: 12, goals: ['eat cleaner', 'lose weight'], restrictions: ['vegan', 'gluten-free'], desc: 'Fragrant coconut curry with chickpeas and sweet potato.', recipe: ['Sauté onion, ginger, garlic in oil', 'Add curry paste and cook 1 minute', 'Add coconut milk, sweet potato, chickpeas', 'Simmer 20 min, serve over rice'] },
    { name: 'Pork Tenderloin with Sweet Potato', calories: 490, protein: 42, carbs: 44, fat: 14, goals: ['build muscle', 'maintain weight'], restrictions: ['gluten-free'], desc: 'Lean pork tenderloin with roasted sweet potato mash.', recipe: ['Season pork with garlic, thyme, and paprika', 'Sear all sides in oven-safe pan', 'Roast at 425F for 20 minutes', 'Serve with mashed sweet potato'] },
    { name: 'Cod with Mediterranean Salsa', calories: 340, protein: 40, carbs: 16, fat: 10, goals: ['lose weight', 'eat cleaner'], restrictions: ['gluten-free', 'keto'], desc: 'Flaky cod topped with tomato, olive, and caper salsa.', recipe: ['Season cod fillets and bake at 400F for 12 min', 'Combine diced tomato, olives, capers, basil', 'Add lemon juice and olive oil to salsa', 'Spoon over cooked fish'] },
  ],
  snacks: [
    { name: 'Apple with Almond Butter', calories: 200, protein: 5, carbs: 28, fat: 10, goals: ['all'], restrictions: ['vegan', 'gluten-free'], desc: 'Crisp apple slices with 1 tbsp almond butter.' },
    { name: 'Hard Boiled Eggs', calories: 140, protein: 12, carbs: 1, fat: 10, goals: ['all'], restrictions: ['gluten-free', 'keto'], desc: 'Two hard boiled eggs with a pinch of sea salt.' },
    { name: 'Mixed Nuts', calories: 180, protein: 5, carbs: 8, fat: 16, goals: ['all'], restrictions: ['vegan', 'gluten-free', 'keto'], desc: 'A small handful of almonds, walnuts, and cashews.' },
    { name: 'Protein Bar', calories: 210, protein: 20, carbs: 22, fat: 7, goals: ['build muscle', 'increase energy'], restrictions: [], desc: 'High protein bar — look for 20g+ protein, under 10g sugar.' },
    { name: 'Celery with Peanut Butter', calories: 160, protein: 6, carbs: 12, fat: 10, goals: ['lose weight', 'eat cleaner'], restrictions: ['vegan', 'gluten-free'], desc: 'Crunchy celery sticks with 2 tbsp peanut butter.' },
    { name: 'Cottage Cheese and Pineapple', calories: 190, protein: 20, carbs: 20, fat: 3, goals: ['lose weight', 'build muscle'], restrictions: ['gluten-free'], desc: '3/4 cup cottage cheese with fresh pineapple chunks.' },
    { name: 'Rice Cakes with Avocado', calories: 170, protein: 3, carbs: 22, fat: 9, goals: ['lose weight', 'eat cleaner', 'maintain weight'], restrictions: ['vegan', 'gluten-free'], desc: 'Two plain rice cakes topped with mashed avocado.' },
    { name: 'Edamame', calories: 150, protein: 12, carbs: 12, fat: 5, goals: ['all'], restrictions: ['vegan', 'gluten-free'], desc: 'Steamed edamame with a sprinkle of sea salt.' },
    { name: 'Greek Yogurt with Honey', calories: 180, protein: 16, carbs: 22, fat: 3, goals: ['lose weight', 'build muscle', 'eat cleaner'], restrictions: ['gluten-free'], desc: '3/4 cup plain Greek yogurt with a drizzle of honey.' },
    { name: 'Beef Jerky', calories: 120, protein: 14, carbs: 6, fat: 3, goals: ['build muscle', 'lose weight'], restrictions: ['gluten-free', 'keto'], desc: 'Low-sodium beef jerky — great portable protein.' },
    { name: 'Hummus and Veggies', calories: 160, protein: 6, carbs: 20, fat: 7, goals: ['eat cleaner', 'lose weight', 'maintain weight'], restrictions: ['vegan', 'gluten-free'], desc: '1/4 cup hummus with carrots, peppers, and cucumber.' },
    { name: 'Cheese and Deli Turkey', calories: 170, protein: 18, carbs: 2, fat: 10, goals: ['build muscle', 'lose weight'], restrictions: ['gluten-free', 'keto'], desc: 'Two slices turkey breast rolled with cheese.' },
    { name: 'Banana with Walnut Butter', calories: 220, protein: 4, carbs: 30, fat: 10, goals: ['increase energy', 'maintain weight', 'build muscle'], restrictions: ['vegan', 'gluten-free'], desc: 'Medium banana with 1 tbsp walnut butter.' },
    { name: 'Tuna on Cucumber Slices', calories: 110, protein: 18, carbs: 4, fat: 2, goals: ['lose weight', 'eat cleaner'], restrictions: ['gluten-free', 'keto'], desc: 'Seasoned tuna salad served on cucumber rounds.' },
    { name: 'Dark Chocolate and Almonds', calories: 190, protein: 4, carbs: 16, fat: 14, goals: ['maintain weight', 'eat cleaner'], restrictions: ['vegan', 'gluten-free'], desc: '1 oz dark chocolate (70%+) with a small handful of almonds.' },
  ]
}

const GOALS = ['Lose weight', 'Build muscle', 'Maintain weight', 'Eat cleaner', 'Increase energy']
const RESTRICTIONS = ['None', 'Vegetarian', 'Vegan', 'Gluten-free', 'Dairy-free', 'Keto', 'Paleo', 'Nut-free']

function filterMeals(meals, goal, restrictions) {
  const g = goal.toLowerCase()
  const r = restrictions.map(x => x.toLowerCase()).filter(x => x !== 'none')
  return meals.filter(m => {
    const goalMatch = m.goals.includes('all') || m.goals.some(mg => mg.toLowerCase().includes(g.split(' ')[0]) || g.includes(mg.split(' ')[0]))
    const restrictionMatch = r.length === 0 || r.every(res => m.restrictions.includes(res))
    return goalMatch
  })
}

const MacroBadge = ({ label, val, color }) => (
  <span style={{ background:`${color}22`, color, fontSize:'11px', fontWeight:600, padding:'2px 7px', borderRadius:'5px', marginRight:'4px' }}>
    {label}: {val}g
  </span>
)

export default function NutritionPage() {
  const [goal, setGoal] = useState('')
  const [restrictions, setRestrictions] = useState([])
  const [activeTab, setActiveTab] = useState('breakfasts')
  const [expandedMeal, setExpandedMeal] = useState(null)
  const [generated, setGenerated] = useState(false)

  function toggleRestriction(r) {
    if (r === 'None') { setRestrictions(['None']); return }
    const filtered = restrictions.filter(x => x !== 'None')
    setRestrictions(filtered.includes(r) ? filtered.filter(x => x !== r) : [...filtered, r])
  }

  const filtered = useMemo(() => {
    if (!goal) return null
    return {
      breakfasts: filterMeals(MEAL_DB.breakfasts, goal, restrictions),
      lunches: filterMeals(MEAL_DB.lunches, goal, restrictions),
      dinners: filterMeals(MEAL_DB.dinners, goal, restrictions),
      snacks: MEAL_DB.snacks,
    }
  }, [goal, restrictions, generated])

  const tabs = filtered ? [
    { id:'breakfasts', label:'🍳 Breakfast', items: filtered.breakfasts },
    { id:'lunches', label:'🥗 Lunch', items: filtered.lunches },
    { id:'dinners', label:'🍽️ Dinner', items: filtered.dinners },
    { id:'snacks', label:'🍎 Snacks', items: filtered.snacks },
  ] : []

  const activeItems = tabs.find(t => t.id === activeTab)?.items || []

  return (
    <div style={{ maxWidth:'800px' }}>
      <div className="page-header"><h1>Nutrition & meal ideas</h1><p>Meal ideas and macros built around your goals.</p></div>

      <div className="card">
        <p className="card-title">Your preferences</p>
        <div className="form-row">
          <label className="form-label">Goal</label>
          <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
            {GOALS.map(g => (
              <button key={g} onClick={() => { setGoal(g); setGenerated(true); setActiveTab('breakfasts') }}
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
        {!goal && <p style={{ fontSize:'13px', color:'var(--text3)', marginTop:'4px' }}>Select a goal to see meal ideas.</p>}
      </div>

      {filtered && (
        <div>
          <div style={{ display:'flex', gap:'6px', marginBottom:'14px', flexWrap:'wrap' }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => { setActiveTab(t.id); setExpandedMeal(null) }}
                style={{ background: activeTab===t.id ? 'var(--accent)' : 'var(--surface2)', border:`1px solid ${activeTab===t.id ? 'var(--accent)' : 'var(--border2)'}`, borderRadius:'8px', color: activeTab===t.id ? '#fff' : 'var(--text2)', cursor:'pointer', fontSize:'13px', padding:'7px 16px', fontFamily:'inherit', fontWeight: activeTab===t.id ? 600 : 400 }}>
                {t.label} <span style={{ opacity:0.7, fontSize:'11px' }}>({tabs.find(x=>x.id===t.id)?.items?.length || 0})</span>
              </button>
            ))}
          </div>

          {activeItems.length === 0 ? (
            <div className="empty">No meals match your current filters. Try removing a dietary restriction.</div>
          ) : activeItems.map((item, i) => (
            <div key={i} style={{ background:'var(--surface)', border:`1px solid ${expandedMeal===`${activeTab}-${i}` ? 'var(--accent)' : 'var(--border)'}`, borderRadius:'12px', padding:'14px', marginBottom:'8px', cursor:'pointer', transition:'border-color 0.15s' }}
              onClick={() => setExpandedMeal(expandedMeal===`${activeTab}-${i}` ? null : `${activeTab}-${i}`)}>
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'10px', marginBottom:'6px' }}>
                <div>
                  <div style={{ fontWeight:600, fontSize:'14px', marginBottom:'2px' }}>{item.name}</div>
                  <div style={{ fontSize:'12px', color:'var(--text2)' }}>{item.desc}</div>
                </div>
                <div style={{ textAlign:'right', flexShrink:0 }}>
                  <div style={{ fontSize:'16px', fontWeight:700, color:'var(--accent)' }}>{item.calories}</div>
                  <div style={{ fontSize:'10px', color:'var(--text3)' }}>kcal</div>
                </div>
              </div>
              <div>
                <MacroBadge label="Protein" val={item.protein} color="var(--green)" />
                <MacroBadge label="Carbs" val={item.carbs} color="var(--blue)" />
                <MacroBadge label="Fat" val={item.fat} color="var(--amber)" />
              </div>
              {expandedMeal===`${activeTab}-${i}` && item.recipe && (
                <div style={{ marginTop:'12px', padding:'12px', background:'var(--surface2)', borderRadius:'8px' }}>
                  <div style={{ fontSize:'11px', fontWeight:700, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.7px', marginBottom:'8px' }}>How to make it</div>
                  {item.recipe.map((step, j) => (
                    <div key={j} style={{ fontSize:'13px', color:'var(--text2)', marginBottom:'6px', display:'flex', gap:'8px', lineHeight:1.5 }}>
                      <span style={{ color:'var(--accent)', fontWeight:700, flexShrink:0 }}>{j+1}.</span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              )}
              {expandedMeal!==`${activeTab}-${i}` && item.recipe && (
                <div style={{ fontSize:'12px', color:'var(--accent)', marginTop:'8px' }}>Tap to see recipe ▼</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
