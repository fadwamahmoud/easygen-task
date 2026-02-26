import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { getToken } from '../auth/token';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const token = getToken();
  if (!token) return <Navigate to="/signin" replace />;
  // later will add /auth/me verification
  return <>{children}</>;
}