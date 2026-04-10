import { createBrowserRouter } from 'react-router'
import Login  from "./features/auth/Pages/Login"
import Register from "./features/auth/Pages/Register"
import Protected from './features/auth/components/Protected'
import Home from "./features/interview/pages/Home"
import Dashboard from './features/interview/pages/Dashboard'
import Interview from './features/interview/pages/Interview'
import AptitudeTest from './features/interview/pages/AptitudeTest'
import TechnicalTest from './features/interview/pages/TechnicalTest'

export const router = createBrowserRouter([
    {
        path: "/login",
        element: <Login />    
    },
    {
        path: "/register",
        element: <Register />
    },
    {
        path: "/",
        element: <Protected>
            <Home />
        </Protected>
    },
    {
        path: "/dashboard/:sessionId",
        element: <Protected>
            <Dashboard />
        </Protected>
    },
    {
        path: "/session/:sessionId/interview",
        element: <Protected>
            <Interview />
        </Protected>
    },
    {
        path: "/session/:sessionId/aptitude",
        element: <Protected>
            <AptitudeTest />
        </Protected>
    },
    {
        path: "/session/:sessionId/technical",
        element: <Protected>
            <TechnicalTest />
        </Protected>
    }
])