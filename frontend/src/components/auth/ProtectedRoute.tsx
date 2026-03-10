import React from 'react'
import { Navigate, Outlet } from 'react-router-dom';
import AppLayout from '../layout/AppLayout';

const ProtectedRoute = () => {
    const isAuthenticated = true; // Replace with actual authentication logic
const isLoading = false; 
if(isLoading) {
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