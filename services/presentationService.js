/**
 * Presentation Service
 * Handles CRUD operations for presentations and slides
 */

import { query } from '../database/config.js';

class PresentationService {
  /**
   * Create a new presentation
   */
  async createPresentation(userId, presentationData) {
    const {
      title,
      description,
      brandKit,
      model,
      aiProvider,
      organizationId
    } = presentationData;

    const result = await query(
      `INSERT INTO presentations 
       (title, description, user_id, organization_id, brand_kit, model, ai_provider, settings)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        title || 'Untitled Presentation',
        description || null,
        userId,
        organizationId || null,
        JSON.stringify(brandKit || {}),
        model || 'standard',
        aiProvider || 'gemini',
        JSON.stringify({})
      ]
    );

    return this.serializePresentation(result.rows[0]);
  }

  /**
   * Get presentation by ID
   */
  async getPresentationById(presentationId, userId = null) {
    const result = await query(
      `SELECT p.*, 
              COUNT(DISTINCT s.id) as slide_count
       FROM presentations p
       LEFT JOIN slides s ON s.presentation_id = p.id
       WHERE p.id = $1 
       AND p.deleted_at IS NULL
       ${userId ? 'AND (p.user_id = $2 OR p.is_public = TRUE)' : ''}
       GROUP BY p.id`,
      userId ? [presentationId, userId] : [presentationId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const presentation = this.serializePresentation(result.rows[0]);

    // Load slides
    const slides = await this.getSlidesByPresentationId(presentationId);
    presentation.slides = slides;

    return presentation;
  }

  /**
   * List presentations for user
   */
  async listPresentations(userId, options = {}) {
    const {
      limit = 50,
      offset = 0,
      organizationId = null,
      search = null,
      sortBy = 'updated_at',
      sortOrder = 'DESC'
    } = options;

    let sql = `
      SELECT p.*,
             COUNT(DISTINCT s.id) as slide_count
      FROM presentations p
      LEFT JOIN slides s ON s.presentation_id = p.id
      WHERE p.deleted_at IS NULL
      AND (p.user_id = $1 OR p.is_public = TRUE)`;

    const params = [userId];
    let paramCount = 2;

    if (organizationId) {
      sql += ` AND p.organization_id = $${paramCount++}`;
      params.push(organizationId);
    }

    if (search) {
      sql += ` AND (p.title ILIKE $${paramCount} OR p.description ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    sql += ` GROUP BY p.id ORDER BY p.${sortBy} ${sortOrder} LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    params.push(limit, offset);

    const result = await query(sql, params);
    return result.rows.map(row => this.serializePresentation(row));
  }

  /**
   * Update presentation
   */
  async updatePresentation(presentationId, userId, updates) {
    // Verify ownership
    const existing = await query(
      'SELECT user_id FROM presentations WHERE id = $1',
      [presentationId]
    );

    if (existing.rows.length === 0) {
      throw new Error('Presentation not found');
    }

    if (existing.rows[0].user_id !== userId) {
      throw new Error('Access denied');
    }

    const fields = [];
    const values = [];
    let paramCount = 1;

    if (updates.title !== undefined) {
      fields.push(`title = $${paramCount++}`);
      values.push(updates.title);
    }

    if (updates.description !== undefined) {
      fields.push(`description = $${paramCount++}`);
      values.push(updates.description);
    }

    if (updates.brandKit !== undefined) {
      fields.push(`brand_kit = $${paramCount++}`);
      values.push(JSON.stringify(updates.brandKit));
    }

    if (updates.model !== undefined) {
      fields.push(`model = $${paramCount++}`);
      values.push(updates.model);
    }

    if (updates.isPublic !== undefined) {
      fields.push(`is_public = $${paramCount++}`);
      values.push(updates.isPublic);
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(presentationId);

    const result = await query(
      `UPDATE presentations SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    return this.serializePresentation(result.rows[0]);
  }

  /**
   * Delete presentation (soft delete)
   */
  async deletePresentation(presentationId, userId) {
    const result = await query(
      `UPDATE presentations 
       SET deleted_at = CURRENT_TIMESTAMP 
       WHERE id = $1 AND user_id = $2 
       RETURNING id`,
      [presentationId, userId]
    );

    if (result.rows.length === 0) {
      throw new Error('Presentation not found or access denied');
    }

    return true;
  }

  /**
   * Create or update slides
   */
  async saveSlides(presentationId, userId, slides) {
    // Verify ownership
    const existing = await query(
      'SELECT user_id FROM presentations WHERE id = $1',
      [presentationId]
    );

    if (existing.rows.length === 0) {
      throw new Error('Presentation not found');
    }

    if (existing.rows[0].user_id !== userId) {
      throw new Error('Access denied');
    }

    // Delete existing slides
    await query('DELETE FROM slides WHERE presentation_id = $1', [presentationId]);

    // Insert new slides
    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      await query(
        `INSERT INTO slides 
         (presentation_id, position, title, content, layout, image_url, image_prompt, speaker_notes, metadata)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          presentationId,
          i,
          slide.title || 'Untitled Slide',
          slide.content || '',
          slide.layout || 'TITLE_CONTENT',
          slide.imageUrl || null,
          slide.imagePrompt || null,
          slide.speakerNotes || null,
          JSON.stringify(slide.metadata || {})
        ]
      );
    }

    return await this.getSlidesByPresentationId(presentationId);
  }

  /**
   * Get slides for a presentation
   */
  async getSlidesByPresentationId(presentationId) {
    const result = await query(
      `SELECT * FROM slides 
       WHERE presentation_id = $1 
       ORDER BY position ASC`,
      [presentationId]
    );

    return result.rows.map(row => ({
      id: row.id,
      position: row.position,
      title: row.title,
      content: row.content,
      layout: row.layout,
      imageUrl: row.image_url,
      imagePrompt: row.image_prompt,
      speakerNotes: row.speaker_notes,
      metadata: row.metadata
    }));
  }

  /**
   * Create share link
   */
  async createShareLink(presentationId, userId, shareSettings) {
    const token = this.generateToken();
    
    const result = await query(
      `INSERT INTO share_links 
       (presentation_id, token, permissions, password_hash, expires_at, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        presentationId,
        token,
        shareSettings.permissions || 'view',
        shareSettings.passwordHash || null,
        shareSettings.expiresAt || null,
        userId
      ]
    );

    return result.rows[0];
  }

  /**
   * Get share link by token
   */
  async getShareLinkByToken(token) {
    const result = await query(
      `SELECT sl.*, p.title as presentation_title
       FROM share_links sl
       JOIN presentations p ON p.id = sl.presentation_id
       WHERE sl.token = $1 
       AND (sl.expires_at IS NULL OR sl.expires_at > CURRENT_TIMESTAMP)
       AND p.deleted_at IS NULL`,
      [token]
    );

    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Track share link access
   */
  async trackShareAccess(shareLinkId) {
    await query(
      'UPDATE share_links SET access_count = access_count + 1 WHERE id = $1',
      [shareLinkId]
    );
  }

  /**
   * Serialize presentation (convert JSONB fields)
   */
  serializePresentation(row) {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      userId: row.user_id,
      organizationId: row.organization_id,
      brandKit: typeof row.brand_kit === 'string' ? JSON.parse(row.brand_kit) : row.brand_kit,
      model: row.model,
      aiProvider: row.ai_provider,
      isTemplate: row.is_template,
      isPublic: row.is_public,
      shareToken: row.share_token,
      shareSettings: typeof row.share_settings === 'string' ? JSON.parse(row.share_settings) : row.share_settings,
      settings: typeof row.settings === 'string' ? JSON.parse(row.settings) : row.settings,
      metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      deletedAt: row.deleted_at,
      slideCount: row.slide_count
    };
  }

  /**
   * Generate share token
   */
  generateToken() {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 12)}`;
  }
}

export const presentationService = new PresentationService();

