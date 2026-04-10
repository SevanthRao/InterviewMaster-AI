import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router";
import Spinner from "../../shared/Spinner";

const Protected = ({children}) => {
    const { loading, user } = useAuth()

    if (loading) {
        return (
            <main className='min-h-screen flex flex-col items-center justify-center bg-linear-to-br from-[#0f0f0f] via-[#1a1a1a] to-[#000000]'>
                <div className="animate-fade-in-up flex flex-col items-center gap-4">
                    <Spinner size="xl" className="text-purple-400" />
                    <p className="text-gray-400 text-sm tracking-wide animate-pulse">
                        Authenticating...
                    </p>
                </div>
            </main>
        )
    }

    if (!user) {
        return <Navigate to="/login" replace />
    }

    return children
}

export default Protected
