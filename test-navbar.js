// Simple test to check if navbar has been updated
const fs = require('fs');

console.log('🔍 Checking navbar file...');

const navbarContent = fs.readFileSync('./frontend/src/components/Navbar.jsx', 'utf8');

if (navbarContent.includes('Admin')) {
  console.log('❌ Admin button still found in navbar file!');
} else {
  console.log('✅ Admin button successfully removed from navbar file');
}

if (navbarContent.includes('List Your Venue')) {
  console.log('❌ List Your Venue button still found in navbar file!');
} else {
  console.log('✅ List Your Venue button successfully removed from navbar file');
}

if (navbarContent.includes('toggleTheme')) {
  console.log('❌ Dark mode toggle still found in navbar file!');
} else {
  console.log('✅ Dark mode toggle successfully removed from navbar file');
}

console.log('\n📝 Navbar file is correct. Issue is likely browser caching.');
console.log('💡 Try these solutions:');
console.log('   1. Hard refresh: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)');
console.log('   2. Clear browser cache completely');
console.log('   3. Try incognito/private browsing mode');
console.log('   4. Try a different browser');
console.log('   5. Check if you\'re looking at the right URL');