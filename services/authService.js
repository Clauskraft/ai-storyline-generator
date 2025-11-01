/**
 * Authentication Service
 * Handles user registration, login, JWT tokens, and password management
 */

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../database/config.js';

const SALT_ROUNDS = 12;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

class AuthService {
  /**
   * Register a new user
   */
  async register(email, password, fullName = null) {
    // Validate input
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }

    // Check if user already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (existingUser.rows.length > 0) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const result = await query(
      `INSERT INTO users (email, password_hash, full_name, email_verification_token)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, full_name, tier, created_at`,
      [
        email.toLowerCase(),
        passwordHash,
        fullName,
        this.generateToken()
      ]
    );

    return result.rows[0];
  }

  /**
   * Login and generate JWT token
   */
  async login(email, password) {
    // Find user
    const result = await query(
      'SELECT id, email, password_hash, full_name, tier, email_verified FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      throw new Error('Invalid email or password');
    }

    const user = result.rows[0];

    // Verify password
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      throw new Error('Invalid email or password');
    }

    // Update last login
    await query(
      'UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );

    // Generate JWT token
    const token = this.generateToken(user.id, email);

    // Return user data (without password)
    const { password_hash, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      token
    };
  }

  /**
   * Verify JWT token
   */
  async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Get fresh user data
      const result = await query(
        'SELECT id, email, full_name, tier, email_verified FROM users WHERE id = $1',
        [decoded.userId]
      );

      if (result.rows.length === 0) {
        throw new Error('User not found');
      }

      return result.rows[0];
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Generate JWT token
   */
  generateToken(userId, email) {
    if (!userId || !email) {
      // Generate random token for verification/reset
      return Math.random().toString(36).substring(2, 15) + 
             Math.random().toString(36).substring(2, 15);
    }

    return jwt.sign(
      { userId, email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email) {
    const token = this.generateToken();
    const expires = new Date(Date.now() + 3600000); // 1 hour

    const result = await query(
      `UPDATE users 
       SET password_reset_token = $1, password_reset_expires = $2
       WHERE email = $3
       RETURNING id, email`,
      [token, expires, email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      throw new Error('User not found');
    }

    return { token, email: result.rows[0].email };
  }

  /**
   * Reset password
   */
  async resetPassword(token, newPassword) {
    if (newPassword.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }

    // Verify token and expiry
    const result = await query(
      `SELECT id FROM users 
       WHERE password_reset_token = $1 
       AND password_reset_expires > CURRENT_TIMESTAMP`,
      [token]
    );

    if (result.rows.length === 0) {
      throw new Error('Invalid or expired reset token');
    }

    const userId = result.rows[0].id;

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    // Update password and clear reset token
    await query(
      `UPDATE users 
       SET password_hash = $1, 
           password_reset_token = NULL, 
           password_reset_expires = NULL
       WHERE id = $2`,
      [passwordHash, userId]
    );

    return true;
  }

  /**
   * Verify email
   */
  async verifyEmail(token) {
    const result = await query(
      `UPDATE users 
       SET email_verified = TRUE, email_verification_token = NULL
       WHERE email_verification_token = $1
       RETURNING id, email`,
      [token]
    );

    if (result.rows.length === 0) {
      throw new Error('Invalid verification token');
    }

    return result.rows[0];
  }

  /**
   * Get user by ID
   */
  async getUserById(userId) {
    const result = await query(
      'SELECT id, email, full_name, avatar_url, tier, email_verified, settings FROM users WHERE id = $1',
      [userId]
    );

    return result.rows[0] || null;
  }

  /**
   * Update user profile
   */
  async updateProfile(userId, updates) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (updates.fullName !== undefined) {
      fields.push(`full_name = $${paramCount++}`);
      values.push(updates.fullName);
    }

    if (updates.avatarUrl !== undefined) {
      fields.push(`avatar_url = $${paramCount++}`);
      values.push(updates.avatarUrl);
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(userId);
    const result = await query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount}
       RETURNING id, email, full_name, avatar_url, tier`,
      values
    );

    return result.rows[0];
  }

  /**
   * Change password
   */
  async changePassword(userId, oldPassword, newPassword) {
    if (newPassword.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }

    // Get current password
    const result = await query(
      'SELECT password_hash FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      throw new Error('User not found');
    }

    // Verify old password
    const isValid = await bcrypt.compare(oldPassword, result.rows[0].password_hash);
    if (!isValid) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    // Update password
    await query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [passwordHash, userId]
    );

    return true;
  }
}

export const authService = new AuthService();

