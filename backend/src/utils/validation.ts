import Joi from 'joi';

// Schemas de validación
export const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Email inválido',
    'any.required': 'Email es requerido'
  }),
  password: Joi.string().min(8).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])')).required().messages({
    'string.min': 'La contraseña debe tener al menos 8 caracteres',
    'string.pattern.base': 'La contraseña debe contener al menos: una minúscula, una mayúscula, un número y un símbolo',
    'any.required': 'Contraseña es requerida'
  }),
  tipo_usuario: Joi.string().valid('as', 'explorador', 'ambos').required().messages({
    'any.only': 'Tipo de usuario debe ser: as, explorador o ambos',
    'any.required': 'Tipo de usuario es requerido'
  }),
  nombre: Joi.string().min(2).max(100).required().messages({
    'string.min': 'El nombre debe tener al menos 2 caracteres',
    'string.max': 'El nombre no puede exceder 100 caracteres',
    'any.required': 'Nombre es requerido'
  }),
  apellido: Joi.string().min(2).max(100).required().messages({
    'string.min': 'El apellido debe tener al menos 2 caracteres',
    'string.max': 'El apellido no puede exceder 100 caracteres',
    'any.required': 'Apellido es requerido'
  }),
  dni: Joi.string().min(7).max(20).required().messages({
    'string.min': 'DNI inválido',
    'string.max': 'DNI inválido',
    'any.required': 'DNI es requerido'
  }),
  telefono: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required().messages({
    'string.pattern.base': 'Teléfono inválido',
    'any.required': 'Teléfono es requerido'
  }),
  fecha_nacimiento: Joi.date().max('now').iso().when('tipo_usuario', {
    is: Joi.string().valid('as', 'ambos'),
    then: Joi.required(),
    otherwise: Joi.optional()
  }).messages({
    'date.max': 'Fecha de nacimiento inválida',
    'any.required': 'Fecha de nacimiento es requerida para Ases'
  }),
  direccion: Joi.string().min(10).max(500).required().messages({
    'string.min': 'La dirección debe ser más específica',
    'string.max': 'La dirección es demasiado larga',
    'any.required': 'Dirección es requerida'
  }),
  localidad: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Localidad inválida',
    'any.required': 'Localidad es requerida'
  }),
  provincia: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Provincia inválida',
    'any.required': 'Provincia es requerida'
  }),
  codigo_postal: Joi.string().min(4).max(10).optional(),
  latitud: Joi.number().min(-90).max(90).optional(),
  longitud: Joi.number().min(-180).max(180).optional(),
  
  // Campos específicos para Ases
  nivel_educativo: Joi.string().valid('primario', 'secundario', 'terciario', 'universitario', 'posgrado').when('tipo_usuario', {
    is: Joi.string().valid('as', 'ambos'),
    then: Joi.optional(),
    otherwise: Joi.forbidden()
  }),
  referencias_laborales: Joi.string().max(1000).optional(),
  tiene_movilidad: Joi.boolean().default(false),
  
  // Términos y condiciones
  acepta_terminos: Joi.boolean().valid(true).required().messages({
    'any.only': 'Debes aceptar los términos y condiciones'
  })
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Email inválido',
    'any.required': 'Email es requerido'
  }),
  password: Joi.string().required().messages({
    'any.required': 'Contraseña es requerida'
  }),
  remember_me: Joi.boolean().default(false)
});

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Email inválido',
    'any.required': 'Email es requerido'
  })
});

export const resetPasswordSchema = Joi.object({
  token: Joi.string().required().messages({
    'any.required': 'Token es requerido'
  }),
  password: Joi.string().min(8).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])')).required().messages({
    'string.min': 'La contraseña debe tener al menos 8 caracteres',
    'string.pattern.base': 'La contraseña debe contener al menos: una minúscula, una mayúscula, un número y un símbolo',
    'any.required': 'Contraseña es requerida'
  }),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
    'any.only': 'Las contraseñas no coinciden',
    'any.required': 'Confirmación de contraseña es requerida'
  })
});

export const verifyEmailSchema = Joi.object({
  token: Joi.string().required().messages({
    'any.required': 'Token de verificación es requerido'
  })
});

// Validador general
export const validate = (schema: Joi.ObjectSchema) => {
  return (req: any, res: any, next: any) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({
        success: false,
        error: 'Datos inválidos',
        errors
      });
    }
    
    next();
  };
};