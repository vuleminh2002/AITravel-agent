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
      console.log('Making getCurrentUser request to:', `${API_URL}/auth/me`);
      const response = await fetch(`${API_URL}/auth/me`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      console.log('getCurrentUser response status:', response.status);
      console.log('getCurrentUser response headers:', response.headers);
      
      if (response.ok) {
        const userData = await response.json();
        console.log('Received user data:', userData);
        return userData;
      }
      console.log('Failed to get user data:', response.status);
      const errorText = await response.text();
      console.log('Error response body:', errorText);
      return null;
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
  },
}; 