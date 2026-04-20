import { AuthProvider } from "./contexts/auth.context"
import { ToastProvider } from "./contexts/toast.context"
import ToastContainer from "./components/Toast"
import AppRoutes from "./app.routes"

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppRoutes />
        <ToastContainer />
      </AuthProvider>
    </ToastProvider>
  )
}

export default App