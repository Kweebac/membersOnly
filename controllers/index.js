const router = require("express").Router();
const User = require("../models/user");
const Message = require("../models/message");
const bcrypt = require("bcrypt");
const { body, validationResult } = require("express-validator");
const passport = require("passport");

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) next();
  else res.redirect("/login");
}
function checkNotAuthenticated(req, res, next) {
  if (!req.isAuthenticated()) next();
  else res.redirect("/");
}

router.get("/", async (req, res) => {
  const allMessages = await Message.find().populate("author").exec();

  res.render("index", {
    allMessages,
  });
});

router.get("/register", checkNotAuthenticated, (req, res) =>
  res.render("register", {
    user: undefined,
    errors: [],
  })
);
router.post("/register", [
  body("firstName").escape().trim(),
  body("lastName").escape().trim(),
  body("email").escape().trim(),
  body("passwordConfirmation").escape().trim(),
  body("password")
    .escape()
    .trim()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .custom((value, { req }) => {
      return value === req.body.passwordConfirmation;
    })
    .withMessage("Passwords don't match"),

  async (req, res) => {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: hashedPassword,
      membership: false,
    });

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      await user.save();
      res.redirect("/login");
    } else {
      res.render("register", {
        user,
        errors: errors.array(),
      });
    }
  },
]);

router.get("/login", checkNotAuthenticated, (req, res) => res.render("login"));
router.post("/login", [
  body("email").escape().trim(),
  body("password").escape().trim(),
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
  }),
]);

router.get(
  "/membership",
  checkAuthenticated,
  (req, res, next) => {
    if (req.user.membership) res.redirect("/");
    else next();
  },
  (req, res) => res.render("membership", { secretCode: undefined, errors: [] })
);
router.post("/membership", [
  body("secretCode")
    .escape()
    .trim()
    .custom((value, { req }) => {
      return value === "CyberedCake";
    })
    .withMessage("Secret code is incorrect"),

  async (req, res) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      await User.findOneAndUpdate({ email: req.user.email }, { membership: true });
      res.redirect("/");
    } else {
      res.render("membership", {
        secretCode: req.body.secretCode,
        errors: errors.array(),
      });
    }
  },
]);

router.get("/logout", function (req, res, next) {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("/");
  });
});

router.get("/newMessage", checkAuthenticated, (req, res) =>
  res.render("newMessage", {
    message: undefined,
    errors: [],
  })
);
router.post("/newMessage", [
  body("title").escape().trim(),
  body("body")
    .escape()
    .trim()
    .isLength({ min: 15 })
    .withMessage("Password must be at least 15 characters"),

  async (req, res) => {
    const message = new Message({
      title: req.body.title,
      body: req.body.body,
      author: req.user,
    });

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      await message.save();
      res.redirect("/");
    } else {
      res.render("newMessage", {
        message,
        errors: errors.array(),
      });
    }
  },
]);

module.exports = router;
