const mongoose = require("mongoose");

module.exports = mongoose.model(
  "Message",
  mongoose.Schema({
    title: { type: String, required: true },
    body: { type: String, required: true },
    timestamp: { type: Date, required: true, default: Date.now },
    author: { type: mongoose.SchemaTypes.ObjectId, ref: "User", required: true },
  })
);
