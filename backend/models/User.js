const mongoose = require('mongoose');

/**
 * User Schema for ReUseHUB College Students
 * Stores student credentials, branch, and section
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your full name'],
      trim: true,
      maxLength: [60, 'Name cannot exceed 60 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide your college email ID'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minLength: [6, 'Password must be at least 6 characters long'],
    },
    branch: {
      type: String,
      required: [true, 'Please provide your branch (e.g. CSE, ECE, Mech)'],
      trim: true,
    },
    section: {
      type: String,
      required: [true, 'Please provide your section (e.g. A, B, C)'],
      trim: true,
      uppercase: true,
    },
  },
  {
    timestamps: true, // Automatically records createdAt and updatedAt
  }
);

module.exports = mongoose.model('User', userSchema);
