const express = require('express');
const Turf = require('../models/Turf');
const auth = require('../middleware/auth');
const ownerOnly = require('../middleware/ownerOnly');
const router = express.Router();

// Get all turfs with advanced search and filters
router.get('/', async (req, res) => {
  try {
    const { 
      city, sport, 
      min_price, max_price,
      amenities, // comma-separated
      rating, // minimum rating
      search, // search by name or location
      sort_by, // price_low, price_high, rating_high, distance
      lat, lng, radius, // for location-based search
      date, time_slot, // for availability filter
      page = 1, limit = 20
    } = req.query;
    
    let filter = { isActive: true }; // Only show active turfs
    
    // City filter
    if (city) {
      filter.city = { $regex: city, $options: 'i' };
    }
    
    // Sport filter (supports multiple sports)
    if (sport) {
      const sportArray = sport.split(',').map(s => s.trim());
      filter.sports = { $in: sportArray };
    }
    
    // Price range filter
    if (min_price || max_price) {
      filter.price_per_hour = {};
      if (min_price) filter.price_per_hour.$gte = parseFloat(min_price);
      if (max_price) filter.price_per_hour.$lte = parseFloat(max_price);
    }
    
    // Amenities filter
    if (amenities) {
      const amenitiesArray = amenities.split(',').map(a => a.trim());
      filter.amenities = { $all: amenitiesArray };
    }
    
    // Rating filter
    if (rating) {
      filter.rating = { $gte: parseFloat(rating) };
    }
    
    // Search by name or location
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Location-based filter (nearby turfs)
    if (lat && lng) {
      const radiusKm = radius ? parseFloat(radius) : 10;
      const radiusDegrees = radiusKm / 111; // Approximate conversion
      
      filter['coordinates.lat'] = { 
        $gte: parseFloat(lat) - radiusDegrees, 
        $lte: parseFloat(lat) + radiusDegrees 
      };
      filter['coordinates.lng'] = { 
        $gte: parseFloat(lng) - radiusDegrees, 
        $lte: parseFloat(lng) + radiusDegrees 
      };
    }
    
    // Availability filter
    if (date && time_slot) {
      const Slot = require('../models/Slot');
      const bookedSlots = await Slot.find({ 
        date, 
        time_slot, 
        is_booked: true 
      }).distinct('turf_id');
      
      filter._id = { $nin: bookedSlots };
    }
    
    // Sorting
    let sortOption = { createdAt: -1 }; // Default: newest first
    
    if (sort_by === 'price_low') {
      sortOption = { price_per_hour: 1 };
    } else if (sort_by === 'price_high') {
      sortOption = { price_per_hour: -1 };
    } else if (sort_by === 'rating_high') {
      sortOption = { rating: -1 };
    } else if (sort_by === 'distance' && lat && lng) {
      // Distance sorting will be done in-memory after fetching
      sortOption = {};
    }
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Exclude large fields (images/videos) from listing to prevent MongoDB memory issues
    const projection = { images: 0, videos: 0 };

    let turfs = await Turf.find(filter, projection)
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit))
      .allowDiskUse(true);
    
    // Calculate distance if lat/lng provided
    if (lat && lng) {
      turfs = turfs.map(turf => {
        const turfObj = turf.toObject();
        const distance = calculateDistance(
          parseFloat(lat), 
          parseFloat(lng), 
          turf.coordinates.lat, 
          turf.coordinates.lng
        );
        turfObj.distance = parseFloat(distance.toFixed(2));
        return turfObj;
      });
      
      // Sort by distance if requested
      if (sort_by === 'distance') {
        turfs.sort((a, b) => a.distance - b.distance);
      }
    }
    
    // Get total count for pagination
    const total = await Turf.countDocuments(filter);
    
    res.json({
      turfs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      },
      filters_applied: {
        city, sport, min_price, max_price, amenities, rating, search, 
        location_based: !!(lat && lng),
        availability_checked: !!(date && time_slot)
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Helper function to calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Get nearby turfs
router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng, radius = 10 } = req.query;
    const turfs = await Turf.find({
      'coordinates.lat': { $gte: parseFloat(lat) - radius / 111, $lte: parseFloat(lat) + radius / 111 },
      'coordinates.lng': { $gte: parseFloat(lng) - radius / 111, $lte: parseFloat(lng) + radius / 111 },
    });
    res.json(turfs);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Seed turfs — assigns existing turfs to logged-in partner OR creates new ones
router.get('/seed', auth, ownerOnly, async (req, res) => {
  try {
    const owner_id = req.user.id;
    
    // Check if turfs already exist
    const existingTurfs = await Turf.find({});
    
    if (existingTurfs.length > 0) {
      // Assign all existing turfs to this partner
      await Turf.updateMany({}, { owner_id });
      res.json({ 
        msg: `✅ ${existingTurfs.length} existing turfs assigned to your account!`,
        count: existingTurfs.length 
      });
    } else {
      // Create new turfs
      const newTurfs = await Turf.insertMany([
        { name: 'Green Arena', location: 'Koramangala', city: 'Bengaluru', price_per_hour: 800, sport: 'Football', rating: 4.5, amenities: ['Floodlights', 'Parking', 'Washroom'], coordinates: { lat: 12.9352, lng: 77.6245 }, owner_id },
        { name: 'Kings Turf', location: 'Indiranagar', city: 'Bengaluru', price_per_hour: 1000, sport: 'Cricket', rating: 4.2, amenities: ['Floodlights', 'Cafeteria'], coordinates: { lat: 12.9784, lng: 77.6408 }, owner_id },
        { name: 'Premier Grounds', location: 'Whitefield', city: 'Bengaluru', price_per_hour: 700, sport: 'Football', rating: 4.7, amenities: ['Parking', 'Washroom'], coordinates: { lat: 12.9698, lng: 77.7480 }, owner_id },
        { name: 'City Sports Hub', location: 'HSR Layout', city: 'Bengaluru', price_per_hour: 900, sport: 'Badminton', rating: 4.3, amenities: ['Floodlights', 'AC'], coordinates: { lat: 12.9116, lng: 77.6477 }, owner_id },
        { name: 'Champion Arena', location: 'JP Nagar', city: 'Bengaluru', price_per_hour: 850, sport: 'Football', rating: 4.6, amenities: ['Floodlights', 'Parking'], coordinates: { lat: 12.9077, lng: 77.5946 }, owner_id },
      ]);
      res.json({ 
        msg: `✅ ${newTurfs.length} new turfs created and assigned to your account!`,
        count: newTurfs.length 
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get single turf
router.get('/:id', async (req, res) => {
  try {
    const turf = await Turf.findById(req.params.id);
    if (!turf) return res.status(404).json({ msg: 'Turf not found' });
    res.json(turf);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Create turf
router.post('/', auth, ownerOnly, async (req, res) => {
  try {
    const {
      name, location, city, state, pincode,
      price_per_hour, sport, sports, type,
      venueSize, surfaceType, bookingType,
      description, shortDescription,
      amenities, images, videos, lat, lng,
      openTime, closeTime,
    } = req.body;

    // Validate required fields
    if (!name || !location || !city) {
      return res.status(400).json({ msg: 'Name, location, and city are required' });
    }

    // Validate images array
    if (images && !Array.isArray(images)) {
      return res.status(400).json({ msg: 'Images must be an array' });
    }

    // Check if images contain objects instead of strings
    if (images && images.length > 0 && typeof images[0] === 'object') {
      return res.status(400).json({ 
        msg: 'Invalid image format. Expected array of base64 strings, received array of objects. Please ensure images are properly formatted.' 
      });
    }

    // Estimate document size (rough calculation)
    const estimatedSize = JSON.stringify(req.body).length;
    if (estimatedSize > 15 * 1024 * 1024) { // 15MB limit (MongoDB limit is 16MB)
      return res.status(400).json({ 
        msg: 'Document size too large. Please reduce the number of images or compress them.' 
      });
    }

    const turf = await Turf.create({
      name, location, city,
      state: state || '',
      pincode: pincode || '',
      price_per_hour: parseFloat(price_per_hour) || 0,
      sport: sport || (Array.isArray(sports) && sports[0]) || 'Football',
      sports: Array.isArray(sports) ? sports : (sport ? [sport] : []),
      type: type || 'Outdoor',
      venueSize: venueSize || '',
      surfaceType: surfaceType || '',
      bookingType: bookingType || 'Hourly',
      description: description || '',
      shortDescription: shortDescription || '',
      amenities: Array.isArray(amenities) ? amenities : (typeof amenities === 'string' ? amenities.split(',').map(a => a.trim()) : []),
      images: Array.isArray(images) ? images : [],
      videos: Array.isArray(videos) ? videos : [],
      owner_id: req.user.id,
      coordinates: { lat: parseFloat(lat) || 0, lng: parseFloat(lng) || 0 },
      openTime: openTime || '06:00 AM',
      closeTime: closeTime || '11:00 PM',
    });
    res.json(turf);
  } catch (err) {
    console.error('❌ Create turf error:', err);
    
    // Send detailed error message
    if (err.name === 'ValidationError') {
      return res.status(400).json({ msg: 'Validation error', error: err.message });
    }
    
    if (err.code === 11000) {
      return res.status(400).json({ msg: 'Duplicate entry', error: err.message });
    }

    // MongoDB document size limit error
    if (err.message && err.message.includes('too large')) {
      return res.status(400).json({ 
        msg: 'Document size exceeds MongoDB limit (16MB). Please reduce image sizes or quantity.' 
      });
    }
    
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Update turf
router.put('/:id', auth, ownerOnly, async (req, res) => {
  try {
    const turf = await Turf.findOne({ _id: req.params.id, owner_id: req.user.id });
    if (!turf) return res.status(404).json({ msg: 'Turf not found or not authorized' });
    await Turf.findByIdAndUpdate(req.params.id, req.body);
    res.json({ msg: 'Turf updated' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Toggle turf active status
router.patch('/:id/status', auth, ownerOnly, async (req, res) => {
  try {
    const turf = await Turf.findOne({ _id: req.params.id, owner_id: req.user.id });
    if (!turf) return res.status(404).json({ msg: 'Turf not found or not authorized' });
    turf.isActive = !turf.isActive;
    await turf.save();
    res.json({ msg: `Turf marked as ${turf.isActive ? 'active' : 'inactive'}`, isActive: turf.isActive });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Delete turf
router.delete('/:id', auth, ownerOnly, async (req, res) => {
  try {
    await Turf.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Turf deleted' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;