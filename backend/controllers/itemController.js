const Item = require('../models/Item');
const cloudinary = require('../config/cloudinary');

/**
 * @desc    Get all items with optional search, category filter, and sorting
 * @route   GET /api/items
 * @access  Public
 */
const getItems = async (req, res, next) => {
  try {
    const { search, category, sort } = req.query;

    // Build query object
    let query = {};

    // 1. Filter by category (if specified and not 'All')
    if (category && category !== 'All') {
      query.category = category;
    }

    // 2. Search by item name or description
    if (search && search.trim() !== '') {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    // 3. Sorting logic
    let sortOptions = { createdAt: -1 }; // Default: Newest first

    if (sort === 'oldest') {
      sortOptions = { createdAt: 1 };
    } else if (sort === 'az') {
      sortOptions = { name: 1 };
    }

    // Execute query in MongoDB
    const items = await Item.find(query).sort(sortOptions);

    res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    next(error); // Pass error to central error handler
  }
};

/**
 * @desc    Get single item by ID
 * @route   GET /api/items/:id
 * @access  Public
 */
const getItemById = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found with this ID',
      });
    }

    res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create / List a new item (with optional Cloudinary photo upload)
 * @route   POST /api/items
 * @access  Public
 */
const createItem = async (req, res, next) => {
  try {
    const { name, category, condition, description, contributorName, userId, contributorBranch, contributorSection } = req.body;

    // Validate required fields
    if (!name || !category || !condition || !description || !contributorName) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, category, condition, description, and contributorName',
      });
    }

    let imageUrl = '';

    // If an image file was provided in the upload
    if (req.file) {
      // Check if Cloudinary credentials are set in environment
      if (
        process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET
      ) {
        // Convert file buffer to base64 Data URI for Cloudinary upload
        const b64 = Buffer.from(req.file.buffer).toString('base64');
        const dataURI = `data:${req.file.mimetype};base64,${b64}`;
        const uploadResponse = await cloudinary.uploader.upload(dataURI, {
          folder: 'reusehub_items',
        });
        imageUrl = uploadResponse.secure_url;
      } else {
        // Fallback: Store image as Data URI directly in database so photos display immediately
        const b64 = Buffer.from(req.file.buffer).toString('base64');
        imageUrl = `data:${req.file.mimetype};base64,${b64}`;
      }
    } else if (req.body.image) {
      // If image URL was passed directly as text
      imageUrl = req.body.image;
    }

    // Create item in MongoDB
    const newItem = await Item.create({
      name: name.trim(),
      category,
      condition,
      description: description.trim(),
      contributorName: contributorName.trim(),
      userId: userId || null,
      contributorBranch: contributorBranch || '',
      contributorSection: contributorSection || '',
      image: imageUrl,
    });

    res.status(201).json({
      success: true,
      message: 'Item listed successfully!',
      data: newItem,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getItems,
  getItemById,
  createItem,
};
