"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TwilioError = void 0;
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/**
 * Generic Twilio error that the SDK will raise when encountering an error. Can
 * be used to describe backend errors.
 *
 * @public
 */
class TwilioError extends Error {
  constructor(message, code) {
    super(message);
    _defineProperty(this, "causes", []);
    _defineProperty(this, "description", 'Generic Twilio error.');
    _defineProperty(this, "explanation", 'The SDK has encountered an unexpected error.');
    _defineProperty(this, "solutions", []);
    this.code = code;
    Object.setPrototypeOf(this, TwilioError.prototype);
    this.name = TwilioError.name;
  }
}
exports.TwilioError = TwilioError;
//# sourceMappingURL=TwilioError.js.map