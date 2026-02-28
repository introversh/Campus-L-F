import { Navigate, Outlet } from 'react-router-dom'
import { useAppSelector } from '../../store/hooks'

export default function ProtectedRoute() {
    const { accessToken, user, loading } = useAppSelector((s) => s.auth)

    if (!accessToken) return <Navigate to="/login" replace />

    // fetchMe still in-flight — render nothing until user is populated
    if (!user && loading) {
        return (
            <div style={{
                minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: '#0B0B0F',
            }}>
                <div style={{
                    width: '40px', height: '40px', borderRadius: '50%',
                    border: '3px solid #1C1C1C', borderTopColor: '#3A6FF7',
                    animation: 'spin 0.8s linear infinite',
                }} />
            </div>
        )
    }

    return <Outlet />
}
