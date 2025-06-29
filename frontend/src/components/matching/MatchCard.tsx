import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  StarIcon,
  MapPinIcon,
  ClockIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  HeartIcon,
  XMarkIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { Match, Servicio, PerfilAs } from '@/types';

interface MatchCardProps {
  match: Match & {
    servicio?: Servicio;
    as?: PerfilAs;
  };
  onAccept?: (matchId: string) => void;
  onReject?: (matchId: string) => void;
  onContact?: (matchId: string, method: 'phone' | 'chat' | 'whatsapp') => void;
  showActions?: boolean;
}

export default function MatchCard({
  match,
  onAccept,
  onReject,
  onContact,
  showActions = true
}: MatchCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => {
      const filled = i < Math.floor(rating);
      
      return (
        <div key={i} className="relative">
          <StarIcon className="w-4 h-4 text-neutral-300" />
          {filled && (
            <StarIconSolid className="absolute inset-0 w-4 h-4 text-yellow-400" />
          )}
        </div>
      );
    });
  };

  const getMatchQuality = (score?: number) => {
    if (!score) return { label: 'Sin evaluar', color: 'text-neutral-500' };
    if (score >= 90) return { label: 'Excelente match', color: 'text-secondary-green' };
    if (score >= 70) return { label: 'Buen match', color: 'text-primary-blue' };
    if (score >= 50) return { label: 'Match regular', color: 'text-secondary-orange' };
    return { label: 'Match bajo', color: 'text-neutral-600' };
  };

  const matchQuality = getMatchQuality(match.score_matching);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white rounded-xl border border-neutral-200 p-6 hover:shadow-sm transition-shadow"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-4">
          {/* AS Avatar */}
          <div className="w-12 h-12 bg-gradient-to-br from-primary-blue/10 to-secondary-green/10 rounded-xl flex items-center justify-center flex-shrink-0">
            {match.as?.foto_perfil ? (
              <img
                src={match.as.foto_perfil}
                alt={match.as.nombre}
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              <span className="text-lg">👤</span>
            )}
          </div>

          {/* AS Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-neutral-900 truncate">
              {match.as?.nombre} {match.as?.apellido}
            </h3>
            <p className="text-sm text-neutral-600 mb-1">
              {match.servicio?.titulo || 'Servicio no especificado'}
            </p>
            
            {/* Rating and Distance */}
            <div className="flex items-center space-x-3 text-sm text-neutral-600">
              {match.servicio?.rating && (
                <div className="flex items-center space-x-1">
                  <div className="flex space-x-0.5">
                    {renderStars(match.servicio.rating)}
                  </div>
                  <span>{match.servicio.rating}</span>
                </div>
              )}
              {match.distancia_km && (
                <div className="flex items-center space-x-1">
                  <MapPinIcon className="w-4 h-4" />
                  <span>{match.distancia_km.toFixed(1)} km</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Match Score */}
        <div className="text-right">
          <div className={`text-sm font-medium ${matchQuality.color}`}>
            {matchQuality.label}
          </div>
          {match.score_matching && (
            <div className="text-xs text-neutral-500">
              {match.score_matching}% match
            </div>
          )}
        </div>
      </div>

      {/* Service Description */}
      {match.servicio?.descripcion && (
        <div className="mb-4">
          <p className={`text-neutral-700 text-sm ${!isExpanded ? 'line-clamp-2' : ''}`}>
            {match.servicio.descripcion}
          </p>
          {match.servicio.descripcion.length > 100 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-primary-blue hover:text-primary-blue-dark text-xs mt-1"
            >
              {isExpanded ? 'Ver menos' : 'Ver más'}
            </button>
          )}
        </div>
      )}

      {/* Price and Details */}
      <div className="flex flex-wrap items-center gap-4 mb-4 text-sm">
        {match.servicio?.precio_desde && (
          <div className="flex items-center space-x-1 text-secondary-green">
            <span className="font-semibold">
              ${match.servicio.precio_desde.toLocaleString()}
              {match.servicio.precio_hasta && 
                match.servicio.precio_hasta !== match.servicio.precio_desde && (
                  <>-${match.servicio.precio_hasta.toLocaleString()}</>
                )}
            </span>
            <span className="text-neutral-600">
              {match.servicio.tipo_precio === 'por_hora' && 'por hora'}
              {match.servicio.tipo_precio === 'por_trabajo' && 'por trabajo'}
              {match.servicio.tipo_precio === 'por_semana' && 'por semana'}
              {match.servicio.tipo_precio === 'por_mes' && 'por mes'}
            </span>
          </div>
        )}
        
        <div className="flex items-center space-x-1 text-neutral-600">
          <ClockIcon className="w-4 h-4" />
          <span>{new Date(match.created_at).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2 mb-4">
        {match.as?.identidad_verificada && (
          <span className="px-2 py-1 bg-secondary-green/10 text-secondary-green text-xs rounded-full">
            ✓ Verificado
          </span>
        )}
        {match.servicio?.urgente && (
          <span className="px-2 py-1 bg-secondary-red/10 text-secondary-red text-xs rounded-full">
            Urgente
          </span>
        )}
        {match.as?.tiene_movilidad && (
          <span className="px-2 py-1 bg-primary-blue/10 text-primary-blue text-xs rounded-full">
            Con movilidad
          </span>
        )}
      </div>

      {/* Actions */}
      {showActions && match.estado === 'sugerido' && (
        <div className="flex space-x-2">
          <button
            onClick={() => onReject?.(match.id)}
            className="flex-1 flex items-center justify-center space-x-1 px-4 py-2 border border-neutral-300 text-neutral-600 rounded-lg hover:bg-neutral-50 transition-colors"
          >
            <XMarkIcon className="w-4 h-4" />
            <span>Rechazar</span>
          </button>
          
          <button
            onClick={() => onContact?.(match.id, 'chat')}
            className="flex-1 flex items-center justify-center space-x-1 px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-blue-dark transition-colors"
          >
            <ChatBubbleLeftRightIcon className="w-4 h-4" />
            <span>Contactar</span>
          </button>
          
          <button
            onClick={() => onAccept?.(match.id)}
            className="flex-1 flex items-center justify-center space-x-1 px-4 py-2 bg-secondary-green text-white rounded-lg hover:bg-secondary-green-dark transition-colors"
          >
            <CheckIcon className="w-4 h-4" />
            <span>Aceptar</span>
          </button>
        </div>
      )}

      {/* Contact Actions for Accepted Matches */}
      {match.estado === 'contactado' && (
        <div className="flex space-x-2">
          <button
            onClick={() => onContact?.(match.id, 'phone')}
            className="flex-1 flex items-center justify-center space-x-1 px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-blue-dark transition-colors"
          >
            <PhoneIcon className="w-4 h-4" />
            <span>Llamar</span>
          </button>
          
          <button
            onClick={() => onContact?.(match.id, 'whatsapp')}
            className="flex-1 flex items-center justify-center space-x-1 px-4 py-2 bg-secondary-green text-white rounded-lg hover:bg-secondary-green-dark transition-colors"
          >
            <ChatBubbleLeftRightIcon className="w-4 h-4" />
            <span>WhatsApp</span>
          </button>
        </div>
      )}

      {/* Status for Other States */}
      {match.estado !== 'sugerido' && match.estado !== 'contactado' && (
        <div className="text-center py-2">
          <span className={`text-sm ${
            match.estado === 'completado' ? 'text-secondary-green' :
            match.estado === 'rechazado' ? 'text-neutral-500' :
            'text-neutral-600'
          }`}>
            {match.estado === 'completado' && '✓ Trabajo completado'}
            {match.estado === 'rechazado' && '✗ Match rechazado'}
          </span>
        </div>
      )}
    </motion.div>
  );
}