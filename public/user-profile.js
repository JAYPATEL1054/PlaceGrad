// user-profile.js - User Authentication and Profile Management

// API Configuration
const API_BASE_URL = window.location.origin + '/api';

// DOM Elements that will be updated
let profileBtn = null;
let profileImg = null;
let profileName = null;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeProfile();
    setupProfileDropdown();
});

// Initialize profile elements and load user data
function initializeProfile() {
    // Get profile elements
    profileBtn = document.querySelector('.profile-btn');
    profileImg = document.querySelector('.profile-img');
    profileName = document.querySelector('.profile-btn span');

    // Check authentication and load profile
    if (checkAuthentication()) {
        loadUserProfile();
    }
}

// Check if user is authenticated
function checkAuthentication() {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
        redirectToLogin();
        return false;
    }

    // Validate token
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp * 1000 < Date.now()) {
            // Token expired
            handleLogout();
            return false;
        }
        return true;
    } catch (error) {
        console.error('Invalid token:', error);
        handleLogout();
        return false;
    }
}

// Load user profile data
async function loadUserProfile() {
    try {
        // First try to get data from localStorage if available
        const cachedUserData = localStorage.getItem('userData');
        if (cachedUserData) {
            const userData = JSON.parse(cachedUserData);
            updateProfileDisplay(userData);
        }

        // Then fetch fresh data from API
        const response = await fetch(`${API_BASE_URL}/user/profile`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                handleLogout();
                return;
            }
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        if (data.success && data.user) {
            // Cache the user data
            localStorage.setItem('userData', JSON.stringify(data.user));
            updateProfileDisplay(data.user);
        } else {
            throw new Error(data.message || 'Failed to load profile data');
        }

    } catch (error) {
        console.error('Error loading profile:', error);
        
        // If API fails, try to use cached data or show fallback
        const cachedUserData = localStorage.getItem('userData');
        if (cachedUserData) {
            const userData = JSON.parse(cachedUserData);
            updateProfileDisplay(userData);
        } else {
            // Show fallback display
            updateProfileDisplay({
                username: 'User',
                email: 'user@example.com'
            });
        }
    }
}

// Update profile display with user data
function updateProfileDisplay(user) {
    if (!profileName || !profileImg) return;

    // Determine display name
    let displayName = 'User';
    if (user.profile && (user.profile.firstName || user.profile.lastName)) {
        displayName = `${user.profile.firstName || ''} ${user.profile.lastName || ''}`.trim();
    } else if (user.username) {
        displayName = user.username;
    } else if (user.email) {
        displayName = user.email.split('@')[0];
    }

    // Update profile name
    profileName.textContent = displayName;

    // Update profile image
    const avatarUrl = generateAvatarUrl(displayName);
    profileImg.src = avatarUrl;
    profileImg.alt = displayName;

    // Add user data to profile elements for easy access
    profileBtn.setAttribute('data-user', JSON.stringify(user));
}

// Generate avatar URL
function generateAvatarUrl(name) {
    const initials = name.split(' ')
        .map(word => word.charAt(0).toUpperCase())
        .join('')
        .substring(0, 2);
    
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=0D8ABC&color=fff&size=200&bold=true`;
}

// Setup profile dropdown functionality
function setupProfileDropdown() {
    const profileDropdown = document.querySelector('.profile-dropdown');
    const profileDropdownContent = document.querySelector('.profile-dropdown-content');

    if (!profileDropdown || !profileDropdownContent) return;

    // Toggle dropdown on click
    profileBtn?.addEventListener('click', function(e) {
        e.stopPropagation();
        profileDropdownContent.classList.toggle('show');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!profileDropdown.contains(e.target)) {
            profileDropdownContent.classList.remove('show');
        }
    });

    // Handle dropdown menu items
    const dropdownLinks = profileDropdownContent.querySelectorAll('a');
    dropdownLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href === 'login.html' && this.textContent.includes('Logout')) {
                e.preventDefault();
                handleLogout();
            } else if (href === 'myresume.html' && this.textContent.includes('My Resume')) {
                e.preventDefault();
                handleResume();
            }
        });
    });
}

// Handle logout
function handleLogout() {
    // Clear all stored data
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    
    // Clear any session storage if used
    sessionStorage.clear();
    
    // Redirect to login
    redirectToLogin();
}

// Redirect to login page
function redirectToLogin() {
    window.location.href = '/login.html';
}

// Handle resume
function handleResume() {
    window.location.href = '/myresume.html';
}

// Utility function to get current user data
function getCurrentUser() {
    const userData = localStorage.getItem('userData');
    if (userData) {
        try {
            return JSON.parse(userData);
        } catch (error) {
            console.error('Error parsing user data:', error);
        }
    }
    return null;
}

// Utility function to get auth token
function getAuthToken() {
    return localStorage.getItem('authToken');
}

// Export functions for use in other scripts
window.UserProfile = {
    loadUserProfile,
    getCurrentUser,
    getAuthToken,
    handleLogout,
    checkAuthentication
};

// Add CSS for dropdown functionality
const style = document.createElement('style');
style.textContent = `
    .profile-dropdown {
        position: relative;
    }

    .profile-dropdown-content {
        display: none;
        position: absolute;
        right: 0;
        top: 100%;
        background-color: white;
        min-width: 200px;
        box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
        border-radius: 8px;
        z-index: 1000;
        overflow: hidden;
    }

    .profile-dropdown-content.show {
        display: block;
    }

    .profile-dropdown-content a {
        color: #333;
        padding: 12px 16px;
        text-decoration: none;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: background-color 0.3s;
    }

    .profile-dropdown-content a:hover {
        background-color: #f1f1f1;
    }

    .profile-btn {
        background: none;
        border: none;
        display: flex;
        align-items: center;
        gap: 10px;
        cursor: pointer;
        padding: 8px 12px;
        border-radius: 8px;
        transition: background-color 0.3s;
    }

    .profile-btn:hover {
        background-color: rgba(255, 255, 255, 0.1);
    }

    .profile-img {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        object-fit: cover;
    }

    .profile-btn span {
        color: white;
        font-weight: 500;
    }

    .profile-btn i {
        color: white;
        font-size: 12px;
    }
`;

document.head.appendChild(style);