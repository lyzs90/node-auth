const express = require("express");
const router = express.Router();
const expressValidator = require("express-validator");
const passport = require("passport");
const bcrypt = require('bcrypt');

const db = require("../db");

const saltRounds = 10; // hashes/sec

/* GET / */
router.get("/", (req, res) => {
  console.log(req.user);
  console.log(req.isAuthenticated());
  res.render("home", { title: "Home" });
});

/* GET /profile */
router.get("/profile", authenticationMiddleware(), (req, res) => {
  res.render("profile", { title: "Profile" });
})


/* GET /login */
router.get("/login", (req, res) => {
  res.render("login", { title: "Login" });
})

/* POST /login */
router.post("/login", passport.authenticate('local', {
  successRedirect: '/profile',
  failureRedirect: '/login'
}))

/* GET /logout */
router.get("/logout", (req, res) => {
  req.logout();
  req.session.destroy();
  res.redirect("/");
})

/* GET /register */
router.get("/register", (req, res) => {
  res.render("register", { title: "Registration" });
});

/* POST /register */
router.post("/register", (req, res) => {
  const { username, email, password } = req.body;

  req.checkBody("username", "Username field cannot be empty").notEmpty();
  req
    .checkBody("username", "Username must be between 4-15 characters long")
    .len(4, 15);
  req
    .checkBody("email", "The email you entered is invalid, please try again")
    .isEmail();
  req
    .checkBody("email", "Email must be between 4-100 characters long")
    .len(4, 100);
  req
    .checkBody("password", "Password must be between 8-100 characters long")
    .len(8, 100);
  req
    .checkBody(
      "password",
      "Password must include one lowercase character, one uppercase character, a number, and a special character"
    )
    .matches(/^(?=.*\d)(?=.*[a-z])(?!.* )(?=.*[^a-zA-Z0-9]).{8,}$/, "i");
  req
    .checkBody(
      "passwordMatch",
      "Password must be between 8-100 characters long"
    )
    .len(8, 100);
  req
    .checkBody("password", "Passwords do not match, please try again")
    .equals(password);

  const errors = req.validationErrors();

  if (errors) {
    console.log(`errors: ${JSON.stringify(errors)}`);

    res.render("register", { title: "Registration Error", errors });
  } else {
    const db = require("../db");

    // Hash password and store credentials in db
    bcrypt.hash(password, saltRounds, (err, hash) => {
      const params = [username, email, hash];

      db.run(
        `INSERT INTO users(username, email, password) VALUES(
          ?, ?, ?);`,
        params,
        err => {
          if (err) throw err;
          console.log(`User created!`);

          db.all('SELECT last_insert_rowid() as user_id', (err, results, fields) => {
            if (err) throw err;

            const user = results[0];

            req.login(user, err => {
              res.redirect('/');
              db.close();
            });
          });
        }
      );
    });
  }
});

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user)
});

function authenticationMiddleware() {
  return (req, res, next) => {
    console.log(`req.session.passport.user: ${JSON.stringify(req.session.passport)}`);

    if (req.isAuthenticated()) return next();

    res.redirect('/login');
  }
}

module.exports = router;
