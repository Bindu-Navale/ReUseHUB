const Request = require('../models/Request');
const Item = require('../models/Item');

/**
 * @desc    Submit a request for an available item
 * @route   POST /api/requests
 * @access  Public
 */
const createRequest = async (req, res, next) => {
  try {
    const { itemId, itemName, contributorName, requesterName, requesterId, requesterBranch, requesterSection } = req.body;

    // 1. Validate required fields
    if (!itemId || !itemName || !contributorName) {
      return res.status(400).json({
        success: false,
        message: 'Please provide itemId, itemName, and contributorName',
      });
    }

    // 2. Verify that the requested item exists in the database
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'The item you are requesting does not exist.',
      });
    }

    // 3. Prevent duplicate requests for the same item
    const existingRequest = await Request.findOne({ itemId });
    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'A request has already been submitted for this item.',
      });
    }

    // 4. Generate a unique 4-digit handover confirmation code (OTP)
    const handoverCode = Math.floor(1000 + Math.random() * 9000).toString();

    // 5. Create and save the request with the handoverCode
    const newRequest = await Request.create({
      itemId,
      itemName: itemName.trim(),
      contributorName: contributorName.trim(),
      requesterName: requesterName ? requesterName.trim() : 'Campus Student',
      requesterId: requesterId || null,
      requesterBranch: requesterBranch || '',
      requesterSection: requesterSection || '',
      status: 'Request submitted',
      handoverCode,
    });

    res.status(201).json({
      success: true,
      message: `Your request for "${itemName}" has been recorded! Your handover code is ${handoverCode}.`,
      data: newRequest,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all submitted requests (for My Activity dashboard)
 * @route   GET /api/requests
 * @access  Public
 */
const getRequests = async (req, res, next) => {
  try {
    const requests = await Request.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify handover code & mark request as completed (Generates Certificate for contributor)
 * @route   PATCH /api/requests/:id/complete
 * @access  Public
 */
const completeRequest = async (req, res, next) => {
  try {
    const { code } = req.body;
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found with this ID',
      });
    }

    // Security Verification: Require the 4-digit handover code
    if (!code || !code.toString().trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please enter the 4-digit confirmation code provided by the receiver.',
      });
    }

    // Verify code against database
    if (request.handoverCode && request.handoverCode !== code.toString().trim()) {
      return res.status(400).json({
        success: false,
        message: '❌ Invalid confirmation code! Please ask the receiver for their 4-digit code.',
      });
    }

    // Mark request as Completed / Handed Over
    request.status = 'Completed / Handed Over';
    await request.save();

    // Mark the item as no longer available (handed over)
    await Item.findByIdAndUpdate(request.itemId, { isAvailable: false });

    res.status(200).json({
      success: true,
      message: `✅ Code verified! "${request.itemName}" has been handed over successfully.`,
      data: request,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRequest,
  getRequests,
  completeRequest,
};
