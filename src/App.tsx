import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ToastProvider } from './contexts/ToastContext'
import { AppLayout } from './layouts/AppLayout'
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { BodyMeasurementsPage } from './pages/body-measurements/BodyMeasurementsPage'
import { DashboardPage } from './pages/dashboard/DashboardPage'
import { HistoryDetailPage } from './pages/history/HistoryDetailPage'
import { HistoryPage } from './pages/history/HistoryPage'
import { ProfilePage } from './pages/profile/ProfilePage'
import { ProgressPage } from './pages/progress/ProgressPage'
import { WorkoutProgressPage } from './pages/progress/WorkoutProgressPage'
import { WorkoutSessionPage } from './pages/workout-session/WorkoutSessionPage'
import { WorkoutDetailPage } from './pages/workouts/WorkoutDetailPage'
import { WorkoutsPage } from './pages/workouts/WorkoutsPage'
import { ProtectedRoute, PublicOnlyRoute } from './routes/guards'

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            <Route element={<PublicOnlyRoute />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>
            <Route element={<ProtectedRoute />}>
              <Route path="/session/:logId" element={<WorkoutSessionPage />} />
              <Route element={<AppLayout />}>
                <Route index element={<DashboardPage />} />
                <Route path="/workouts" element={<WorkoutsPage />} />
                <Route path="/workouts/:id" element={<WorkoutDetailPage />} />
                <Route path="/history" element={<HistoryPage />} />
                <Route path="/history/:logId" element={<HistoryDetailPage />} />
                <Route path="/progress" element={<ProgressPage />} />
                <Route path="/progress/:workoutId" element={<WorkoutProgressPage />} />
                <Route path="/measurements" element={<BodyMeasurementsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}
