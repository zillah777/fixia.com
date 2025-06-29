import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { EyeIcon, EyeSlashIcon, UserIcon, WrenchScrewdriverIcon } from '@heroicons/react/24/outline';
import { APP_CONFIG, BRAND_TERMS } from '@/utils/constants';
import toast from 'react-hot-toast';
import { authService, RegisterData } from '@/services/api';

export default function Register() {
  const router = useRouter();
  const { tipo } = router.query;
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState<'explorador' | 'as'>(
    tipo === 'as' ? 'as' : 'explorador'
  );
  
  const [formData, setFormData] = useState({
    // Usuario base
    email: '',
    password: '',
    confirmPassword: '',
    tipo_usuario: userType, // 'as' | 'explorador' | 'ambos'
    
    // Perfil específico (aplica tanto a As como Explorador)
    nombre: '',
    apellido: '',
    dni: '',
    telefono: '',
    direccion: '',
    localidad: '',
    provincia: '',
    codigo_postal: '',
    
    // Solo para As
    fecha_nacimiento: '',
    nivel_educativo: '',
    tiene_movilidad: false,
    
    terminos: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar requisitos de contraseña
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,128}$/;
    if (!passwordRegex.test(formData.password)) {
      toast.error('La contraseña debe tener 8+ caracteres con mayúscula, minúscula, número y carácter especial (@$!%*?&)');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (!formData.terminos) {
      toast.error('Debes aceptar los términos y condiciones');
      return;
    }

    setLoading(true);

    try {
      // Preparar datos para el backend
      const registerData: RegisterData = {
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        tipo_usuario: userType,
        acepta_terminos: formData.terminos,
        nombre: formData.nombre,
        apellido: formData.apellido,
        dni: formData.dni,
        telefono: formData.telefono,
        direccion: formData.direccion,
        localidad: formData.localidad,
        provincia: formData.provincia,
        codigo_postal: formData.codigo_postal,
        // Para AS agregar campos específicos
        ...(userType === 'as' && {
          fecha_nacimiento: formData.fecha_nacimiento,
          nivel_educativo: formData.nivel_educativo,
          tiene_movilidad: formData.tiene_movilidad,
        })
      };

      // Llamar al servicio de registro
      const response = await authService.register(registerData);
      
      if (response.success) {
        // Redirigir según el tipo de usuario
        if (userType === 'as') {
          router.push('/onboarding?tipo=as');
        } else {
          router.push('/dashboard');
        }
      }
    } catch (error: any) {
      // Los errores ya se muestran en el servicio authService
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = 'checked' in e.target ? e.target.checked : false;
    
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Actualizar tipo de usuario cuando cambie
  const handleUserTypeChange = (newType: 'explorador' | 'as') => {
    setUserType(newType);
    setFormData({
      ...formData,
      tipo_usuario: newType
    });
  };

  return (
    <>
      <Head>
        <title>Registro - {APP_CONFIG.NAME}</title>
        <meta name="description" content="Crea tu cuenta en Serviplay" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-primary-blue-light via-white to-secondary-green/20 py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-md mx-auto"
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
            
            <h1 className="font-display text-3xl font-bold text-neutral-900 mb-2">
              ¡Únete a la comunidad!
            </h1>
            <p className="text-neutral-600">
              Crea tu cuenta y comienza a conectar
            </p>
          </div>

          {/* User Type Selection */}
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <h2 className="font-semibold text-neutral-900 mb-4 text-center">
              ¿Cómo quieres usar {APP_CONFIG.NAME}?
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleUserTypeChange('explorador')}
                className={`p-4 border-2 rounded-xl transition-all ${
                  userType === 'explorador'
                    ? 'border-primary-blue bg-primary-blue/5'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <UserIcon className="w-8 h-8 mx-auto mb-2 text-primary-blue" />
                <h3 className="font-semibold text-sm text-neutral-900">
                  {BRAND_TERMS.EXPLORADOR}
                </h3>
                <p className="text-xs text-neutral-600 mt-1">
                  Buscar servicios
                </p>
              </button>
              
              <button
                type="button"
                onClick={() => handleUserTypeChange('as')}
                className={`p-4 border-2 rounded-xl transition-all ${
                  userType === 'as'
                    ? 'border-secondary-green bg-secondary-green/5'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <WrenchScrewdriverIcon className="w-8 h-8 mx-auto mb-2 text-secondary-green" />
                <h3 className="font-semibold text-sm text-neutral-900">
                  {BRAND_TERMS.AS}
                </h3>
                <p className="text-xs text-neutral-600 mt-1">
                  Ofrecer servicios
                </p>
              </button>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="nombre" className="block text-sm font-medium text-neutral-700 mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    autoComplete="given-name"
                    required
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all"
                    placeholder="Juan"
                  />
                </div>
                
                <div>
                  <label htmlFor="apellido" className="block text-sm font-medium text-neutral-700 mb-1">
                    Apellido
                  </label>
                  <input
                    type="text"
                    id="apellido"
                    name="apellido"
                    value={formData.apellido}
                    onChange={handleChange}
                    autoComplete="family-name"
                    required
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all"
                    placeholder="Pérez"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all"
                  placeholder="tu@email.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="dni" className="block text-sm font-medium text-neutral-700 mb-1">
                    DNI
                  </label>
                  <input
                    type="text"
                    id="dni"
                    name="dni"
                    value={formData.dni}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all"
                    placeholder="12.345.678"
                  />
                </div>
                
                <div>
                  <label htmlFor="telefono" className="block text-sm font-medium text-neutral-700 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    id="telefono"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    autoComplete="tel"
                    required
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all"
                    placeholder="+54 9 11 1234-5678"
                  />
                </div>
              </div>

              {/* Campos adicionales para As */}
              {userType === 'as' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="fecha_nacimiento" className="block text-sm font-medium text-neutral-700 mb-1">
                        Fecha de Nacimiento
                      </label>
                      <input
                        type="date"
                        id="fecha_nacimiento"
                        name="fecha_nacimiento"
                        value={formData.fecha_nacimiento}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="nivel_educativo" className="block text-sm font-medium text-neutral-700 mb-1">
                        Nivel Educativo
                      </label>
                      <select
                        id="nivel_educativo"
                        name="nivel_educativo"
                        value={formData.nivel_educativo}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all"
                      >
                        <option value="">Seleccionar</option>
                        <option value="primario">Primario</option>
                        <option value="secundario">Secundario</option>
                        <option value="terciario">Terciario</option>
                        <option value="universitario">Universitario</option>
                        <option value="posgrado">Posgrado</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="tiene_movilidad"
                      name="tiene_movilidad"
                      checked={formData.tiene_movilidad}
                      onChange={handleChange}
                      className="rounded border-neutral-300 text-primary-blue focus:ring-primary-blue"
                    />
                    <label htmlFor="tiene_movilidad" className="ml-2 text-sm text-neutral-600">
                      Tengo movilidad propia (auto, moto, etc.)
                    </label>
                  </div>
                </>
              )}

              {/* Información de ubicación */}
              <div>
                <label htmlFor="direccion" className="block text-sm font-medium text-neutral-700 mb-1">
                  Dirección
                </label>
                <input
                  type="text"
                  id="direccion"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all"
                  placeholder="Av. Corrientes 1234"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label htmlFor="localidad" className="block text-sm font-medium text-neutral-700 mb-1">
                    Localidad
                  </label>
                  <input
                    type="text"
                    id="localidad"
                    name="localidad"
                    value={formData.localidad}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all"
                    placeholder="CABA"
                  />
                </div>
                
                <div>
                  <label htmlFor="provincia" className="block text-sm font-medium text-neutral-700 mb-1">
                    Provincia
                  </label>
                  <input
                    type="text"
                    id="provincia"
                    name="provincia"
                    value={formData.provincia}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all"
                    placeholder="Buenos Aires"
                  />
                </div>
                
                <div>
                  <label htmlFor="codigo_postal" className="block text-sm font-medium text-neutral-700 mb-1">
                    C.P.
                  </label>
                  <input
                    type="text"
                    id="codigo_postal"
                    name="codigo_postal"
                    value={formData.codigo_postal}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all"
                    placeholder="1234"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-1">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                    required
                    className="w-full px-3 py-2 pr-10 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="w-4 h-4" />
                    ) : (
                      <EyeIcon className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-neutral-500 mt-1">
                  Mínimo 8 caracteres, debe incluir: mayúscula, minúscula, número y carácter especial (@$!%*?&)
                </p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700 mb-1">
                  Confirmar Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    autoComplete="new-password"
                    required
                    className="w-full px-3 py-2 pr-10 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="w-4 h-4" />
                    ) : (
                      <EyeIcon className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="terminos"
                  name="terminos"
                  checked={formData.terminos}
                  onChange={handleChange}
                  required
                  className="mt-1 rounded border-neutral-300 text-primary-blue focus:ring-primary-blue"
                />
                <label htmlFor="terminos" className="ml-2 text-sm text-neutral-600">
                  Acepto los{' '}
                  <Link href="/terms" className="text-primary-blue hover:underline">
                    Términos de Uso
                  </Link>{' '}
                  y la{' '}
                  <Link href="/privacy" className="text-primary-blue hover:underline">
                    Política de Privacidad
                  </Link>
                </label>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 ${
                  userType === 'as'
                    ? 'bg-secondary-green text-white hover:bg-green-600'
                    : 'bg-primary-blue text-white hover:bg-primary-blue-dark'
                }`}
              >
                {loading ? 'Creando cuenta...' : `Crear cuenta como ${userType === 'as' ? 'As' : 'Explorador'}`}
              </motion.button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-neutral-600">
                ¿Ya tienes cuenta?{' '}
                <Link
                  href="/auth/login"
                  className="text-primary-blue hover:text-primary-blue-dark font-semibold transition-colors"
                >
                  Inicia sesión aquí
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}