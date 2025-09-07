function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showMessage(message, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
    
    // Add pulse animation for success messages
    if (type === 'success') {
        messageDiv.classList.add('animate-pulse');
        setTimeout(() => {
            messageDiv.classList.remove('animate-pulse');
        }, 600);
    }
    
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}

async function login(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    
    if (!username || !password) {
        showMessage('Please fill in all fields', 'error');
        return;
    }
    
    try {
        const response = await axios.post(API_ENDPOINTS.AUTH.LOGIN, {
            username,
            password
        });
        
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        window.location.href = 'dashboard.html';
    } catch (error) {
        const message = error.response?.data?.error || 'Login failed';
        showMessage(message, 'error');
    }
}

async function register(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (!username || !email || !password || !confirmPassword) {
        showMessage('Please fill in all fields', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showMessage('Passwords do not match', 'error');
        return;
    }
    
    if (password.length < 6) {
        showMessage('Password must be at least 6 characters', 'error');
        return;
    }
    
    try {
        await axios.post(API_ENDPOINTS.AUTH.REGISTER, {
            username,
            email,
            password
        });
        
        showMessage('Registration successful! Please login.', 'success');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
    } catch (error) {
        const message = error.response?.data?.error || 'Registration failed';
        showMessage(message, 'error');
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

function checkAuth() {
    const token = localStorage.getItem('token');
    const publicPages = ['login.html', 'register.html', 'index.html', 'services.html', 'features.html', 'payments.html', 'pricing.html'];
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    console.log('Checking auth for page:', currentPage, 'Token exists:', !!token);
    
    if (!token) {
        if (!publicPages.includes(currentPage)) {
            console.log('No token found, redirecting to login from:', currentPage);
            window.location.href = 'login.html';
        }
        return false;
    }
    
    return true;
}

function getAuthHeaders() {
    const token = localStorage.getItem('token');
    if (!token) {
        console.error('No token available for request');
        throw new Error('Authentication token not found');
    }
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
}