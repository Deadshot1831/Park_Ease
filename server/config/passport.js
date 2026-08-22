const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

// Passport handles Google OAuth only; bearer tokens go through
// middleware/auth.js, which is also where session revocation is enforced.

// Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user already exists
          let user = await User.findOne({ googleId: profile.id });

          if (user) {
            return done(null, user);
          }

          // An account may already exist for this address. Adopting it is only
          // safe when nobody could be sitting on it with a password we never
          // verified: registration does not confirm email ownership, so someone
          // can sign up with a stranger's address and wait for the real owner
          // to arrive via Google, ending up sharing the account with them.
          user = await User.findOne({ email: profile.emails[0].value }).select('+password');

          if (user && user.password && !user.isEmailVerified) {
            return done(null, false);
          }

          if (user) {
            // Safe to link: the account has no password, or it is verified
            user.googleId = profile.id;
            user.avatar = profile.photos[0]?.value || user.avatar;
            await user.save();
            return done(null, user);
          }

          // Create new user
          user = await User.create({
            name: profile.displayName,
            email: profile.emails[0].value,
            googleId: profile.id,
            avatar: profile.photos[0]?.value,
            isEmailVerified: true,
          });

          return done(null, user);
        } catch (error) {
          return done(error, false);
        }
      }
    )
  );
}

module.exports = passport;
