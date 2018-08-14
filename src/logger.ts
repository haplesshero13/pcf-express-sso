import { Request } from "express"

export function info(...args: string[]) {
  console.log.apply(console, args.slice())
}

export function error(...args: string[]) {
  console.error.apply(console, args.slice())
}

export function httpError(req: Request, type?: string) {
  const result = `Event Occurred:
    ${element("Timestamp", new Date().toISOString())}
    ${element("SessionID", req.sessionID || "undefined")}
    ${element("Endpoint", req.originalUrl)}
    ${element("Method", req.method)}
    ${element("RemoteAddress", req.connection.remoteAddress || "undefined")}
    ${element("ErrorType", type || "undefined")}`

  error(result.replace(/(\r\n|\n|\r)/gm, ""))
}

export function element(name: string, value: string) {
  value = value || "Unknown"
  return `${name}=[${value}]`
}
