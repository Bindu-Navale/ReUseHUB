const mongoose = require('mongoose');

/**
 * Item Schema for ReUseHUB
 * Matches the existing fields used by the React frontend
 */
const itemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide an item name'],
      trim: true,
      maxLength: [100, 'Item name cannot exceed 100 characters'],
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: {
        values: ['Stationery', 'Electronics'],
        message: 'Category must be either Stationery or Electronics',
      },
    },
    condition: {
      type: String,
      required: [true, 'Please select the item condition'],
      enum: {
        values: ['Like New', 'Good', 'Gently used', 'Usable'],
        message: 'Condition must be Like New, Good, Gently used, or Usable',
      },
    },
    description: {
      type: String,
      required: [true, 'Please provide an item description'],
      trim: true,
      maxLength: [1000, 'Description cannot exceed 1000 characters'],
    },
    contributorName: {
      type: String,
      required: [true, 'Please provide your name'],
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    contributorBranch: {
      type: String,
      default: '',
    },
    contributorSection: {
      type: String,
      default: '',
    },
    image: {
      type: String,
      default: '', // Stores the Cloudinary image URL or empty string
    },
    isAvailable: {
      type: Boolean,
      default: true, // Available by default until claimed
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

module.exports = mongoose.model('Item', itemSchema);
