import chai, { expect } from "chai"
import { Request } from "express"
import sinon, { SinonStub } from "sinon"
import sinonChai from "sinon-chai"

import * as logging from "../logger"

chai.use(sinonChai)

describe("lib/logger", () => {
  let err: SinonStub
  let req: Request

  beforeEach(() => {
    req = {
      connection: {
        remoteAddress: "192.168.1.1",
      },
      method: "TEST",
      originalUrl: "testEndpoint",
      sessionID: "testSessionId",
    } as Request
    err = sinon.stub(console, "error")
  })

  afterEach(() => {
    err.restore()
  })

  describe("contains functions to assist server logging", () => {
    describe("httpError prepares and calls logs for http errors", () => {
      it("inserts the session ID", () => {
        logging.httpError(req)
        expect(err).to.have.been.calledWith(sinon.match("testSessionId"))
      })
      it("inserts the remote ip address", () => {
        logging.httpError(req)
        expect(err).to.have.been.calledWith(sinon.match("192.168.1.1"))
      })
      it("inserts the endpoint attempted", () => {
        logging.httpError(req)
        expect(err).to.have.been.calledWith(sinon.match("testEndpoint"))
      })
      it("inserts the method attempted", () => {
        logging.httpError(req)
        expect(err).to.have.been.calledWith(sinon.match("TEST"))
      })
      it("inserts the type of error if supplied", () => {
        logging.httpError(req, "user failed login")
        expect(err).to.have.been.calledWith(sinon.match("user failed login"))
      })
    })
  })
})
