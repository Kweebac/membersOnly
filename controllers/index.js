const router = require("express").Router();
const User = require("../models/user");
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

router.get("/", (req, res) => res.render("index"));

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

router.get("/login", checkNotAuthenticated, (req, res) =>
  res.render("login", {
    user: undefined,
    errors: [],
  })
);
router.post("/login", [
  body("email").escape().trim(),
  body("password").escape().trim(),
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
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

module.exports = router;
