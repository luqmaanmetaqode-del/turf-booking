const express = require('express');
const Offer = require('../models/Offer');
const Turf = require('../models/Turf');
const auth = require('../middleware/auth');
const ownerOnly = require('../middleware/ownerOnly');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const offers = await Offer.find();
    res.json(offers);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

router.post('/', auth, ownerOnly, async (req, res) => {
  try {
    const { title, description, discount, turf_id, valid_until } = req.body;
    const turf = await Turf.findOne({ _id: turf_id, owner_id: req.user.id });
    if (!turf) return res.status(404).json({ msg: 'Venue not found for this owner' });

    const offer = await Offer.create({ title, description, discount, turf_id, valid_until });
    res.json(offer);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

router.put('/:id', auth, ownerOnly, async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) return res.status(404).json({ msg: 'Offer not found' });

    const turf = await Turf.findOne({ _id: offer.turf_id, owner_id: req.user.id });
    if (!turf) return res.status(403).json({ msg: 'Not allowed to update this offer' });

    Object.assign(offer, req.body);
    await offer.save();
    res.json(offer);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

router.delete('/:id', auth, ownerOnly, async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) return res.status(404).json({ msg: 'Offer not found' });

    const turf = await Turf.findOne({ _id: offer.turf_id, owner_id: req.user.id });
    if (!turf) return res.status(403).json({ msg: 'Not allowed to delete this offer' });

    await offer.deleteOne();
    res.json({ msg: 'Offer deleted' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
