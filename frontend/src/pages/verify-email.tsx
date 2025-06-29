import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  CheckCircleIcon,
  XCircleIcon,
  EnvelopeIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { APP_CONFIG } from '@/utils/constants';
import Loading from '@/components/common/Loading';
import axios from 'axios';

type VerificationState = 'loading' | 'success' | 'error' | 'invalid' | 'expired';

export default function VerifyEmailPage() {
  const router = useRouter();
  const { token } = router.query;
  const [state, setState] = useState<VerificationState>('loading');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (token && typeof token === 'string') {
      verifyEmail(token);
    } else if (router.isReady && !token) {
      setState('invalid');
      setMessage('Token de verificación no encontrado en la URL');
    }
  }, [token, router.isReady]);

  const verifyEmail = async (verificationToken: string) => {
    try {
      setState('loading');
      
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://serviplay-production.up.railway.app'}/api/auth/verify-email`,
        { token: verificationToken }
      );

      if (response.data.success) {
        setState('success');
        setMessage(response.data.message || '¡Email verificado exitosamente!');
        
        // Redirigir al login después de 3 segundos
        setTimeout(() => {
          router.push('/auth/login?verified=true');
        }, 3000);
      } else {
        setState('error');
        setMessage(response.data.error || 'Error al verificar el email');
      }
    } catch (error: any) {
      console.error('Error verificando email:', error);
      
      if (error.response?.status === 400) {
        setState('invalid');
        setMessage(error.response.data.error || 'Token de verificación inválido o expirado');
      } else {
        setState('error');
        setMessage('Error del servidor. Por favor, inténtalo más tarde.');
      }
    }
  };

  const handleResendVerification = async () => {
    if (!email.trim()) {
      alert('Por favor, ingresa tu email para reenviar la verificación');
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://serviplay-production.up.railway.app'}/api/auth/resend-verification`,
        { email }
      );

      if (response.data.success) {
        alert('Email de verificación reenviado. Revisa tu bandeja de entrada.');
      } else {
        alert(response.data.error || 'Error al reenviar la verificación');
      }
    } catch (error: any) {
      console.error('Error reenviando verificación:', error);
      alert('Error al reenviar la verificación. Inténtalo más tarde.');
    }
  };

  const renderContent = () => {
    switch (state) {
      case 'loading':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Loading />
            <h2 className="font-display text-2xl font-bold text-neutral-900 mt-6 mb-4">
              Verificando tu email...
            </h2>
            <p className="text-neutral-600">
              Por favor espera mientras procesamos tu verificación.
            </p>
          </motion.div>
        );

      case 'success':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-12"
          >
            <div className="w-20 h-20 bg-secondary-green/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircleIcon className="w-12 h-12 text-secondary-green" />
            </div>
            
            <h2 className="font-display text-3xl font-bold text-neutral-900 mb-4">
              ¡Email Verificado!
            </h2>
            
            <p className="text-lg text-neutral-700 mb-6 max-w-md mx-auto">
              {message}
            </p>
            
            <div className="space-y-4">
              <p className="text-sm text-neutral-600">
                Tu cuenta ya está activa. Serás redirigido al login en unos segundos...
              </p>
              
              <Link
                href="/auth/login"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-primary-blue text-white rounded-lg hover:bg-primary-blue-dark transition-colors"
              >
                <span>Iniciar Sesión Ahora</span>
              </Link>
            </div>
          </motion.div>
        );

      case 'invalid':
      case 'expired':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-12"
          >
            <div className="w-20 h-20 bg-secondary-orange/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <ExclamationTriangleIcon className="w-12 h-12 text-secondary-orange" />
            </div>
            
            <h2 className="font-display text-3xl font-bold text-neutral-900 mb-4">
              {state === 'expired' ? 'Token Expirado' : 'Token Inválido'}
            </h2>
            
            <p className="text-lg text-neutral-700 mb-6 max-w-md mx-auto">
              {message}
            </p>
            
            <div className="space-y-4">
              <div className="bg-neutral-50 rounded-lg p-4 max-w-md mx-auto">
                <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                  Ingresa tu email para reenviar la verificación
                </label>
                <div className="flex space-x-2">
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                  />
                  <button
                    onClick={handleResendVerification}
                    className="px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-blue-dark transition-colors flex items-center space-x-1"
                  >
                    <ArrowPathIcon className="w-4 h-4" />
                    <span>Reenviar</span>
                  </button>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/auth/register"
                  className="px-6 py-3 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  Crear Nueva Cuenta
                </Link>
                <Link
                  href="/auth/login"
                  className="px-6 py-3 bg-primary-blue text-white rounded-lg hover:bg-primary-blue-dark transition-colors"
                >
                  Ir al Login
                </Link>
              </div>
            </div>
          </motion.div>
        );

      case 'error':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-12"
          >
            <div className="w-20 h-20 bg-secondary-red/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircleIcon className="w-12 h-12 text-secondary-red" />
            </div>
            
            <h2 className="font-display text-3xl font-bold text-neutral-900 mb-4">
              Error de Verificación
            </h2>
            
            <p className="text-lg text-neutral-700 mb-6 max-w-md mx-auto">
              {message}
            </p>
            
            <div className="space-y-4">
              <button
                onClick={() => token && verifyEmail(token as string)}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-primary-blue text-white rounded-lg hover:bg-primary-blue-dark transition-colors"
              >
                <ArrowPathIcon className="w-4 h-4" />
                <span>Intentar Nuevamente</span>
              </button>
              
              <p className="text-sm text-neutral-600">
                Si el problema persiste,{' '}
                <Link href="/contact" className="text-primary-blue hover:underline">
                  contacta nuestro soporte
                </Link>
              </p>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Head>
        <title>Verificar Email - {APP_CONFIG.NAME}</title>
        <meta name="description" content="Verifica tu dirección de email para activar tu cuenta" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-primary-blue-light via-white to-secondary-green/20">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <Link href="/" className="flex items-center space-x-2 w-fit">
              <div className="w-12 h-12 bg-gradient-to-r from-primary-blue to-secondary-green rounded-2xl shadow-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <span className="font-display text-2xl font-bold text-neutral-900">
                {APP_CONFIG.NAME}
              </span>
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-2xl mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden"
          >
            {/* Icon Header */}
            <div className="bg-gradient-to-r from-primary-blue to-secondary-green p-6 text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <EnvelopeIcon className="w-8 h-8 text-white" />
              </div>
              <h1 className="font-display text-2xl font-bold text-white">
                Verificación de Email
              </h1>
            </div>

            {/* Content */}
            <div className="p-6">
              {renderContent()}
            </div>
          </motion.div>

          {/* Help Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-8 text-center"
          >
            <h3 className="font-semibold text-neutral-900 mb-2">
              ¿Problemas con la verificación?
            </h3>
            <div className="space-y-2 text-sm text-neutral-600">
              <p>• Revisa tu carpeta de spam o correos no deseados</p>
              <p>• Asegúrate de usar el enlace más reciente</p>
              <p>• Los enlaces de verificación expiran en 24 horas</p>
            </div>
            <div className="mt-4 space-x-4">
              <Link
                href="/help"
                className="text-primary-blue hover:underline text-sm"
              >
                Centro de Ayuda
              </Link>
              <Link
                href="/contact"
                className="text-primary-blue hover:underline text-sm"
              >
                Contactar Soporte
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}