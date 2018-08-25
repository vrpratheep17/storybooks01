const express = require("express");
const passport = require("passport");

const exphbs = require("express-handlebars");
const cookieParser = require("cookie-parser");
const session = require("express-session");

const mongoose = require("mongoose");
const app = express();

//load users
require("./models/User");
//load routes
const auth = require("./routes/auth");
const index = require("./routes/index");
//load keys
const keys = require("./config/keys");

//epress handlebars midd
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");
//passport middleware
app.use(cookieParser());
app.use(
  session({
    secret: "Secret",
    resave: true,
    saveUninitialized: true
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

//mongoose check
mongoose
  .connect(keys.mongoURI)
  .then(() => {
    console.log("database is up");
  })
  .catch(err => {
    console.log(err);
  });

//map global promises
mongoose.Promise = global.Promise;
//passport config
require("./config/passport")(passport);

app.use("/auth", auth);
app.use("/", index);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`server is running on ${port}`);
});
