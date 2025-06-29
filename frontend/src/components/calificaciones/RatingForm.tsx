import { useState } from 'react';
import { motion } from 'framer-motion';
import { StarIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

interface RatingFormProps {
  matchId: string;
  calificadoId: string;
  calificadoNombre: string;
  servicioTitulo: string;
  onClose: () => void;
  onSubmit: (rating: RatingData) => void;
}

interface RatingData {
  match_id: string;
  calificado_id: string;
  puntuacion: number; // 1-5
  comentario: string;
  // Aspectos específicos según tabla calificaciones
  puntualidad: number; // 1-5
  calidad: number; // 1-5
  comunicacion: number; // 1-5
  precio_justo: number; // 1-5
  publica: boolean;
}

const aspectos = [
  {
    key: 'puntualidad' as keyof RatingData,
    label: 'Puntualidad',
    description: '¿Llegó a tiempo?'
  },
  {
    key: 'calidad' as keyof RatingData,
    label: 'Calidad del Trabajo',
    description: '¿Quedaste satisfecho con el resultado?'
  },
  {
    key: 'comunicacion' as keyof RatingData,
    label: 'Comunicación',
    description: '¿Fue claro y respondió rápido?'
  },
  {
    key: 'precio_justo' as keyof RatingData,
    label: 'Precio Justo',
    description: '¿El precio fue acorde al trabajo?'
  }
];

export default function RatingForm({ 
  matchId, 
  calificadoId, 
  calificadoNombre, 
  servicioTitulo, 
  onClose, 
  onSubmit 
}: RatingFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<RatingData>({
    match_id: matchId,
    calificado_id: calificadoId,
    puntuacion: 0,
    comentario: '',
    puntualidad: 0,
    calidad: 0,
    comunicacion: 0,
    precio_justo: 0,
    publica: true
  });

  const handleStarClick = (field: keyof RatingData, rating: number) => {
    setFormData({
      ...formData,
      [field]: rating
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones
    if (formData.puntuacion === 0) {
      toast.error('Selecciona una calificación general');
      return;
    }
    
    if (formData.puntualidad === 0 || formData.calidad === 0 || 
        formData.comunicacion === 0 || formData.precio_justo === 0) {
      toast.error('Califica todos los aspectos');
      return;
    }
    
    if (formData.comentario.trim().length < 10) {
      toast.error('El comentario debe tener al menos 10 caracteres');
      return;
    }

    setLoading(true);
    
    try {
      await onSubmit(formData);
      toast.success('¡Calificación enviada correctamente!');
      onClose();
    } catch (error) {
      toast.error('Error al enviar la calificación');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (field: keyof RatingData, value: number) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleStarClick(field, star)}
            className="focus:outline-none transition-colors"
          >
            {star <= value ? (
              <StarSolidIcon className="w-6 h-6 text-yellow-500" />
            ) : (
              <StarIcon className="w-6 h-6 text-neutral-300 hover:text-yellow-400" />
            )}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">
              Calificar Servicio
            </h2>
            <p className="text-neutral-600 mt-1">
              {servicioTitulo} - {calificadoNombre}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Calificación General */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-3">
              Calificación General *
            </label>
            <div className="flex items-center space-x-4">
              {renderStars('puntuacion', formData.puntuacion)}
              <span className="text-lg font-semibold text-neutral-700">
                {formData.puntuacion > 0 && `${formData.puntuacion}/5`}
              </span>
            </div>
          </div>

          {/* Aspectos Específicos */}
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">
              Califica aspectos específicos *
            </h3>
            <div className="space-y-4">
              {aspectos.map((aspecto) => (
                <div key={aspecto.key} className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-neutral-900">{aspecto.label}</h4>
                    <p className="text-sm text-neutral-600">{aspecto.description}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    {renderStars(aspecto.key, formData[aspecto.key] as number)}
                    <span className="text-sm font-medium text-neutral-700 w-8">
                      {(formData[aspecto.key] as number) > 0 && formData[aspecto.key]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Comentario */}
          <div>
            <label htmlFor="comentario" className="block text-sm font-medium text-neutral-700 mb-2">
              Comentario *
            </label>
            <textarea
              id="comentario"
              value={formData.comentario}
              onChange={(e) => setFormData({ ...formData, comentario: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all"
              placeholder="Describe tu experiencia con este servicio..."
            />
            <p className="text-sm text-neutral-500 mt-1">
              {formData.comentario.length} caracteres (mínimo 10)
            </p>
          </div>

          {/* Visibilidad */}
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="publica"
              checked={formData.publica}
              onChange={(e) => setFormData({ ...formData, publica: e.target.checked })}
              className="mt-1 rounded border-neutral-300 text-primary-blue focus:ring-primary-blue"
            />
            <div>
              <label htmlFor="publica" className="font-medium text-neutral-900 cursor-pointer">
                Hacer pública esta reseña
              </label>
              <p className="text-sm text-neutral-600">
                Si está marcado, otros usuarios podrán ver tu reseña en el perfil del prestador
              </p>
            </div>
          </div>

          {/* Resumen de calificación */}
          {formData.puntuacion > 0 && (
            <div className="bg-neutral-50 rounded-lg p-4">
              <h4 className="font-medium text-neutral-900 mb-2">Resumen de tu calificación</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-neutral-600">General:</span>
                  <span className="font-medium ml-2">{formData.puntuacion}/5</span>
                </div>
                {aspectos.map((aspecto) => (
                  <div key={aspecto.key}>
                    <span className="text-neutral-600">{aspecto.label}:</span>
                    <span className="font-medium ml-2">
                      {formData[aspecto.key] || 0}/5
                    </span>
                  </div>
                ))}
              </div>
              
              {/* Promedio */}
              <div className="mt-3 pt-3 border-t">
                <span className="text-neutral-600">Promedio de aspectos:</span>
                <span className="font-semibold ml-2 text-primary-blue">
                  {(
                    (formData.puntualidad + formData.calidad + formData.comunicacion + formData.precio_justo) / 4
                  ).toFixed(1)}/5
                </span>
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
            >
              Cancelar
            </button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-primary-blue text-white rounded-lg font-semibold hover:bg-primary-blue-dark transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              {loading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              <span>{loading ? 'Enviando...' : 'Enviar Calificación'}</span>
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}