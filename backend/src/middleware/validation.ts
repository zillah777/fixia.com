import { Request, Response, NextFunction } from 'express';
import { MulterRequest } from '@/types';
import { body, query, param, validationResult } from 'express-validator';
import { createError } from './errorHandler';

// Helper para manejar errores de validación
const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.type === 'field' ? error.path : 'unknown',
      message: error.msg,
      value: error.type === 'field' ? error.value : undefined
    }));
    
    return res.status(400).json({ 
      error: 'Datos de entrada inválidos',
      code: 'VALIDATION_ERROR',
      details: formattedErrors
    });
  }
  next();
};

// Validaciones para registro de usuario
export const validateRegister = [
  body('email')
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('Email demasiado largo'),
  
  body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('La contraseña debe tener entre 8 y 128 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('La contraseña debe contener al menos: 1 minúscula, 1 mayúscula, 1 número y 1 carácter especial'),
  
  body('tipo_usuario')
    .isIn(['as', 'explorador', 'ambos'])
    .withMessage('Tipo de usuario inválido'),
  
  body('acepta_terminos')
    .isBoolean()
    .withMessage('Debe aceptar los términos y condiciones')
    .custom(value => {
      if (!value) {
        throw new Error('Debe aceptar los términos y condiciones');
      }
      return true;
    }),
  
  body('nombre')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El nombre solo puede contener letras y espacios'),
  
  body('apellido')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El apellido debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El apellido solo puede contener letras y espacios'),
  
  body('telefono')
    .isMobilePhone('es-AR')
    .withMessage('Número de teléfono argentino inválido'),
  
  body('fecha_nacimiento')
    .optional()
    .isISO8601()
    .withMessage('Fecha de nacimiento inválida')
    .custom(value => {
      if (value) {
        const age = new Date().getFullYear() - new Date(value).getFullYear();
        if (age < 18 || age > 100) {
          throw new Error('Debes tener entre 18 y 100 años');
        }
      }
      return true;
    }),
  
  handleValidationErrors
];

// Validaciones para login
export const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida')
    .isLength({ max: 128 })
    .withMessage('Contraseña demasiado larga'),
  
  body('remember_me')
    .optional()
    .isBoolean()
    .withMessage('Remember me debe ser boolean'),
  
  handleValidationErrors
];

// Validaciones para servicios
export const validateService = [
  body('titulo')
    .trim()
    .isLength({ min: 10, max: 200 })
    .withMessage('El título debe tener entre 10 y 200 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\-_.,!()]+$/)
    .withMessage('El título contiene caracteres no válidos'),
  
  body('descripcion')
    .trim()
    .isLength({ min: 50, max: 1000 })
    .withMessage('La descripción debe tener entre 50 y 1000 caracteres'),
  
  body('precio_desde')
    .isFloat({ min: 100, max: 999999 })
    .withMessage('El precio debe ser mínimo $100 y máximo $999,999'),
  
  body('precio_hasta')
    .optional()
    .isFloat({ min: 100 })
    .withMessage('El precio hasta debe ser mínimo $100')
    .custom((value, { req }) => {
      if (value && req.body.precio_desde && value <= req.body.precio_desde) {
        throw new Error('El precio hasta debe ser mayor al precio desde');
      }
      return true;
    }),
  
  body('tipo_precio')
    .isIn(['fijo', 'por_hora', 'presupuesto'])
    .withMessage('Tipo de precio inválido'),
  
  body('categoria_id')
    .isUUID()
    .withMessage('Categoría inválida'),
  
  body('urgente')
    .optional()
    .isBoolean()
    .withMessage('Urgente debe ser boolean'),
  
  body('trabajo_remoto')
    .optional()
    .isBoolean()
    .withMessage('Trabajo remoto debe ser boolean'),
  
  body('tags')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Máximo 10 tags permitidos'),
  
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 2, max: 30 })
    .withMessage('Cada tag debe tener entre 2 y 30 caracteres'),
  
  handleValidationErrors
];

// Validaciones para búsquedas
export const validateBusqueda = [
  body('titulo')
    .trim()
    .isLength({ min: 10, max: 200 })
    .withMessage('El título debe tener entre 10 y 200 caracteres'),
  
  body('descripcion')
    .trim()
    .isLength({ min: 20, max: 1000 })
    .withMessage('La descripción debe tener entre 20 y 1000 caracteres'),
  
  body('categoria_id')
    .optional()
    .isUUID()
    .withMessage('Categoría inválida'),
  
  body('presupuesto_minimo')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El presupuesto mínimo debe ser mayor a 0'),
  
  body('presupuesto_maximo')
    .optional()
    .isFloat({ min: 100 })
    .withMessage('El presupuesto máximo debe ser mínimo $100')
    .custom((value, { req }) => {
      if (value && req.body.presupuesto_minimo && value <= req.body.presupuesto_minimo) {
        throw new Error('El presupuesto máximo debe ser mayor al mínimo');
      }
      return true;
    }),
  
  body('direccion_trabajo')
    .optional()
    .trim()
    .isLength({ min: 10, max: 255 })
    .withMessage('La dirección debe tener entre 10 y 255 caracteres'),
  
  body('latitud_trabajo')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitud inválida'),
  
  body('longitud_trabajo')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitud inválida'),
  
  body('radio_busqueda')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('El radio de búsqueda debe estar entre 1 y 100 km'),
  
  body('fecha_necesaria')
    .optional()
    .isISO8601()
    .withMessage('Fecha necesaria inválida')
    .custom(value => {
      if (value && new Date(value) < new Date()) {
        throw new Error('La fecha necesaria no puede ser en el pasado');
      }
      return true;
    }),
  
  body('urgente')
    .optional()
    .isBoolean()
    .withMessage('Urgente debe ser boolean'),
  
  handleValidationErrors
];

// Validaciones para perfil de As
export const validatePerfilAs = [
  body('descripcion_servicios')
    .optional()
    .trim()
    .isLength({ min: 50, max: 1000 })
    .withMessage('La descripción de servicios debe tener entre 50 y 1000 caracteres'),
  
  body('experiencia_anos')
    .optional()
    .isInt({ min: 0, max: 50 })
    .withMessage('Los años de experiencia deben estar entre 0 y 50'),
  
  body('nivel_educativo')
    .optional()
    .isIn(['primario', 'secundario', 'terciario', 'universitario', 'posgrado'])
    .withMessage('Nivel educativo inválido'),
  
  body('profesional_verificado')
    .optional()
    .isBoolean()
    .withMessage('Profesional verificado debe ser boolean'),
  
  body('tiene_movilidad')
    .optional()
    .isBoolean()
    .withMessage('Tiene movilidad debe ser boolean'),
  
  body('radio_trabajo')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('El radio de trabajo debe estar entre 1 y 100 km'),
  
  body('monto_minimo_trabajo')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El monto mínimo debe ser mayor o igual a 0'),
  
  body('disponibilidad_horaria')
    .optional()
    .isArray()
    .withMessage('Disponibilidad horaria debe ser un array'),
  
  body('servicios_principales')
    .optional()
    .isArray({ max: 5 })
    .withMessage('Máximo 5 servicios principales'),
  
  handleValidationErrors
];

// Validaciones para consultas de búsqueda
export const validateSearchQuery = [
  query('q')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('La consulta debe tener entre 2 y 100 caracteres'),
  
  query('categoria')
    .optional()
    .isUUID()
    .withMessage('Categoría inválida'),
  
  query('lat')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitud inválida'),
  
  query('lng')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitud inválida'),
  
  query('radio')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('El radio debe estar entre 1 y 100 km'),
  
  query('precio_min')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Precio mínimo inválido'),
  
  query('precio_max')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Precio máximo inválido'),
  
  query('pagina')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Número de página inválido'),
  
  query('limite')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Límite debe estar entre 1 y 50'),
  
  query('ordenar')
    .optional()
    .isIn(['precio_asc', 'precio_desc', 'distancia', 'rating', 'reciente'])
    .withMessage('Orden inválido'),
  
  handleValidationErrors
];

// Validaciones para parámetros UUID
export const validateUUIDParam = (paramName: string = 'id') => [
  param(paramName)
    .isUUID()
    .withMessage(`${paramName} debe ser un UUID válido`),
  
  handleValidationErrors
];

// Validaciones para paginación
export const validatePagination = [
  query('pagina')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Página debe estar entre 1 y 1000'),
  
  query('limite')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Límite debe estar entre 1 y 100'),
  
  handleValidationErrors
];

// Validación para subida de archivos
export const validateFileUpload = (req: MulterRequest, res: Response, next: NextFunction) => {
  if (!req.file && !req.files) {
    return res.status(400).json({
      error: 'No se ha subido ningún archivo',
      code: 'NO_FILE_UPLOADED'
    });
  }

  const file = req.file || (Array.isArray(req.files) ? req.files[0] : req.files);
  
  // Validar tamaño (máximo 5MB)
  if (file.size > 5 * 1024 * 1024) {
    return res.status(400).json({
      error: 'El archivo es demasiado grande (máximo 5MB)',
      code: 'FILE_TOO_LARGE'
    });
  }

  // Validar tipo de archivo para imágenes
  const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (req.path.includes('foto') || req.path.includes('image')) {
    if (!allowedImageTypes.includes(file.mimetype)) {
      return res.status(400).json({
        error: 'Tipo de archivo no permitido. Use JPEG, PNG o WebP',
        code: 'INVALID_FILE_TYPE'
      });
    }
  }

  next();
};

// Sanitización de texto para prevenir XSS
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  const sanitizeString = (str: string): string => {
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remover scripts
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Remover iframes
      .replace(/javascript:/gi, '') // Remover javascript:
      .replace(/on\w+\s*=/gi, ''); // Remover event handlers
  };

  const sanitizeObject = (obj: any): any => {
    if (typeof obj === 'string') {
      return sanitizeString(obj);
    }
    if (typeof obj === 'object' && obj !== null) {
      const sanitized: any = Array.isArray(obj) ? [] : {};
      for (const key in obj) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
      return sanitized;
    }
    return obj;
  };

  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }

  next();
};

// Validación de rate limiting personalizada
export const validateRateLimit = (windowMs: number, maxRequests: number, message?: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Esta validación se integra con el middleware de rate limiting
    req.rateLimit = {
      windowMs,
      maxRequests,
      message: message || `Demasiadas solicitudes. Máximo ${maxRequests} por ${windowMs / 1000} segundos.`
    };
    next();
  };
};

// Validación de geolocalización
export const validateGeolocation = [
  body('latitud')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitud debe estar entre -90 y 90'),
  
  body('longitud')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitud debe estar entre -180 y 180'),
  
  body('direccion')
    .optional()
    .trim()
    .isLength({ min: 10, max: 255 })
    .withMessage('La dirección debe tener entre 10 y 255 caracteres'),
  
  handleValidationErrors
];

// Middleware para validar datos sensibles
export const validateSensitiveData = (req: Request, res: Response, next: NextFunction) => {
  const sensitiveFields = ['password', 'token', 'credit_card', 'ssn'];
  const body = JSON.stringify(req.body).toLowerCase();
  
  // Verificar que no se estén enviando datos sensibles en logs
  for (const field of sensitiveFields) {
    if (body.includes(field)) {
      console.warn(`⚠️  Campo sensible detectado en request: ${field}`);
    }
  }
  
  next();
};