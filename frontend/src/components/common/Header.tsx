import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bars3Icon, 
  XMarkIcon,
  BellIcon,
  UserCircleIcon,
  MagnifyingGlassIcon 
} from '@heroicons/react/24/outline';
import { APP_CONFIG, BRAND_TERMS } from '@/utils/constants';
import { HeaderProps } from '@/types';

const Header = ({ user, showSearch = true, onSearchFocus }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const router = useRouter();

  const handleSearchFocus = () => {
    if (onSearchFocus) {
      onSearchFocus();
    } else {
      router.push('/explore');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <motion.div 
              className="w-12 h-12 bg-gradient-to-r from-primary-blue to-secondary-green rounded-2xl flex items-center justify-center shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-white font-bold text-xl">S</span>
            </motion.div>
            <h1 className="font-display text-xl font-bold text-neutral-900 group-hover:text-primary-blue transition-colors">
              {APP_CONFIG.NAME}
            </h1>
          </Link>

          {/* Search Bar (Desktop) */}
          {showSearch && (
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type="text"
                  placeholder={`Buscá ${BRAND_TERMS.ASES} o servicios...`}
                  className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all"
                  onFocus={handleSearchFocus}
                />
              </div>
            </div>
          )}

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {user ? (
              <>
                {/* User is logged in */}
                <Link href="/explore" className="text-neutral-600 hover:text-primary-blue transition-colors">
                  Explorar
                </Link>
                
                <Link href="/pricing" className="text-neutral-600 hover:text-purple-600 transition-colors">
                  Planes
                </Link>
                
                {user?.tipo_usuario === 'as' && (
                  <Link href="/my-services" className="text-neutral-600 hover:text-primary-blue transition-colors">
                    Mis Servicios
                  </Link>
                )}
                
                {user?.tipo_usuario === 'explorador' && (
                  <Link href="/my-searches" className="text-neutral-600 hover:text-primary-blue transition-colors">
                    Mis Búsquedas
                  </Link>
                )}

                {/* Notifications */}
                <button className="relative p-2 text-neutral-600 hover:text-primary-blue transition-colors">
                  <BellIcon className="w-6 h-6" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-secondary-red text-white text-xs rounded-full flex items-center justify-center">
                    3
                  </span>
                </button>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-2 p-2 rounded-full hover:bg-neutral-100 transition-colors"
                  >
                    <img 
                      src={user?.foto_perfil || '/images/default-avatar.png'}
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <span className="text-sm font-medium text-neutral-700">
                      {user?.nombre || 'Usuario'}
                    </span>
                  </button>

                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 py-2"
                      >
                        <Link href="/profile" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50">
                          Mi Perfil
                        </Link>
                        <Link href="/settings" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50">
                          Configuración
                        </Link>
                        {user?.tipo_usuario === 'as' && (
                          <Link href="/subscription" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50">
                            Suscripción
                          </Link>
                        )}
                        <hr className="my-2" />
                        <button className="block w-full text-left px-4 py-2 text-sm text-secondary-red hover:bg-neutral-50">
                          Cerrar Sesión
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                {/* User is not logged in */}
                <Link href="/explore" className="text-neutral-600 hover:text-primary-blue transition-colors">
                  Explorar
                </Link>
                <Link href="/pricing" className="text-neutral-600 hover:text-purple-600 transition-colors">
                  Planes
                </Link>
                <Link href="/login" className="text-neutral-600 hover:text-primary-blue transition-colors">
                  Iniciar Sesión
                </Link>
                <Link 
                  href="/register"
                  className="px-4 py-2 bg-primary-blue text-white rounded-full hover:bg-primary-blue-dark transition-colors"
                >
                  Registrarse
                </Link>
              </>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-neutral-600"
          >
            {isMenuOpen ? (
              <XMarkIcon className="w-6 h-6" />
            ) : (
              <Bars3Icon className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Search */}
        {showSearch && (
          <div className="md:hidden pb-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="text"
                placeholder={`Buscá ${BRAND_TERMS.ASES} o servicios...`}
                className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                onFocus={handleSearchFocus}
              />
            </div>
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-neutral-200"
          >
            <div className="px-4 py-4 space-y-4">
              {user ? (
                <>
                  <div className="flex items-center space-x-3 pb-4 border-b border-neutral-200">
                    <img 
                      src={user?.foto_perfil || '/images/default-avatar.png'}
                      alt="Profile"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-medium text-neutral-900">{user?.nombre || 'Usuario'}</p>
                      <p className="text-sm text-neutral-500 capitalize">
                        {user?.tipo_usuario === 'as' ? BRAND_TERMS.AS : BRAND_TERMS.EXPLORADOR}
                      </p>
                    </div>
                  </div>
                  
                  <Link href="/explore" className="block py-2 text-neutral-700">
                    Explorar
                  </Link>
                  
                  <Link href="/pricing" className="block py-2 text-neutral-700">
                    Planes
                  </Link>
                  
                  {user?.tipo_usuario === 'as' && (
                    <Link href="/my-services" className="block py-2 text-neutral-700">
                      Mis Servicios
                    </Link>
                  )}
                  
                  <Link href="/profile" className="block py-2 text-neutral-700">
                    Mi Perfil
                  </Link>
                  
                  <button className="block w-full text-left py-2 text-secondary-red">
                    Cerrar Sesión
                  </button>
                </>
              ) : (
                <>
                  <Link href="/explore" className="block py-2 text-neutral-700">
                    Explorar
                  </Link>
                  <Link href="/pricing" className="block py-2 text-neutral-700">
                    Planes
                  </Link>
                  <Link href="/login" className="block py-2 text-neutral-700">
                    Iniciar Sesión
                  </Link>
                  <Link href="/register" className="block py-2 text-primary-blue font-medium">
                    Registrarse
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;