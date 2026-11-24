const mongoose = require('mongoose');

/**
 * Request Schema for ReUseHUB
 * Represents a student's request for an available item
 * Includes a 4-digit handoverCode (OTP) for proof of delivery
 */
const requestSchema = new mongoose.Schema(
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: [true, 'Item ID is required to make a request'],
    },
    itemName: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
    },
    contributorName: {
      type: String,
      required: [true, 'Contributor name is required'],
      trim: true,
    },
    requesterName: {
      type: String,
      default: 'Campus Student',
      trim: true,
    },
    requesterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    requesterBranch: {
      type: String,
      default: '',
    },
    requesterSection: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      default: 'Request submitted',
      enum: ['Request submitted', 'Approved', 'Completed / Handed Over', 'Completed', 'Cancelled'],
    },
    handoverCode: {
      type: String,
      // Automatically generates a random 4-digit code (e.g. "4821")
      default: () => Math.floor(1000 + Math.random() * 9000).toString(),
    },
  },
  {
    timestamps: true, // Provides createdAt (when request was made) and updatedAt
  }
);

module.exports = mongoose.model('Request', requestSchema);
