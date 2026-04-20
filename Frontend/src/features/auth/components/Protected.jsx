import { useAuth } from "../../../hooks/useAuth"
import { Navigate } from "react-router"
import PageLoader from "../../../components/PageLoader"

const Protected = ({children}) => {
    const { loading, user } = useAuth()

    if (loading) {
        return <PageLoader message="Authenticating..." />
    }

    if (!user) {
        return <Navigate to="/login" replace />
    }

    return children
}

export default Protected
