// routes/roleRoutes.js
const express = require('express');
const auth = require('../middleware/auth');
const {
  validateCreateRole,
  validateUpdateRole
} = require('../middleware/roleValidation');

const roleController = require('../controllers/roleController');

const router = express.Router();

// Role Routes
router.post('/', auth('admin'), validateCreateRole, roleController.createRole);
router.get('/', roleController.getAllRoles);
router.get('/all/lists', roleController.getAllRolesWithoutPagination);
router.get('/:id', roleController.getRole);
router.put('/:id', auth('admin'), validateUpdateRole, roleController.updateRole);
router.delete('/:id', auth('admin'), roleController.deleteRole);

module.exports = router;