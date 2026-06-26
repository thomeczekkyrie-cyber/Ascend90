import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { type, goal, restrictions, level, daysPerWeek } = req.body

  let prompt = ''

  if (type === 'meals') {
    prompt = `Generate a meal plan for someone with goal: "${goal}" and dietary restrictions: "${restrictions || 'None'}".

Return this exact JSON structure with no markdown, no explanation, just raw JSON:
{
  "breakfasts": [
    { "name": "", "description": "", "calories": 0, "protein": 0, "carbs": 0, "fat": 0, "recipe": ["step1", "step2", "step3"] }
  ],
  "lunches": [same structure, 5 items],
  "dinners": [same structure, 5 items],
  "snacks": [
    { "name": "", "description": "", "calories": 0, "protein": 0, "carbs": 0, "fat": 0 }
  ]
}
Include 5 breakfasts, 5 lunches, 5 dinners, 10 snacks. Make them realistic, delicious, and aligned with the goal.`
  }

  if (type === 'workout') {
    prompt = `Create a ${daysPerWeek}-day per week workout plan for a ${level}.
Return this exact JSON with no markdown, no explanation:
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
  }

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4000,
      system: 'You are a certified nutritionist and personal trainer. Return ONLY valid JSON, no markdown, no explanation, no backticks.',
      messages: [{ role: 'user', content: prompt }]
    })

    const text = message.content[0].text.replace(/```json|```/g, '').trim()
    const data = JSON.parse(text)
    res.json({ data })
  } catch (err) {
    console.error('AI generate error:', err)
    res.status(500).json({ error: err.message })
  }
}
