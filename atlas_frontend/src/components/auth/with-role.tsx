'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getUserRole, isAuthenticated } from '@/lib/auth';

interface WithRoleProps {
  children: React.ReactNode;
  roles: string | string[];
  redirectTo?: string;
}

// Higher-order component for role-based access control
export default function WithRole({ children, roles, redirectTo = '/login' }: WithRoleProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      router.push(redirectTo);
      return;
    }

    // Convert roles to array if string
    const roleArray = Array.isArray(roles) ? roles : [roles];
    const userRole = getUserRole();

    // Check if user has required role
    if (userRole && roleArray.includes(userRole)) {
      setAuthorized(true);
    } else {
      router.push('/unauthorized');
    }

    setLoading(false);
  }, [roles, redirectTo, router]);

  // Show nothing while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show children only if authorized
  return authorized ? <>{children}</> : null;
}

// HOC function creator
export function withRole(Component: React.ComponentType<any>, roles: string | string[], redirectTo = '/login') {
  return function ProtectedRoute(props: any) {
    return (
      <WithRole roles={roles} redirectTo={redirectTo}>
        <Component {...props} />
      </WithRole>
    );
  };
}
