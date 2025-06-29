import { query } from '@/config/database';
import { Usuario, PerfilAs, PerfilExplorador } from '@/types';

export class User {
  static async create(userData: {
    email: string;
    password_hash: string;
    tipo_usuario: string;
    token_verificacion?: string;
  }): Promise<Usuario> {
    const result = await query(
      `INSERT INTO usuarios (email, password_hash, tipo_usuario, token_verificacion)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [userData.email, userData.password_hash, userData.tipo_usuario, userData.token_verificacion]
    );
    
    return result.rows[0];
  }

  static async findByEmail(email: string): Promise<Usuario | null> {
    const result = await query(
      'SELECT * FROM usuarios WHERE email = $1',
      [email]
    );
    
    return result.rows[0] || null;
  }

  static async findById(id: string): Promise<Usuario | null> {
    const result = await query(
      'SELECT * FROM usuarios WHERE id = $1',
      [id]
    );
    
    return result.rows[0] || null;
  }

  static async findByVerificationToken(token: string): Promise<Usuario | null> {
    const result = await query(
      'SELECT * FROM usuarios WHERE token_verificacion = $1',
      [token]
    );
    
    return result.rows[0] || null;
  }

  static async findByResetToken(token: string): Promise<Usuario | null> {
    const result = await query(
      'SELECT * FROM usuarios WHERE reset_password_token = $1 AND reset_password_expires > NOW()',
      [token]
    );
    
    return result.rows[0] || null;
  }

  static async verifyEmail(token: string): Promise<boolean> {
    const result = await query(
      `UPDATE usuarios 
       SET email_verificado = true, token_verificacion = null, estado = 'verificado', updated_at = NOW()
       WHERE token_verificacion = $1
       RETURNING id`,
      [token]
    );
    
    return result.rows.length > 0;
  }

  static async updatePassword(userId: string, hashedPassword: string): Promise<boolean> {
    const result = await query(
      `UPDATE usuarios 
       SET password_hash = $1, reset_password_token = null, reset_password_expires = null, updated_at = NOW()
       WHERE id = $2
       RETURNING id`,
      [hashedPassword, userId]
    );
    
    return result.rows.length > 0;
  }

  static async setResetPasswordToken(email: string, token: string, expiresAt: Date): Promise<boolean> {
    const result = await query(
      `UPDATE usuarios 
       SET reset_password_token = $1, reset_password_expires = $2, updated_at = NOW()
       WHERE email = $3
       RETURNING id`,
      [token, expiresAt, email]
    );
    
    return result.rows.length > 0;
  }

  static async updateLastAccess(userId: string): Promise<void> {
    await query(
      'UPDATE usuarios SET ultimo_acceso = NOW() WHERE id = $1',
      [userId]
    );
  }

  static async incrementFailedAttempts(email: string): Promise<void> {
    await query(
      `UPDATE usuarios 
       SET intentos_fallidos = intentos_fallidos + 1,
           bloqueado_hasta = CASE 
             WHEN intentos_fallidos >= 4 THEN NOW() + INTERVAL '15 minutes'
             ELSE bloqueado_hasta
           END,
           updated_at = NOW()
       WHERE email = $1`,
      [email]
    );
  }

  static async resetFailedAttempts(email: string): Promise<void> {
    await query(
      `UPDATE usuarios 
       SET intentos_fallidos = 0, bloqueado_hasta = null, updated_at = NOW()
       WHERE email = $1`,
      [email]
    );
  }

  static async getUserWithProfiles(userId: string): Promise<{
    user: Usuario;
    perfilAs?: PerfilAs;
    perfilExplorador?: PerfilExplorador;
  } | null> {
    const userResult = await query(
      'SELECT * FROM usuarios WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return null;
    }

    const user = userResult.rows[0];
    const response: any = { user };

    // Obtener perfil de As si corresponde
    if (user.tipo_usuario === 'as' || user.tipo_usuario === 'ambos') {
      const asResult = await query(
        'SELECT * FROM perfiles_ases WHERE usuario_id = $1',
        [userId]
      );
      if (asResult.rows.length > 0) {
        response.perfilAs = asResult.rows[0];
      }
    }

    // Obtener perfil de Explorador si corresponde
    if (user.tipo_usuario === 'explorador' || user.tipo_usuario === 'ambos') {
      const exploradorResult = await query(
        'SELECT * FROM perfiles_exploradores WHERE usuario_id = $1',
        [userId]
      );
      if (exploradorResult.rows.length > 0) {
        response.perfilExplorador = exploradorResult.rows[0];
      }
    }

    return response;
  }
}

export class PerfilAsModel {
  static async create(profileData: Partial<PerfilAs>): Promise<PerfilAs> {
    const {
      usuario_id, nombre, apellido, dni, fecha_nacimiento, telefono,
      direccion, localidad, provincia, codigo_postal, latitud, longitud,
      nivel_educativo, referencias_laborales, tiene_movilidad
    } = profileData;

    const result = await query(
      `INSERT INTO perfiles_ases (
        usuario_id, nombre, apellido, dni, fecha_nacimiento, telefono,
        direccion, localidad, provincia, codigo_postal, latitud, longitud,
        nivel_educativo, referencias_laborales, tiene_movilidad
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *`,
      [
        usuario_id, nombre, apellido, dni, fecha_nacimiento, telefono,
        direccion, localidad, provincia, codigo_postal, latitud, longitud,
        nivel_educativo, referencias_laborales, tiene_movilidad || false
      ]
    );
    
    return result.rows[0];
  }

  static async findByUserId(userId: string): Promise<PerfilAs | null> {
    const result = await query(
      'SELECT * FROM perfiles_ases WHERE usuario_id = $1',
      [userId]
    );
    
    return result.rows[0] || null;
  }

  static async update(userId: string, updates: Partial<PerfilAs>): Promise<PerfilAs | null> {
    const setClause = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');
    
    const values = [userId, ...Object.values(updates)];
    
    const result = await query(
      `UPDATE perfiles_ases SET ${setClause}, updated_at = NOW() WHERE usuario_id = $1 RETURNING *`,
      values
    );
    
    return result.rows[0] || null;
  }
}

export class PerfilExploradorModel {
  static async create(profileData: Partial<PerfilExplorador>): Promise<PerfilExplorador> {
    const {
      usuario_id, nombre, apellido, dni, telefono,
      direccion, localidad, provincia, codigo_postal, latitud, longitud
    } = profileData;

    const result = await query(
      `INSERT INTO perfiles_exploradores (
        usuario_id, nombre, apellido, dni, telefono,
        direccion, localidad, provincia, codigo_postal, latitud, longitud
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        usuario_id, nombre, apellido, dni, telefono,
        direccion, localidad, provincia, codigo_postal, latitud, longitud
      ]
    );
    
    return result.rows[0];
  }

  static async findByUserId(userId: string): Promise<PerfilExplorador | null> {
    const result = await query(
      'SELECT * FROM perfiles_exploradores WHERE usuario_id = $1',
      [userId]
    );
    
    return result.rows[0] || null;
  }

  static async update(userId: string, updates: Partial<PerfilExplorador>): Promise<PerfilExplorador | null> {
    const setClause = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');
    
    const values = [userId, ...Object.values(updates)];
    
    const result = await query(
      `UPDATE perfiles_exploradores SET ${setClause}, updated_at = NOW() WHERE usuario_id = $1 RETURNING *`,
      values
    );
    
    return result.rows[0] || null;
  }
}