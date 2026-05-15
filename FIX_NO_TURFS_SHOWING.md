# Fix: No Turfs Showing on Website

## Problem
The website is not showing any turfs even though the seed script ran successfully.

## Solution Steps

### Step 1: Check if turfs exist in database

SSH to your server and run:

```bash
ssh root@172.235.25.58
cd /home/turf-booking
git pull origin main
cd backend
node check-turfs.js
```

This will show you:
- How many turfs are in the database
- Which turfs are active/inactive
- Details of each turf

### Step 2: If NO turfs found

If the check shows 0 turfs, run the seed script again:

```bash
cd /home/turf-booking/backend
node seed-data.js
```

You should see:
```
Seed complete
Owner phone: +917019615646
Owner password: password123
```

### Step 3: If turfs exist but are INACTIVE

If turfs exist but `isActive: false`, you need to activate them. Run this command:

```bash
cd /home/turf-booking/backend
node -e "require('dotenv').config(); const mongoose = require('mongoose'); const Turf = require('./models/Turf'); mongoose.connect(process.env.MONGO_URI).then(async () => { await Turf.updateMany({}, { isActive: true }); console.log('All turfs activated!'); process.exit(0); });"
```

### Step 4: Verify turfs are showing

1. Check the API directly in your browser:
   - Open: https://turfx.metaqode.co.in/api/turfs
   - You should see JSON with turfs array

2. Check the website:
   - Open: https://turfx.metaqode.co.in
   - Scroll down to "Featured Turfs" section
   - You should see turf cards

### Step 5: If still not showing

Check backend logs for errors:

```bash
pm2 logs turf-backend --lines 50
```

Look for any errors related to:
- MongoDB connection
- API requests
- CORS errors

## Common Issues

### Issue 1: MongoDB not connected
**Symptom**: Backend logs show connection errors
**Fix**: Check `.env` file has correct MongoDB Atlas connection string

### Issue 2: CORS errors
**Symptom**: Browser console shows CORS errors
**Fix**: Backend should allow requests from `https://turfx.metaqode.co.in`

### Issue 3: API URL wrong in frontend
**Symptom**: Network tab shows 404 errors
**Fix**: All frontend files should use `https://turfx.metaqode.co.in/api`

## Quick Test Commands

Run these on your server to test:

```bash
# Test 1: Check MongoDB connection
cd /home/turf-booking/backend
node -e "require('dotenv').config(); const mongoose = require('mongoose'); mongoose.connect(process.env.MONGO_URI).then(() => { console.log('✅ MongoDB connected!'); process.exit(0); }).catch(err => { console.error('❌ Error:', err.message); process.exit(1); });"

# Test 2: Count turfs in database
cd /home/turf-booking/backend
node check-turfs.js

# Test 3: Test API endpoint
curl https://turfx.metaqode.co.in/api/turfs

# Test 4: Check backend is running
pm2 status
```

## Expected Results

After following these steps, you should see:
- ✅ 4 turfs in database (from seed script)
- ✅ All turfs are active
- ✅ API returns turfs: https://turfx.metaqode.co.in/api/turfs
- ✅ Website shows turfs in "Featured Turfs" section

## Need Help?

If turfs still not showing after all steps:
1. Share the output of `node check-turfs.js`
2. Share the output of `pm2 logs turf-backend --lines 50`
3. Share what you see when you open: https://turfx.metaqode.co.in/api/turfs
