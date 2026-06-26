import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './lib/AuthContext.jsx'
import LandingPage from './pages/LandingPage.jsx'
import AuthPage from './pages/AuthPage.jsx'
import AppLayout from './pages/AppLayout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import WeightPage from './pages/WeightPage.jsx'
import WakeupPage from './pages/WakeupPage.jsx'
import WorkoutsPage from './pages/WorkoutsPage.jsx'
import HabitsPage from './pages/HabitsPage.jsx'
import GoalsPage from './pages/GoalsPage.jsx'
import TasksPage from './pages/TasksPage.jsx'
import JournalPage from './pages/JournalPage.jsx'
import PricingPage from './pages/PricingPage.jsx'
import AccountPage from './pages/AccountPage.jsx'
import ProgressPage from './pages/ProgressPage.jsx'
import MeasurementsPage from './pages/MeasurementsPage.jsx'
import WaterPage from './pages/WaterPage.jsx'
import SleepPage from './pages/SleepPage.jsx'
import NutritionPage from './pages/NutritionPage.jsx'
import ExercisePage from './pages/ExercisePage.jsx'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',color:'var(--text3)'}}>Loading...</div>
  return user ? children : <Navigate to="/auth" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/app" element={<PrivateRoute><AppLayout /></PrivateRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="weight" element={<WeightPage />} />
        <Route path="wakeup" element={<WakeupPage />} />
        <Route path="workouts" element={<WorkoutsPage />} />
        <Route path="habits" element={<HabitsPage />} />
        <Route path="goals" element={<GoalsPage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="journal" element={<JournalPage />} />
        <Route path="progress" element={<ProgressPage />} />
        <Route path="measurements" element={<MeasurementsPage />} />
        <Route path="water" element={<WaterPage />} />
        <Route path="sleep" element={<SleepPage />} />
        <Route path="nutrition" element={<NutritionPage />} />
        <Route path="exercise" element={<ExercisePage />} />
        <Route path="account" element={<AccountPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
