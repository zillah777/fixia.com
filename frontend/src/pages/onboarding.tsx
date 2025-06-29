import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { 
  CheckIcon, 
  UserIcon, 
  MapPinIcon, 
  CameraIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { APP_CONFIG, BRAND_TERMS } from '@/utils/constants';
import toast from 'react-hot-toast';

const steps = [
  {
    id: 1,
    title: 'Información Personal',
    description: 'Completa tu perfil básico'
  },
  {
    id: 2,
    title: 'Ubicación',
    description: 'Dónde ofreces tus servicios'
  },
  {
    id: 3,
    title: 'Foto de Perfil',
    description: 'Agrega una foto profesional'
  },
  {
    id: 4,
    title: '¡Listo!',
    description: 'Tu cuenta está configurada'
  }
];

export default function Onboarding() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    bio: '',
    ubicacion: '',
    direccion: '',
    localidad: '',
    provincia: '',
    foto_perfil: null as File | null
  });

  const handleNext = async () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      // Finalizar onboarding
      setLoading(true);
      try {
        // TODO: Enviar datos al backend
        await new Promise(resolve => setTimeout(resolve, 2000));
        toast.success('¡Bienvenido a Serviplay!');
        router.push('/dashboard');
      } catch (error) {
        toast.error('Error al configurar tu cuenta');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    router.push('/dashboard');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({
        ...formData,
        foto_perfil: e.target.files[0]
      });
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserIcon className="w-8 h-8 text-primary-blue" />
              </div>
              <h2 className="font-display text-2xl font-bold text-neutral-900 mb-2">
                Cuéntanos sobre ti
              </h2>
              <p className="text-neutral-600">
                Esta información ayudará a los {BRAND_TERMS.EXPLORADORES} a conocerte mejor
              </p>
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-neutral-700 mb-2">
                Descripción personal
              </label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all"
                placeholder="Describe tu experiencia, especialidades y qué te hace único..."
              />
              <p className="text-sm text-neutral-500 mt-1">
                Tip: Menciona tu experiencia y especialidades
              </p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-secondary-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPinIcon className="w-8 h-8 text-secondary-green" />
              </div>
              <h2 className="font-display text-2xl font-bold text-neutral-900 mb-2">
                ¿Dónde trabajas?
              </h2>
              <p className="text-neutral-600">
                Ayudanos a conectarte con {BRAND_TERMS.EXPLORADORES} de tu zona
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="direccion" className="block text-sm font-medium text-neutral-700 mb-2">
                  Dirección
                </label>
                <input
                  type="text"
                  id="direccion"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all"
                  placeholder="Av. Corrientes 1234"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="localidad" className="block text-sm font-medium text-neutral-700 mb-2">
                    Localidad
                  </label>
                  <input
                    type="text"
                    id="localidad"
                    name="localidad"
                    value={formData.localidad}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all"
                    placeholder="CABA"
                  />
                </div>

                <div>
                  <label htmlFor="provincia" className="block text-sm font-medium text-neutral-700 mb-2">
                    Provincia
                  </label>
                  <input
                    type="text"
                    id="provincia"
                    name="provincia"
                    value={formData.provincia}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all"
                    placeholder="Buenos Aires"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CameraIcon className="w-8 h-8 text-yellow-600" />
              </div>
              <h2 className="font-display text-2xl font-bold text-neutral-900 mb-2">
                Foto de perfil
              </h2>
              <p className="text-neutral-600">
                Una buena foto genera más confianza con los {BRAND_TERMS.EXPLORADORES}
              </p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-32 h-32 bg-neutral-100 rounded-full flex items-center justify-center mb-6 overflow-hidden">
                {formData.foto_perfil ? (
                  <img
                    src={URL.createObjectURL(formData.foto_perfil)}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserIcon className="w-16 h-16 text-neutral-400" />
                )}
              </div>

              <label htmlFor="foto" className="cursor-pointer">
                <div className="px-6 py-3 bg-primary-blue text-white rounded-lg hover:bg-primary-blue-dark transition-colors">
                  {formData.foto_perfil ? 'Cambiar foto' : 'Subir foto'}
                </div>
                <input
                  type="file"
                  id="foto"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              <p className="text-sm text-neutral-500 mt-4 text-center">
                Recomendamos una foto clara de tu rostro<br />
                Formatos: JPG, PNG (máx. 5MB)
              </p>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckIcon className="w-10 h-10 text-green-600" />
            </div>
            
            <h2 className="font-display text-3xl font-bold text-neutral-900 mb-4">
              ¡Todo listo! 🎉
            </h2>
            
            <p className="text-xl text-neutral-600 mb-8">
              Tu cuenta está configurada y lista para usar
            </p>

            <div className="bg-gradient-to-r from-primary-blue to-secondary-green p-6 rounded-2xl text-white">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <StarIcon className="w-6 h-6" />
                <span className="font-semibold">Próximos pasos</span>
              </div>
              
              <div className="space-y-2 text-sm">
                <p>✅ Completa tu perfil al 100%</p>
                <p>💼 Publica tu primer servicio</p>
                <p>🤝 Conecta con {BRAND_TERMS.EXPLORADORES}</p>
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
        <title>Configuración de Cuenta - {APP_CONFIG.NAME}</title>
        <meta name="description" content="Configura tu cuenta en Serviplay" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-primary-blue-light via-white to-secondary-green/20">
        <div className="max-w-2xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-r from-primary-blue to-secondary-green rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <h1 className="font-display text-2xl font-bold text-neutral-900">
              {APP_CONFIG.NAME}
            </h1>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all
                    ${currentStep >= step.id 
                      ? 'bg-primary-blue border-primary-blue text-white' 
                      : 'border-neutral-300 text-neutral-400'
                    }
                  `}>
                    {currentStep > step.id ? (
                      <CheckIcon className="w-5 h-5" />
                    ) : (
                      <span className="text-sm font-semibold">{step.id}</span>
                    )}
                  </div>
                  
                  {index < steps.length - 1 && (
                    <div className={`
                      h-0.5 w-16 mx-2 transition-all
                      ${currentStep > step.id ? 'bg-primary-blue' : 'bg-neutral-300'}
                    `} />
                  )}
                </div>
              ))}
            </div>
            
            <div className="text-center">
              <h2 className="font-semibold text-neutral-900 mb-1">
                {steps[currentStep - 1]?.title}
              </h2>
              <p className="text-sm text-neutral-600">
                {steps[currentStep - 1]?.description}
              </p>
            </div>
          </div>

          {/* Content */}
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl shadow-xl p-8 mb-8"
          >
            {renderStepContent()}
          </motion.div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex space-x-4">
              {currentStep > 1 && (
                <button
                  onClick={handleBack}
                  className="px-6 py-3 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  Anterior
                </button>
              )}
              
              <button
                onClick={handleSkip}
                className="px-6 py-3 text-neutral-600 hover:text-neutral-800 transition-colors"
              >
                Saltar configuración
              </button>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleNext}
              disabled={loading}
              className="px-8 py-3 bg-primary-blue text-white rounded-lg font-semibold hover:bg-primary-blue-dark transition-colors disabled:opacity-50"
            >
              {loading ? 'Configurando...' : 
               currentStep === steps.length ? 'Ir al Dashboard' : 'Continuar'}
            </motion.button>
          </div>
        </div>
      </div>
    </>
  );
}