import { RouterProvider } from 'react-router'
import { router } from "./app.routes.jsx"
import { AuthProvider } from './features/auth/auth.context.jsx'
import { ToastProvider } from './features/shared/toast.context.jsx'
import ToastContainer from './features/shared/Toast.jsx'

const App = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <RouterProvider router={router} />
        <ToastContainer />
      </AuthProvider>
    </ToastProvider>
  )
}

export default App