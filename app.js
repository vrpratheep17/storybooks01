const express = require("express");
const passport = require("passport");
const methodOverride = require("method-override");
const path = require("path");
const bodyParser = require("body-parser");
const exphbs = require("express-handlebars");
const cookieParser = require("cookie-parser");
const session = require("express-session");

const mongoose = require("mongoose");
const app = express();

//load users
require("./models/User");
//load stories
require("./models/story");
//load routes
const auth = require("./routes/auth");
const index = require("./routes/index");
const stories = require("./routes/stories");
//load keys
const keys = require("./config/keys");
//method overide middleware
app.use(methodOverride("_method"));
//bodyparser midleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
//handleabrs helpers
const {
  truncate,
  stripTags,
  formatDate,
  select,
  editIcon
} = require("./helpers/hbs");
//epress handlebars midd
app.engine(
  "handlebars",
  exphbs({
    helpers: {
      truncate: truncate,
      stripTags: stripTags,
      formatDate: formatDate,
      select: select,
      editIcon: editIcon
    },
    defaultLayout: "main"
  })
);
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
app.use("/stories", stories);

//set static folder
app.use(express.static(path.join(__dirname, "public")));
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`server is running on ${port}`);
});
