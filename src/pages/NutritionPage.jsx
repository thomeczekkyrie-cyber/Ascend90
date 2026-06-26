import { useState, useMemo } from 'react'

const MEAL_DB = {
  breakfasts: [
    { name: 'Greek Yogurt Parfait', calories: 320, protein: 22, carbs: 38, fiber: 3, fat: 8, tags: ['vegetarian', 'gluten-free'], goals: ['lose weight', 'maintain weight', 'eat cleaner', 'increase energy'], desc: 'Greek yogurt layered with berries and granola.', recipe: ['Add 1 cup Greek yogurt to a bowl', 'Top with 1/2 cup mixed berries', 'Sprinkle 1/4 cup granola', 'Drizzle with 1 tsp honey'] },
    { name: 'Egg White Veggie Omelette', calories: 210, protein: 28, carbs: 8, fiber: 2, fat: 6, tags: ['vegetarian', 'gluten-free', 'keto'], goals: ['lose weight', 'build muscle', 'eat cleaner', 'keto'], desc: 'Fluffy egg white omelette loaded with peppers and spinach.', recipe: ['Whisk 4 egg whites with salt and pepper', 'Pour into non-stick pan over medium heat', 'Add diced peppers, spinach, and onion', 'Fold and serve'] },
    { name: 'Overnight Oats', calories: 380, protein: 14, carbs: 58, fiber: 8, fat: 9, tags: ['vegetarian', 'vegan', 'dairy-free'], goals: ['maintain weight', 'increase energy', 'eat cleaner'], desc: 'Creamy oats soaked overnight with chia seeds and fruit.', recipe: ['Combine 1/2 cup oats, 1 cup almond milk, 1 tbsp chia seeds', 'Add 1 tsp honey and vanilla', 'Refrigerate overnight', 'Top with fresh fruit in the morning'] },
    { name: 'Protein Smoothie', calories: 340, protein: 35, carbs: 32, fiber: 3, fat: 6, tags: ['gluten-free', 'dairy-free'], goals: ['build muscle', 'increase energy'], desc: 'High-protein banana peanut butter smoothie.', recipe: ['Blend 1 scoop protein powder', 'Add 1 banana, 1 tbsp peanut butter', 'Add 1 cup almond milk and ice', 'Blend until smooth'] },
    { name: 'Avocado Toast with Eggs', calories: 420, protein: 18, carbs: 36, fiber: 7, fat: 22, tags: ['vegetarian'], goals: ['maintain weight', 'eat cleaner', 'increase energy'], desc: 'Whole grain toast topped with avocado and poached eggs.', recipe: ['Toast 2 slices whole grain bread', 'Mash 1/2 avocado with lemon juice and salt', 'Poach 2 eggs for 3 minutes', 'Assemble and top with red pepper flakes'] },
    { name: 'Cottage Cheese Bowl', calories: 290, protein: 32, carbs: 18, fiber: 1, fat: 7, tags: ['vegetarian', 'gluten-free'], goals: ['lose weight', 'build muscle'], desc: 'High-protein cottage cheese with pineapple and seeds.', recipe: ['Scoop 1 cup cottage cheese into bowl', 'Add 1/2 cup pineapple chunks', 'Sprinkle 1 tbsp pumpkin seeds', 'Add cinnamon to taste'] },
    { name: 'Chia Pudding', calories: 260, protein: 8, carbs: 30, fiber: 10, fat: 12, tags: ['vegan', 'gluten-free', 'dairy-free'], goals: ['lose weight', 'eat cleaner'], desc: 'Thick chia pudding with coconut milk and mango.', recipe: ['Mix 3 tbsp chia seeds with 1 cup coconut milk', 'Stir well and refrigerate 4+ hours', 'Top with diced mango', 'Add a squeeze of lime'] },
    { name: 'Keto Bacon and Eggs', calories: 480, protein: 30, carbs: 1, fiber: 0, fat: 38, tags: ['gluten-free', 'keto', 'dairy-free'], goals: ['lose weight', 'build muscle', 'keto'], desc: 'Classic bacon and eggs — zero carb fuel.', recipe: ['Cook 3 strips bacon in pan until crispy', 'Fry 2 eggs in bacon fat', 'Season with salt and pepper', 'Serve with sliced avocado'] },
    { name: 'Keto Avocado Egg Bowl', calories: 440, protein: 24, carbs: 4, fiber: 3, fat: 36, tags: ['gluten-free', 'keto', 'dairy-free', 'vegetarian'], goals: ['lose weight', 'keto', 'eat cleaner'], desc: 'Halved avocado filled with baked egg, topped with everything bagel seasoning.', recipe: ['Halve an avocado and scoop out a little flesh', 'Crack an egg into each half', 'Bake at 400F for 12-15 minutes', 'Season with salt, pepper, and bagel seasoning'] },
    { name: 'Steel Cut Oatmeal', calories: 350, protein: 12, carbs: 60, fiber: 10, fat: 6, tags: ['vegan', 'gluten-free', 'dairy-free', 'vegetarian'], goals: ['increase energy', 'maintain weight', 'eat cleaner'], desc: 'Hearty oatmeal with walnuts, banana, and cinnamon.', recipe: ['Cook 1/2 cup steel cut oats in 2 cups water (20 min)', 'Stir in cinnamon and a pinch of salt', 'Top with sliced banana and walnuts', 'Add maple syrup if desired'] },
    { name: 'Smoked Salmon Cream Cheese Wrap', calories: 380, protein: 26, carbs: 28, fiber: 2, fat: 18, tags: ['gluten-free'], goals: ['build muscle', 'eat cleaner', 'maintain weight'], desc: 'Smoked salmon with cream cheese and capers on a low-carb wrap.', recipe: ['Spread cream cheese on a low-carb wrap', 'Layer smoked salmon and capers', 'Add thinly sliced red onion and dill', 'Roll and slice in half'] },
    { name: 'Keto Sausage and Cheese Egg Cups', calories: 420, protein: 28, carbs: 2, fiber: 0, fat: 34, tags: ['gluten-free', 'keto'], goals: ['lose weight', 'build muscle', 'keto'], desc: 'Savory egg cups with sausage and melted cheese — meal prep friendly.', recipe: ['Preheat oven to 375F and grease a muffin tin', 'Press cooked sausage into bottom of each cup', 'Crack an egg into each cup', 'Top with shredded cheese and bake 15 min'] },
  ],
  lunches: [
    { name: 'Grilled Chicken Salad', calories: 380, protein: 42, carbs: 18, fiber: 5, fat: 14, tags: ['gluten-free', 'dairy-free'], goals: ['lose weight', 'build muscle', 'eat cleaner'], desc: 'Mixed greens with grilled chicken, cherry tomatoes, and vinaigrette.', recipe: ['Grill 6oz chicken breast with seasoning', 'Slice and place over mixed greens', 'Add cherry tomatoes, cucumber, red onion', 'Drizzle with olive oil and lemon'] },
    { name: 'Turkey and Avocado Wrap', calories: 450, protein: 34, carbs: 42, fiber: 6, fat: 16, tags: ['dairy-free'], goals: ['build muscle', 'maintain weight', 'increase energy'], desc: 'Whole wheat wrap with turkey, avocado, and veggies.', recipe: ['Lay out whole wheat tortilla', 'Layer sliced turkey, avocado, lettuce, tomato', 'Add mustard or hummus', 'Roll tightly and slice in half'] },
    { name: 'Quinoa Buddha Bowl', calories: 420, protein: 18, carbs: 52, fiber: 10, fat: 14, tags: ['vegan', 'gluten-free', 'dairy-free', 'vegetarian'], goals: ['eat cleaner', 'maintain weight', 'increase energy'], desc: 'Colorful bowl with quinoa, roasted veggies, and tahini.', recipe: ['Cook 1/2 cup quinoa', 'Roast sweet potato and broccoli at 400F for 25 min', 'Assemble with chickpeas', 'Drizzle with tahini dressing'] },
    { name: 'Tuna Lettuce Wraps', calories: 280, protein: 38, carbs: 6, fiber: 2, fat: 9, tags: ['gluten-free', 'keto', 'dairy-free'], goals: ['lose weight', 'eat cleaner', 'keto'], desc: 'Light tuna salad served in crisp lettuce cups.', recipe: ['Mix canned tuna with Greek yogurt, mustard, celery', 'Season with salt, pepper, and lemon', 'Spoon into large lettuce leaves', 'Top with sliced avocado'] },
    { name: 'Lentil Soup', calories: 360, protein: 22, carbs: 54, fiber: 18, fat: 4, tags: ['vegan', 'gluten-free', 'dairy-free', 'vegetarian'], goals: ['lose weight', 'eat cleaner', 'increase energy'], desc: 'Hearty red lentil soup with cumin and spinach.', recipe: ['Sauté onion, garlic, and cumin in pot', 'Add 1 cup red lentils and 4 cups broth', 'Simmer 20 minutes until soft', 'Stir in spinach and lemon juice'] },
    { name: 'Steak and Rice Bowl', calories: 580, protein: 48, carbs: 52, fiber: 4, fat: 16, tags: ['gluten-free', 'dairy-free'], goals: ['build muscle', 'increase energy'], desc: 'Lean sirloin over brown rice with roasted broccoli.', recipe: ['Season and grill 6oz sirloin to desired doneness', 'Slice thinly against the grain', 'Serve over 1 cup brown rice', 'Add roasted broccoli and soy sauce'] },
    { name: 'Keto Cobb Salad', calories: 520, protein: 38, carbs: 6, fiber: 3, fat: 38, tags: ['gluten-free', 'keto'], goals: ['lose weight', 'build muscle', 'keto'], desc: 'Classic cobb with chicken, bacon, egg, avocado, and blue cheese.', recipe: ['Arrange romaine lettuce as base', 'Top with sliced chicken, crispy bacon, hard boiled egg', 'Add avocado, cherry tomatoes, blue cheese', 'Dress with ranch or blue cheese dressing'] },
    { name: 'Salmon Power Bowl', calories: 520, protein: 44, carbs: 8, fiber: 4, fat: 32, tags: ['gluten-free', 'keto', 'dairy-free'], goals: ['build muscle', 'eat cleaner', 'keto'], desc: 'Baked salmon over greens with avocado and sesame.', recipe: ['Bake 6oz salmon at 400F for 12 minutes', 'Arrange over mixed greens', 'Add avocado, cucumber, edamame', 'Dress with sesame ginger dressing'] },
    { name: 'Mediterranean Chickpea Wrap', calories: 410, protein: 16, carbs: 58, fiber: 12, fat: 12, tags: ['vegan', 'vegetarian'], goals: ['eat cleaner', 'maintain weight'], desc: 'Hummus wrap with chickpeas, cucumber, and olives.', recipe: ['Spread hummus on whole wheat wrap', 'Add chickpeas, diced cucumber, tomato', 'Add olives and fresh parsley', 'Roll up and serve'] },
    { name: 'Black Bean Burrito Bowl', calories: 490, protein: 22, carbs: 68, fiber: 16, fat: 12, tags: ['vegan', 'gluten-free', 'dairy-free', 'vegetarian'], goals: ['eat cleaner', 'maintain weight', 'increase energy'], desc: 'Rice bowl loaded with black beans, corn, and salsa.', recipe: ['Layer brown rice in bowl', 'Add warmed black beans and corn', 'Top with salsa, guacamole, and cilantro', 'Squeeze lime over everything'] },
    { name: 'Keto Egg Salad on Lettuce', calories: 340, protein: 22, carbs: 3, fiber: 1, fat: 26, tags: ['gluten-free', 'keto', 'vegetarian'], goals: ['lose weight', 'keto', 'eat cleaner'], desc: 'Creamy egg salad in crispy romaine boats.', recipe: ['Hard boil 4 eggs and chop roughly', 'Mix with mayo, dijon mustard, celery, and chives', 'Season well with salt and pepper', 'Spoon into romaine lettuce cups'] },
    { name: 'Shrimp Avocado Salad', calories: 360, protein: 36, carbs: 8, fiber: 5, fat: 20, tags: ['gluten-free', 'keto', 'dairy-free'], goals: ['lose weight', 'build muscle', 'keto', 'eat cleaner'], desc: 'Chilled shrimp with avocado, lime, and fresh herbs.', recipe: ['Cook and chill shrimp', 'Dice avocado and combine with shrimp', 'Add red onion, cilantro, jalapeño', 'Dress with lime juice and olive oil'] },
  ],
  dinners: [
    { name: 'Baked Salmon with Asparagus', calories: 480, protein: 46, carbs: 8, fiber: 4, fat: 26, tags: ['gluten-free', 'keto', 'dairy-free'], goals: ['lose weight', 'build muscle', 'eat cleaner', 'keto'], desc: 'Herb-crusted salmon with roasted asparagus.', recipe: ['Season salmon with lemon, garlic, and herbs', 'Place on baking sheet with asparagus', 'Drizzle with olive oil', 'Bake at 400F for 15 minutes'] },
    { name: 'Chicken Stir Fry', calories: 440, protein: 42, carbs: 38, fiber: 6, fat: 12, tags: ['gluten-free', 'dairy-free'], goals: ['build muscle', 'eat cleaner', 'increase energy'], desc: 'Lean chicken with colorful veggies in savory sauce.', recipe: ['Slice chicken breast thin and season', 'Stir fry in hot wok with oil 5-6 min', 'Add broccoli, peppers, snap peas', 'Toss with low-sodium soy sauce and ginger'] },
    { name: 'Turkey Meatballs with Zucchini Noodles', calories: 390, protein: 38, carbs: 12, fiber: 3, fat: 18, tags: ['gluten-free', 'keto', 'dairy-free'], goals: ['lose weight', 'eat cleaner', 'keto'], desc: 'Lean turkey meatballs over spiralized zucchini.', recipe: ['Mix ground turkey with egg, garlic, herbs', 'Roll into balls and bake 20 min at 375F', 'Spiralize zucchini and sauté briefly', 'Top with marinara and meatballs'] },
    { name: 'Keto Ribeye with Garlic Butter', calories: 620, protein: 48, carbs: 2, fiber: 0, fat: 46, tags: ['gluten-free', 'keto'], goals: ['build muscle', 'keto'], desc: 'Pan-seared ribeye with garlic herb butter and side salad.', recipe: ['Bring steak to room temp and season generously', 'Sear in cast iron on high heat 3-4 min per side', 'Top with garlic butter and let rest 5 min', 'Serve with simple green salad'] },
    { name: 'Shrimp Tacos', calories: 420, protein: 34, carbs: 42, fiber: 6, fat: 12, tags: ['dairy-free', 'gluten-free'], goals: ['eat cleaner', 'maintain weight'], desc: 'Seasoned shrimp in corn tortillas with slaw.', recipe: ['Season shrimp with cumin, chili powder, garlic', 'Cook in hot pan 2 min per side', 'Warm corn tortillas', 'Top with cabbage slaw, avocado, and lime'] },
    { name: 'Stuffed Bell Peppers', calories: 380, protein: 28, carbs: 28, fiber: 6, fat: 12, tags: ['gluten-free', 'dairy-free'], goals: ['eat cleaner', 'lose weight', 'maintain weight'], desc: 'Peppers stuffed with ground turkey, rice, and tomatoes.', recipe: ['Cut tops off bell peppers and remove seeds', 'Mix cooked turkey, rice, diced tomatoes, spices', 'Fill peppers and place in baking dish', 'Bake covered at 375F for 35 minutes'] },
    { name: 'Keto Chicken Thighs with Broccoli', calories: 480, protein: 42, carbs: 6, fiber: 3, fat: 32, tags: ['gluten-free', 'keto', 'dairy-free'], goals: ['lose weight', 'build muscle', 'keto'], desc: 'Crispy roasted chicken thighs with garlic roasted broccoli.', recipe: ['Season chicken thighs with garlic, paprika, salt', 'Roast skin-side up at 425F for 30 minutes', 'Toss broccoli in olive oil and roast alongside', 'Serve together with lemon wedges'] },
    { name: 'Vegetable Curry', calories: 360, protein: 14, carbs: 48, fiber: 12, fat: 12, tags: ['vegan', 'gluten-free', 'dairy-free', 'vegetarian'], goals: ['eat cleaner', 'lose weight'], desc: 'Fragrant coconut curry with chickpeas and sweet potato.', recipe: ['Sauté onion, ginger, garlic in oil', 'Add curry paste and cook 1 minute', 'Add coconut milk, sweet potato, chickpeas', 'Simmer 20 min, serve over cauliflower rice for keto'] },
    { name: 'Pork Tenderloin with Sweet Potato', calories: 490, protein: 42, carbs: 44, fiber: 6, fat: 14, tags: ['gluten-free', 'dairy-free'], goals: ['build muscle', 'maintain weight'], desc: 'Lean pork tenderloin with roasted sweet potato mash.', recipe: ['Season pork with garlic, thyme, and paprika', 'Sear all sides in oven-safe pan', 'Roast at 425F for 20 minutes', 'Serve with mashed sweet potato'] },
    { name: 'Keto Ground Beef Lettuce Tacos', calories: 440, protein: 34, carbs: 4, fiber: 2, fat: 32, tags: ['gluten-free', 'keto', 'dairy-free'], goals: ['lose weight', 'keto', 'eat cleaner'], desc: 'Seasoned ground beef in crisp lettuce cups with all the toppings.', recipe: ['Brown ground beef with taco seasoning', 'Drain fat and add diced onion and garlic', 'Spoon into large iceberg lettuce cups', 'Top with avocado, salsa, and sour cream'] },
    { name: 'Cod with Mediterranean Salsa', calories: 340, protein: 40, carbs: 10, fiber: 3, fat: 10, tags: ['gluten-free', 'keto', 'dairy-free'], goals: ['lose weight', 'eat cleaner', 'keto'], desc: 'Flaky cod topped with tomato, olive, and caper salsa.', recipe: ['Season cod fillets and bake at 400F for 12 min', 'Combine diced tomato, olives, capers, basil', 'Add lemon juice and olive oil to salsa', 'Spoon over cooked fish'] },
    { name: 'Vegan Lentil Bolognese', calories: 420, protein: 20, carbs: 62, fiber: 16, fat: 8, tags: ['vegan', 'dairy-free', 'vegetarian'], goals: ['eat cleaner', 'maintain weight', 'increase energy'], desc: 'Hearty lentil bolognese over spaghetti.', recipe: ['Sauté onion, carrot, celery in olive oil', 'Add lentils, crushed tomatoes, herbs', 'Simmer 25 minutes until thick', 'Serve over cooked spaghetti'] },
  ],
  snacks: [
    { name: 'Apple with Almond Butter', calories: 200, protein: 5, carbs: 28, fiber: 4, fat: 10, tags: ['vegan', 'gluten-free', 'dairy-free', 'vegetarian'], goals: ['all'], desc: 'Crisp apple slices with 1 tbsp almond butter.' },
    { name: 'Hard Boiled Eggs', calories: 140, protein: 12, carbs: 1, fiber: 0, fat: 10, tags: ['gluten-free', 'keto', 'dairy-free', 'vegetarian'], goals: ['all'], desc: 'Two hard boiled eggs with a pinch of sea salt.' },
    { name: 'Mixed Nuts', calories: 180, protein: 5, carbs: 8, fiber: 2, fat: 16, tags: ['vegan', 'gluten-free', 'keto', 'dairy-free', 'vegetarian'], goals: ['all'], desc: 'A small handful of almonds, walnuts, and cashews.' },
    { name: 'Celery with Peanut Butter', calories: 160, protein: 6, carbs: 12, fiber: 3, fat: 10, tags: ['vegan', 'gluten-free', 'dairy-free', 'vegetarian'], goals: ['lose weight', 'eat cleaner'], desc: 'Crunchy celery sticks with 2 tbsp peanut butter.' },
    { name: 'Cottage Cheese and Pineapple', calories: 190, protein: 20, carbs: 20, fiber: 1, fat: 3, tags: ['gluten-free', 'vegetarian'], goals: ['lose weight', 'build muscle'], desc: '3/4 cup cottage cheese with fresh pineapple chunks.' },
    { name: 'Keto Cheese and Deli Meat Roll-ups', calories: 170, protein: 18, carbs: 1, fiber: 0, fat: 10, tags: ['gluten-free', 'keto'], goals: ['lose weight', 'build muscle', 'keto'], desc: 'Sliced turkey breast rolled with sliced cheddar or swiss.' },
    { name: 'Edamame', calories: 150, protein: 12, carbs: 12, fiber: 5, fat: 5, tags: ['vegan', 'gluten-free', 'dairy-free', 'vegetarian'], goals: ['all'], desc: 'Steamed edamame with a sprinkle of sea salt.' },
    { name: 'Greek Yogurt with Honey', calories: 180, protein: 16, carbs: 22, fiber: 0, fat: 3, tags: ['gluten-free', 'vegetarian'], goals: ['lose weight', 'build muscle', 'eat cleaner'], desc: '3/4 cup plain Greek yogurt with a drizzle of honey.' },
    { name: 'Beef Jerky', calories: 120, protein: 14, carbs: 4, fiber: 0, fat: 3, tags: ['gluten-free', 'keto', 'dairy-free'], goals: ['build muscle', 'lose weight', 'keto'], desc: 'Low-sodium beef jerky — great portable protein.' },
    { name: 'Hummus and Veggies', calories: 160, protein: 6, carbs: 20, fiber: 6, fat: 7, tags: ['vegan', 'gluten-free', 'dairy-free', 'vegetarian'], goals: ['eat cleaner', 'lose weight', 'maintain weight'], desc: '1/4 cup hummus with carrots, peppers, and cucumber.' },
    { name: 'Keto Pepperoni and Cheese', calories: 190, protein: 12, carbs: 1, fiber: 0, fat: 15, tags: ['gluten-free', 'keto'], goals: ['lose weight', 'keto'], desc: 'Sliced pepperoni with cubed cheddar — satisfying and zero carb.' },
    { name: 'Banana with Walnut Butter', calories: 220, protein: 4, carbs: 30, fiber: 3, fat: 10, tags: ['vegan', 'gluten-free', 'dairy-free', 'vegetarian'], goals: ['increase energy', 'maintain weight', 'build muscle'], desc: 'Medium banana with 1 tbsp walnut butter.' },
    { name: 'Tuna on Cucumber Slices', calories: 110, protein: 18, carbs: 3, fiber: 1, fat: 2, tags: ['gluten-free', 'keto', 'dairy-free'], goals: ['lose weight', 'eat cleaner', 'keto'], desc: 'Seasoned tuna salad served on cucumber rounds.' },
    { name: 'Dark Chocolate and Almonds', calories: 190, protein: 4, carbs: 16, fiber: 3, fat: 14, tags: ['vegan', 'gluten-free', 'dairy-free', 'vegetarian'], desc: '1 oz dark chocolate (70%+) with a small handful of almonds.', goals: ['maintain weight', 'eat cleaner'] },
    { name: 'Keto Fat Bombs', calories: 160, protein: 2, carbs: 2, fiber: 1, fat: 16, tags: ['vegetarian', 'gluten-free', 'keto'], goals: ['lose weight', 'keto'], desc: 'Coconut oil and peanut butter fat bombs — keeps you full for hours.' },
  ]
}

const GOALS = ['Lose weight', 'Build muscle', 'Maintain weight', 'Eat cleaner', 'Increase energy']
const RESTRICTIONS = ['None', 'Vegetarian', 'Vegan', 'Gluten-free', 'Dairy-free', 'Keto', 'Paleo', 'Nut-free']

const netCarbs = (item) => Math.max(0, item.carbs - item.fiber)
const isKeto = (item) => netCarbs(item) <= 5

function filterMeals(meals, goal, restrictions) {
  const g = goal.toLowerCase()
  const r = restrictions.map(x => x.toLowerCase()).filter(x => x !== 'none')

  return meals.filter(m => {
    // Goal match
    const goalMatch = m.goals.includes('all') ||
      m.goals.some(mg => g.split(' ').some(word => mg.toLowerCase().includes(word)))

    // Restriction match — ALL selected restrictions must be satisfied
    let restrictionMatch = true
    if (r.includes('keto')) {
      restrictionMatch = restrictionMatch && isKeto(m)
    }
    if (r.includes('vegan')) {
      restrictionMatch = restrictionMatch && m.tags.includes('vegan')
    }
    if (r.includes('vegetarian')) {
      restrictionMatch = restrictionMatch && (m.tags.includes('vegetarian') || m.tags.includes('vegan'))
    }
    if (r.includes('gluten-free')) {
      restrictionMatch = restrictionMatch && m.tags.includes('gluten-free')
    }
    if (r.includes('dairy-free')) {
      restrictionMatch = restrictionMatch && m.tags.includes('dairy-free')
    }
    if (r.includes('nut-free')) {
      restrictionMatch = restrictionMatch && !m.name.toLowerCase().includes('almond') && !m.name.toLowerCase().includes('nut') && !m.name.toLowerCase().includes('peanut') && !m.name.toLowerCase().includes('walnut')
    }

    return goalMatch && restrictionMatch
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

  const isKetoMode = restrictions.map(r => r.toLowerCase()).includes('keto')

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
      snacks: filterMeals(MEAL_DB.snacks, goal, restrictions),
    }
  }, [goal, restrictions])

  const tabs = filtered ? [
    { id:'breakfasts', label:'🍳 Breakfast', items: filtered.breakfasts },
    { id:'lunches', label:'🥗 Lunch', items: filtered.lunches },
    { id:'dinners', label:'🍽️ Dinner', items: filtered.dinners },
    { id:'snacks', label:'🍎 Snacks', items: filtered.snacks },
  ] : []

  const activeItems = tabs.find(t => t.id === activeTab)?.items || []

  return (
    <div style={{ maxWidth:'800px' }}>
      <div className="page-header"><h1>Nutrition & meal ideas</h1><p>Meal ideas and macros built around your goals and dietary needs.</p></div>

      <div className="card">
        <p className="card-title">Your preferences</p>
        <div className="form-row">
          <label className="form-label">Goal</label>
          <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
            {GOALS.map(g => (
              <button key={g} onClick={() => { setGoal(g); setActiveTab('breakfasts'); setExpandedMeal(null) }}
                style={{ background: goal===g ? 'var(--accent-soft)' : 'var(--surface2)', border:`1px solid ${goal===g ? 'var(--accent)' : 'var(--border2)'}`, borderRadius:'8px', color: goal===g ? 'var(--accent)' : 'var(--text2)', cursor:'pointer', fontSize:'13px', padding:'7px 14px', fontFamily:'inherit', transition:'all 0.15s' }}>
                {g}
              </button>
            ))}
          </div>
        </div>
        <div className="form-row">
          <label className="form-label">Dietary restrictions <span style={{ color:'var(--text3)', fontWeight:400 }}>(select all that apply)</span></label>
          <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
            {RESTRICTIONS.map(r => (
              <button key={r} onClick={() => { toggleRestriction(r); setExpandedMeal(null) }}
                style={{ background: restrictions.includes(r) ? 'var(--accent-soft)' : 'var(--surface2)', border:`1px solid ${restrictions.includes(r) ? 'var(--accent)' : 'var(--border2)'}`, borderRadius:'8px', color: restrictions.includes(r) ? 'var(--accent)' : 'var(--text2)', cursor:'pointer', fontSize:'13px', padding:'7px 14px', fontFamily:'inherit', transition:'all 0.15s' }}>
                {r}
              </button>
            ))}
          </div>
        </div>
        {isKetoMode && (
          <div style={{ background:'var(--amber-soft)', border:'1px solid rgba(245,166,35,0.3)', borderRadius:'8px', padding:'10px 14px', fontSize:'13px', color:'var(--amber)' }}>
            🥑 Keto mode on — showing only meals with <strong>5g or less net carbs</strong>. Net carbs = total carbs minus fiber.
          </div>
        )}
        {!goal && <p style={{ fontSize:'13px', color:'var(--text3)', marginTop:'8px' }}>Select a goal above to see meal ideas.</p>}
      </div>

      {filtered && (
        <div>
          <div style={{ display:'flex', gap:'6px', marginBottom:'14px', flexWrap:'wrap' }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => { setActiveTab(t.id); setExpandedMeal(null) }}
                style={{ background: activeTab===t.id ? 'var(--accent)' : 'var(--surface2)', border:`1px solid ${activeTab===t.id ? 'var(--accent)' : 'var(--border2)'}`, borderRadius:'8px', color: activeTab===t.id ? '#fff' : 'var(--text2)', cursor:'pointer', fontSize:'13px', padding:'7px 16px', fontFamily:'inherit', fontWeight: activeTab===t.id ? 600 : 400 }}>
                {t.label} <span style={{ opacity:0.7, fontSize:'11px' }}>({t.items?.length || 0})</span>
              </button>
            ))}
          </div>

          {activeItems.length === 0 ? (
            <div className="card" style={{ textAlign:'center', padding:'36px' }}>
              <div style={{ fontSize:'28px', marginBottom:'10px' }}>🤔</div>
              <div style={{ fontWeight:600, marginBottom:'6px' }}>No meals match your filters</div>
              <div style={{ fontSize:'13px', color:'var(--text2)' }}>Try removing a dietary restriction or changing your goal.</div>
            </div>
          ) : activeItems.map((item, i) => (
            <div key={i} style={{ background:'var(--surface)', border:`1px solid ${expandedMeal===`${activeTab}-${i}` ? 'var(--accent)' : 'var(--border)'}`, borderRadius:'12px', padding:'14px', marginBottom:'8px', cursor:'pointer', transition:'border-color 0.15s' }}
              onClick={() => setExpandedMeal(expandedMeal===`${activeTab}-${i}` ? null : `${activeTab}-${i}`)}>
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'10px', marginBottom:'8px' }}>
                <div>
                  <div style={{ fontWeight:600, fontSize:'14px', marginBottom:'2px', display:'flex', alignItems:'center', gap:'6px' }}>
                    {item.name}
                    {isKeto(item) && isKetoMode && <span style={{ fontSize:'10px', background:'var(--green-soft)', color:'var(--green)', padding:'2px 7px', borderRadius:'20px', fontWeight:700 }}>✓ Keto</span>}
                  </div>
                  <div style={{ fontSize:'12px', color:'var(--text2)' }}>{item.desc}</div>
                </div>
                <div style={{ textAlign:'right', flexShrink:0 }}>
                  <div style={{ fontSize:'16px', fontWeight:700, color:'var(--accent)' }}>{item.calories}</div>
                  <div style={{ fontSize:'10px', color:'var(--text3)' }}>kcal</div>
                </div>
              </div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:'4px' }}>
                <MacroBadge label="Protein" val={item.protein} color="var(--green)" />
                <MacroBadge label="Carbs" val={item.carbs} color="var(--blue)" />
                <MacroBadge label="Fiber" val={item.fiber} color="var(--text3)" />
                <span style={{ background:'rgba(124,92,252,0.15)', color:'var(--accent)', fontSize:'11px', fontWeight:700, padding:'2px 7px', borderRadius:'5px', marginRight:'4px' }}>
                  Net carbs: {netCarbs(item)}g
                </span>
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
              {!item.recipe && expandedMeal!==`${activeTab}-${i}` && null}
              {item.recipe && expandedMeal!==`${activeTab}-${i}` && (
                <div style={{ fontSize:'12px', color:'var(--text3)', marginTop:'6px' }}>Tap to see recipe ▼</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
