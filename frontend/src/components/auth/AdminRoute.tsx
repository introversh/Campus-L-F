import { Navigate, Outlet } from 'react-router-dom'
import { useAppSelector } from '../../store/hooks'

/**
 * BUG-04: Admin-only route guard.
 * Redirects non-admin users to /dashboard instead of letting the
 * backend silently reject every API call inside the admin UI.
 */
export default function AdminRoute() {
    const { user } = useAppSelector((s) => s.auth)
    const isAdmin = user?.role === 'ADMIN' || user?.role === 'SECURITY'
    return isAdmin ? <Outlet /> : <Navigate to="/dashboard" replace />
}
