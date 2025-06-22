import express from 'express';
import passport from 'passport';

const router = express.Router();

// Google OAuth routes
router.get(
  '/google',
  passport.authenticate('google', { 
    scope: [
      'profile', 
      'email',
      'https://www.googleapis.com/auth/calendar.events'
    ],
    accessType: 'offline',
    prompt: 'consent'
  })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { 
    failureRedirect: '/login',
    failureMessage: true
  }),
  (req, res) => {
    console.log('Authentication successful, user:', req.user);
    console.log('Session after auth:', req.session);
    
    // Set a cookie to indicate successful login
    res.cookie('auth_success', 'true', { 
      maxAge: 1000 * 60 * 5, // 5 minutes
      httpOnly: false // Allow client-side access
    });

    // Ensure the session is saved before redirecting
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.redirect('/login');
      }
      res.redirect(process.env.CLIENT_URL || 'http://localhost:5173');
    });
  }
);

// Get current user
router.get('/me', (req, res) => {
  console.log('Checking authentication status:', req.isAuthenticated());
  console.log('Session in /me:', req.session);
  console.log('User in /me:', req.user);
  
  if (req.isAuthenticated()) {
    console.log('User is authenticated:', req.user);
    res.json(req.user);
  } else {
    console.log('User is not authenticated');
    res.status(401).json({ message: 'Not authenticated' });
  }
});

// Logout route
router.get('/logout', (req, res) => {
  req.logout(() => {
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destroy error:', err);
      }
      res.clearCookie('auth_success');
      res.redirect(process.env.CLIENT_URL || 'http://localhost:5173');
    });
  });
});

export default router; 