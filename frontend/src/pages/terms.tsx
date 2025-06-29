import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { APP_CONFIG } from '@/utils/constants';

export default function Terms() {
  return (
    <>
      <Head>
        <title>Términos y Condiciones - {APP_CONFIG.NAME}</title>
        <meta name="description" content="Términos y condiciones de uso de Serviplay" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-primary-blue-light via-white to-secondary-green/20">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-12 h-12 bg-gradient-to-r from-primary-blue to-secondary-green rounded-2xl shadow-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">S</span>
                </div>
                <span className="font-display text-2xl font-bold text-neutral-900">
                  {APP_CONFIG.NAME}
                </span>
              </Link>
              
              <Link
                href="/"
                className="px-4 py-2 text-neutral-600 hover:text-primary-blue transition-colors"
              >
                Volver al inicio
              </Link>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h1 className="font-display text-3xl font-bold text-neutral-900 mb-2">
                Términos y Condiciones
              </h1>
              <p className="text-neutral-600 mb-8">
                Última actualización: Diciembre 2024
              </p>

              <div className="prose prose-lg max-w-none">
                <h2 className="font-display text-2xl font-bold text-neutral-900 mt-8 mb-4">
                  1. Aceptación de los Términos
                </h2>
                <p className="text-neutral-700 mb-6">
                  Al acceder y utilizar Serviplay, usted acepta estar sujeto a estos Términos y Condiciones 
                  de Uso. Si no está de acuerdo con alguna parte de estos términos, no debe utilizar nuestros servicios.
                </p>

                <h2 className="font-display text-2xl font-bold text-neutral-900 mt-8 mb-4">
                  2. Descripción del Servicio
                </h2>
                <p className="text-neutral-700 mb-6">
                  Serviplay es una plataforma digital que conecta prestadores de servicios ("Ases") con 
                  usuarios que buscan dichos servicios ("Exploradores"). Actuamos como intermediario 
                  facilitando el contacto entre ambas partes.
                </p>

                <h2 className="font-display text-2xl font-bold text-neutral-900 mt-8 mb-4">
                  3. Registro de Usuario
                </h2>
                <div className="text-neutral-700 mb-6">
                  <p className="mb-4">Para utilizar nuestros servicios, debe:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Ser mayor de 18 años o tener autorización parental</li>
                    <li>Proporcionar información precisa y actualizada</li>
                    <li>Mantener la confidencialidad de su cuenta</li>
                    <li>Notificar inmediatamente cualquier uso no autorizado</li>
                  </ul>
                </div>

                <h2 className="font-display text-2xl font-bold text-neutral-900 mt-8 mb-4">
                  4. Responsabilidades de los Usuarios
                </h2>
                
                <h3 className="font-semibold text-xl text-neutral-900 mt-6 mb-3">
                  4.1 Responsabilidades de los Ases
                </h3>
                <div className="text-neutral-700 mb-6">
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Proporcionar servicios de calidad según lo ofrecido</li>
                    <li>Mantener las credenciales y licencias necesarias</li>
                    <li>Cumplir con las normativas locales aplicables</li>
                    <li>Tratar a los Exploradores con respeto y profesionalismo</li>
                  </ul>
                </div>

                <h3 className="font-semibold text-xl text-neutral-900 mt-6 mb-3">
                  4.2 Responsabilidades de los Exploradores
                </h3>
                <div className="text-neutral-700 mb-6">
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Proporcionar información precisa sobre los servicios requeridos</li>
                    <li>Pagar los servicios según lo acordado</li>
                    <li>Tratar a los Ases con respeto</li>
                    <li>Proporcionar feedback honesto y constructivo</li>
                  </ul>
                </div>

                <h2 className="font-display text-2xl font-bold text-neutral-900 mt-8 mb-4">
                  5. Limitación de Responsabilidad
                </h2>
                <p className="text-neutral-700 mb-6">
                  Serviplay actúa únicamente como plataforma de conexión. No somos responsables por:
                </p>
                <div className="text-neutral-700 mb-6">
                  <ul className="list-disc pl-6 space-y-2">
                    <li>La calidad de los servicios prestados</li>
                    <li>Disputas entre Ases y Exploradores</li>
                    <li>Daños o pérdidas resultantes del uso de los servicios</li>
                    <li>Incumplimientos contractuales entre usuarios</li>
                  </ul>
                </div>

                <h2 className="font-display text-2xl font-bold text-neutral-900 mt-8 mb-4">
                  6. Política de Privacidad
                </h2>
                <p className="text-neutral-700 mb-6">
                  Su privacidad es importante para nosotros. Consulte nuestra{' '}
                  <Link href="/privacy" className="text-primary-blue hover:underline">
                    Política de Privacidad
                  </Link>{' '}
                  para entender cómo recopilamos, utilizamos y protegemos su información personal.
                </p>

                <h2 className="font-display text-2xl font-bold text-neutral-900 mt-8 mb-4">
                  7. Modificaciones
                </h2>
                <p className="text-neutral-700 mb-6">
                  Nos reservamos el derecho de modificar estos términos en cualquier momento. 
                  Los cambios entrarán en vigor inmediatamente después de su publicación en la plataforma.
                </p>

                <h2 className="font-display text-2xl font-bold text-neutral-900 mt-8 mb-4">
                  8. Ley Aplicable
                </h2>
                <p className="text-neutral-700 mb-6">
                  Estos términos se rigen por las leyes de la República Argentina. 
                  Cualquier disputa será resuelta en los tribunales competentes de la Ciudad Autónoma de Buenos Aires.
                </p>

                <h2 className="font-display text-2xl font-bold text-neutral-900 mt-8 mb-4">
                  9. Contacto
                </h2>
                <p className="text-neutral-700 mb-6">
                  Si tiene preguntas sobre estos términos, puede contactarnos en:{' '}
                  <a href={`mailto:${APP_CONFIG.SUPPORT_EMAIL}`} className="text-primary-blue hover:underline">
                    {APP_CONFIG.SUPPORT_EMAIL}
                  </a>
                </p>

                <div className="bg-neutral-50 rounded-lg p-6 mt-8">
                  <p className="text-sm text-neutral-600">
                    <strong>Fecha de última actualización:</strong> 22 de diciembre de 2024<br />
                    <strong>Versión:</strong> 1.0
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Footer */}
        <footer className="bg-neutral-900 text-white px-4 py-8 mt-16">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-neutral-500 text-sm">
              © 2024 {APP_CONFIG.NAME} - Marcelo Mata. Todos los derechos reservados.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}