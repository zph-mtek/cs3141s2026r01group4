//this comp check if user is admin
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const AdminRoute = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded = jwtDecode(token);
    const user = decoded.data;

    if (user && user.role === 'admin') {
      return <Outlet />;
    } else {
      return <Navigate to="/" replace />;
    }
  } catch (error) {
    localStorage.removeItem('token');
    return <Navigate to="/login" replace />;
  }
};

export default AdminRoute;