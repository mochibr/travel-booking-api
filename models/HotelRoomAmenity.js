const db = require('../config/database');

class HotelRoomAmenity {
  static async create(amenityData) {
    const { room_id, amenity_ids } = amenityData;
    
    // Validate input
    if (!room_id || !amenity_ids || !Array.isArray(amenity_ids) || amenity_ids.length === 0) {
      throw new Error('room_id and amenity_ids array are required');
    }

    try {
      // Convert array to comma-separated string
      const amenityIdsString = amenity_ids.join(',');
      
      const [result] = await db.execute(
        'INSERT INTO hotel_room_amenity (room_id, amenity_id) VALUES (?, ?)',
        [room_id, amenityIdsString]
      );
      
      return result.insertId;
    } catch (error) {
      throw new Error(`Failed to create room amenities: ${error.message}`);
    }
  }

  static async update(roomId, amenityIds) {
    // Validate input
    if (!roomId || !amenityIds || !Array.isArray(amenityIds)) {
      throw new Error('room_id and amenity_ids array are required');
    }

    try {
      // Convert array to comma-separated string
      const amenityIdsString = amenityIds.join(',');
      
      // Check if record exists for this room
      const [existing] = await db.execute(
        'SELECT id FROM hotel_room_amenity WHERE room_id = ?',
        [roomId]
      );

      if (existing.length > 0) {
        // Update existing record
        const [result] = await db.execute(
          'UPDATE hotel_room_amenity SET amenity_id = ?, updated_at = CURRENT_TIMESTAMP WHERE room_id = ?',
          [amenityIdsString, roomId]
        );
        return result.affectedRows > 0;
      } else {
        // Create new record
        const [result] = await db.execute(
          'INSERT INTO hotel_room_amenity (room_id, amenity_id) VALUES (?, ?)',
          [roomId, amenityIdsString]
        );
        return result.insertId;
      }
    } catch (error) {
      throw new Error(`Failed to update room amenities: ${error.message}`);
    }
  }

  static async findAllWithPagination(options = {}) {
    const {
      room_id = null,
      search = '',
      page = 1,
      limit = 10,
      sort_by = 'hra.id',
      sort_order = 'DESC'
    } = options;

    // Calculate offset
    const offset = (page - 1) * limit;

    // Build WHERE clause
    let whereConditions = [];
    const queryParams = [];

    // Add room_id condition if provided
    if (room_id) {
      whereConditions.push('hra.room_id = ?');
      queryParams.push(room_id);
    }

    // Add search condition if provided
    if (search) {
      whereConditions.push('(ha.name LIKE ? OR hr.room_number LIKE ? OR hr.title LIKE ?)');
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm);
    }

    // Combine WHERE conditions
    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : '';

    // Validate sort_by to prevent SQL injection
    const allowedSortColumns = ['hra.id', 'ha.name', 'hra.created_at', 'hra.updated_at', 'hra.room_id', 'hr.room_number', 'hr.title'];
    const safeSortBy = allowedSortColumns.includes(sort_by) ? sort_by : 'hra.id';
    const safeSortOrder = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Main query with pagination
    const query = `
      SELECT 
        hra.id,
        hra.room_id,
        hra.amenity_id,
        hra.created_at,
        hra.updated_at,
        hr.room_number,
        hr.title as room_title,
        h.name as hotel_name
      FROM hotel_room_amenity hra 
      JOIN hotel_room hr ON hra.room_id = hr.id
      JOIN hotel_room_type hrt ON hr.room_type_id = hrt.id
      JOIN hotel h ON hrt.hotel_id = h.id
      ${whereClause}
      ORDER BY ${safeSortBy} ${safeSortOrder}
      LIMIT ? OFFSET ?
    `;

    // Count query for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM hotel_room_amenity hra 
      JOIN hotel_room hr ON hra.room_id = hr.id
      JOIN hotel_room_type hrt ON hr.room_type_id = hrt.id
      JOIN hotel h ON hrt.hotel_id = h.id
      ${whereClause}
    `;

    try {
      // Execute both queries
      const [amenities] = await db.execute(query, [...queryParams, parseInt(limit), offset]);
      
      // For each amenity, get the individual amenity details
      const amenitiesWithDetails = await Promise.all(
        amenities.map(async (amenity) => {
          const amenityIds = amenity.amenity_id.split(',').map(id => parseInt(id.trim()));
          
          if (amenityIds.length === 0) {
            return {
              ...amenity,
              amenities: []
            };
          }

          // Get amenity details for each ID
          const placeholders = amenityIds.map(() => '?').join(',');
          const [amenityDetails] = await db.execute(
            `SELECT id, name, icon FROM hotel_amenity WHERE id IN (${placeholders})`,
            amenityIds
          );

          return {
            ...amenity,
            amenities: amenityDetails
          };
        })
      );

      const [countResult] = await db.execute(countQuery, queryParams);

      const totalRecords = countResult[0].total;
      const totalPages = Math.ceil(totalRecords / limit);

      return {
        amenities: amenitiesWithDetails,
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
      throw new Error(`Failed to fetch room amenities: ${error.message}`);
    }
  }

  static async findByRoomId(roomId) {
    try {
      const [rows] = await db.execute(
        `SELECT 
          hra.id,
          hra.room_id,
          hra.amenity_id,
          hra.created_at,
          hra.updated_at,
          hr.room_number,
          hr.title as room_title,
          h.name as hotel_name,
          hrt.name as room_type_name
        FROM hotel_room_amenity hra 
        JOIN hotel_room hr ON hra.room_id = hr.id
        JOIN hotel_room_type hrt ON hr.room_type_id = hrt.id
        JOIN hotel h ON hrt.hotel_id = h.id
        WHERE hra.room_id = ?`,
        [roomId]
      );

      if (rows.length === 0) {
        return [];
      }

      const roomAmenity = rows[0];
      const amenityIds = roomAmenity.amenity_id.split(',').map(id => parseInt(id.trim()));
      
      if (amenityIds.length === 0) {
        return [];
      }

      // Get amenity details for each ID
      const placeholders = amenityIds.map(() => '?').join(',');
      const [amenityDetails] = await db.execute(
        `SELECT id, name, icon FROM hotel_amenity WHERE id IN (${placeholders})`,
        amenityIds
      );

      return amenityDetails.map(amenity => ({
        id: roomAmenity.id,
        room_id: roomAmenity.room_id,
        amenity_id: amenity.id,
        name: amenity.name,
        icon: amenity.icon,
        room_number: roomAmenity.room_number,
        room_title: roomAmenity.room_title,
        hotel_name: roomAmenity.hotel_name,
        room_type_name: roomAmenity.room_type_name,
        created_at: roomAmenity.created_at,
        updated_at: roomAmenity.updated_at
      }));
    } catch (error) {
      throw new Error(`Failed to fetch room amenities by room ID: ${error.message}`);
    }
  }

  static async findById(id) {
    try {
      const [rows] = await db.execute(
        `SELECT 
          hra.id,
          hra.room_id,
          hra.amenity_id,
          hra.created_at,
          hra.updated_at,
          hr.room_number,
          hr.title as room_title,
          hr.room_type_id,
          h.id as hotel_id,
          h.name as hotel_name,
          hrt.name as room_type_name
        FROM hotel_room_amenity hra 
        JOIN hotel_room hr ON hra.room_id = hr.id
        JOIN hotel_room_type hrt ON hr.room_type_id = hrt.id
        JOIN hotel h ON hrt.hotel_id = h.id
        WHERE hra.id = ?`,
        [id]
      );

      if (rows.length === 0) {
        return null;
      }

      const roomAmenity = rows[0];
      const amenityIds = roomAmenity.amenity_id.split(',').map(id => parseInt(id.trim()));
      
      if (amenityIds.length === 0) {
        return {
          ...roomAmenity,
          amenities: []
        };
      }

      // Get amenity details for each ID
      const placeholders = amenityIds.map(() => '?').join(',');
      const [amenityDetails] = await db.execute(
        `SELECT id, name, icon FROM hotel_amenity WHERE id IN (${placeholders})`,
        amenityIds
      );

      return {
        ...roomAmenity,
        amenities: amenityDetails
      };
    } catch (error) {
      throw new Error(`Failed to fetch room amenity: ${error.message}`);
    }
  }

  static async delete(id) {
    const [result] = await db.execute(
      'DELETE FROM hotel_room_amenity WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  static async deleteByRoomId(roomId) {
    const [result] = await db.execute(
      'DELETE FROM hotel_room_amenity WHERE room_id = ?',
      [roomId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = HotelRoomAmenity;