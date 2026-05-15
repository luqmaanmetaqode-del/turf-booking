# Deploy Image Upload Fix

## ✅ What Was Fixed

**Problem:** When adding a venue with photos/videos, the system showed error:
```
Turf validation failed: images.0: Cast to [string] failed
```

**Root Cause:** Frontend was sending image objects `{ url: '...', name: '...', type: '...' }` but backend expected just the URL string.

**Solution:** Changed line 93 in `AddVenueForm.jsx` from:
```javascript
images: formData.images,
```
to:
```javascript
images: formData.images.map(img => img.url),
```

## 🚀 Deploy to Server

Copy and paste these commands into your server terminal:

```bash
# 1. SSH to server
ssh root@172.235.25.58

# 2. Go to project folder
cd /home/turf-booking

# 3. Pull latest code
git pull origin main

# 4. Rebuild frontend
cd frontend
npm run build

# 5. Restart PM2
pm2 restart all

# 6. Check logs
pm2 logs turf-backend --lines 20
```

## ✅ Test the Fix

1. Go to: https://turfx.metaqode.co.in
2. Login as partner: Phone `+917019615646`, Password `password123`
3. Click "Add Venue"
4. Fill in the form
5. **Add photos/videos** (this was failing before)
6. Click "Submit Venue"
7. Should see success message!

## 📊 Current Status

- ✅ 5 turfs in database (all active)
- ✅ MongoDB connected
- ✅ Backend running on port 5001
- ✅ Image upload fix applied
- 🔄 Needs deployment to server

## 🎯 Expected Result

After deployment:
- Partners can add venues with photos/videos
- No more "Cast to [string] failed" error
- Images will be saved correctly as base64 strings
