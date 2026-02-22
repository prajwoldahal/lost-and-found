import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RequireAuth({ children }) {
    const { currentUser, userData, loading } = useAuth();
    const location = useLocation();

    // Show nothing while checking auth state
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!currentUser) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (userData?.status === 'suspended') {
        return <Navigate to="/suspended" replace />;
    }

    if (!currentUser.emailVerified && userData?.role !== 'admin') {
        return <Navigate to="/verify-email" replace />;
    }

    return children;
}
