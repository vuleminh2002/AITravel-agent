const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Debug logging
console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('Final API_URL:', API_URL);

export const authService = {
  loginWithGoogle: () => {
    const loginUrl = `${API_URL}/auth/google`;
    console.log('Redirecting to:', loginUrl);
    window.location.href = loginUrl;
  },

  logout: async () => {
    try {
      const response = await fetch(`${API_URL}/auth/logout`, {
        method: 'GET',
        credentials: 'include',
      });
      if (response.ok) {
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const userData = await response.json();
        console.log('Received user data:', userData);
        return userData;
      }
      console.log('Failed to get user data:', response.status);
      return null;
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
  },
}; 