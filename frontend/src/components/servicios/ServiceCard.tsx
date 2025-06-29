import { motion } from 'framer-motion';
import { 
  CheckIcon, 
  StarIcon, 
  MapPinIcon,
  ClockIcon,
  CurrencyDollarIcon 
} from '@heroicons/react/24/outline';
import { ServiceCardProps } from '@/types';
import { BRAND_TERMS } from '@/utils/constants';

const ServiceCard = ({ service, onClick, featured }: ServiceCardProps) => (
  <motion.div
    className={`
      group relative overflow-hidden rounded-2xl bg-white p-6 shadow-md 
      transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer
      ${featured ? 'ring-2 ring-primary-blue ring-opacity-20' : ''}
    `}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
  >
    {/* Gradient overlay para featured */}
    {featured && (
      <div className="absolute inset-0 bg-gradient-to-br from-primary-blue/5 to-transparent" />
    )}
    
    {/* Header con avatar y badge */}
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center space-x-3">
        <div className="relative">
          <img 
            src={service.as?.foto_perfil || '/images/default-avatar.png'} 
            alt={`${service.as?.nombre} - ${BRAND_TERMS.AS}`}
            className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-md"
          />
          {service.as?.identidad_verificada && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-secondary-green rounded-full flex items-center justify-center">
              <CheckIcon className="w-3 h-3 text-white" />
            </div>
          )}
        </div>
        <div>
          <h3 className="font-semibold text-neutral-900">
            {service.as?.nombre} {service.as?.apellido}
          </h3>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-sm text-neutral-600">{service.rating || '5.0'}</span>
            </div>
            {service.as?.profesional_verificado && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                Pro
              </span>
            )}
          </div>
        </div>
      </div>
      
      {/* Badge de categoría */}
      <div className="px-3 py-1 bg-primary-blue/10 text-primary-blue text-xs font-medium rounded-full">
        {service.categoria?.icono} {service.categoria?.nombre}
      </div>
    </div>
    
    {/* Contenido */}
    <div className="space-y-3">
      <h4 className="font-display text-lg text-neutral-900 group-hover:text-primary-blue transition-colors">
        {service.titulo}
      </h4>
      <p className="text-neutral-600 text-sm line-clamp-2">{service.descripcion}</p>
      
      {/* Tags */}
      {service.tags && service.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {service.tags.slice(0, 3).map(tag => (
            <span key={tag.id} className="px-2 py-1 bg-neutral-100 text-neutral-600 text-xs rounded-md">
              {tag.nombre}
            </span>
          ))}
          {service.tags.length > 3 && (
            <span className="px-2 py-1 bg-neutral-100 text-neutral-500 text-xs rounded-md">
              +{service.tags.length - 3}
            </span>
          )}
        </div>
      )}
      
      {/* Info adicional */}
      <div className="flex items-center space-x-4 text-sm text-neutral-500">
        {service.distancia && (
          <div className="flex items-center space-x-1">
            <MapPinIcon className="w-4 h-4" />
            <span>{service.distancia}km</span>
          </div>
        )}
        
        {service.urgente && (
          <div className="flex items-center space-x-1 text-secondary-red">
            <ClockIcon className="w-4 h-4" />
            <span className="font-medium">Urgente</span>
          </div>
        )}
        
        {service.as?.tiene_movilidad && (
          <span className="text-secondary-green text-xs font-medium">
            🚗 Con movilidad
          </span>
        )}
      </div>
      
      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
        <div className="flex items-center space-x-1 text-neutral-500">
          <CurrencyDollarIcon className="w-4 h-4" />
          <span className="text-sm">Desde</span>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-neutral-900">
            ${service.precio_desde?.toLocaleString()}
            {service.precio_hasta && service.precio_hasta !== service.precio_desde && (
              <span className="text-sm font-normal text-neutral-500">
                - ${service.precio_hasta.toLocaleString()}
              </span>
            )}
          </div>
          <div className="text-xs text-neutral-500 capitalize">
            {service.tipo_precio.replace('_', ' ')}
          </div>
        </div>
      </div>
    </div>
    
    {/* Badge de urgencia */}
    {service.urgente && (
      <div className="absolute top-4 left-4 px-2 py-1 bg-secondary-red text-white text-xs font-medium rounded-full animate-pulse">
        🚨 Urgente
      </div>
    )}

    {/* Badge de destacado */}
    {service.destacado && (
      <div className="absolute top-4 right-4 px-2 py-1 bg-secondary-orange text-white text-xs font-medium rounded-full">
        ⭐ Destacado
      </div>
    )}

    {/* Badge de As verificado */}
    {service.as?.identidad_verificada && (
      <div className="absolute bottom-4 left-4 text-xs bg-secondary-green/10 text-secondary-green px-2 py-1 rounded-full font-medium">
        {BRAND_TERMS.AS_VERIFIED}
      </div>
    )}
  </motion.div>
);

export default ServiceCard;