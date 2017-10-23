# node-auth

Trying out a several [Passport.js](http://www.passportjs.org/) authentication strategies.
Forked from @christopher4lis [course](https://github.com/christopher4lis/express-cc).

### Strategies
- Cookie/Session-based
- JWT (coming soon)
- Keberos (coming soon)

### Getting Started
- Install dependencies `yarn`
- Rename `.env.default` to `.env` and
  - Set `NODE_ENV=development` to use SQLite as your DB
  - Set a random `SESSION_SECRET` which will be used to sign your session cookies
  -  DB credentials can be left blank
- Prepare SQLite database `npm run prepare`
- Start backend `npm start` or `nodemon`
- Start frontend `webpack`

### Useful Tools
- DB Browser for SQLite (http://sqlitebrowser.org/)