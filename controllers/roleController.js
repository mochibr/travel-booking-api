// controllers/roleController.js
const Role = require('../models/Role');

const createRole = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Check if role name already exists
    const existingRole = await Role.findByName(name);
    if (existingRole) {
      return res.status(400).json({
        success: false,
        error: 'Role name already exists'
      });
    }

    const roleData = {
      name,
      description: description || null
    };

    const roleId = await Role.create(roleData);

    res.status(201).json({
      success: true,
      message: 'Role created successfully',
      data: { roleId }
    });
  } catch (error) {
    console.error('Create role error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create role'
    });
  }
};

const getAllRoles = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      sort_by = 'created_at',
      sort_order = 'DESC'
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(Math.max(1, parseInt(limit)), 100);

    const filters = {
      page: pageNum,
      limit: limitNum,
      search,
      sort_by,
      sort_order
    };

    const result = await Role.findAllWithFilters(filters);
    
    const totalPages = Math.ceil(result.pagination.total / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.json({
      success: true,
      data: {
        roles: result.roles,
        pagination: {
          current_page: pageNum,
          total_pages: totalPages,
          total_count: result.pagination.total,
          has_next_page: hasNextPage,
          has_prev_page: hasPrevPage,
          next_page: hasNextPage ? pageNum + 1 : null,
          prev_page: hasPrevPage ? pageNum - 1 : null,
          limit: limitNum
        }
      }
    });
  } catch (error) {
    console.error('Get all roles error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch roles'
    });
  }
};

const getAllRolesWithoutPagination = async (req, res) => {
  try {
    const roles = await Role.findAllWithoutPagination();

    res.json({
      success: true,
      data: { roles }
    });
  } catch (error) {
    console.error('Get all roles without pagination error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch roles'
    });
  }
};

const getRole = async (req, res) => {
  try {
    const { id } = req.params;
    
    const role = await Role.findById(id);
    if (!role) {
      return res.status(404).json({
        success: false,
        error: 'Role not found'
      });
    }

    res.json({
      success: true,
      data: { role }
    });
  } catch (error) {
    console.error('Get role error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch role'
    });
  }
};

const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    
    // Check if role exists
    const existingRole = await Role.findById(id);
    if (!existingRole) {
      return res.status(404).json({
        success: false,
        error: 'Role not found'
      });
    }

    // Check if new name conflicts with other roles
    if (name && name !== existingRole.name) {
      const roleWithSameName = await Role.findByName(name);
      if (roleWithSameName) {
        return res.status(400).json({
          success: false,
          error: 'Role name already exists'
        });
      }
    }

    const updateData = {
      name: name || existingRole.name,
      description: description !== undefined ? description : existingRole.description
    };

    const updated = await Role.update(id, updateData);
    if (!updated) {
      return res.status(500).json({
        success: false,
        error: 'Failed to update role'
      });
    }

    res.json({
      success: true,
      message: 'Role updated successfully'
    });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update role'
    });
  }
};

const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if role exists
    const role = await Role.findById(id);
    if (!role) {
      return res.status(404).json({
        success: false,
        error: 'Role not found'
      });
    }

    // Check if role is being used
    const isUsed = await Role.checkIfUsed(id);
    if (isUsed) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete role that is assigned to users'
      });
    }

    const deleted = await Role.delete(id);
    if (!deleted) {
      return res.status(500).json({
        success: false,
        error: 'Failed to delete role'
      });
    }

    res.json({
      success: true,
      message: 'Role deleted successfully'
    });
  } catch (error) {
    console.error('Delete role error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete role'
    });
  }
};

module.exports = {
  createRole,
  getAllRoles,
  getAllRolesWithoutPagination,
  getRole,
  updateRole,
  deleteRole
};