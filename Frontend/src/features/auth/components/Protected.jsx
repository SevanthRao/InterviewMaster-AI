import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router";

const Protected = ({children}) => {
    const { loading, user } = useAuth()

    if (loading) {
        return (<main className='min-h-screen flex items-center justify-center bg-linear-to-br from-[#0f0f0f] via-[#1a1a1a] to-[#000000]'>
            <h1 className='text-4xl font-semibold text-white text-bold'>Loading.........</h1>
        </main>
        )
    }

    if (!user) {
        return <Navigate to="/login" />
    }

    return children
}

export default Protected