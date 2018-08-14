# pcf-express-sso

A fork and straight port to TypeScript of [pcf-sso-express-middleware](https://github.com/vanceric/pcf-sso-express-middleware#readme).

The purpose of this module is to wrap the process of interfacing with the Single
Sign-On service provided for Pivotal Cloud Foundry into a middleware for express.

For more information on PCF SSO visit:
[PCF Single Sign-On Overview](http://docs.pivotal.io/p-identity/1-5/index.html)

## Basic Usage Example:

Install with NPM or Yarn: `yarn add pcf-express-sso`. If you are using TypeScript you will also need to add `@types/express` and `@types/simple-oauth2`.

```typescript
import * as express from "express"
import * as session from "express-session"
import SSOClient from "pcf-express-sso"

const PORT = process.env.PORT || 8080
const AUTH_CONDITION = process.env.ENABLE_AUTH || false
const app = express()

app.use(
  session({
    name: "server-session",
    resave: true,
    saveUninitialized: true,
    secret: "genericSecret",
  }),
)

const ENABLE_AUTH = app.get("env") === "production"
const auth = new SSOClient(app)
auth.initialize(ENABLE_AUTH)

app.use(/\/(!callback.)*/, (req, res, next) => {
  auth.middleware(req, res, next)
})

app.get("/*", (req, res) => {
  res.send("Hello World!")
})

app.listen(PORT, () => {
  console.log(`Express server started on port ${PORT}`)
})
```

Notes:

1. Use an external store once in production, like Redis.
2. Use a secret provided via environment variables once in production

## Testing:

Run `yarn test`.

### TODO:

Backfill tests for SSOClient#initialize, etc.

## Module Dependencies:

* [Node Fetch](https://github.com/bitinn/node-fetch)
* [Simple Oauth2](https://github.com/lelylan/simple-oauth2)

## Prerequisites:

* [Express JS Application](https://github.com/expressjs/express)
* [Express Session Implemented](https://github.com/expressjs/session)
* [Pivotal Cloud Foundry Platform for Deployment](https://pivotal.io/platform)
