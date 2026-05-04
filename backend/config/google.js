const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/userSchema");

passport.use(
    new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            const email = profile.emails?.[0]?.value?.toLowerCase();
            if (!email) {
                return done(new Error("Google account does not provide an email."));
        }

        let user = await User.findOne({ email });

        if (!user) {
          user = await User.create({
            name: profile.displayName,
            email,
            avatar: profile.photos?.[0]?.value || null,
            googleId: profile.id,
            password: null,
            isEmailVerified: true,
          });
        } else {
          user.googleId = user.googleId || profile.id;
          user.avatar = user.avatar || profile.photos?.[0]?.value || null;
          user.isEmailVerified = true;
          await user.save();
        }

        return done(null, user);
        } catch (err) {
        return done(err);
       }
    },
  ),
);

module.exports = passport;
