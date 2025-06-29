import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Loading from '@/components/common/Loading';
import { UserProfile } from '@/types';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  allowedRoles?: ('as' | 'explorador' | 'ambos')[];
  redirectTo?: string;
}

export default function AuthGuard({
  children,
  requireAuth = true,
  allowedRoles,
  redirectTo = '/login'
}: AuthGuardProps) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, [router.pathname]);

  const checkAuth = async () => {
    try {
      // TODO: Reemplazar con lógica real de autenticación
      // const token = localStorage.getItem('auth_token');
      // if (!token) {
      //   if (requireAuth) {
      //     router.push(redirectTo);
      //     return;
      //   }
      //   setLoading(false);
      //   return;
      // }

      // const response = await api.get('/auth/me');
      // const userData = response.data;

      // Mock user data por ahora
      const mockUser: UserProfile = {
        id: '1',
        email: 'usuario@ejemplo.com',
        tipo_usuario: 'as',
        nombre: 'Juan',
        apellido: 'Pérez',
        telefono: '+54 11 1234-5678',
        suscripcion_activa: true,
        identidad_verificada: true
      };

      setUser(mockUser);

      // Verificar roles si están especificados
      if (allowedRoles && !allowedRoles.includes(mockUser.tipo_usuario)) {
        router.push('/unauthorized');
        return;
      }

    } catch (error) {
      console.error('Auth check failed:', error);
      if (requireAuth) {
        router.push(redirectTo);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <Loading />
      </div>
    );
  }

  if (requireAuth && !user) {
    return null; // Redirecting...
  }

  return <>{children}</>;
}