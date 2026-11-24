const express = require('express');
const router = express.Router();
const { createRequest, getRequests, completeRequest } = require('../controllers/requestController');

// GET /api/requests - Fetch all requests (for My Activity dashboard)
// POST /api/requests - Submit a new item request
router.route('/')
  .get(getRequests)
  .post(createRequest);

// PATCH /api/requests/:id/complete - Mark request as completed / handed over
router.patch('/:id/complete', completeRequest);

module.exports = router;
