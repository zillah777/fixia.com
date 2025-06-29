import { motion } from 'framer-motion';
import { StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

interface Calificacion {
  id: string;
  match_id: string;
  calificador_id: string;
  calificado_id: string;
  puntuacion: number; // 1-5
  comentario: string;
  // Aspectos específicos según tabla calificaciones
  puntualidad: number; // 1-5
  calidad: number; // 1-5
  comunicacion: number; // 1-5
  precio_justo: number; // 1-5
  publica: boolean;
  created_at: Date;
  // Datos del calificador
  calificador: {
    nombre: string;
    apellido: string;
    foto_perfil?: string;
  };
  // Datos del servicio
  servicio?: {
    titulo: string;
  };
}

interface RatingDisplayProps {
  calificaciones: Calificacion[];
  showService?: boolean; // Para mostrar el servicio en el perfil del As
  loading?: boolean;
}

const aspectLabels = {
  puntualidad: 'Puntualidad',
  calidad: 'Calidad',
  comunicacion: 'Comunicación',
  precio_justo: 'Precio Justo'
};

export default function RatingDisplay({ 
  calificaciones, 
  showService = false, 
  loading = false 
}: RatingDisplayProps) {
  const renderStars = (rating: number, size: 'sm' | 'md' = 'sm') => {
    const starSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
    
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <div key={star}>
            {star <= rating ? (
              <StarSolidIcon className={`${starSize} text-yellow-500`} />
            ) : (
              <StarIcon className={`${starSize} text-neutral-300`} />
            )}
          </div>
        ))}
      </div>
    );
  };

  const getPromedioAspectos = (calificacion: Calificacion) => {
    return (
      (calificacion.puntualidad + calificacion.calidad + 
       calificacion.comunicacion + calificacion.precio_justo) / 4
    );
  };

  const getPromedioGeneral = () => {
    if (calificaciones.length === 0) return 0;
    const suma = calificaciones.reduce((acc, cal) => acc + cal.puntuacion, 0);
    return suma / calificaciones.length;
  };

  const getPromedioAspectosGeneral = () => {
    if (calificaciones.length === 0) return {
      puntualidad: 0,
      calidad: 0,
      comunicacion: 0,
      precio_justo: 0
    };

    const suma = calificaciones.reduce((acc, cal) => ({
      puntualidad: acc.puntualidad + cal.puntualidad,
      calidad: acc.calidad + cal.calidad,
      comunicacion: acc.comunicacion + cal.comunicacion,
      precio_justo: acc.precio_justo + cal.precio_justo
    }), { puntualidad: 0, calidad: 0, comunicacion: 0, precio_justo: 0 });

    return {
      puntualidad: suma.puntualidad / calificaciones.length,
      calidad: suma.calidad / calificaciones.length,
      comunicacion: suma.comunicacion / calificaciones.length,
      precio_justo: suma.precio_justo / calificaciones.length
    };
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-neutral-200 h-24 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (calificaciones.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">⭐</span>
        </div>
        <p className="text-neutral-600 mb-2">No hay reseñas aún</p>
        <p className="text-sm text-neutral-500">
          Las reseñas aparecerán aquí cuando completes tus primeros trabajos
        </p>
      </div>
    );
  }

  const promedioGeneral = getPromedioGeneral();
  const promedioAspectos = getPromedioAspectosGeneral();

  return (
    <div className="space-y-6">
      {/* Resumen General */}
      <div className="bg-gradient-to-r from-primary-blue/5 to-secondary-green/5 rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Calificación General */}
          <div className="text-center">
            <div className="text-3xl font-bold text-neutral-900 mb-2">
              {promedioGeneral.toFixed(1)}
            </div>
            <div className="flex justify-center mb-2">
              {renderStars(Math.round(promedioGeneral), 'md')}
            </div>
            <p className="text-sm text-neutral-600">
              Basado en {calificaciones.length} reseña{calificaciones.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Aspectos Específicos */}
          <div className="space-y-3">
            {Object.entries(aspectLabels).map(([key, label]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm text-neutral-700">{label}</span>
                <div className="flex items-center space-x-2">
                  {renderStars(Math.round(promedioAspectos[key as keyof typeof promedioAspectos]))}
                  <span className="text-sm font-medium text-neutral-600 w-8">
                    {promedioAspectos[key as keyof typeof promedioAspectos].toFixed(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lista de Reseñas */}
      <div className="space-y-4">
        {calificaciones.map((calificacion, index) => (
          <motion.div
            key={calificacion.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="bg-white border border-neutral-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
          >
            {/* Header de la reseña */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-neutral-200 rounded-full flex items-center justify-center overflow-hidden">
                  {calificacion.calificador.foto_perfil ? (
                    <img
                      src={calificacion.calificador.foto_perfil}
                      alt={`${calificacion.calificador.nombre} ${calificacion.calificador.apellido}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-neutral-400 font-medium">
                      {calificacion.calificador.nombre.charAt(0)}
                    </span>
                  )}
                </div>
                
                <div>
                  <h4 className="font-semibold text-neutral-900">
                    {calificacion.calificador.nombre} {calificacion.calificador.apellido}
                  </h4>
                  {showService && calificacion.servicio && (
                    <p className="text-sm text-neutral-600">{calificacion.servicio.titulo}</p>
                  )}
                </div>
              </div>
              
              <div className="text-right">
                <div className="flex items-center space-x-2 mb-1">
                  {renderStars(calificacion.puntuacion)}
                  <span className="font-semibold text-neutral-700">
                    {calificacion.puntuacion}/5
                  </span>
                </div>
                <p className="text-xs text-neutral-500">
                  {calificacion.created_at.toLocaleDateString('es-AR')}
                </p>
              </div>
            </div>

            {/* Comentario */}
            <p className="text-neutral-700 mb-4 leading-relaxed">
              {calificacion.comentario}
            </p>

            {/* Aspectos Específicos */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-neutral-50 rounded-lg">
              {Object.entries(aspectLabels).map(([key, label]) => (
                <div key={key} className="text-center">
                  <p className="text-xs text-neutral-600 mb-1">{label}</p>
                  <div className="flex justify-center mb-1">
                    {renderStars(calificacion[key as keyof typeof aspectLabels] as number)}
                  </div>
                  <p className="text-xs font-medium text-neutral-700">
                    {calificacion[key as keyof typeof aspectLabels]}/5
                  </p>
                </div>
              ))}
            </div>

            {/* Promedio de aspectos */}
            <div className="mt-3 text-center">
              <p className="text-sm text-neutral-600">
                Promedio de aspectos: 
                <span className="font-semibold text-primary-blue ml-1">
                  {getPromedioAspectos(calificacion).toFixed(1)}/5
                </span>
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}