import { Navigate, Outlet } from 'react-router-dom';
import AppLayout from '../layout/AppLayout';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className='flex items-center justify-center'>
        <div>Loading...</div>
      </div>
    )
  }

  return (isAuthenticated ?
    <AppLayout>
      <Outlet />
    </AppLayout>
    : <Navigate to="/login" />
  )
}

export default ProtectedRoute