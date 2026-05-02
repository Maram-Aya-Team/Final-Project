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

        const user = await User.findOne({ email });
        return done(null, user);
        } catch (error) {
        return done(error);
       }
    },
  ),
);

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id)
    .then((user) => done(null, user))
    .catch((error) => done(error, null));
});

module.exports = passport;
