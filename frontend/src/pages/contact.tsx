import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  QuestionMarkCircleIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { APP_CONFIG } from '@/utils/constants';
import { AnimatedStatus } from '@/components/common/ModernIcon';
import toast from 'react-hot-toast';

const contactMethods = [
  {
    icon: EnvelopeIcon,
    title: 'Email',
    description: 'Respuesta en 24 horas',
    value: 'hola@serviplay.com',
    emoji: '📧',
    action: 'mailto:hola@serviplay.com'
  },
  {
    icon: PhoneIcon,
    title: 'Teléfono',
    description: 'Lun a Vie 9:00 - 18:00',
    value: '+54 11 1234-5678',
    emoji: '📞',
    action: 'tel:+541112345678'
  },
  {
    icon: ChatBubbleLeftRightIcon,
    title: 'Chat en Vivo',
    description: 'Disponible ahora',
    value: 'Iniciar conversación',
    emoji: '💬',
    action: '#'
  },
  {
    icon: MapPinIcon,
    title: 'Oficina',
    description: 'Buenos Aires, Argentina',
    value: 'Av. Santa Fe 1234, CABA',
    emoji: '📍',
    action: 'https://maps.google.com'
  }
];

const contactReasons = [
  {
    id: 'support',
    title: 'Soporte Técnico',
    description: 'Problemas con la plataforma o tu cuenta',
    icon: QuestionMarkCircleIcon,
    emoji: '🛠️',
    responseTime: '4-6 horas'
  },
  {
    id: 'billing',
    title: 'Facturación y Pagos',
    description: 'Consultas sobre planes y pagos',
    icon: CurrencyDollarIcon,
    emoji: '💳',
    responseTime: '2-4 horas'
  },
  {
    id: 'safety',
    title: 'Seguridad y Reportes',
    description: 'Reportar problemas de seguridad',
    icon: ShieldCheckIcon,
    emoji: '🚨',
    responseTime: '1-2 horas'
  },
  {
    id: 'business',
    title: 'Oportunidades de Negocio',
    description: 'Partnerships y colaboraciones',
    icon: UserGroupIcon,
    emoji: '🤝',
    responseTime: '24-48 horas'
  },
  {
    id: 'feedback',
    title: 'Sugerencias y Feedback',
    description: 'Ideas para mejorar la plataforma',
    icon: ExclamationTriangleIcon,
    emoji: '💡',
    responseTime: '24-48 horas'
  },
  {
    id: 'other',
    title: 'Otros Temas',
    description: 'Cualquier otra consulta',
    icon: EnvelopeIcon,
    emoji: '📋',
    responseTime: '24-48 horas'
  }
];

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    reason: '',
    subject: '',
    message: '',
    urgent: false
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = 'checked' in e.target ? e.target.checked : false;
    
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones
    if (!formData.name.trim()) {
      toast.error('Ingresa tu nombre');
      return;
    }
    
    if (!formData.email.trim() || !formData.email.includes('@')) {
      toast.error('Ingresa un email válido');
      return;
    }
    
    if (!formData.reason) {
      toast.error('Selecciona el motivo de contacto');
      return;
    }
    
    if (!formData.subject.trim()) {
      toast.error('Ingresa el asunto');
      return;
    }
    
    if (!formData.message.trim()) {
      toast.error('Escribe tu mensaje');
      return;
    }

    setLoading(true);

    try {
      // Simular envío
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Mensaje enviado correctamente');
      
      // Limpiar formulario
      setFormData({
        name: '',
        email: '',
        reason: '',
        subject: '',
        message: '',
        urgent: false
      });
    } catch (error) {
      toast.error('Error al enviar el mensaje');
    } finally {
      setLoading(false);
    }
  };

  const selectedReason = contactReasons.find(reason => reason.id === formData.reason);

  return (
    <>
      <Head>
        <title>Contacto - {APP_CONFIG.NAME}</title>
        <meta name="description" content="Ponte en contacto con el equipo de Serviplay. Estamos aquí para ayudarte." />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-primary-blue-light via-white to-secondary-green/20">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-12 h-12 bg-gradient-to-r from-primary-blue to-secondary-green rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xl">S</span>
                </div>
                <span className="font-display text-2xl font-bold text-neutral-900">
                  {APP_CONFIG.NAME}
                </span>
              </Link>
              
              <div className="flex items-center space-x-4">
                <Link href="/help" className="px-4 py-2 text-neutral-600 hover:text-primary-blue transition-colors">
                  Centro de Ayuda
                </Link>
                <Link href="/pricing" className="px-4 py-2 text-neutral-600 hover:text-purple-600 transition-colors">
                  Planes
                </Link>
                <Link href="/auth/login" className="px-4 py-2 text-neutral-600 hover:text-primary-blue transition-colors">
                  Iniciar Sesión
                </Link>
                <Link href="/auth/register" className="px-6 py-2 bg-primary-blue text-white rounded-full hover:bg-primary-blue-dark transition-colors">
                  Registrarse
                </Link>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 py-16">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h1 className="font-display text-4xl md:text-6xl font-bold text-neutral-900 mb-6">
              Contactanos 📞
            </h1>
            <p className="text-xl text-neutral-600 mb-8 max-w-3xl mx-auto">
              ¿Tienes preguntas, sugerencias o necesitas ayuda? Estamos aquí para ayudarte. 
              Nuestro equipo responde en tiempo récord.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Methods */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-white rounded-2xl p-6 shadow-lg mb-8"
              >
                <h2 className="font-display text-xl font-bold text-neutral-900 mb-6">
                  Formas de Contacto
                </h2>
                
                <div className="space-y-4">
                  {contactMethods.map((method, index) => (
                    <motion.a
                      key={index}
                      href={method.action}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="flex items-center space-x-4 p-4 rounded-lg border border-neutral-200 hover:border-primary-blue hover:bg-primary-blue/5 transition-all group"
                    >
                      <div className="text-2xl">{method.emoji}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-neutral-900 group-hover:text-primary-blue transition-colors">
                          {method.title}
                        </h3>
                        <p className="text-sm text-neutral-600">{method.description}</p>
                        <p className="text-sm font-medium text-primary-blue">{method.value}</p>
                      </div>
                    </motion.a>
                  ))}
                </div>
              </motion.div>

              {/* Business Hours */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white rounded-2xl p-6 shadow-lg"
              >
                <h3 className="font-display text-lg font-bold text-neutral-900 mb-4 flex items-center">
                  <ClockIcon className="w-5 h-5 mr-2" />
                  Horarios de Atención
                </h3>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Lunes - Viernes</span>
                    <span className="font-medium">9:00 - 18:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Sábados</span>
                    <span className="font-medium">10:00 - 15:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Domingos</span>
                    <span className="text-neutral-400">Cerrado</span>
                  </div>
                  
                  <div className="pt-3 border-t border-neutral-200">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-green-800 text-xs">
                        🟢 <strong>Chat en vivo:</strong> Disponible 24/7 para emergencias
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-white rounded-2xl p-8 shadow-lg"
              >
                <h2 className="font-display text-2xl font-bold text-neutral-900 mb-6">
                  Envíanos un Mensaje
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Personal Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-2">
                        Nombre Completo *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all"
                        placeholder="Juan Pérez"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all"
                        placeholder="juan@email.com"
                      />
                    </div>
                  </div>

                  {/* Contact Reason */}
                  <div>
                    <label htmlFor="reason" className="block text-sm font-medium text-neutral-700 mb-2">
                      Motivo del Contacto *
                    </label>
                    <select
                      id="reason"
                      name="reason"
                      value={formData.reason}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all"
                    >
                      <option value="">Selecciona un motivo</option>
                      {contactReasons.map((reason) => (
                        <option key={reason.id} value={reason.id}>
                          {reason.emoji} {reason.title}
                        </option>
                      ))}
                    </select>
                    
                    {selectedReason && (
                      <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-blue-800 text-sm">
                          <strong>Tiempo de respuesta:</strong> {selectedReason.responseTime}
                        </p>
                        <p className="text-blue-700 text-xs mt-1">
                          {selectedReason.description}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Subject */}
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-neutral-700 mb-2">
                      Asunto *
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all"
                      placeholder="Describe brevemente tu consulta"
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-neutral-700 mb-2">
                      Mensaje *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all"
                      placeholder="Cuéntanos en detalle cómo podemos ayudarte..."
                    />
                    <p className="text-sm text-neutral-500 mt-1">
                      {formData.message.length}/1000 caracteres
                    </p>
                  </div>

                  {/* Urgent Checkbox */}
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="urgent"
                      name="urgent"
                      checked={formData.urgent}
                      onChange={handleChange}
                      className="rounded border-neutral-300 text-red-600 focus:ring-red-500"
                    />
                    <label htmlFor="urgent" className="text-sm text-neutral-700 flex items-center">
                      <ExclamationTriangleIcon className="w-4 h-4 text-red-500 mr-1" />
                      Es urgente (respuesta prioritaria)
                    </label>
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary-blue text-white py-4 rounded-lg font-semibold hover:bg-primary-blue-dark transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    {loading && <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                    <span>{loading ? 'Enviando...' : 'Enviar Mensaje'}</span>
                  </motion.button>
                </form>
              </motion.div>
            </div>
          </div>

          {/* FAQ Quick Access */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mt-16 bg-gradient-to-r from-secondary-green to-green-600 rounded-2xl p-12 text-center text-white"
          >
            <AnimatedStatus 
              emoji="💡" 
              text="¿Buscas Respuestas Rápidas?"
              subtext="Visita nuestro Centro de Ayuda donde encontrarás respuestas a las preguntas más frecuentes"
            />
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Link
                href="/help"
                className="px-8 py-4 bg-white text-secondary-green rounded-lg font-semibold hover:bg-neutral-100 transition-colors"
              >
                Centro de Ayuda
              </Link>
              <Link
                href="/how-it-works"
                className="px-8 py-4 border border-white text-white rounded-lg font-semibold hover:bg-white/10 transition-colors"
              >
                Cómo Funciona
              </Link>
            </div>
          </motion.div>

          {/* Response Time Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mt-8 bg-white rounded-2xl p-8 shadow-lg"
          >
            <h2 className="font-display text-2xl font-bold text-center text-neutral-900 mb-8">
              Nuestros Tiempos de Respuesta 📊
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl mb-3">🚨</div>
                <h3 className="font-semibold text-neutral-900 mb-2">Emergencias</h3>
                <p className="text-2xl font-bold text-red-600 mb-1">&lt; 1 hora</p>
                <p className="text-sm text-neutral-600">Problemas críticos de seguridad</p>
              </div>
              
              <div className="text-center">
                <div className="text-3xl mb-3">⚡</div>
                <h3 className="font-semibold text-neutral-900 mb-2">Soporte Técnico</h3>
                <p className="text-2xl font-bold text-yellow-600 mb-1">2-6 horas</p>
                <p className="text-sm text-neutral-600">Problemas con la plataforma</p>
              </div>
              
              <div className="text-center">
                <div className="text-3xl mb-3">💬</div>
                <h3 className="font-semibold text-neutral-900 mb-2">Consultas Generales</h3>
                <p className="text-2xl font-bold text-blue-600 mb-1">24-48 horas</p>
                <p className="text-sm text-neutral-600">Preguntas y sugerencias</p>
              </div>
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