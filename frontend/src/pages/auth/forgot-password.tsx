import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ArrowLeftIcon,
  EnvelopeIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { APP_CONFIG } from '@/utils/constants';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('Ingresa tu email');
      return;
    }

    if (!email.includes('@')) {
      toast.error('Ingresa un email válido');
      return;
    }

    setLoading(true);

    try {
      // TODO: Implementar lógica de recuperación con backend
      await new Promise(resolve => setTimeout(resolve, 2000));
      setEmailSent(true);
      toast.success('Email de recuperación enviado');
    } catch (error) {
      toast.error('Error al enviar el email');
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Email reenviado correctamente');
    } catch (error) {
      toast.error('Error al reenviar el email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Recuperar Contraseña - {APP_CONFIG.NAME}</title>
        <meta name="description" content="Recupera tu contraseña de Serviplay" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-primary-blue-light via-white to-secondary-green/20 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-md w-full"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center space-x-2 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-primary-blue to-secondary-green rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <span className="font-display text-2xl font-bold text-neutral-900">
                {APP_CONFIG.NAME}
              </span>
            </Link>
          </div>

          {!emailSent ? (
            /* Formulario de recuperación */
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-primary-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <EnvelopeIcon className="w-8 h-8 text-primary-blue" />
                </div>
                <h1 className="font-display text-2xl font-bold text-neutral-900 mb-2">
                  ¿Olvidaste tu contraseña?
                </h1>
                <p className="text-neutral-600">
                  No te preocupes, te enviaremos instrucciones para recuperarla
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                    Email de tu cuenta
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all"
                    placeholder="tu@email.com"
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary-blue text-white py-3 rounded-lg font-semibold hover:bg-primary-blue-dark transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {loading && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                  <span>{loading ? 'Enviando...' : 'Enviar instrucciones'}</span>
                </motion.button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center space-x-2 text-primary-blue hover:text-primary-blue-dark transition-colors"
                >
                  <ArrowLeftIcon className="w-4 h-4" />
                  <span>Volver al login</span>
                </Link>
              </div>
            </div>
          ) : (
            /* Confirmación de envío */
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircleIcon className="w-8 h-8 text-green-600" />
                </div>
                
                <h1 className="font-display text-2xl font-bold text-neutral-900 mb-2">
                  ¡Email enviado! 📧
                </h1>
                
                <p className="text-neutral-600 mb-6">
                  Hemos enviado las instrucciones para recuperar tu contraseña a:
                </p>
                
                <div className="bg-neutral-50 rounded-lg p-4 mb-6">
                  <p className="font-semibold text-neutral-900">{email}</p>
                </div>

                <div className="space-y-4 text-sm text-neutral-600">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">💡 Qué hacer ahora:</h3>
                    <ol className="list-decimal list-inside space-y-1 text-blue-800">
                      <li>Revisa tu bandeja de entrada</li>
                      <li>Busca el email de {APP_CONFIG.NAME}</li>
                      <li>Haz clic en el enlace de recuperación</li>
                      <li>Crea una nueva contraseña segura</li>
                    </ol>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-yellow-800">
                      <strong>📁 No encuentras el email?</strong><br />
                      Revisa tu carpeta de spam o correo no deseado
                    </p>
                  </div>
                </div>

                <div className="flex flex-col space-y-3 mt-6">
                  <button
                    onClick={handleResendEmail}
                    disabled={loading}
                    className="w-full bg-neutral-100 text-neutral-700 py-3 rounded-lg font-medium hover:bg-neutral-200 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Reenviando...' : 'Reenviar email'}
                  </button>
                  
                  <Link
                    href="/auth/login"
                    className="w-full bg-primary-blue text-white py-3 rounded-lg font-semibold hover:bg-primary-blue-dark transition-colors text-center"
                  >
                    Volver al login
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Footer info */}
          <div className="text-center mt-8">
            <p className="text-sm text-neutral-500">
              ¿Necesitas ayuda? Contacta a{' '}
              <Link href="/contact" className="text-primary-blue hover:underline">
                soporte técnico
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </>
  );
}