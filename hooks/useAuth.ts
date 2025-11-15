import { useContext } from 'react';
import type { AuthContextType } from '@/types/auth';
import AuthContext from '@/contexts/AuthContext';

export default function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}