import chai, { expect } from "chai"
import { Express, Request, Response } from "express"
import sinonChai from "sinon-chai"
import sinon, { stubInterface } from "ts-sinon"

import SSOClient from "../index"

chai.use(sinonChai)

describe("SSOClient", () => {
  let ssoClient: SSOClient
  let req: Request
  let res: Response
  let next: sinon.SinonSpy

  beforeEach(() => {
    const app = stubInterface<Express>()
    ssoClient = new SSOClient(app)
    next = sinon.spy()
    req = {
      session: {},
    } as Request
    res = stubInterface(Response)
  })

  describe("to manage connecting a node js app to a PCF SSO Service", () => {
    describe("the getAppScopes method", () => {
      it("returns an array of scopes your app will look for (default = openid)", () => {
        expect(ssoClient.getAppScopes()).to.deep.equal(["openid"])
      })
    })

    describe("the setAppScopes method", () => {
      it("allows you to define what scopes the app should expect", () => {
        ssoClient.setAppScopes(["openid", "newTestScope"])
        expect(ssoClient.getAppScopes()).to.deep.equal([
          "openid",
          "newTestScope",
        ])
      })
    })

    describe("the middleware method", () => {
      context("when the user session is already authorized", () => {
        it("calls next", () => {
          if (req.session) {
            req.session.authorized = true
          }
          ssoClient.middleware(req, res, next)
          expect(next).to.have.been.called
        })
      })

      context("when the user session is not already authorized", () => {
        it("calls res.redirect with the authURI", () => {
          ssoClient.authURI = "testAuthURI"
          ssoClient.middleware(req, res, next)
          expect(res.redirect).to.have.been.calledWith("testAuthURI")
        })
      })
    })

    describe("the parseJSONString static method", () => {
      context("a valid stringified JSON is presented", () => {
        it("returns a parsed version", () => {
          const json = JSON.stringify({ test: "test" })
          expect(SSOClient.parseJSONString(json)).to.deep.equal(
            JSON.parse(json),
          )
        })
      })
    })
  })
})
