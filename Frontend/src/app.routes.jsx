import { BrowserRouter, Routes, Route, Navigate } from 'react-router'

import Landing from './features/landing/pages/Landing'
import Login from './features/auth/Pages/Login'
import Register from './features/auth/Pages/Register'
import Protected from './features/auth/components/Protected'

import AppLayout from './layouts/AppLayout'
import SessionsHome from './features/sessions/pages/SessionsHome'
import SessionDashboard from './features/sessions/pages/SessionDashboard'
import Interview from './features/interview/pages/Interview'
import AptitudeTest from './features/aptitude/pages/AptitudeTest'
import TechnicalTest from './features/technical/pages/TechnicalTest'

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes with AppLayout */}
        <Route path="/app" element={
          <Protected>
            <AppLayout>
              <SessionsHome />
            </AppLayout>
          </Protected>
        } />

        <Route path="/app/session/:sessionId" element={
          <Protected>
            <AppLayout>
              <SessionDashboard />
            </AppLayout>
          </Protected>
        } />

        <Route path="/app/session/:sessionId/interview" element={
          <Protected>
            <AppLayout>
              <Interview />
            </AppLayout>
          </Protected>
        } />

        <Route path="/app/session/:sessionId/aptitude" element={
          <Protected>
            <AptitudeTest />
          </Protected>
        } />

        <Route path="/app/session/:sessionId/technical" element={
          <Protected>
            <TechnicalTest />
          </Protected>
        } />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes