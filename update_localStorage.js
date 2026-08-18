// Script to update localStorage for existing users
// Run this in browser console on http://localhost:3000

(function () {
    const USERS_KEY = 'pnevmoscan_db_users';
    const SESSION_KEY = 'pnevmoscan_current_user';

    // Update users in localStorage
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    let updated = false;

    users.forEach(user => {
        if (user.email === 'mansur3909@gmail.com' && user.role === 'admin') {
            user.role = 'super_admin';
            updated = true;
            console.log('✅ Updated user to super_admin:', user.email);
        }
    });

    if (updated) {
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
        console.log('✅ Users updated in localStorage');
    } else {
        console.log('ℹ️ No users needed updating');
    }

    // Update current session if logged in as mansur3909@gmail.com
    const currentUser = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
    if (currentUser && currentUser.email === 'mansur3909@gmail.com' && currentUser.role === 'admin') {
        currentUser.role = 'super_admin';
        localStorage.setItem(SESSION_KEY, JSON.stringify(currentUser));
        console.log('✅ Current session updated to super_admin');
        console.log('⚠️ Please refresh the page to see changes');
    }

    console.log('\n📊 Current users:', users);
})();
