const express = require('express');
const router = express.Router();
const { getItems, getItemById, createItem } = require('../controllers/itemController');
const upload = require('../middleware/uploadMiddleware');

// GET /api/items - Fetch all items (supports ?search=..., ?category=..., ?sort=...)
router.get('/', getItems);

// POST /api/items - Create a new item (accepts multipart/form-data with image or application/json)
router.post('/', upload.single('image'), createItem);

// GET /api/items/:id - Fetch single item by MongoDB ID
router.get('/:id', getItemById);

module.exports = router;
