import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { APP_CONFIG } from '@/utils/constants';

export default function Privacy() {
  return (
    <>
      <Head>
        <title>Política de Privacidad - {APP_CONFIG.NAME}</title>
        <meta name="description" content="Política de privacidad de Serviplay" />
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
                Política de Privacidad
              </h1>
              <p className="text-neutral-600 mb-8">
                Última actualización: Diciembre 2024
              </p>

              <div className="prose prose-lg max-w-none">
                <h2 className="font-display text-2xl font-bold text-neutral-900 mt-8 mb-4">
                  1. Introducción
                </h2>
                <p className="text-neutral-700 mb-6">
                  En Serviplay, respetamos su privacidad y nos comprometemos a proteger sus datos personales. 
                  Esta Política de Privacidad explica cómo recopilamos, utilizamos, almacenamos y protegemos 
                  su información cuando utiliza nuestra plataforma.
                </p>

                <h2 className="font-display text-2xl font-bold text-neutral-900 mt-8 mb-4">
                  2. Información que Recopilamos
                </h2>
                
                <h3 className="font-semibold text-xl text-neutral-900 mt-6 mb-3">
                  2.1 Información Personal
                </h3>
                <div className="text-neutral-700 mb-6">
                  <p className="mb-4">Recopilamos información que usted nos proporciona directamente:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Datos de registro:</strong> nombre, apellido, email, teléfono</li>
                    <li><strong>Información de perfil:</strong> foto, descripción, ubicación, habilidades</li>
                    <li><strong>Información de servicios:</strong> descripciones, precios, disponibilidad</li>
                    <li><strong>Comunicaciones:</strong> mensajes, reseñas, comentarios</li>
                  </ul>
                </div>

                <h3 className="font-semibold text-xl text-neutral-900 mt-6 mb-3">
                  2.2 Información Automática
                </h3>
                <div className="text-neutral-700 mb-6">
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Datos de uso:</strong> páginas visitadas, tiempo de navegación, clicks</li>
                    <li><strong>Información del dispositivo:</strong> tipo de dispositivo, navegador, sistema operativo</li>
                    <li><strong>Datos de ubicación:</strong> dirección IP, ubicación aproximada (con su consentimiento)</li>
                    <li><strong>Cookies:</strong> para mejorar su experiencia de usuario</li>
                  </ul>
                </div>

                <h2 className="font-display text-2xl font-bold text-neutral-900 mt-8 mb-4">
                  3. Cómo Utilizamos su Información
                </h2>
                <div className="text-neutral-700 mb-6">
                  <p className="mb-4">Utilizamos su información para:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Facilitar la conexión entre Ases y Exploradores</li>
                    <li>Procesar registros y verificar identidades</li>
                    <li>Personalizar su experiencia en la plataforma</li>
                    <li>Enviar notificaciones relevantes sobre servicios</li>
                    <li>Mejorar nuestros servicios y funcionalidades</li>
                    <li>Prevenir fraudes y garantizar la seguridad</li>
                    <li>Cumplir con obligaciones legales</li>
                  </ul>
                </div>

                <h2 className="font-display text-2xl font-bold text-neutral-900 mt-8 mb-4">
                  4. Compartir Información
                </h2>
                <div className="text-neutral-700 mb-6">
                  <p className="mb-4">Solo compartimos su información en las siguientes circunstancias:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Con otros usuarios:</strong> información de perfil visible para facilitar conexiones</li>
                    <li><strong>Proveedores de servicios:</strong> empresas que nos ayudan a operar la plataforma</li>
                    <li><strong>Requerimientos legales:</strong> cuando la ley lo requiera</li>
                    <li><strong>Protección de derechos:</strong> para proteger nuestros derechos o los de otros usuarios</li>
                  </ul>
                </div>

                <h2 className="font-display text-2xl font-bold text-neutral-900 mt-8 mb-4">
                  5. Seguridad de los Datos
                </h2>
                <p className="text-neutral-700 mb-6">
                  Implementamos medidas de seguridad técnicas, administrativas y físicas para proteger 
                  su información personal contra acceso no autorizado, alteración, divulgación o destrucción. 
                  Esto incluye encriptación de datos, acceso restringido y monitoreo regular de nuestros sistemas.
                </p>

                <h2 className="font-display text-2xl font-bold text-neutral-900 mt-8 mb-4">
                  6. Retención de Datos
                </h2>
                <p className="text-neutral-700 mb-6">
                  Conservamos su información personal solo durante el tiempo necesario para cumplir con 
                  los propósitos descritos en esta política, salvo que la ley requiera o permita un 
                  período de retención más largo.
                </p>

                <h2 className="font-display text-2xl font-bold text-neutral-900 mt-8 mb-4">
                  7. Sus Derechos
                </h2>
                <div className="text-neutral-700 mb-6">
                  <p className="mb-4">Usted tiene derecho a:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Acceso:</strong> solicitar información sobre los datos que tenemos</li>
                    <li><strong>Rectificación:</strong> corregir datos inexactos o incompletos</li>
                    <li><strong>Eliminación:</strong> solicitar la eliminación de sus datos</li>
                    <li><strong>Portabilidad:</strong> obtener una copia de sus datos</li>
                    <li><strong>Oposición:</strong> oponerse al procesamiento de sus datos</li>
                    <li><strong>Limitación:</strong> restringir cómo procesamos sus datos</li>
                  </ul>
                </div>

                <h2 className="font-display text-2xl font-bold text-neutral-900 mt-8 mb-4">
                  8. Cookies y Tecnologías Similares
                </h2>
                <p className="text-neutral-700 mb-6">
                  Utilizamos cookies y tecnologías similares para mejorar su experiencia, personalizar 
                  contenido, analizar el tráfico y recordar sus preferencias. Puede gestionar sus 
                  preferencias de cookies a través de la configuración de su navegador.
                </p>

                <h2 className="font-display text-2xl font-bold text-neutral-900 mt-8 mb-4">
                  9. Transferencias Internacionales
                </h2>
                <p className="text-neutral-700 mb-6">
                  Sus datos pueden ser transferidos y procesados en países fuera de su país de residencia. 
                  Cuando esto ocurra, implementamos salvaguardas adecuadas para proteger su información 
                  de acuerdo con esta política de privacidad.
                </p>

                <h2 className="font-display text-2xl font-bold text-neutral-900 mt-8 mb-4">
                  10. Menores de Edad
                </h2>
                <p className="text-neutral-700 mb-6">
                  Nuestros servicios están dirigidos a personas mayores de 18 años. No recopilamos 
                  intencionalmente información personal de menores de edad sin el consentimiento parental.
                </p>

                <h2 className="font-display text-2xl font-bold text-neutral-900 mt-8 mb-4">
                  11. Cambios en esta Política
                </h2>
                <p className="text-neutral-700 mb-6">
                  Podemos actualizar esta Política de Privacidad ocasionalmente. Le notificaremos sobre 
                  cambios significativos publicando la nueva política en nuestra plataforma y actualizando 
                  la fecha de "última actualización".
                </p>

                <h2 className="font-display text-2xl font-bold text-neutral-900 mt-8 mb-4">
                  12. Contacto
                </h2>
                <p className="text-neutral-700 mb-6">
                  Si tiene preguntas sobre esta Política de Privacidad o desea ejercer sus derechos, 
                  puede contactarnos en:{' '}
                  <a href={`mailto:${APP_CONFIG.SUPPORT_EMAIL}`} className="text-primary-blue hover:underline">
                    {APP_CONFIG.SUPPORT_EMAIL}
                  </a>
                </p>

                <div className="bg-neutral-50 rounded-lg p-6 mt-8">
                  <p className="text-sm text-neutral-600">
                    <strong>Fecha de última actualización:</strong> 22 de diciembre de 2024<br />
                    <strong>Versión:</strong> 1.0<br />
                    <strong>Responsable del tratamiento:</strong> Serviplay - Marcelo Mata
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