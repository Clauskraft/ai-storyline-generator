/**
 * Authentication Middleware
 * Protects routes that require authentication
 */

import { authService } from '../services/authService.js';

/**
 * Middleware to verify JWT token
 */
export function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.substring(7);
    const user = authService.verifyToken(token);

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: error.message });
  }
}

/**
 * Middleware to optionally authenticate (for public routes with optional auth)
 */
export async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      req.user = await authService.verifyToken(token);
    }

    next();
  } catch (error) {
    // Continue without auth if token is invalid
    next();
  }
}

/**
 * Middleware to check if user has specific tier
 */
export function requireTier(...allowedTiers) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!allowedTiers.includes(req.user.tier)) {
      return res.status(403).json({ 
        error: 'Upgrade required',
        currentTier: req.user.tier,
        requiredTiers: allowedTiers
      });
    }

    next();
  };
}

/**
 * Middleware to check resource ownership
 */
export async function checkOwnership(tableName, idParam = 'id') {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[idParam];
      const userId = req.user.id;

      const result = await query(
        `SELECT user_id FROM ${tableName} WHERE id = $1`,
        [resourceId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Resource not found' });
      }

      if (result.rows[0].user_id !== userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      next();
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  };
}

