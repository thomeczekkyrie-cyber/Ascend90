import { supabase } from './supabase'

// Generic helpers
const uid = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id
}

// ---- WEIGHTS ----
export async function getWeights() {
  const userId = await uid()
  const { data } = await supabase.from('weights').select('*').eq('user_id', userId).order('date', { ascending: true })
  return data || []
}
export async function upsertWeight(date, val) {
  const userId = await uid()
  const { error } = await supabase.from('weights').upsert({ user_id: userId, date, val }, { onConflict: 'user_id,date' })
  return error
}
export async function deleteWeight(date) {
  const userId = await uid()
  await supabase.from('weights').delete().eq('user_id', userId).eq('date', date)
}

// ---- WAKEUPS ----
export async function getWakeups() {
  const userId = await uid()
  const { data } = await supabase.from('wakeups').select('date').eq('user_id', userId)
  const map = {}
  ;(data || []).forEach(r => { map[r.date] = true })
  return map
}
export async function toggleWakeup(date, checked) {
  const userId = await uid()
  if (checked) {
    await supabase.from('wakeups').upsert({ user_id: userId, date }, { onConflict: 'user_id,date' })
  } else {
    await supabase.from('wakeups').delete().eq('user_id', userId).eq('date', date)
  }
}

// ---- WORKOUTS ----
export async function getWorkouts() {
  const userId = await uid()
  const { data } = await supabase.from('workouts').select('*').eq('user_id', userId).order('date', { ascending: false })
  return data || []
}
export async function insertWorkout(workout) {
  const userId = await uid()
  const { error } = await supabase.from('workouts').insert({ ...workout, user_id: userId })
  return error
}
export async function deleteWorkout(id) {
  const userId = await uid()
  await supabase.from('workouts').delete().eq('user_id', userId).eq('id', id)
}

// ---- HABITS ----
export async function getHabits() {
  const userId = await uid()
  const { data } = await supabase.from('habits').select('*').eq('user_id', userId).order('created_at', { ascending: true })
  return data || []
}
export async function insertHabit(name, cat) {
  const userId = await uid()
  const { error } = await supabase.from('habits').insert({ user_id: userId, name, cat })
  return error
}
export async function deleteHabit(id) {
  const userId = await uid()
  await supabase.from('habits').delete().eq('user_id', userId).eq('id', id)
}

// ---- HABIT LOG ----
export async function getHabitLog() {
  const userId = await uid()
  const { data } = await supabase.from('habit_log').select('*').eq('user_id', userId)
  const map = {}
  ;(data || []).forEach(r => {
    if (!map[r.date]) map[r.date] = []
    map[r.date].push(r.habit_id)
  })
  return map
}
export async function toggleHabitLog(habitId, date, checked) {
  const userId = await uid()
  if (checked) {
    await supabase.from('habit_log').upsert({ user_id: userId, habit_id: habitId, date }, { onConflict: 'user_id,habit_id,date' })
  } else {
    await supabase.from('habit_log').delete().eq('user_id', userId).eq('habit_id', habitId).eq('date', date)
  }
}

// ---- GOALS ----
export async function getGoals() {
  const userId = await uid()
  const { data } = await supabase.from('goals').select('*').eq('user_id', userId).order('created_at', { ascending: true })
  return data || []
}
export async function insertGoal(goal) {
  const userId = await uid()
  const { error } = await supabase.from('goals').insert({ ...goal, user_id: userId })
  return error
}
export async function updateGoalStatus(id, status) {
  const userId = await uid()
  await supabase.from('goals').update({ status }).eq('user_id', userId).eq('id', id)
}
export async function deleteGoal(id) {
  const userId = await uid()
  await supabase.from('goals').delete().eq('user_id', userId).eq('id', id)
}

// ---- TASKS ----
export async function getTasks() {
  const userId = await uid()
  const { data } = await supabase.from('tasks').select('*').eq('user_id', userId).order('created_at', { ascending: false })
  return data || []
}
export async function insertTask(task) {
  const userId = await uid()
  const { error } = await supabase.from('tasks').insert({ ...task, user_id: userId, done: false })
  return error
}
export async function toggleTask(id, done) {
  const userId = await uid()
  await supabase.from('tasks').update({ done }).eq('user_id', userId).eq('id', id)
}
export async function deleteTask(id) {
  const userId = await uid()
  await supabase.from('tasks').delete().eq('user_id', userId).eq('id', id)
}

// ---- JOURNAL ----
export async function getJournal() {
  const userId = await uid()
  const { data } = await supabase.from('journal').select('*').eq('user_id', userId).order('date', { ascending: false })
  return data || []
}
export async function upsertJournal(entry) {
  const userId = await uid()
  const { error } = await supabase.from('journal').upsert({ ...entry, user_id: userId }, { onConflict: 'user_id,date' })
  return error
}
export async function deleteJournal(date) {
  const userId = await uid()
  await supabase.from('journal').delete().eq('user_id', userId).eq('date', date)
}
