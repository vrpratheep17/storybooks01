const express = require("express");
const passport = require("passport");
const mongoose = require("mongoose");
const app = express();
//passport config
require("./config/passport")(passport);
app.get("/", (req, res) => {
  res.send("it works");
});
//load routes
const auth = require("./routes/auth");
app.use("/auth", auth);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`server is running on ${port}`);
});
