import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  UserIcon, 
  CogIcon, 
  BellIcon,
  EyeIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  QuestionMarkCircleIcon,
  ArrowRightOnRectangleIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { APP_CONFIG } from '@/utils/constants';
import toast from 'react-hot-toast';

// Mock user settings
const mockSettings = {
  notificaciones: {
    nuevos_mensajes: true,
    nuevas_solicitudes: true,
    recordatorios: false,
    marketing: false
  },
  privacidad: {
    perfil_publico: true,
    mostrar_telefono: true,
    mostrar_email: false,
    indexar_busqueda: true
  },
  cuenta: {
    verificacion_dos_pasos: false,
    sesiones_activas: 3
  }
};

export default function Settings() {
  const router = useRouter();
  const [settings, setSettings] = useState(mockSettings);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('cuenta');

  const tabs = [
    { id: 'cuenta', label: 'Cuenta', icon: UserIcon },
    { id: 'notificaciones', label: 'Notificaciones', icon: BellIcon },
    { id: 'privacidad', label: 'Privacidad', icon: EyeIcon },
    { id: 'seguridad', label: 'Seguridad', icon: ShieldCheckIcon },
    { id: 'suscripcion', label: 'Suscripción', icon: CreditCardIcon },
    { id: 'ayuda', label: 'Ayuda', icon: QuestionMarkCircleIcon }
  ];

  const handleToggleSetting = (section: string, key: string) => {
    setSettings(prev => {
      const currentSection = (prev as any)[section];
      return {
        ...prev,
        [section]: {
          ...currentSection,
          [key]: !currentSection[key]
        }
      };
    });
    toast.success('Configuración actualizada');
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // TODO: Guardar configuración en backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Configuración guardada correctamente');
    } catch (error) {
      toast.error('Error al guardar la configuración');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    // TODO: Implementar logout
    toast.success('Sesión cerrada correctamente');
    router.push('/');
  };

  const handleDeleteAccount = () => {
    const confirmed = window.confirm(
      '¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.'
    );
    if (confirmed) {
      // TODO: Implementar eliminación de cuenta
      toast.success('Cuenta eliminada correctamente');
      router.push('/');
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'cuenta':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Información Personal</h3>
              <div className="space-y-4">
                <Link
                  href="/profile"
                  className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg hover:border-primary-blue transition-colors group"
                >
                  <div>
                    <h4 className="font-medium text-neutral-900">Editar Perfil</h4>
                    <p className="text-sm text-neutral-600">Actualiza tu información personal y foto</p>
                  </div>
                  <div className="text-neutral-400 group-hover:text-primary-blue transition-colors">→</div>
                </Link>
                
                <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-neutral-900">Cambiar Contraseña</h4>
                    <p className="text-sm text-neutral-600">Actualiza tu contraseña de acceso</p>
                  </div>
                  <button className="px-4 py-2 text-primary-blue hover:bg-primary-blue/5 rounded-lg transition-colors">
                    Cambiar
                  </button>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Sesiones Activas</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-neutral-900">Sesión Actual</h4>
                    <p className="text-sm text-neutral-600">Chrome en Windows • IP: 192.168.1.1</p>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Activa</span>
                </div>
                
                <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-neutral-900">Móvil</h4>
                    <p className="text-sm text-neutral-600">Chrome Mobile • Última actividad: hace 2 horas</p>
                  </div>
                  <button className="text-red-600 hover:bg-red-50 px-3 py-1 rounded transition-colors">
                    Cerrar
                  </button>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-red-600 mb-4">Zona Peligrosa</h3>
              <div className="space-y-4">
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-3 w-full p-4 border border-neutral-200 rounded-lg hover:border-primary-blue hover:bg-blue-50 transition-colors text-left"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5 text-primary-blue" />
                  <div>
                    <h4 className="font-medium text-neutral-900">Cerrar Sesión</h4>
                    <p className="text-sm text-neutral-600">Cerrar sesión en este dispositivo</p>
                  </div>
                </button>
                
                <button
                  onClick={handleDeleteAccount}
                  className="flex items-center space-x-3 w-full p-4 border border-red-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-colors text-left"
                >
                  <TrashIcon className="w-5 h-5 text-red-600" />
                  <div>
                    <h4 className="font-medium text-red-900">Eliminar Cuenta</h4>
                    <p className="text-sm text-red-600">Eliminar permanentemente tu cuenta y todos los datos</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        );

      case 'notificaciones':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Notificaciones Push</h3>
              <div className="space-y-4">
                {Object.entries(settings.notificaciones).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                    <div>
                      <h4 className="font-medium text-neutral-900 capitalize">
                        {key.replace('_', ' ')}
                      </h4>
                      <p className="text-sm text-neutral-600">
                        {key === 'nuevos_mensajes' && 'Recibir notificaciones de nuevos mensajes'}
                        {key === 'nuevas_solicitudes' && 'Notificaciones de nuevas solicitudes de servicio'}
                        {key === 'recordatorios' && 'Recordatorios de citas y trabajos pendientes'}
                        {key === 'marketing' && 'Ofertas especiales y novedades de la plataforma'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleToggleSetting('notificaciones', key)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        value ? 'bg-primary-blue' : 'bg-neutral-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          value ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'privacidad':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Visibilidad del Perfil</h3>
              <div className="space-y-4">
                {Object.entries(settings.privacidad).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                    <div>
                      <h4 className="font-medium text-neutral-900 capitalize">
                        {key.replace('_', ' ')}
                      </h4>
                      <p className="text-sm text-neutral-600">
                        {key === 'perfil_publico' && 'Tu perfil será visible para otros usuarios'}
                        {key === 'mostrar_telefono' && 'Mostrar tu número de teléfono en el perfil'}
                        {key === 'mostrar_email' && 'Mostrar tu email en el perfil público'}
                        {key === 'indexar_busqueda' && 'Permitir que tu perfil aparezca en búsquedas'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleToggleSetting('privacidad', key)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        value ? 'bg-primary-blue' : 'bg-neutral-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          value ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'seguridad':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Autenticación</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-neutral-900">Verificación en Dos Pasos</h4>
                    <p className="text-sm text-neutral-600">Agrega una capa extra de seguridad a tu cuenta</p>
                  </div>
                  <button
                    onClick={() => handleToggleSetting('cuenta', 'verificacion_dos_pasos')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.cuenta.verificacion_dos_pasos ? 'bg-primary-blue' : 'bg-neutral-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.cuenta.verificacion_dos_pasos ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Historial de Seguridad</h3>
              <div className="space-y-3">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-2 text-green-800">
                    <ShieldCheckIcon className="w-5 h-5" />
                    <span className="font-medium">Cuenta Segura</span>
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    No se detectaron actividades sospechosas recientes
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'suscripcion':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Plan Actual</h3>
              <div className="p-6 border border-neutral-200 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xl font-bold text-neutral-900">Plan Básico</h4>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">$2900/mes</span>
                </div>
                <p className="text-neutral-600 mb-4">
                  Suscripción requerida para publicar servicios en la plataforma
                </p>
                <ul className="space-y-2 text-sm text-neutral-600 mb-6">
                  <li>• Hasta 5 servicios publicados</li>
                  <li>• Sin comisiones por transacciones</li>
                  <li>• Soporte por email</li>
                  <li>• Perfil verificado</li>
                </ul>
                <button className="w-full px-6 py-3 bg-secondary-green text-white rounded-lg hover:bg-green-600 transition-colors">
                  Upgrade a Profesional
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Historial de Pagos</h3>
              <div className="text-center py-8">
                <div className="w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <span className="text-3xl">💳</span>
                </div>
                <p className="text-neutral-600">Plan Básico - $2900/mes</p>
                <p className="text-sm text-neutral-500">Próximo pago: 22 Enero 2025</p>
              </div>
            </div>
          </div>
        );

      case 'ayuda':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Centro de Ayuda</h3>
              <div className="space-y-4">
                <Link
                  href="/help/faq"
                  className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg hover:border-primary-blue transition-colors group"
                >
                  <div>
                    <h4 className="font-medium text-neutral-900">Preguntas Frecuentes</h4>
                    <p className="text-sm text-neutral-600">Encuentra respuestas a las dudas más comunes</p>
                  </div>
                  <div className="text-neutral-400 group-hover:text-primary-blue transition-colors">→</div>
                </Link>

                <Link
                  href="/help/contact"
                  className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg hover:border-primary-blue transition-colors group"
                >
                  <div>
                    <h4 className="font-medium text-neutral-900">Contactar Soporte</h4>
                    <p className="text-sm text-neutral-600">Envía un mensaje a nuestro equipo de soporte</p>
                  </div>
                  <div className="text-neutral-400 group-hover:text-primary-blue transition-colors">→</div>
                </Link>

                <Link
                  href="/terms"
                  className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg hover:border-primary-blue transition-colors group"
                >
                  <div>
                    <h4 className="font-medium text-neutral-900">Términos y Condiciones</h4>
                    <p className="text-sm text-neutral-600">Lee nuestros términos de uso</p>
                  </div>
                  <div className="text-neutral-400 group-hover:text-primary-blue transition-colors">→</div>
                </Link>

                <Link
                  href="/privacy"
                  className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg hover:border-primary-blue transition-colors group"
                >
                  <div>
                    <h4 className="font-medium text-neutral-900">Política de Privacidad</h4>
                    <p className="text-sm text-neutral-600">Conoce cómo protegemos tu información</p>
                  </div>
                  <div className="text-neutral-400 group-hover:text-primary-blue transition-colors">→</div>
                </Link>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Información de la App</h3>
              <div className="p-4 bg-neutral-50 rounded-lg">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Versión:</span>
                    <span className="font-medium">{APP_CONFIG.VERSION}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Última actualización:</span>
                    <span className="font-medium">22 Dic 2024</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Head>
        <title>Configuración - {APP_CONFIG.NAME}</title>
        <meta name="description" content="Configura tu cuenta y preferencias en Serviplay" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-primary-blue-light via-white to-secondary-green/20">
        {/* Navigation */}
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-r from-primary-blue to-secondary-green rounded-2xl shadow-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">S</span>
                </div>
                <span className="font-display text-xl font-bold text-neutral-900">
                  {APP_CONFIG.NAME}
                </span>
              </Link>
              
              <div className="flex items-center space-x-4">
                <Link
                  href="/dashboard"
                  className="px-3 py-2 text-neutral-600 hover:text-primary-blue transition-colors"
                >
                  Dashboard
                </Link>
                
                <Link
                  href="/profile"
                  className="p-2 text-neutral-600 hover:text-primary-blue transition-colors"
                >
                  <UserIcon className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-6xl mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-display text-3xl font-bold text-neutral-900 mb-8">
              Configuración
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <nav className="space-y-2">
                    {tabs.map((tab) => {
                      const IconComponent = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                            activeTab === tab.id
                              ? 'bg-primary-blue text-white'
                              : 'text-neutral-600 hover:bg-neutral-50 hover:text-primary-blue'
                          }`}
                        >
                          <IconComponent className="w-5 h-5" />
                          <span className="font-medium">{tab.label}</span>
                        </button>
                      );
                    })}
                  </nav>
                </div>
              </div>

              {/* Content */}
              <div className="lg:col-span-3">
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  {renderTabContent()}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}