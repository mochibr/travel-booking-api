const db = require('../config/database');

class HotelFeature {
  static async create(featureData) {
    const { hotel_id, feature_ids } = featureData;
    
    // Validate input
    if (!hotel_id || !feature_ids || !Array.isArray(feature_ids) || feature_ids.length === 0) {
      throw new Error('hotel_id and feature_ids array are required');
    }

    try {
      // Convert array to comma-separated string
      const featureIdsString = feature_ids.join(',');
      
      const [result] = await db.execute(
        'INSERT INTO hotel_feature (hotel_id, feature_id) VALUES (?, ?)',
        [hotel_id, featureIdsString]
      );
      
      return result.insertId;
    } catch (error) {
      throw new Error(`Failed to create hotel features: ${error.message}`);
    }
  }

  static async update(hotelId, featureIds) {
    // Validate input
    if (!hotelId || !featureIds || !Array.isArray(featureIds)) {
      throw new Error('hotel_id and feature_ids array are required');
    }

    try {
      // Convert array to comma-separated string
      const featureIdsString = featureIds.join(',');
      
      // Check if record exists for this hotel
      const [existing] = await db.execute(
        'SELECT id FROM hotel_feature WHERE hotel_id = ?',
        [hotelId]
      );

      if (existing.length > 0) {
        // Update existing record
        const [result] = await db.execute(
          'UPDATE hotel_feature SET feature_id = ?, updated_at = CURRENT_TIMESTAMP WHERE hotel_id = ?',
          [featureIdsString, hotelId]
        );
        return result.affectedRows > 0;
      } else {
        // Create new record
        const [result] = await db.execute(
          'INSERT INTO hotel_feature (hotel_id, feature_id) VALUES (?, ?)',
          [hotelId, featureIdsString]
        );
        return result.insertId;
      }
    } catch (error) {
      throw new Error(`Failed to update hotel features: ${error.message}`);
    }
  }

  static async findAllWithPagination(options = {}) {
    const {
      hotel_id = null,
      search = '',
      page = 1,
      limit = 10,
      sort_by = 'hf.id',
      sort_order = 'DESC'
    } = options;

    // Calculate offset
    const offset = (page - 1) * limit;

    // Build WHERE clause
    let whereConditions = [];
    const queryParams = [];

    // Add hotel_id condition if provided
    if (hotel_id) {
      whereConditions.push('hf.hotel_id = ?');
      queryParams.push(hotel_id);
    }

    // Add search condition if provided
    if (search) {
      whereConditions.push('(h.name LIKE ? OR hf.feature_id LIKE ?)');
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm);
    }

    // Combine WHERE conditions
    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : '';

    // Validate sort_by to prevent SQL injection
    const allowedSortColumns = ['hf.id', 'h.name', 'hf.created_at', 'hf.updated_at', 'hf.hotel_id'];
    const safeSortBy = allowedSortColumns.includes(sort_by) ? sort_by : 'hf.id';
    const safeSortOrder = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Main query with pagination
    const query = `
      SELECT 
        hf.id,
        hf.hotel_id,
        hf.feature_id,
        hf.created_at,
        hf.updated_at,
        h.name as hotel_name
      FROM hotel_feature hf 
      JOIN hotel h ON hf.hotel_id = h.id
      ${whereClause}
      ORDER BY ${safeSortBy} ${safeSortOrder}
      LIMIT ? OFFSET ?
    `;

    // Count query for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM hotel_feature hf 
      JOIN hotel h ON hf.hotel_id = h.id
      ${whereClause}
    `;

    try {
      // Execute both queries
      const [features] = await db.execute(query, [...queryParams, parseInt(limit), offset]);
      
      // For each feature record, get the individual feature details
      const featuresWithDetails = await Promise.all(
        features.map(async (feature) => {
          const featureIds = feature.feature_id.split(',').map(id => parseInt(id.trim()));
          
          if (featureIds.length === 0) {
            return {
              ...feature,
              features: []
            };
          }

          // Get feature details for each ID
          const placeholders = featureIds.map(() => '?').join(',');
          const [featureDetails] = await db.execute(
            `SELECT id, name, icon FROM hotel_feature_type WHERE id IN (${placeholders})`,
            featureIds
          );

          return {
            ...feature,
            features: featureDetails
          };
        })
      );

      const [countResult] = await db.execute(countQuery, queryParams);

      const totalRecords = countResult[0].total;
      const totalPages = Math.ceil(totalRecords / limit);

      return {
        features: featuresWithDetails,
        pagination: {
          current_page: parseInt(page),
          total_pages: totalPages,
          total_records: totalRecords,
          has_next: page < totalPages,
          has_prev: page > 1,
          limit: parseInt(limit)
        }
      };
    } catch (error) {
      console.error('Database error in findAllWithPagination:', error);
      throw new Error(`Failed to fetch hotel features: ${error.message}`);
    }
  }

  static async findById(id) {
    try {
      const [rows] = await db.execute(
        `SELECT 
          hf.id,
          hf.hotel_id,
          hf.feature_id,
          hf.created_at,
          hf.updated_at,
          h.name as hotel_name
        FROM hotel_feature hf 
        JOIN hotel h ON hf.hotel_id = h.id
        WHERE hf.id = ?`,
        [id]
      );

      if (rows.length === 0) {
        return null;
      }

      const hotelFeature = rows[0];
      const featureIds = hotelFeature.feature_id.split(',').map(id => parseInt(id.trim()));
      
      if (featureIds.length === 0) {
        return {
          ...hotelFeature,
          features: []
        };
      }

      // Get feature details for each ID
      const placeholders = featureIds.map(() => '?').join(',');
      const [featureDetails] = await db.execute(
        `SELECT id, name, icon FROM hotel_feature_type WHERE id IN (${placeholders})`,
        featureIds
      );

      return {
        ...hotelFeature,
        features: featureDetails
      };
    } catch (error) {
      throw new Error(`Failed to fetch hotel feature: ${error.message}`);
    }
  }

  static async findByHotelId(hotelId) {
    try {
      const [rows] = await db.execute(
        `SELECT 
          hf.id,
          hf.hotel_id,
          hf.feature_id,
          hf.created_at,
          hf.updated_at,
          h.name as hotel_name
        FROM hotel_feature hf 
        JOIN hotel h ON hf.hotel_id = h.id
        WHERE hf.hotel_id = ?`,
        [hotelId]
      );

      if (rows.length === 0) {
        return [];
      }

      const hotelFeature = rows[0];
      const featureIds = hotelFeature.feature_id.split(',').map(id => parseInt(id.trim()));
      
      if (featureIds.length === 0) {
        return [];
      }

      // Get feature details for each ID
      const placeholders = featureIds.map(() => '?').join(',');
      const [featureDetails] = await db.execute(
        `SELECT id, name, icon FROM hotel_feature_type WHERE id IN (${placeholders})`,
        featureIds
      );

      return featureDetails.map(feature => ({
        id: hotelFeature.id,
        hotel_id: hotelFeature.hotel_id,
        feature_id: feature.id,
        name: feature.name,
        icon: feature.icon,
        hotel_name: hotelFeature.hotel_name,
        created_at: hotelFeature.created_at,
        updated_at: hotelFeature.updated_at
      }));
    } catch (error) {
      throw new Error(`Failed to fetch hotel features by hotel ID: ${error.message}`);
    }
  }

  static async delete(id) {
    const [result] = await db.execute(
      'DELETE FROM hotel_feature WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  static async deleteByHotelId(hotelId) {
    const [result] = await db.execute(
      'DELETE FROM hotel_feature WHERE hotel_id = ?',
      [hotelId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = HotelFeature;