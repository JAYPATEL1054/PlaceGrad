// DOM Elements
const loginForm = document.getElementById('loginForm');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const rememberCheckbox = document.getElementById('remember');
const passwordToggle = document.getElementById('passwordToggle');
const errorMessage = document.getElementById('errorMessage');
const successMessage = document.getElementById('successMessage');
const loginBtn = document.querySelector('.login-btn');
const inputs = document.querySelectorAll('.form-control');
const forgotPasswordLink = document.querySelector('.forgot-password');

// API Configuration
const API_BASE_URL = window.location.origin + '/api';

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    checkExistingAuth();
});

// Initialize application
function initializeApp() {
    setupEventListeners();
    setupInputAnimations();
    setupPasswordToggle();
    setupRippleEffect();
    loadSavedCredentials();
}

// Load saved credentials if 'Remember Me' was checked
function loadSavedCredentials() {
    const savedCredentials = localStorage.getItem('savedCredentials');
    if (savedCredentials) {
        const { username, password } = JSON.parse(savedCredentials);
        usernameInput.value = username;
        passwordInput.value = password;
        rememberCheckbox.checked = true;
    }
}

// Check if user is already authenticated
function checkExistingAuth() {
    const token = localStorage.getItem('authToken');
    if (token && isTokenValid(token)) {
        // User is already logged in, could redirect to dashboard
        console.log('User already authenticated');
        // Uncomment the next line to auto-redirect authenticated users
        // window.location.href = '/dashboard.html';
    }
}

// Check if JWT token is valid (basic check)
function isTokenValid(token) {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp * 1000 > Date.now();
    } catch (error) {
        return false;
    }
}

// Setup all event listeners
function setupEventListeners() {
    // Form submission
    loginForm.addEventListener('submit', handleLogin);
    
    // Forgot password link
    forgotPasswordLink.addEventListener('click', handleForgotPassword);
    
    // Input focus animations
    inputs.forEach(input => {
        input.addEventListener('focus', handleInputFocus);
        input.addEventListener('blur', handleInputBlur);
        input.addEventListener('input', handleInputChange);
    });
}

// Handle forgot password link click
function handleForgotPassword(e) {
    e.preventDefault();
    window.location.href = '/forgot-password';
}

// Handle login form submission
async function handleLogin(e) {
    e.preventDefault();
    
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    const remember = rememberCheckbox.checked;
    
    // Hide any previous messages
    hideMessages();
    
    // Validate inputs
    if (!validateInputs(username, password)) {
        return;
    }
    
    // Show loading state
    setLoadingState(true);
    
    try {
        // Make API call to login endpoint
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username,
                password,
                remember
            })
        });

        const data = await response.json();
        
        if (response.ok && data.success) {
            handleLoginSuccess(data);
        } else {
            handleLoginFailure(data.message || 'Login failed');
        }
        
    } catch (error) {
        console.error('Login error:', error);
        handleLoginFailure('Network error. Please check your connection and try again.');
    }
    
    setLoadingState(false);
}

// Validate form inputs
function validateInputs(username, password) {
    if (!username || !password) {
        showErrorMessage('Please fill in all fields.');
        return false;
    }
    
    if (username.length < 3) {
        showErrorMessage('Username must be at least 3 characters long.');
        return false;
    }
    
    if (password.length < 6) {
        showErrorMessage('Password must be at least 6 characters long.');
        return false;
    }
    
    return true;
}

// Handle successful login response
function handleLoginSuccess(data) {
    if (data.requiresOTP) {
        // Save credentials if 'Remember Me' is checked
        if (rememberCheckbox.checked) {
            const credentials = {
                username: usernameInput.value.trim(),
                password: passwordInput.value.trim()
            };
            localStorage.setItem('savedCredentials', JSON.stringify(credentials));
        } else {
            localStorage.removeItem('savedCredentials');
        }

        // OTP is required, redirect to OTP verification page
        showSuccessMessage(data.message || 'Login credentials verified. Please check your email for OTP.');
        
        // Store temporary token
        sessionStorage.setItem('tempToken', data.tempToken);
        
        // Animate success
        animateLoginSuccess();
        
        // Redirect to OTP verification page with parameters
        setTimeout(() => {
            const otpUrl = `/otp-verification?token=${encodeURIComponent(data.tempToken)}&email=${encodeURIComponent(data.email)}`;
            window.location.href = otpUrl;
        }, 1500);
    } else {
        // Direct login (no OTP required)
        showSuccessMessage(data.message || 'Login successful! Welcome to PlaceGrad.');
        
        // Store authentication data
        if (data.token) {
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('userData', JSON.stringify(data.user));
            
            // Save credentials if 'Remember Me' is checked
            if (rememberCheckbox.checked) {
                const credentials = {
                    username: usernameInput.value.trim(),
                    password: passwordInput.value.trim()
                };
                localStorage.setItem('savedCredentials', JSON.stringify(credentials));
            } else {
                localStorage.removeItem('savedCredentials');
            }
        }
        
        // Animate success
        animateLoginSuccess();
        
        // Redirect to dashboard
        setTimeout(() => {
            const userRole = data.user?.role || 'student';
            redirectToDashboard(userRole);
        }, 2000);
    }
}

// Handle login failure
function handleLoginFailure(message) {
    // Use the actual error message from the server, or a generic one
    const errorMsg = message || 'Invalid username or password. Please try again.';
    showErrorMessage(errorMsg);
    
    // Shake the login card
    animateLoginFailure();
    
    // Clear sensitive data but maintain username if 'Remember Me' is checked
    if (!rememberCheckbox.checked) {
        passwordInput.value = '';
        localStorage.removeItem('savedCredentials');
    }
}

// Redirect to appropriate dashboard based on user role
function redirectToDashboard(role) {
    if (role === 'admin') {
        window.location.href = '/admin-dashboard.html';
    } else {
        window.location.href = '/home.html';
    }
}

// Show error message
function showErrorMessage(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    errorMessage.classList.add('animate');
    
    setTimeout(() => {
        errorMessage.classList.remove('animate');
    }, 500);
}

// Show success message
function showSuccessMessage(message) {
    successMessage.textContent = message;
    successMessage.style.display = 'block';
    successMessage.classList.add('animate');
}

// Hide all messages
function hideMessages() {
    errorMessage.style.display = 'none';
    successMessage.style.display = 'none';
}

// Set loading state for login button
function setLoadingState(isLoading) {
    if (isLoading) {
        loginBtn.textContent = 'Signing In...';
        loginBtn.disabled = true;
        loginBtn.style.opacity = '0.8';
    } else {
        loginBtn.textContent = 'Login';
        loginBtn.disabled = false;
        loginBtn.style.opacity = '1';
    }
}

// Reset form to initial state
function resetForm() {
    loginForm.reset();
    hideMessages();
    setLoadingState(false);
    // Reset password visibility to hidden state
    passwordInput.type = 'password';
    passwordToggle.textContent = '🔒';
    passwordToggle.style.color = '#9ca3af';
    passwordToggle.title = 'Show password';
}

// Handle input focus
function handleInputFocus(e) {
    const container = e.target.parentElement;
    container.style.transform = 'scale(1.02)';
    container.style.transition = 'transform 0.3s ease';
}

// Handle input blur
function handleInputBlur(e) {
    const container = e.target.parentElement;
    container.style.transform = 'scale(1)';
}

// Handle input changes
function handleInputChange(e) {
    const input = e.target;
    
    // For username field, change the icon color
    if (input.id === 'username') {
        const icon = input.nextElementSibling;
        if (input.value.length > 0) {
            icon.style.color = '#3b82f6';
        } else {
            icon.style.color = '#9ca3af';
        }
    }
}

// Setup input animations
function setupInputAnimations() {
    inputs.forEach(input => {
        const label = input.parentElement.parentElement.querySelector('label');
        
        input.addEventListener('focus', () => {
            label.style.color = '#3b82f6';
            label.style.transform = 'translateY(-2px)';
        });
        
        input.addEventListener('blur', () => {
            if (!input.value) {
                label.style.color = '#374151';
                label.style.transform = 'translateY(0)';
            }
        });
    });
}

// Setup password visibility toggle
function setupPasswordToggle() {
    let isPasswordVisible = false;
    
    passwordInput.type = 'password';
    passwordToggle.textContent = '🔒';
    passwordToggle.title = 'Show password';
    passwordToggle.style.color = '#9ca3af';
    
    passwordToggle.addEventListener('click', function() {
        isPasswordVisible = !isPasswordVisible;
        
        if (isPasswordVisible) {
            passwordInput.type = 'text';
            this.textContent = '👁️';
            this.style.color = '#3b82f6';
            this.title = 'Hide password';
        } else {
            passwordInput.type = 'password';
            this.textContent = '🔒';
            this.style.color = '#9ca3af';
            this.title = 'Show password';
        }
        
        this.style.transform = 'translateY(-50%) scale(1.2)';
        setTimeout(() => {
            this.style.transform = 'translateY(-50%) scale(1)';
        }, 150);
    });
    
    passwordInput.addEventListener('focus', () => {
        if (!isPasswordVisible) {
            passwordToggle.style.color = '#6b7280';
        }
    });
    
    passwordInput.addEventListener('blur', () => {
        if (!isPasswordVisible && !passwordInput.value) {
            passwordToggle.style.color = '#9ca3af';
        }
    });
    
    passwordInput.addEventListener('input', () => {
        if (passwordInput.value.length > 0 && !isPasswordVisible) {
            passwordToggle.style.color = '#6b7280';
        } else if (passwordInput.value.length === 0 && !isPasswordVisible) {
            passwordToggle.style.color = '#9ca3af';
        }
    });
}

// Setup ripple effect for button
function setupRippleEffect() {
    loginBtn.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s linear;
            pointer-events: none;
        `;
        
        this.appendChild(ripple);
        
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.remove();
            }
        }, 600);
    });
}

// Animate login success
function animateLoginSuccess() {
    const loginCard = document.querySelector('.login-card');
    loginCard.style.transform = 'scale(1.05)';
    loginCard.style.boxShadow = '0 30px 60px rgba(34, 197, 94, 0.3)';
    loginCard.style.transition = 'all 0.3s ease';
    
    setTimeout(() => {
        loginCard.style.transform = 'scale(1)';
        loginCard.style.boxShadow = '0 25px 50px rgba(0, 0, 0, 0.25)';
    }, 300);
}

// Animate login failure
function animateLoginFailure() {
    const loginCard = document.querySelector('.login-card');
    loginCard.style.animation = 'shake 0.5s ease-in-out';
    
    setTimeout(() => {
        loginCard.style.animation = '';
    }, 500);
}

// Utility function to make authenticated API calls
async function makeAuthenticatedRequest(url, options = {}) {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
        throw new Error('No authentication token found');
    }
    
    const defaultHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
    
    return fetch(url, {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers
        }
    });
}

// Logout function
function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    sessionStorage.clear();
    window.location.href = '/';
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && document.activeElement.tagName !== 'BUTTON') {
        e.preventDefault();
        loginBtn.click();
    }
    
    if (e.key === 'Escape') {
        resetForm();
    }
});

// Handle window resize
window.addEventListener('resize', function() {
    const floatingElements = document.querySelectorAll('.floating-circle');
    floatingElements.forEach(element => {
        element.style.animationDuration = '8s';
    });
});

// Prevent form submission on invalid state
loginForm.addEventListener('invalid', function(e) {
    e.preventDefault();
    const firstInvalidInput = loginForm.querySelector(':invalid');
    if (firstInvalidInput) {
        firstInvalidInput.focus();
        showErrorMessage('Please fill in all required fields correctly.');
    }
}, true);

// Performance optimization: Debounce input validation
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Real-time validation with debouncing
const debouncedValidation = debounce(function(input) {
    if (input.value.length > 0) {
        input.style.borderColor = '#10b981';
    } else {
        input.style.borderColor = '#e5e7eb';
    }
}, 300);

inputs.forEach(input => {
    input.addEventListener('input', () => debouncedValidation(input));
});

// Export functions for potential use in other modules
window.PlaceGradAuth = {
    makeAuthenticatedRequest,
    logout,
    isAuthenticated: () => {
        const token = localStorage.getItem('authToken');
        return token && isTokenValid(token);
    },
    getUserData: () => {
        const userData = localStorage.getItem('userData');
        return userData ? JSON.parse(userData) : null;
    }
};
