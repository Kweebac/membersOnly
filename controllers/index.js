const router = require("express").Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const { body, validationResult } = require("express-validator");

router.get("/", (req, res) => res.render("index"));
router.get("/register", (req, res) =>
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
      res.redirect("/");
    } else {
      res.render("register", {
        user,
        errors: errors.array(),
      });
    }
  },
]);

module.exports = router;
