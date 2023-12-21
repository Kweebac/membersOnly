if (process.env.NODE_ENV !== "production") require("dotenv").config();
const express = require("express");
const indexRouter = require("./controllers/index");
const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_PRIVATE_URL);

const app = express();
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use("/", indexRouter);

app.listen(3000);
