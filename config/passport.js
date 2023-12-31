const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("../models/user");

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

passport.use(
  "local.register",
  new LocalStrategy(
    {
      usernameField: "emailr",
      passwordField: "passwordr",
      passReqToCallback: true,
    },
    async (req, email, password, done) => {
      try {
        const user = await User.findOne({ email: email });
        if (user) {
          return done(null, false, { message: "Email already exists" });
        }
        if (password != req.body.cpasswordr) {
          return done(null, false, { message: "Passwords must match" });
        }
        const newUser = await new User();
        newUser.name = req.body.namer;
        newUser.email = email;
        newUser.password = newUser.encryptPassword(password);
        await newUser.save();
        return done(null, newUser);
      } catch (error) {
        console.log(error);
        return done(error);
      }
    }
  )
);

passport.use(
  "local.login",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: false,
    },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email: email });
        if (!user) {
          return done(null, false, { message: "User doesn't exist" });
        }
        if (!user.validPassword(password)) {
          return done(null, false, { message: "Wrong password" });
        }
        return done(null, user);
      } catch (error) {
        console.log(error);
        return done(error);
      }
    }
  )
);

passport.use(
  "local.admin-login",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: false,
    },
    async (email, password, done) => {
      try {
        const adminUser = await User.findOne({
          email: email,
          isAdmin: true,
        });

        if (!adminUser) {
          return done(null, false, { message: "Admin not found." });
        }

        if (!adminUser.validPassword(password)) {
          return done(null, false, { message: "Incorrect admin password." });
        }

        return done(null, adminUser);
      } catch (error) {
        console.log(error);
        return done(error);
      }
    }
  )
);
