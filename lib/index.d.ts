import { Application, NextFunction, Request, Response } from "express";
import { OAuthClient } from "simple-oauth2";
export interface ICredentials {
    id: string;
    secret: string;
}
export interface IClientPaths {
    clientHost: string;
    clientCallback: string;
}
export interface IIdentity {
    credentials: IService;
}
export interface IVCAP {
    "p-identity": IIdentity[];
}
export interface ISSOPaths {
    authorizePath: string;
    tokenHost: string;
    tokenPath: string;
}
export interface IService {
    auth_domain: string;
    client_id: string;
    client_secret: string;
}
export default class SSOClient {
    static parseJSONString(s: string): any;
    static extractIdentity(VCAP: IVCAP): IService;
    ssoPaths: ISSOPaths;
    credentials: ICredentials;
    clientPaths: IClientPaths;
    userInfoPath: string;
    authURI: string;
    app: Application;
    bypass: boolean;
    oauth2?: OAuthClient;
    private scopes;
    constructor(app: Application);
    setAppScopes(scopes: string[]): void;
    getAppScopes(): string[];
    middleware(req: Request, res: Response, next: NextFunction): void;
    initialize(enabled: boolean): void;
    setPathsFromVCAP({ uris }: {
        uris?: string[];
    }, VCAP_SVC: IVCAP): void;
    callback(req: Request, res: Response): Promise<void | import("express-serve-static-core").Response>;
    private grabUserInfo;
}
