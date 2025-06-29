import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { 
  ShieldCheckIcon,
  DocumentIcon,
  PhoneIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  PhotoIcon,
  IdentificationIcon,
  AcademicCapIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { APP_CONFIG, BRAND_TERMS } from '@/utils/constants';
import { AnimatedStatus } from '@/components/common/ModernIcon';
import toast from 'react-hot-toast';

const verificationSteps = [
  {
    id: 'email',
    title: 'Verificación de Email',
    description: 'Confirma tu dirección de correo electrónico',
    icon: EnvelopeIcon,
    emoji: '📧',
    required: true,
    timeEstimate: '2 minutos',
    benefits: ['Acceso completo a la plataforma', 'Notificaciones de trabajos', 'Recuperación de cuenta']
  },
  {
    id: 'phone',
    title: 'Verificación de Teléfono',
    description: 'Confirma tu número de teléfono móvil',
    icon: PhoneIcon,
    emoji: '📱',
    required: true,
    timeEstimate: '3 minutos',
    benefits: ['Mayor confianza de clientes', 'Contacto directo', 'Verificación SMS']
  },
  {
    id: 'identity',
    title: 'Verificación de Identidad',
    description: 'Sube una foto de tu documento nacional',
    icon: IdentificationIcon,
    emoji: '🆔',
    required: true,
    timeEstimate: '5 minutos',
    benefits: ['Badge de verificado', 'Mayor visibilidad', 'Confianza de Exploradores']
  },
  {
    id: 'address',
    title: 'Verificación de Domicilio',
    description: 'Confirma tu dirección de residencia',
    icon: DocumentIcon,
    emoji: '🏠',
    required: false,
    timeEstimate: '24-48 horas',
    benefits: ['Servicios a domicilio', 'Mayor credibilidad', 'Zona de cobertura']
  },
  {
    id: 'professional',
    title: 'Verificación Profesional',
    description: 'Valida tus títulos y certificaciones',
    icon: AcademicCapIcon,
    emoji: '🎓',
    required: false,
    timeEstimate: '1-3 días',
    benefits: ['Badge profesional', 'Precios premium', 'Servicios especializados']
  }
];

const verificationStatus = {
  email: 'verified',
  phone: 'pending',
  identity: 'not_started',
  address: 'not_started',
  professional: 'not_started'
};

const statusConfig = {
  verified: { icon: CheckCircleIcon, color: 'text-green-500', bg: 'bg-green-100', text: 'Verificado' },
  pending: { icon: ClockIcon, color: 'text-yellow-500', bg: 'bg-yellow-100', text: 'Pendiente' },
  rejected: { icon: XCircleIcon, color: 'text-red-500', bg: 'bg-red-100', text: 'Rechazado' },
  not_started: { icon: ExclamationTriangleIcon, color: 'text-neutral-400', bg: 'bg-neutral-100', text: 'No iniciado' }
};

export default function Verification() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState<string>('phone');
  const [loading, setLoading] = useState(false);
  
  // Form states for different verification types
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState('dni');

  const handleSendCode = async () => {
    if (!phoneNumber.trim()) {
      toast.error('Ingresa tu número de teléfono');
      return;
    }

    setLoading(true);
    try {
      // Simular envío de código
      await new Promise(resolve => setTimeout(resolve, 2000));
      setCodeSent(true);
      toast.success('Código enviado por SMS');
    } catch (error) {
      toast.error('Error al enviar el código');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) {
      toast.error('Ingresa el código de verificación');
      return;
    }

    setLoading(true);
    try {
      // Simular verificación
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Teléfono verificado correctamente');
      // Actualizar estado de verificación
    } catch (error) {
      toast.error('Código incorrecto');
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentUpload = async () => {
    if (!selectedDocument) {
      toast.error('Selecciona un documento');
      return;
    }

    setLoading(true);
    try {
      // Simular subida de documento
      await new Promise(resolve => setTimeout(resolve, 3000));
      toast.success('Documento enviado para revisión');
      // Actualizar estado de verificación
    } catch (error) {
      toast.error('Error al subir el documento');
    } finally {
      setLoading(false);
    }
  };

  const getCompletionPercentage = () => {
    const completed = Object.values(verificationStatus).filter(status => status === 'verified').length;
    return Math.round((completed / verificationSteps.length) * 100);
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 'phone':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-6xl mb-4">📱</div>
              <h3 className="font-display text-2xl font-bold text-neutral-900 mb-2">
                Verificación de Teléfono
              </h3>
              <p className="text-neutral-600">
                Los {BRAND_TERMS.EXPLORADORES} confían más en {BRAND_TERMS.ASES} con teléfono verificado
              </p>
            </div>

            {!codeSent ? (
              <div className="space-y-4">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-neutral-700 mb-2">
                    Número de Teléfono
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+54 9 11 1234-5678"
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                  />
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSendCode}
                  disabled={loading}
                  className="w-full bg-primary-blue text-white py-3 rounded-lg font-semibold hover:bg-primary-blue-dark transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                  <span>{loading ? 'Enviando...' : 'Enviar Código SMS'}</span>
                </motion.button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 text-sm">
                    <CheckCircleIcon className="w-4 h-4 inline mr-2" />
                    Código enviado a {phoneNumber}
                  </p>
                </div>

                <div>
                  <label htmlFor="code" className="block text-sm font-medium text-neutral-700 mb-2">
                    Código de Verificación
                  </label>
                  <input
                    type="text"
                    id="code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="123456"
                    maxLength={6}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent text-center text-2xl tracking-widest"
                  />
                </div>

                <div className="flex space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleVerifyCode}
                    disabled={loading}
                    className="flex-1 bg-primary-blue text-white py-3 rounded-lg font-semibold hover:bg-primary-blue-dark transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Verificando...' : 'Verificar Código'}
                  </motion.button>
                  
                  <button
                    onClick={handleSendCode}
                    className="px-4 py-3 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
                  >
                    Reenviar
                  </button>
                </div>
              </div>
            )}
          </div>
        );

      case 'identity':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-6xl mb-4">🆔</div>
              <h3 className="font-display text-2xl font-bold text-neutral-900 mb-2">
                Verificación de Identidad
              </h3>
              <p className="text-neutral-600">
                Sube una foto clara de tu documento para obtener el badge de verificado
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Tipo de Documento
                </label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                >
                  <option value="dni">DNI (Documento Nacional de Identidad)</option>
                  <option value="passport">Pasaporte</option>
                  <option value="cedula">Cédula de Identidad</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Foto del Documento
                </label>
                <div className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center hover:border-primary-blue transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setSelectedDocument(e.target.files?.[0] || null)}
                    className="hidden"
                    id="document-upload"
                  />
                  <label htmlFor="document-upload" className="cursor-pointer">
                    <PhotoIcon className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                    <p className="text-neutral-600 mb-2">
                      {selectedDocument ? selectedDocument.name : 'Haz clic para subir una foto'}
                    </p>
                    <p className="text-xs text-neutral-500">
                      JPG, PNG o PDF • Máximo 10MB
                    </p>
                  </label>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">💡 Consejos para una buena foto:</h4>
                <ul className="text-blue-800 text-sm space-y-1">
                  <li>• Asegúrate de que se vea toda la información</li>
                  <li>• Evita reflejos o sombras</li>
                  <li>• La foto debe estar enfocada y ser legible</li>
                  <li>• No cubras ninguna parte del documento</li>
                </ul>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDocumentUpload}
                disabled={loading || !selectedDocument}
                className="w-full bg-primary-blue text-white py-3 rounded-lg font-semibold hover:bg-primary-blue-dark transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                <span>{loading ? 'Subiendo...' : 'Enviar para Verificación'}</span>
              </motion.button>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🚧</div>
            <h3 className="font-display text-2xl font-bold text-neutral-900 mb-2">
              Verificación en Desarrollo
            </h3>
            <p className="text-neutral-600">
              Esta verificación estará disponible próximamente
            </p>
          </div>
        );
    }
  };

  return (
    <>
      <Head>
        <title>Verificación de Cuenta - {APP_CONFIG.NAME}</title>
        <meta name="description" content="Verifica tu identidad para aumentar la confianza y obtener más trabajos" />
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
              
              <div className="flex items-center space-x-4">
                <Link href="/profile" className="px-4 py-2 text-neutral-600 hover:text-primary-blue transition-colors">
                  Mi Perfil
                </Link>
                <Link href="/auth/logout" className="px-6 py-2 border border-neutral-300 text-neutral-700 rounded-full hover:bg-neutral-50 transition-colors">
                  Cerrar Sesión
                </Link>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-4 py-16">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="font-display text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
              Verificación de Cuenta 🛡️
            </h1>
            <p className="text-xl text-neutral-600 mb-8 max-w-3xl mx-auto">
              Verifica tu identidad para generar más confianza, obtener más trabajos 
              y acceder a funciones exclusivas de {APP_CONFIG.NAME}.
            </p>

            {/* Progress Bar */}
            <div className="max-w-md mx-auto">
              <div className="flex items-center justify-between text-sm text-neutral-600 mb-2">
                <span>Progreso de verificación</span>
                <span>{getCompletionPercentage()}% completado</span>
              </div>
              <div className="w-full bg-neutral-200 rounded-full h-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${getCompletionPercentage()}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="bg-gradient-to-r from-primary-blue to-secondary-green h-3 rounded-full"
                ></motion.div>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Verification Steps Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-6 shadow-lg sticky top-8">
                <h2 className="font-display text-xl font-bold text-neutral-900 mb-6">
                  Pasos de Verificación
                </h2>
                
                <div className="space-y-4">
                  {verificationSteps.map((step, index) => {
                    const StatusIcon = statusConfig[verificationStatus[step.id as keyof typeof verificationStatus] as keyof typeof statusConfig].icon;
                    const status = verificationStatus[step.id as keyof typeof verificationStatus] as keyof typeof statusConfig;
                    
                    return (
                      <motion.div
                        key={step.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          activeStep === step.id
                            ? 'border-primary-blue bg-primary-blue/5'
                            : 'border-neutral-200 hover:border-neutral-300'
                        }`}
                        onClick={() => setActiveStep(step.id)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">{step.emoji}</div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold text-neutral-900 text-sm">
                                {step.title}
                              </h3>
                              <div className={`p-1 rounded-full ${statusConfig[status].bg}`}>
                                <StatusIcon className={`w-4 h-4 ${statusConfig[status].color}`} />
                              </div>
                            </div>
                            <p className="text-xs text-neutral-600 mt-1">
                              {step.timeEstimate}
                            </p>
                            {step.required && (
                              <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full mt-1 inline-block">
                                Obligatorio
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Benefits Summary */}
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="font-semibold text-green-900 mb-2 flex items-center">
                    <StarIcon className="w-4 h-4 mr-2" />
                    Beneficios de Verificarse
                  </h3>
                  <ul className="text-green-800 text-xs space-y-1">
                    <li>• 3x más contactos de clientes</li>
                    <li>• Badge de As verificado</li>
                    <li>• Mayor posicionamiento en búsquedas</li>
                    <li>• Acceso a trabajos premium</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2">
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="bg-white rounded-2xl p-8 shadow-lg"
              >
                {renderStepContent()}
              </motion.div>

              {/* Benefits of Current Step */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mt-6 bg-white rounded-2xl p-6 shadow-lg"
              >
                <h3 className="font-display text-lg font-bold text-neutral-900 mb-4">
                  Beneficios de esta Verificación
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {verificationSteps.find(s => s.id === activeStep)?.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-neutral-700">{benefit}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center bg-gradient-to-r from-primary-blue to-primary-blue-dark rounded-2xl p-12 text-white mt-16"
          >
            <AnimatedStatus 
              emoji="🎯" 
              text="¿Necesitas Ayuda?"
              subtext="Nuestro equipo está aquí para ayudarte con cualquier duda sobre la verificación"
            />
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Link
                href="/help"
                className="px-8 py-4 bg-white text-primary-blue rounded-lg font-semibold hover:bg-neutral-100 transition-colors"
              >
                Centro de Ayuda
              </Link>
              <Link
                href="/contact"
                className="px-8 py-4 border border-white text-white rounded-lg font-semibold hover:bg-white/10 transition-colors"
              >
                Contactar Soporte
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Footer */}
        <footer className="bg-neutral-900 text-white px-4 py-12">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-neutral-500 text-sm">
              © 2024 {APP_CONFIG.NAME} - Mmata. Todos los derechos reservados.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}