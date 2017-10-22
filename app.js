const express = require("express");
const path = require("path");
const favicon = require("serve-favicon");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const expressValidator = require("express-validator");

// Auth packages
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require('bcrypt');

const index = require("./routes/index");
const users = require("./routes/users");

const app = express();

require("dotenv").config();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

let sessionStore;
if (process.env.NODE_ENV === 'production') {
  const MySQLStore = require('express-mysql-session')(session);
  const options = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  };
  sessionStore = new MySQLStore(options);
} else {
  const SQLiteStore = require('connect-sqlite3')(session);
  const options = {
    table: 'sessions',
    db: 'dev.db',
    dir: './sqlite'
  }
  sessionStore = new SQLiteStore(options);
}

app.use(session({
  store: sessionStore,
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  //cookie: { secure: true }
}));
app.use(passport.initialize());
app.use(passport.session());

// pass auth state to every view
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.isAuthenticated();
  next();
})
app.use("/", index);
app.use("/users", users);

passport.use(new LocalStrategy((username, password, done) => {
  const db = require("./db");
  const params = [username];

  db.all('SELECT id, password FROM users WHERE username = ?', params, (err, results, fields) => {
    if (err) {
      return done(err);
    }

    if (results.length === 0) {
      return done(null, false);
    } else {
      const hash = results[0].password.toString();
      
      bcrypt.compare(password, hash, (err, response) => {
        if (response === true) {
          return done(null, { user_id: results[0].id });
        } else {
          return done(null, false);
        }
      });
    }
  });
}));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

// Handlebars default config
const hbs = require("hbs");
const fs = require("fs");

const partialsDir = __dirname + "/views/partials";

const filenames = fs.readdirSync(partialsDir);

filenames.forEach(function(filename) {
  const matches = /^([^.]+).hbs$/.exec(filename);
  if (!matches) {
    return;
  }
  const name = matches[1];
  const template = fs.readFileSync(partialsDir + "/" + filename, "utf8");
  hbs.registerPartial(name, template);
});

hbs.registerHelper("json", function(context) {
  return JSON.stringify(context, null, 2);
});

module.exports = app;
