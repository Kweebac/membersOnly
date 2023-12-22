if (process.env.NODE_ENV !== "production") require("dotenv").config();
const express = require("express");
const indexRouter = require("./controllers/index");
const mongoose = require("mongoose");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const session = require("express-session");
const User = require("./models/user");
const bcrypt = require("bcrypt");
const flash = require("express-flash");

mongoose.connect(process.env.MONGO_PRIVATE_URL);

passport.use(
  new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
    try {
      const user = await User.findOne({ email }).exec();

      if (!user) return done(null, false, { message: "No user with that email" });
      if (!(await bcrypt.compare(password, user.password)))
        return done(null, false, { message: "Incorrect password" });
      done(null, user);
    } catch (err) {
      done(err);
    }
  })
);
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).exec();
    done(null, user);
  } catch (err) {
    done(err);
  }
});

const app = express();
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: false }));
app.use(express.static(`${__dirname}/public`));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});
app.use("/", indexRouter);
app.use((err, req, res, next) => {
  res.status(500).send(err);
});

app.listen(3000);
