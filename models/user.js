const mongoose = require("mongoose");

module.exports = mongoose.model(
  "User",
  mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    membership: { type: Boolean, required: true },
  })
);
