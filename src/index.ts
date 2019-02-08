import { Application, NextFunction, Request, Response } from "express"
import fetch from "node-fetch"
import simpleOauthModule, { AuthorizationTokenConfig, OAuthClient } from "simple-oauth2"
import * as log from "./logger"

export interface ICredentials {
  id: string
  secret: string
}

export interface IClientPaths {
  clientHost: string
  clientCallback: string
}

export interface IIdentity {
  credentials: IService
}

export interface IVCAP {
  "p-identity": IIdentity[]
}

export interface ISSOPaths {
  authorizePath: string
  tokenHost: string
  tokenPath: string
}

export interface IService {
  auth_domain: string
  client_id: string
  client_secret: string
}

export default class SSOClient {
  public static parseJSONString(s: string): any {
    let response = {}
    try {
      response = JSON.parse(s)
    } catch (err) {
      console.error(err)
    }
    return response
  }

  public static extractIdentity(VCAP: IVCAP): IService {
    let response = {
      auth_domain: "",
      client_id: "",
      client_secret: "",
    }
    if (VCAP["p-identity"] && VCAP["p-identity"][0]) {
      response = VCAP["p-identity"][0].credentials
    }
    return response
  }

  public ssoPaths: ISSOPaths
  public credentials: ICredentials
  public clientPaths: IClientPaths
  public userInfoPath: string
  public authURI: string
  public app: Application
  public bypass: boolean = false

  public oauth2?: OAuthClient

  private scopes: string[]

  constructor(app: Application) {
    this.ssoPaths = {
      authorizePath: "/oauth/authorize",
      tokenHost: "",
      tokenPath: "/oauth/token",
    }
    this.credentials = {
      id: "",
      secret: "",
    }
    this.clientPaths = {
      clientCallback: "/callback",
      clientHost: "",
    }
    this.userInfoPath = "/userinfo"
    this.scopes = ["openid"]
    this.oauth2 = undefined
    this.authURI = ""
    this.app = app
  }

  public setAppScopes(scopes: string[]) {
    this.scopes = scopes
  }

  public getAppScopes() {
    return this.scopes
  }

  public middleware(req: Request, res: Response, next: NextFunction) {
    if (req.session && req.session.authorized || this.bypass) {
      next()
    } else {
      res.redirect(this.authURI)
    }
  }

  public initialize(enabled: boolean) {
    if (enabled && process.env.VCAP_APPLICATION && process.env.VCAP_SERVICES) {
      this.setPathsFromVCAP(
        SSOClient.parseJSONString(process.env.VCAP_APPLICATION),
        SSOClient.parseJSONString(process.env.VCAP_SERVICES),
      )
      this.oauth2 = simpleOauthModule.create({
        auth: this.ssoPaths,
        client: this.credentials,
      })
      this.authURI = this.oauth2.authorizationCode.authorizeURL({
        redirect_uri: this.clientPaths.clientHost + "/callback",
      })
      this.app.get("/callback", (req, res) => {
        this.callback(req, res)
      })
    } else {
      this.bypass = true
    }
  }

  public setPathsFromVCAP({ uris }: { uris?: string[] }, VCAP_SVC: IVCAP) {
    const services = SSOClient.extractIdentity(VCAP_SVC)

    this.ssoPaths.tokenHost = services.auth_domain
    this.credentials.id = services.client_id
    this.credentials.secret = services.client_secret

    this.clientPaths.clientHost = `https://${
      uris ? uris[0] : "127.0.0.1"
      }`
  }

  public async callback(req: Request, res: Response) {
    const options = {
      code: req.query.code,
    } as AuthorizationTokenConfig
    if (this.oauth2) {
      try {
        const result = await this.oauth2.authorizationCode.getToken(options)
        const user = await this.grabUserInfo(result.access_token)
        if (req.session) {
          req.session.user = user
          req.session.authorized = true
        }
        return res.redirect("/")
      } catch (error) {
        log.httpError(req, error)
        return res.json("Authentication failed")
      }
    }
  }

  private async grabUserInfo(token: string) {
    const { tokenHost } = this.ssoPaths

    const options = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }

    return fetch(tokenHost + this.userInfoPath, options)
  }
}
