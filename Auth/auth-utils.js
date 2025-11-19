/**
 * Authentication Utilities
 * Handles login state, logout, and page protection
 */

const AuthUtils = {
  /**
   * Check if user is logged in
   * @returns {boolean}
   */
  isLoggedIn() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return !!(token && user);
  },

  /**
   * Get current user data
   * @returns {Object|null}
   */
  getCurrentUser() {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      console.error('Error parsing user data:', e);
      return null;
    }
  },

  /**
   * Logout user - clear all session data
   */
  logout() {
    // Clear all authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Clear any other session data if exists
    localStorage.removeItem('cart');
    localStorage.removeItem('wishlist');
    
    // Clear sessionStorage as well
    sessionStorage.clear();
    
    // Redirect to login page
    window.location.replace('../Auth/loginpage.html');
  },

  /**
   * Protect a page - redirect to login if not authenticated
   * Call this at the top of protected pages
   */
  requireAuth() {
    if (!this.isLoggedIn()) {
      // Store intended destination
      sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
      
      // Redirect to login
      window.location.replace('../Auth/loginpage.html');
      return false;
    }
    return true;
  },

  /**
   * Prevent back button navigation after logout
   * Call this on protected pages
   */
  preventBackAfterLogout() {
    // Add state to history
    window.history.pushState(null, '', window.location.href);
    
    // Listen for back button
    window.addEventListener('popstate', () => {
      if (!this.isLoggedIn()) {
        window.history.pushState(null, '', window.location.href);
        window.location.replace('../Auth/loginpage.html');
      } else {
        window.history.pushState(null, '', window.location.href);
      }
    });
  },

  /**
   * Initialize auth protection on page load
   * Call this on every protected page
   */
  initPageProtection() {
    // Check auth immediately
    if (!this.requireAuth()) {
      return false;
    }
    
    // Prevent back button after logout
    this.preventBackAfterLogout();
    
    // Revalidate on page visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && !this.isLoggedIn()) {
        window.location.replace('../Auth/loginpage.html');
      }
    });
    
    return true;
  }
};

// Make it available globally
window.AuthUtils = AuthUtils;