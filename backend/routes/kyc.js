const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ownerOnly = require('../middleware/ownerOnly');
const KYC = require('../models/KYC');
const User = require('../models/User');
const emailService = require('../services/emailService');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/kyc/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images (JPEG, PNG) and PDF files are allowed'));
    }
  }
});

// Get KYC status
router.get('/status', auth, ownerOnly, async (req, res) => {
  try {
    const kyc = await KYC.findOne({ user_id: req.user.id });
    
    if (!kyc) {
      return res.json({ 
        status: 'not_submitted',
        message: 'KYC not submitted yet',
        can_list_venues: false
      });
    }
    
    res.json({
      status: kyc.status,
      verified_badge: kyc.verified_badge,
      can_list_venues: kyc.status === 'approved',
      kyc: kyc
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Submit KYC
router.post('/submit', auth, ownerOnly, upload.fields([
  { name: 'aadhaar_front', maxCount: 1 },
  { name: 'aadhaar_back', maxCount: 1 },
  { name: 'pan_image', maxCount: 1 },
  { name: 'business_reg', maxCount: 1 },
  { name: 'gst_certificate', maxCount: 1 },
  { name: 'address_proof', maxCount: 1 }
]), async (req, res) => {
  try {
    const {
      full_name, business_name, business_type,
      aadhaar_number, pan_number, gst_number,
      account_number, ifsc_code, account_holder_name, bank_name, branch_name, account_type,
      street, city, state, pincode, landmark
    } = req.body;

    // Validation
    if (!full_name || !account_number || !ifsc_code || !account_holder_name) {
      return res.status(400).json({ msg: 'Required fields missing' });
    }

    const kycData = {
      user_id: req.user.id,
      full_name,
      business_name,
      business_type,
      documents: {
        aadhaar: {
          number: aadhaar_number,
          front_image: req.files['aadhaar_front']?.[0]?.path,
          back_image: req.files['aadhaar_back']?.[0]?.path
        },
        pan: {
          number: pan_number,
          image: req.files['pan_image']?.[0]?.path
        },
        business_registration: {
          number: req.body.business_reg_number,
          image: req.files['business_reg']?.[0]?.path
        },
        gst: {
          number: gst_number,
          certificate: req.files['gst_certificate']?.[0]?.path
        },
        address_proof: {
          type: req.body.address_proof_type,
          image: req.files['address_proof']?.[0]?.path
        }
      },
      bank_account: {
        account_number,
        ifsc_code,
        account_holder_name,
        bank_name,
        branch_name,
        account_type,
        verified: false
      },
      business_address: {
        street, city, state, pincode, landmark
      },
      status: 'under_review',
      submitted_at: new Date()
    };

    // Check if KYC already exists
    let kyc = await KYC.findOne({ user_id: req.user.id });
    
    if (kyc) {
      // Update existing KYC
      Object.assign(kyc, kycData);
      kyc.resubmission_count += 1;
      await kyc.save();
    } else {
      // Create new KYC
      kyc = await KYC.create(kycData);
    }

    res.json({
      msg: 'KYC submitted successfully! Our team will review within 24 hours.',
      kyc
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Failed to submit KYC', error: err.message });
  }
});

// Get KYC details
router.get('/details', auth, ownerOnly, async (req, res) => {
  try {
    const kyc = await KYC.findOne({ user_id: req.user.id });
    
    if (!kyc) {
      return res.status(404).json({ msg: 'KYC not found' });
    }
    
    res.json(kyc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// ===== ADMIN ROUTES =====

// Get all KYC submissions (Admin only)
router.get('/admin/all', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin' && req.user.role !== 'owner') {
      return res.status(403).json({ msg: 'Access denied' });
    }

    const { status } = req.query;
    const filter = status ? { status } : {};
    
    const kycs = await KYC.find(filter)
      .populate('user_id', 'name phone email')
      .sort({ submitted_at: -1 });
    
    res.json(kycs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Review KYC (Admin only)
router.put('/admin/review/:id', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin' && req.user.role !== 'owner') {
      return res.status(403).json({ msg: 'Access denied' });
    }

    const { status, rejection_reason, admin_notes, bank_verified } = req.body;
    
    const kyc = await KYC.findById(req.params.id);
    if (!kyc) {
      return res.status(404).json({ msg: 'KYC not found' });
    }

    kyc.status = status;
    kyc.reviewed_by = req.user.id;
    kyc.reviewed_at = new Date();
    kyc.rejection_reason = rejection_reason;
    kyc.admin_notes = admin_notes;

    if (status === 'approved') {
      kyc.verified_badge = true;
      kyc.verification_date = new Date();
      
      if (bank_verified) {
        kyc.bank_account.verified = true;
        kyc.bank_account.verification_method = 'manual';
        kyc.bank_account.verification_date = new Date();
      }
    } else {
      kyc.verified_badge = false;
    }

    await kyc.save();

    // Send email notification
    const partner = await User.findById(kyc.user_id);
    if (status === 'approved') {
      emailService.sendKYCApproved(partner, kyc).catch(err => console.error('Email error:', err));
    } else if (status === 'rejected' || status === 'resubmit_required') {
      emailService.sendKYCRejected(partner, kyc).catch(err => console.error('Email error:', err));
    }

    res.json({
      msg: `KYC ${status} successfully`,
      kyc
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
