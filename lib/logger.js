"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function info() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    console.log.apply(console, args.slice());
}
exports.info = info;
function error() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    console.error.apply(console, args.slice());
}
exports.error = error;
function httpError(req, type) {
    var result = "Event Occurred:\n    " + element("Timestamp", new Date().toISOString()) + "\n    " + element("SessionID", req.sessionID || "undefined") + "\n    " + element("Endpoint", req.originalUrl) + "\n    " + element("Method", req.method) + "\n    " + element("RemoteAddress", req.connection.remoteAddress || "undefined") + "\n    " + element("ErrorType", type || "undefined");
    error(result.replace(/(\r\n|\n|\r)/gm, ""));
}
exports.httpError = httpError;
function element(name, value) {
    value = value || "Unknown";
    return name + "=[" + value + "]";
}
exports.element = element;
