import passport from 'passport';
import { Strategy as GoogleStrategy, Profile } from 'passport-google-oauth20';
import dotenv from 'dotenv';
import { getUserByGoogleId, createUser, getUserById, User } from '../models/user.model.js';

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: `${process.env.SERVER_URL || 'http://localhost:3000'}/auth/google/callback`,
      scope: [
        'profile', 
        'email',
        'https://www.googleapis.com/auth/calendar.events'
      ],
    },
    async (accessToken: string, refreshToken: string, profile: Profile, done: (error: any, user?: any) => void) => {
      try {
        console.log('Google profile:', profile);
        console.log('Received Refresh Token:', refreshToken);
        
        const user = await getUserByGoogleId(profile.id);

        if (user) {
          if (refreshToken) {
            user.refreshToken = refreshToken;
            await user.save();
            console.log('Updated refresh token for existing user.');
          }
          return done(null, user);
        } else {
          const newUser = await createUser({
            googleId: profile.id,
            email: profile.emails?.[0]?.value || '',
            name: profile.displayName,
            picture: profile.photos?.[0]?.value,
            refreshToken: refreshToken,
          });
          console.log('Created new user with refresh token.');
          return done(null, newUser);
        }
      } catch (error) {
        console.error('Google strategy error:', error);
        return done(error as Error);
      }
    }
  )
);

passport.serializeUser((user: any, done) => {
  console.log('Serializing user:', user);
  done(null, user._id.toString());
});

passport.deserializeUser(async (id: string, done) => {
  try {
    console.log('Deserializing user ID:', id);
    const user = await getUserById(id);
    console.log('Deserialized user:', user);
    done(null, user);
  } catch (error) {
    console.error('Deserialize error:', error);
    done(error);
  }
}); 