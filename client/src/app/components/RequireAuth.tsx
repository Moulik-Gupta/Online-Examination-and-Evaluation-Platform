import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../auth';

export function RequireAuth({ role }: { role?: 'student' | 'admin' }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen bg-background" />;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  // Signed in, but the wrong role: send them to their own dashboard.
  if (role && user.role !== role) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/student'} replace />;
  }
  return <Outlet />;
}