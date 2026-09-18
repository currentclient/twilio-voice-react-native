"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UnsupportedPlatformError = void 0;
var _TwilioError = require("./TwilioError");
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/**
 * Error describing that the an unsupported platform other than Android
 * or iOS has been detected.
 *
 * @public
 */
class UnsupportedPlatformError extends _TwilioError.TwilioError {
  constructor(message) {
    super(message);
    _defineProperty(this, "description", 'Unsupported platform error.');
    _defineProperty(this, "explanation", 'An unsupported platform has been detected.');
    Object.setPrototypeOf(this, UnsupportedPlatformError.prototype);
    this.name = UnsupportedPlatformError.name;
  }
}
exports.UnsupportedPlatformError = UnsupportedPlatformError;
//# sourceMappingURL=UnsupportedPlatformError.js.map