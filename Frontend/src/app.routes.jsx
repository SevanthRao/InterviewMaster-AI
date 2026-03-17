import { createBrowserRouter } from 'react-router'
import Login  from "./features/auth/Pages/Login"
import Register from "./features/auth/Pages/Register"

export const router = createBrowserRouter([
    {
        path: "/login",
        element: <Login />    
    },
    {
        path: "/register",
        element: <Register />
    }
])