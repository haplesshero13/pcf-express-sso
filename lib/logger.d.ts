import { Request } from "express";
export declare function info(...args: string[]): void;
export declare function error(...args: string[]): void;
export declare function httpError(req: Request, type?: string): void;
export declare function element(name: string, value: string): string;
