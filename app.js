require("dotenv").config();
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const flash = require("connect-flash");
var MongoStore = require("connect-mongo")(session);
const connectDB = require("./config/db");
const createAdminUser = require("./createAdmin");

const app = express();
require("./config/passport");

// mongodb configuration
// connectDB();
createAdminUser();
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static('public'))

app.use(session({
  secret: 'GOG website',
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({ mongooseConnection: mongoose.connection }),
  cookie: {maxAge: 180 * 60 * 1000}
}));


app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

//routes config
const indexRouter = require("./routes/index");
const {productsRouter} = require("./routes/products");
const {adminRouter} = require("./routes/admin");
app.use('/', indexRouter);
app.use('/products', productsRouter);
app.use('/admin', adminRouter);

var port = process.env.PORT || 3000;
app.set("port", port);
app.listen(port, () => {
  console.log("Server running at port " + port);
});

module.exports = app;
