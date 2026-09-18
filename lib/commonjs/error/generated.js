"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.errorsByCode = exports.UserMediaErrors = exports.TwiMLErrors = exports.SignalingErrors = exports.ServerErrors = exports.SIPServerErrors = exports.RegistrationErrors = exports.MediaErrors = exports.MalformedRequestErrors = exports.GeneralErrors = exports.ForbiddenErrors = exports.ClientErrors = exports.AuthorizationErrors = void 0;
var _TwilioError = require("./TwilioError");
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /**
 * This is a generated file. Any modifications here will be overwritten.
 * See scripts/errors.js.
 */
/**
 * @public
 * Authorization errors.
 */
let AuthorizationErrors = exports.AuthorizationErrors = void 0;
/**
 * @public
 * Forbidden errors.
 */
(function (_AuthorizationErrors) {
  class AccessTokenInvalid extends _TwilioError.TwilioError {
    constructor(message) {
      super(message, 20101);
      /**
       * Not applicable.
       */
      _defineProperty(this, "causes", []);
      /**
       * Invalid access token
       */
      _defineProperty(this, "description", 'Invalid access token');
      /**
       * Twilio was unable to validate your Access Token
       */
      _defineProperty(this, "explanation", 'Twilio was unable to validate your Access Token');
      /**
       * AccessTokenInvalid
       */
      _defineProperty(this, "name", 'AccessTokenInvalid');
      /**
       * Not applicable.
       */
      _defineProperty(this, "solutions", []);
      Object.setPrototypeOf(this, AuthorizationErrors.AccessTokenInvalid.prototype);
      const msg = typeof message === 'string' ? message : this.explanation;
      this.message = `${this.name} (${this.code}): ${msg}`;
    }
  }
  _AuthorizationErrors.AccessTokenInvalid = AccessTokenInvalid;
  class AccessTokenHeaderInvalid extends _TwilioError.TwilioError {
    constructor(message) {
      super(message, 20102);
      /**
       * Not applicable.
       */
      _defineProperty(this, "causes", []);
      /**
       * Invalid access token header
       */
      _defineProperty(this, "description", 'Invalid access token header');
      /**
       * The header of the Access Token provided to the Twilio API was invalid
       */
      _defineProperty(this, "explanation", 'The header of the Access Token provided to the Twilio API was invalid');
      /**
       * AccessTokenHeaderInvalid
       */
      _defineProperty(this, "name", 'AccessTokenHeaderInvalid');
      /**
       * Not applicable.
       */
      _defineProperty(this, "solutions", []);
      Object.setPrototypeOf(this, AuthorizationErrors.AccessTokenHeaderInvalid.prototype);
      const msg = typeof message === 'string' ? message : this.explanation;
      this.message = `${this.name} (${this.code}): ${msg}`;
    }
  }
  _AuthorizationErrors.AccessTokenHeaderInvalid = AccessTokenHeaderInvalid;
  class AccessTokenIssuerInvalid extends _TwilioError.TwilioError {
    constructor(message) {
      super(message, 20103);
      /**
       * Not applicable.
       */
      _defineProperty(this, "causes", []);
      /**
       * Invalid access token issuer/subject
       */
      _defineProperty(this, "description", 'Invalid access token issuer/subject');
      /**
       * The issuer or subject of the Access Token provided to the Twilio API was invalid
       */
      _defineProperty(this, "explanation", 'The issuer or subject of the Access Token provided to the Twilio API was invalid');
      /**
       * AccessTokenIssuerInvalid
       */
      _defineProperty(this, "name", 'AccessTokenIssuerInvalid');
      /**
       * Not applicable.
       */
      _defineProperty(this, "solutions", []);
      Object.setPrototypeOf(this, AuthorizationErrors.AccessTokenIssuerInvalid.prototype);
      const msg = typeof message === 'string' ? message : this.explanation;
      this.message = `${this.name} (${this.code}): ${msg}`;
    }
  }
  _AuthorizationErrors.AccessTokenIssuerInvalid = AccessTokenIssuerInvalid;
  class AccessTokenExpired extends _TwilioError.TwilioError {
    constructor(message) {
      super(message, 20104);
      /**
       * Not applicable.
       */
      _defineProperty(this, "causes", []);
      /**
       * Access token expired or expiration date invalid
       */
      _defineProperty(this, "description", 'Access token expired or expiration date invalid');
      /**
       * The Access Token provided to the Twilio API has expired, the expiration time specified in the token was invalid, or the expiration time specified was too far in the future
       */
      _defineProperty(this, "explanation", 'The Access Token provided to the Twilio API has expired, the expiration time specified in the token was invalid, or the expiration time specified was too far in the future');
      /**
       * AccessTokenExpired
       */
      _defineProperty(this, "name", 'AccessTokenExpired');
      /**
       * Not applicable.
       */
      _defineProperty(this, "solutions", []);
      Object.setPrototypeOf(this, AuthorizationErrors.AccessTokenExpired.prototype);
      const msg = typeof message === 'string' ? message : this.explanation;
      this.message = `${this.name} (${this.code}): ${msg}`;
    }
  }
  _AuthorizationErrors.AccessTokenExpired = AccessTokenExpired;
  class AccessTokenNotYetValid extends _TwilioError.TwilioError {
    constructor(message) {
      super(message, 20105);
      /**
       * Not applicable.
       */
      _defineProperty(this, "causes", []);
      /**
       * Access token not yet valid
       */
      _defineProperty(this, "description", 'Access token not yet valid');
      /**
       * The Access Token provided to the Twilio API is not yet valid
       */
      _defineProperty(this, "explanation", 'The Access Token provided to the Twilio API is not yet valid');
      /**
       * AccessTokenNotYetValid
       */
      _defineProperty(this, "name", 'AccessTokenNotYetValid');
      /**
       * Not applicable.
       */
      _defineProperty(this, "solutions", []);
      Object.setPrototypeOf(this, AuthorizationErrors.AccessTokenNotYetValid.prototype);
      const msg = typeof message === 'string' ? message : this.explanation;
      this.message = `${this.name} (${this.code}): ${msg}`;
    }
  }
  _AuthorizationErrors.AccessTokenNotYetValid = AccessTokenNotYetValid;
  class AccessTokenGrantsInvalid extends _TwilioError.TwilioError {
    constructor(message) {
      super(message, 20106);
      /**
       * Not applicable.
       */
      _defineProperty(this, "causes", []);
      /**
       * Invalid access token grants
       */
      _defineProperty(this, "description", 'Invalid access token grants');
      /**
       * The Access Token signature and issuer were valid, but the grants specified in the token were invalid, unparseable, or did not authorize the action being requested
       */
      _defineProperty(this, "explanation", 'The Access Token signature and issuer were valid, but the grants specified in the token were invalid, unparseable, or did not authorize the action being requested');
      /**
       * AccessTokenGrantsInvalid
       */
      _defineProperty(this, "name", 'AccessTokenGrantsInvalid');
      /**
       * Not applicable.
       */
      _defineProperty(this, "solutions", []);
      Object.setPrototypeOf(this, AuthorizationErrors.AccessTokenGrantsInvalid.prototype);
      const msg = typeof message === 'string' ? message : this.explanation;
      this.message = `${this.name} (${this.code}): ${msg}`;
    }
  }
  _AuthorizationErrors.AccessTokenGrantsInvalid = AccessTokenGrantsInvalid;
  class AccessTokenSignatureInvalid extends _TwilioError.TwilioError {
    constructor(message) {
      super(message, 20107);
      /**
       * Not applicable.
       */
      _defineProperty(this, "causes", []);
      /**
       * Invalid access token signature
       */
      _defineProperty(this, "description", 'Invalid access token signature');
      /**
       * The signature for the Access Token provided was invalid.
       */
      _defineProperty(this, "explanation", 'The signature for the Access Token provided was invalid.');
      /**
       * AccessTokenSignatureInvalid
       */
      _defineProperty(this, "name", 'AccessTokenSignatureInvalid');
      /**
       * Not applicable.
       */
      _defineProperty(this, "solutions", []);
      Object.setPrototypeOf(this, AuthorizationErrors.AccessTokenSignatureInvalid.prototype);
      const msg = typeof message === 'string' ? message : this.explanation;
      this.message = `${this.name} (${this.code}): ${msg}`;
    }
  }
  _AuthorizationErrors.AccessTokenSignatureInvalid = AccessTokenSignatureInvalid;
  class AuthenticationFailed extends _TwilioError.TwilioError {
    constructor(message) {
      super(message, 20151);
      /**
       * Not applicable.
       */
      _defineProperty(this, "causes", []);
      /**
       * Authentication Failed
       */
      _defineProperty(this, "description", 'Authentication Failed');
      /**
       * The Authentication with the provided JWT failed
       */
      _defineProperty(this, "explanation", 'The Authentication with the provided JWT failed');
      /**
       * AuthenticationFailed
       */
      _defineProperty(this, "name", 'AuthenticationFailed');
      /**
       * Not applicable.
       */
      _defineProperty(this, "solutions", []);
      Object.setPrototypeOf(this, AuthorizationErrors.AuthenticationFailed.prototype);
      const msg = typeof message === 'string' ? message : this.explanation;
      this.message = `${this.name} (${this.code}): ${msg}`;
    }
  }
  _AuthorizationErrors.AuthenticationFailed = AuthenticationFailed;
  class ExpirationTimeExceedsMaxTimeAllowed extends _TwilioError.TwilioError {
    constructor(message) {
      super(message, 20157);
      /**
       * Not applicable.
       */
      _defineProperty(this, "causes", []);
      /**
       * Expiration Time Exceeds Maximum Time Allowed
       */
      _defineProperty(this, "description", 'Expiration Time Exceeds Maximum Time Allowed');
      /**
       * The expiration time provided when creating the JWT exceeds the maximum duration allowed
       */
      _defineProperty(this, "explanation", 'The expiration time provided when creating the JWT exceeds the maximum duration allowed');
      /**
       * ExpirationTimeExceedsMaxTimeAllowed
       */
      _defineProperty(this, "name", 'ExpirationTimeExceedsMaxTimeAllowed');
      /**
       * Not applicable.
       */
      _defineProperty(this, "solutions", []);
      Object.setPrototypeOf(this, AuthorizationErrors.ExpirationTimeExceedsMaxTimeAllowed.prototype);
      const msg = typeof message === 'string' ? message : this.explanation;
      this.message = `${this.name} (${this.code}): ${msg}`;
    }
  }
  _AuthorizationErrors.ExpirationTimeExceedsMaxTimeAllowed = ExpirationTimeExceedsMaxTimeAllowed;
  class AuthorizationError extends _TwilioError.TwilioError {
    constructor(message) {
      super(message, 31201);
      /**
       * Not applicable.
       */
      _defineProperty(this, "causes", []);
      /**
       * Authorization error
       */
      _defineProperty(this, "description", 'Authorization error');
      /**
       * The request requires user authentication. The server understood the request, but is refusing to fulfill it.
       */
      _defineProperty(this, "explanation", 'The request requires user authentication. The server understood the request, but is refusing to fulfill it.');
      /**
       * AuthorizationError
       */
      _defineProperty(this, "name", 'AuthorizationError');
      /**
       * Not applicable.
       */
      _defineProperty(this, "solutions", []);
      Object.setPrototypeOf(this, AuthorizationErrors.AuthorizationError.prototype);
      const msg = typeof message === 'string' ? message : this.explanation;
      this.message = `${this.name} (${this.code}): ${msg}`;
    }
  }
  _AuthorizationErrors.AuthorizationError = AuthorizationError;
  class RateExceededError extends _TwilioError.TwilioError {
    constructor(message) {
      super(message, 31206);
      /**
       * Rate limit exceeded.
       */
      _defineProperty(this, "causes", ['Rate limit exceeded.']);
      /**
       * Rate exceeded authorized limit.
       */
      _defineProperty(this, "description", 'Rate exceeded authorized limit.');
      /**
       * The request performed exceeds the authorized limit.
       */
      _defineProperty(this, "explanation", 'The request performed exceeds the authorized limit.');
      /**
       * RateExceededError
       */
      _defineProperty(this, "name", 'RateExceededError');
      /**
       * Ensure message send rate does not exceed authorized limits.
       */
      _defineProperty(this, "solutions", ['Ensure message send rate does not exceed authorized limits.']);
      Object.setPrototypeOf(this, AuthorizationErrors.RateExceededError.prototype);
      const msg = typeof message === 'string' ? message : this.explanation;
      this.message = `${this.name} (${this.code}): ${msg}`;
    }
  }
  _AuthorizationErrors.RateExceededError = RateExceededError;
  class CallMessageEventTypeInvalidError extends _TwilioError.TwilioError {
    constructor(message) {
      super(message, 31210);
      /**
       * The Call Message Event Type is invalid and is not understood by Twilio Voice.
       */
      _defineProperty(this, "causes", ['The Call Message Event Type is invalid and is not understood by Twilio Voice.']);
      /**
       * Call Message Event Type is invalid.
       */
      _defineProperty(this, "description", 'Call Message Event Type is invalid.');
      /**
       * The Call Message Event Type is invalid and is not understood by Twilio Voice.
       */
      _defineProperty(this, "explanation", 'The Call Message Event Type is invalid and is not understood by Twilio Voice.');
      /**
       * CallMessageEventTypeInvalidError
       */
      _defineProperty(this, "name", 'CallMessageEventTypeInvalidError');
      /**
       * Ensure the Call Message Event Type is Valid and understood by Twilio Voice and try again.
       */
      _defineProperty(this, "solutions", ['Ensure the Call Message Event Type is Valid and understood by Twilio Voice and try again.']);
      Object.setPrototypeOf(this, AuthorizationErrors.CallMessageEventTypeInvalidError.prototype);
      const msg = typeof message === 'string' ? message : this.explanation;
      this.message = `${this.name} (${this.code}): ${msg}`;
    }
  }
  _AuthorizationErrors.CallMessageEventTypeInvalidError = CallMessageEventTypeInvalidError;
  class CallMessageUnexpectedStateError extends _TwilioError.TwilioError {
    constructor(message) {
      super(message, 31211);
      /**
       * The Call should be at least in the ringing state to subscribe and send Call Message.
       */
      _defineProperty(this, "causes", ['The Call should be at least in the ringing state to subscribe and send Call Message.']);
      /**
       * Call is not in the expected state.
       */
      _defineProperty(this, "description", 'Call is not in the expected state.');
      /**
       * The Call should be at least in the ringing state to send Call Message.
       */
      _defineProperty(this, "explanation", 'The Call should be at least in the ringing state to send Call Message.');
      /**
       * CallMessageUnexpectedStateError
       */
      _defineProperty(this, "name", 'CallMessageUnexpectedStateError');
      /**
       * Ensure the Call is at least in the ringing state and the subscription is successful and try again.
       */
      _defineProperty(this, "solutions", ['Ensure the Call is at least in the ringing state and the subscription is successful and try again.']);
      Object.setPrototypeOf(this, AuthorizationErrors.CallMessageUnexpectedStateError.prototype);
      const msg = typeof message === 'string' ? message : this.explanation;
      this.message = `${this.name} (${this.code}): ${msg}`;
    }
  }
  _AuthorizationErrors.CallMessageUnexpectedStateError = CallMessageUnexpectedStateError;
  class PayloadSizeExceededError extends _TwilioError.TwilioError {
    constructor(message) {
      super(message, 31212);
      /**
       * The payload size of Call Message Event exceeds the authorized limit.
       */
      _defineProperty(this, "causes", ['The payload size of Call Message Event exceeds the authorized limit.']);
      /**
       * Call Message Event Payload size exceeded authorized limit.
       */
      _defineProperty(this, "description", 'Call Message Event Payload size exceeded authorized limit.');
      /**
       * The request performed to send a Call Message Event exceeds the payload size authorized limit
       */
      _defineProperty(this, "explanation", 'The request performed to send a Call Message Event exceeds the payload size authorized limit');
      /**
       * PayloadSizeExceededError
       */
      _defineProperty(this, "name", 'PayloadSizeExceededError');
      /**
       * Reduce payload size of Call Message Event to be within the authorized limit and try again.
       */
      _defineProperty(this, "solutions", ['Reduce payload size of Call Message Event to be within the authorized limit and try again.']);
      Object.setPrototypeOf(this, AuthorizationErrors.PayloadSizeExceededError.prototype);
      const msg = typeof message === 'string' ? message : this.explanation;
      this.message = `${this.name} (${this.code}): ${msg}`;
    }
  }
  _AuthorizationErrors.PayloadSizeExceededError = PayloadSizeExceededError;
  class AccessTokenRejected extends _TwilioError.TwilioError {
    constructor(message) {
      super(message, 51007);
      /**
       * Not applicable.
       */
      _defineProperty(this, "causes", []);
      /**
       * Token authentication is rejected by authentication service
       */
      _defineProperty(this, "description", 'Token authentication is rejected by authentication service');
      /**
       * The authentication service has rejected the provided Access Token. To check whether the Access Token is structurally correct, you can use the tools available at https://jwt.io. For the details of Twilio's specific Access Token implementation including the grant format, check https://www.twilio.com/docs/iam/access-tokens.
       */
      _defineProperty(this, "explanation", 'The authentication service has rejected the provided Access Token. To check whether the Access Token is structurally correct, you can use the tools available at https://jwt.io. For the details of Twilio\'s specific Access Token implementation including the grant format, check https://www.twilio.com/docs/iam/access-tokens.');
      /**
       * AccessTokenRejected
       */
      _defineProperty(this, "name", 'AccessTokenRejected');
      /**
       * Not applicable.
       */
      _defineProperty(this, "solutions", []);
      Object.setPrototypeOf(this, AuthorizationErrors.AccessTokenRejected.prototype);
      const msg = typeof message === 'string' ? message : this.explanation;
      this.message = `${this.name} (${this.code}): ${msg}`;
    }
  }
  _AuthorizationErrors.AccessTokenRejected = AccessTokenRejected;
})(AuthorizationErrors || (exports.AuthorizationErrors = AuthorizationErrors = {}));
let ForbiddenErrors = exports.ForbiddenErrors = void 0;
/**
 * @public
 * Client errors.
 */
(function (_ForbiddenErrors) {
  class Forbidden extends _TwilioError.TwilioError {
    constructor(message) {
      super(message, 20403);
      /**
       * Not applicable.
       */
      _defineProperty(this, "causes", []);
      /**
       * 403 Forbidden
       */
      _defineProperty(this, "description", '403 Forbidden');
      /**
       * The account lacks permission to access the Twilio API. Typically this means the account has been suspended or closed. For assistance, please contact support
       */
      _defineProperty(this, "explanation", 'The account lacks permission to access the Twilio API. Typically this means the account has been suspended or closed. For assistance, please contact support');
      /**
       * Forbidden
       */
      _defineProperty(this, "name", 'Forbidden');
      /**
       * Not applicable.
       */
      _defineProperty(this, "solutions", []);
      Object.setPrototypeOf(this, ForbiddenErrors.Forbidden.prototype);
      const msg = typeof message === 'string' ? message : this.explanation;
      this.message = `${this.name} (${this.code}): ${msg}`;
    }
  }
  _ForbiddenErrors.Forbidden = Forbidden;
})(ForbiddenErrors || (exports.ForbiddenErrors = ForbiddenErrors = {}));
let ClientErrors = exports.ClientErrors = void 0;
/**
 * @public
 * Server errors.
 */
(function (_ClientErrors) {
  class BadRequest extends _TwilioError.TwilioError {
    constructor(message) {
      super(message, 31400);
      /**
       * Not applicable.
       */
      _defineProperty(this, "causes", []);
      /**
       * Bad Request (HTTP/SIP)
       */
      _defineProperty(this, "description", 'Bad Request (HTTP/SIP)');
      /**
       * The request could not be understood due to malformed syntax.
       */
      _defineProperty(this, "explanation", 'The request could not be understood due to malformed syntax.');
      /**
       * BadRequest
       */
      _defineProperty(this, "name", 'BadRequest');
      /**
       * Not applicable.
       */
      _defineProperty(this, "solutions", []);
      Object.setPrototypeOf(this, ClientErrors.BadRequest.prototype);
      const msg = typeof message === 'string' ? message : this.explanation;
      this.message = `${this.name} (${this.code}): ${msg}`;
    }
  }
  _ClientErrors.BadRequest = BadRequest;
  class Forbidden extends _TwilioError.TwilioError {
    constructor(message) {
      super(message, 31403);
      /**
       * Not applicable.
       */
      _defineProperty(this, "causes", []);
      /**
       * Forbidden (HTTP/SIP)
       */
      _defineProperty(this, "description", 'Forbidden (HTTP/SIP)');
      /**
       * The server understood the request, but is refusing to fulfill it.
       */
      _defineProperty(this, "explanation", 'The server understood the request, but is refusing to fulfill it.');
      /**
       * Forbidden
       */
      _defineProperty(this, "name", 'Forbidden');
      /**
       * Not applicable.
       */
      _defineProperty(this, "solutions", []);
      Object.setPrototypeOf(this, ClientErrors.Forbidden.prototype);
      const msg = typeof message === 'string' ? message : this.explanation;
      this.message = `${this.name} (${this.code}): ${msg}`;
    }
  }
  _ClientErrors.Forbidden = Forbidden;
  class NotFound extends _TwilioError.TwilioError {
    constructor(message) {
      super(message, 31404);
      /**
       * The outbound call was made to an invalid phone number.
       * The TwiML application sid is missing a Voice URL.
       */
      _defineProperty(this, "causes", ['The outbound call was made to an invalid phone number.', 'The TwiML application sid is missing a Voice URL.']);
      /**
       * Not Found (HTTP/SIP)
       */
      _defineProperty(this, "description", 'Not Found (HTTP/SIP)');
      /**
       * The server has not found anything matching the request.
       */
      _defineProperty(this, "explanation", 'The server has not found anything matching the request.');
      /**
       * NotFound
       */
      _defineProperty(this, "name", 'NotFound');
      /**
       * Ensure the phone number dialed is valid.
       * Ensure the TwiML application is configured correctly with a Voice URL link.
       */
      _defineProperty(this, "solutions", ['Ensure the phone number dialed is valid.', 'Ensure the TwiML application is configured correctly with a Voice URL link.']);
      Object.setPrototypeOf(this, ClientErrors.NotFound.prototype);
      const msg = typeof message === 'string' ? message : this.explanation;
      this.message = `${this.name} (${this.code}): ${msg}`;
    }
  }
  _ClientErrors.NotFound = NotFound;
  class RequestTimeout extends _TwilioError.TwilioError {
    constructor(message) {
      super(message, 31408);
      /**
       * Not applicable.
       */
      _defineProperty(this, "causes", []);
      /**
       * Request Timeout (HTTP/SIP)
       */
      _defineProperty(this, "description", 'Request Timeout (HTTP/SIP)');
      /**
       * A request timeout occurred.
       */
      _defineProperty(this, "explanation", 'A request timeout occurred.');
      /**
       * RequestTimeout
       */
      _defineProperty(this, "name", 'RequestTimeout');
      /**
       * Not applicable.
       */
      _defineProperty(this, "solutions", []);
      Object.setPrototypeOf(this, ClientErrors.RequestTimeout.prototype);
      const msg = typeof message === 'string' ? message : this.explanation;
      this.message = `${this.name} (${this.code}): ${msg}`;
    }
  }
  _ClientErrors.RequestTimeout = RequestTimeout;
  class Conflict extends _TwilioError.TwilioError {
    constructor(message) {
      super(message, 31409);
      /**
       * Not applicable.
       */
      _defineProperty(this, "causes", []);
      /**
       * Conflict (HTTP)
       */
      _defineProperty(this, "description", 'Conflict (HTTP)');
      /**
       * The request could not be processed because of a conflict in the current state of the resource. Another request may be in progress.
       */
      _defineProperty(this, "explanation", 'The request could not be processed because of a conflict in the current state of the resource. Another request may be in progress.');
      /**
       * Conflict
       */
      _defineProperty(this, "name", 'Conflict');
      /**
       * Not applicable.
       */
      _defineProperty(this, "solutions", []);
      Object.setPrototypeOf(this, ClientErrors.Conflict.prototype);
      const msg = typeof message === 'string' ? message : this.explanation;
      this.message = `${this.name} (${this.code}): ${msg}`;
    }
  }
  _ClientErrors.Conflict = Conflict;
  class UpgradeRequired extends _TwilioError.TwilioError {
    constructor(message) {
      super(message, 31426);
      /**
       * Not applicable.
       */
      _defineProperty(this, "causes", []);
      /**
       * Upgrade Required (HTTP)
       */
      _defineProperty(this, "description", 'Upgrade Required (HTTP)');
      /**
       * This error is raised when an HTTP 426 response is received. The reason for this is most likely because of an incompatible TLS version. To mitigate this, you may need to upgrade the OS or download a more recent version of the SDK.
       */
      _defineProperty(this, "explanation", 'This error is raised when an HTTP 426 response is received. The reason for this is most likely because of an incompatible TLS version. To mitigate this, you may need to upgrade the OS or download a more recent version of the SDK.');
      /**
       * UpgradeRequired
       */
      _defineProperty(this, "name", 'UpgradeRequired');
      /**
       * Not applicable.
       */
      _defineProperty(this, "solutions", []);
      Object.setPrototypeOf(this, ClientErrors.UpgradeRequired.prototype);
      const msg = typeof message === 'string' ? message : this.explanation;
      this.message = `${this.name} (${this.code}): ${msg}`;
    }
  }
  _ClientErrors.UpgradeRequired = UpgradeRequired;
  class TooManyRequests extends _TwilioError.TwilioError {
    constructor(message) {
      super(message, 31429);
      /**
       * Not applicable.
       */
      _defineProperty(this, "causes", []);
      /**
       * Too Many Requests (HTTP)
       */
      _defineProperty(this, "description", 'Too Many Requests (HTTP)');
      /**
       * Too many requests were sent in a given amount of time.
       */
      _defineProperty(this, "explanation", 'Too many requests were sent in a given amount of time.');
      /**
       * TooManyRequests
       */
      _defineProperty(this, "name", 'TooManyRequests');
      /**
       * Not applicable.
       */
      _defineProperty(this, "solutions", []);
      Object.setPrototypeOf(this, ClientErrors.TooManyRequests.prototype);
      const msg = typeof message === 'string' ? message : this.explanation;
      this.message = `${this.name} (${this.code}): ${msg}`;
    }
  }
  _ClientErrors.TooManyRequests = TooManyRequests;
  class TemporarilyUnavailable extends _TwilioError.TwilioError {
    constructor(message) {
      super(message, 31480);
      /**
       * Not applicable.
       */
      _defineProperty(this, "causes", []);
      /**
       * Temporarily Unavailable (SIP)
       */
      _defineProperty(this, "description", 'Temporarily Unavailable (SIP)');
      /**
       * The callee is currently unavailable.
       */
      _defineProperty(this, "explanation", 'The callee is currently unavailable.');
      /**
       * TemporarilyUnavailable
       */
      _defineProperty(this, "name", 'TemporarilyUnavailable');
      /**
       * Not applicable.
       */
      _defineProperty(this, "solutions", []);
      Object.setPrototypeOf(this, ClientErrors.TemporarilyUnavailable.prototype);
      const msg = typeof message === 'string' ? message : this.explanation;
      this.message = `${this.name} (${this.code}): ${msg}`;
    }
  }
  _ClientErrors.TemporarilyUnavailable = TemporarilyUnavailable;
  class CallTransactionDoesNotExist extends _TwilioError.TwilioError {
    constructor(message) {
      super(message, 31481);
      /**
       * Not applicable.
       */
      _defineProperty(this, "causes", []);
      /**
       * Call/Transaction Does Not Exist (SIP)
       */
      _defineProperty(this, "description", 'Call/Transaction Does Not Exist (SIP)');
      /**
       * The call no longer exists.
       */
      _defineProperty(this, "explanation", 'The call no longer exists.');
      /**
       * CallTransactionDoesNotExist
       */
      _defineProperty(this, "name", 'CallTransactionDoesNotExist');
      /**
       * Not applicable.
       */
      _defineProperty(this, "solutions", []);
      Object.setPrototypeOf(this, ClientErrors.CallTransactionDoesNotExist.prototype);
      const msg = typeof message === 'string' ? message : this.explanation;
      this.message = `${this.name} (${this.code}): ${msg}`;
    }
  }
  _ClientErrors.CallTransactionDoesNotExist = CallTransactionDoesNotExist;
  class AddressIncomplete extends _TwilioError.TwilioError {
    constructor(message) {
      super(message, 31484);
      /**
       * The outbound call was made with a phone number that has an invalid format.
       */
      _defineProperty(this, "causes", ['The outbound call was made with a phone number that has an invalid format.']);
      /**
       * Address Incomplete (SIP)
       */
      _defineProperty(this, "description", 'Address Incomplete (SIP)');
      /**
       * The provided phone number is malformed.
       */
      _defineProperty(this, "explanation", 'The provided phone number is malformed.');
      /**
       * AddressIncomplete
       */
      _defineProperty(this, "name", 'AddressIncomplete');
      /**
       * Ensure the phone number dialed is formatted correctly.
       */
      _defineProperty(this, "solutions", ['Ensure the phone number dialed is formatted correctly.']);
      Object.setPrototypeOf(this, ClientErrors.AddressIncomplete.prototype);
      const msg = typeof message === 'string' ? message : this.explanation;
      this.message = `${this.name} (${this.code}): ${msg}`;
    }
  }
  _ClientErrors.AddressIncomplete = AddressIncomplete;
  class BusyHere extends _TwilioError.TwilioError {
    constructor(message) {
      super(message, 31486);
      /**
       * Not applicable.
       */
      _defineProperty(this, "causes", []);
      /**
       * Busy Here (SIP)
       */
      _defineProperty(this, "description", 'Busy Here (SIP)');
      /**
       * The callee is busy.
       */
      _defineProperty(this, "explanation", 'The callee is busy.');
      /**
       * BusyHere
       */
      _defineProperty(this, "name", 'BusyHere');
      /**
       * Not applicable.
       */
      _defineProperty(this, "solutions", []);
      Object.setPrototypeOf(this, ClientErrors.BusyHere.prototype);
      const msg = typeof message === 'string' ? message : this.explanation;
      this.message = `${this.name} (${this.code}): ${msg}`;
    }
  }
  _ClientErrors.BusyHere = BusyHere;
  class RequestTerminated extends _TwilioError.TwilioError {
    constructor(message) {
      super(message, 31487);
      /**
       * Not applicable.
       */
      _defineProperty(this, "causes", []);
      /**
       * Request Terminated (SIP)
       */
      _defineProperty(this, "description", 'Request Terminated (SIP)');
      /**
       * The request has terminated as a result of a bye or cancel.
       */
      _defineProperty(this, "explanation", 'The request has terminated as a result of a bye or cancel.');
      /**
       * RequestTerminated
       */
      _defineProperty(this, "name", 'RequestTerminated');
      /**
       * Not applicable.
       */
      _defineProperty(this, "solutions", []);
      Object.setPrototypeOf(this, ClientErrors.RequestTerminated.prototype);
      const msg = typeof message === 'string' ? message : this.explanation;
      this.message = `${this.name} (${this.code}): ${msg}`;
    }
  }
  _ClientErrors.RequestTerminated = RequestTerminated;
})(ClientErrors || (exports.ClientErrors = ClientErrors = {}));
let ServerErrors = exports.ServerErrors = void 0;
/**
 * @public
 * SIPServer errors.
 */
(function (_ServerErrors) {
  class InternalServerError extends _TwilioError.TwilioError {
    constructor(message) {
      super(message, 31500);
      /**
       * Not applicable.
       */
      _defineProperty(this, "causes", []);
      /**
       * Internal Server Error (HTTP/SIP)
       */
      _defineProperty(this, "description", 'Internal Server Error (HTTP/SIP)');
      /**
       * The server could not fulfill the request due to some unexpected condition.
       */
      _defineProperty(this, "explanation", 'The server could not fulfill the request due to some unexpected condition.');
      /**
       * InternalServerError
       */
      _defineProperty(this, "name", 'InternalServerError');
      /**
       * Not applicable.
       */
      _defineProperty(this, "solutions", []);
      Object.setPrototypeOf(this, ServerErrors.InternalServerError.prototype);
      const msg = typeof message === 'string' ? message : this.explanation;
      this.message = `${this.name} (${this.code}): ${msg}`;
    }
  }
  _ServerErrors.InternalServerError = InternalServerError;
  class BadGateway extends _TwilioError.TwilioError {
    constructor(message) {
      super(message, 31502);
      /**
       * Not applicable.
       */
      _defineProperty(this, "causes", []);
      /**
       * Bad Gateway (HTTP/SIP)
       */
      _defineProperty(this, "description", 'Bad Gateway (HTTP/SIP)');
      /**
       * The server is acting as a gateway or proxy, and received an invalid response from a downstream server while attempting to fulfill the request.
       */
      _defineProperty(this, "explanation", 'The server is acting as a gateway or proxy, and received an invalid response from a downstream server while attempting to fulfill the request.');
      /**
       * BadGateway
       */
      _defineProperty(this, "name", 'BadGateway');
      /**
       * Not applicable.
       */
      _defineProperty(this, "solutions", []);
      Object.setPrototypeOf(this, ServerErrors.BadGateway.prototype);
      const msg = typeof message === 'string' ? message : this.explanation;
      this.message = `${this.name} (${this.code}): ${msg}`;
    }
  }
  _ServerErrors.BadGateway = BadGateway;
  class ServiceUnavailable extends _TwilioError.TwilioError {
    constructor(message) {
      super(message, 31503);
      /**
       * Not applicable.
       */
      _defineProperty(this, "causes", []);
      /**
       * Service Unavailable (HTTP/SIP)
       */
      _defineProperty(this, "description", 'Service Unavailable (HTTP/SIP)');
      /**
       * The server is currently unable to handle the request due to a temporary overloading or maintenance of the server. This error can also be caused by the Application SID provided in the access token pointing to an inaccessible URL.
       */
      _defineProperty(this, "explanation", 'The server is currently unable to handle the request due to a temporary overloading or maintenance of the server. This error can also be caused by the Application SID provided in the access token pointing to an inaccessible URL.');
      /**
       * ServiceUnavailable
       */
      _defineProperty(this, "name", 'ServiceUnavailable');
      /**
       * Not applicable.
       */
      _defineProperty(this, "solutions", []);
      Object.setPrototypeOf(this, ServerErrors.ServiceUnavailable.prototype);
      const msg = typeof message === 'string' ? message : this.explanation;
      this.message = `${this.name} (${this.code}): ${msg}`;
    }
  }
  _ServerErrors.ServiceUnavailable = ServiceUnavailable;
  class GatewayTimeout extends _TwilioError.TwilioError {
    constructor(message) {
      super(message, 31504);
      /**
       * Not applicable.
       */
      _defineProperty(this, "causes", []);
      /**
       * Gateway Timeout (HTTP/SIP)
       */
      _defineProperty(this, "description", 'Gateway Timeout (HTTP/SIP)');
      /**
       * The server, while acting as a gateway or proxy, did not receive a timely response from an upstream server.
       */
      _defineProperty(this, "explanation", 'The server, while acting as a gateway or proxy, did not receive a timely response from an upstream server.');
      /**
       * GatewayTimeout
       */
      _defineProperty(this, "name", 'GatewayTimeout');
      /**
       * Not applicable.
       */
      _defineProperty(this, "solutions", []);
      Object.setPrototypeOf(this, ServerErrors.GatewayTimeout.prototype);
      const msg = typeof message === 'string' ? message : this.explanation;
      this.message = `${this.name} (${this.code}): ${msg}`;
    }
  }
  _ServerErrors.GatewayTimeout = GatewayTimeout;
  class DNSResolutionError extends _TwilioError.TwilioError {
    constructor(message) {
      super(message, 31530);
      /**
       * Not applicable.
       */
      _defineProperty(this, "causes", []);
      /**
       * DNS Resolution Error (HTTP/SIP)
       */
      _defineProperty(this, "description", 'DNS Resolution Error (HTTP/SIP)');
      /**
       * Could not connect to the server.
       */
      _defineProperty(this, "explanation", 'Could not connect to the server.');
      /**
       * DNSResolutionError
       */
      _defineProperty(this, "name", 'DNSResolutionError');
      /**
       * Not applicable.
       */
      _defineProperty(this, "solutions", []);
      Object.setPrototypeOf(this, ServerErrors.DNSResolutionError.prototype);
      const msg = typeof message === 'string' ? message : this.explanation;
      this.message = `${this.name} (${this.code}): ${msg}`;
    }
  }
  _ServerErrors.DNSResolutionError = DNSResolutionError;
})(ServerErrors || (exports.ServerErrors = ServerErrors = {}));
let SIPServerErrors = exports.SIPServerErrors = void 0;
/**
 * @public
 * TwiML errors.
 */
(function (_SIPServerErrors) {
  class BusyEverywhere extends _TwilioError.TwilioError {
    constructor(message) {
      super(message, 31600);
      /**
       * Not applicable.
       */
      _defineProperty(this, "causes", []);
      /**
       * Busy Everywhere (SIP)
       */
      _defineProperty(this, "description", 'Busy Everywhere (SIP)');
      /**
       * All possible destinations are busy.
       */
      _defineProperty(this, "explanation", 'All possible destinations are busy.');
      /**
       * BusyEverywhere
       */
      _defineProperty(this, "name", 'BusyEverywhere');
      /**
       * Not applicable.
       */
      _defineProperty(this, "solutions", []);
      Object.setPrototypeOf(this, SIPServerErrors.BusyEverywhere.prototype);
      const msg = typeof message === 'string' ? message : this.explanation;
      this.message = `${this.name} (${this.code}): ${msg}`;
    }
  }
  _SIPServerErrors.BusyEverywhere = BusyEverywhere;
  class Decline extends _TwilioError.TwilioError {
    constructor(message) {
      super(message, 31603);
      /**
       * Not applicable.
       */
      _defineProperty(this, "causes", []);
      /**
       * Decline (SIP)
       */
      _defineProperty(this, "description", 'Decline (SIP)');
      /**
       * The callee does not wish to participate in the call.
       */
      _defineProperty(this, "explanation", 'The callee does not wish to participate in the call.');
      /**
       * Decline
       */
      _defineProperty(this, "name", 'Decline');
      /**
       * Not applicable.
       */
      _defineProperty(this, "solutions", []);
      Object.setPrototypeOf(this, SIPServerErrors.Decline.prototype);
      const msg = typeof message === 'string' ? message : this.explanation;
      this.message = `${this.name} (${this.code}): ${msg}`;
    }
  }
  _SIPServerErrors.Decline = Decline;
  class DoesNotExistAnywhere extends _TwilioError.TwilioError {
    constructor(message) {
      super(message, 31604);
      /**
       * Not applicable.
       */
      _defineProperty(this, "causes", []);
      /**
       * Does Not Exist Anywhere (SIP)
       */
      _defineProperty(this, "description", 'Does Not Exist Anywhere (SIP)');
      /**
       * The requested callee does not exist anywhere.
       */
      _defineProperty(this, "explanation", 'The requested callee does not exist anywhere.');
      /**
       * DoesNotExistAnywhere
       */
      _defineProperty(this, "name", 'DoesNotExistAnywhere');
      /**
       * Not applicable.
       */
      _defineProperty(this, "solutions", []);
      Object.setPrototypeOf(this, SIPServerErrors.DoesNotExistAnywhere.prototype);
      const msg = typeof message === 'string' ? message : this.explanation;
      this.message = `${this.name} (${this.code}): ${msg}`;
    }
  }
  _SIPServerErrors.DoesNotExistAnywhere = DoesNotExistAnywhere;
})(SIPServerErrors || (exports.SIPServerErrors = SIPServerErrors = {}));
let TwiMLErrors = exports.TwiMLErrors = void 0;
/**
 * @public
 * General errors.
 */
(function (_TwiMLErrors) {
  class InvalidApplicationSid extends _TwilioError.TwilioError {
    constructor(message) {
      super(message, 21218);
      /**
       * Not applicable.
       */
      _defineProperty(this, "causes", []);
      /**
       * Invalid ApplicationSid
       */
      _defineProperty(this, "description", 'Invalid ApplicationSid');
      /**
       * You attempted to initiate an outbound phone call with an invalid ApplicationSid. The application may not exist anymore or may not be available within your account
       */
      _defineProperty(this, "explanation", 'You attempted to initiate an outbound phone call with an invalid ApplicationSid. The application may not exist anymore or may not be available within your account');
      /**
       * InvalidApplicationSid
       */
      _defineProperty(this, "name", 'InvalidApplicationSid');
      /**
       * Not applicable.
       */
      _defineProperty(this, "solutions", []);
      Object.setPrototypeOf(this, TwiMLErrors.InvalidApplicationSid.prototype);
      const msg = typeof message === 'string' ? message : this.explanation;
      this.message = `${this.name} (${this.code}): ${msg}`;
    }
  }
  _TwiMLErrors.InvalidApplicationSid = InvalidApplicationSid;
})(TwiMLErrors || (exports.TwiMLErrors = TwiMLErrors = {}));
let GeneralErrors = exports.GeneralErrors = void 0;
/**
 * @public
 * MalformedRequest errors.
 */
(function (_GeneralErrors) {
  class ConnectionError extends _TwilioError.TwilioError {
    constructor(message) {
      super(message, 31005);
      /**
       * Not applicable.
       */
      _defineProperty(this, "causes", []);
      /**
       * Connection error
       */
      _defineProperty(this, "description", 'Connection error');
      /**
       * A connection error occurred during the call
       */
      _defineProperty(this, "explanation", 'A connection error occurred during the call');
      /**
       * ConnectionError
       */
      _defineProperty(this, "name", 'ConnectionError');
      /**
       * Not applicable.
       */
      _defineProperty(this, "solutions", []);
      Object.setPrototypeOf(this, GeneralErrors.ConnectionError.prototype);
      const msg = typeof message === 'string' ? message : this.explanation;
      this.message = `${this.name} (${this.code}): ${msg}`;
    }
  }
  _GeneralErrors.ConnectionError = ConnectionError;
  class CallCancelledError extends _TwilioError.TwilioError {
    constructor(message) {
      super(message, 31008);
      /**
       * The incoming call was cancelled because it was not answered in time or it was accepted/rejected by another application instance registered with the same identity.
       */
      _defineProperty(this, "causes", ['The incoming call was cancelled because it was not answered in time or it was accepted/rejected by another application instance registered with the same identity.']);
      /**
       * Call cancelled
       */
      _defineProperty(this, "description", 'Call cancelled');
      /**
       * Unable to answer because the call has ended
       */
      _defineProperty(this, "explanation", 'Unable to answer because the call has ended');
      /**
       * CallCancelledError
       */
      _defineProperty(this, "name", 'CallCancelledError');
      /**
       * Not applicable.
       */
      _defineProperty(this, "solutions", []);
      Object.setPrototypeOf(this, GeneralErrors.CallCancelledError.prototype);
      const msg = typeof message === 'string' ? message : this.explanation;
      this.message = `${this.name} (${this.code}): ${msg}`;
    }
  }
  _GeneralErrors.CallCancelledError = CallCancelledError;
  class TransportError extends _TwilioError.TwilioError {
    constructor(message) {
      super(message, 31009);
      /**
       * Not applicable.
       */
      _defineProperty(this, "causes", []);
      /**
       * Transport error
       */
      _defineProperty(this, "description", 'Transport error');
      /**
       * No transport available to send or receive messages
       */
      _defineProperty(this, "explanation", 'No transport available to send or receive messages');
      /**
       * TransportError
       */
      _defineProperty(this, "name", 'TransportError');
      /**
       * Not applicable.
       */
      _defineProperty(this, "solutions", []);
      Object.setPrototypeOf(this, GeneralErrors.TransportError.prototype);
      const msg = typeof message === 'string' ? message : this.explanation;
      this.message = `${this.name} (${this.code}): ${msg}`;
    }
  }
  _GeneralErrors.TransportError = TransportError;
})(GeneralErrors || (exports.GeneralErrors = GeneralErrors = {}));
let MalformedRequestErrors = exports.MalformedRequestErrors = void 0;
/**
 * @public
 * Registration errors.
 */
(function (_MalformedRequestErrors) {
  class MalformedRequestError extends _TwilioError.TwilioError {
    constructor(message) {
      super(message, 31100);
      /**
       * Invalid content or MessageType passed to sendMessage method.
       */
      _defineProperty(this, "causes", ['Invalid content or MessageType passed to sendMessage method.']);
      /**
       * The request had malformed syntax.
       */
      _defineProperty(this, "description", 'The request had malformed syntax.');
      /**
       * The request could not be understood due to malformed syntax.
       */
      _defineProperty(this, "explanation", 'The request could not be understood due to malformed syntax.');
      /**
       * MalformedRequestError
       */
      _defineProperty(this, "name", 'MalformedRequestError');
      /**
       * Ensure content and MessageType passed to sendMessage method are valid.
       */
      _defineProperty(this, "solutions", ['Ensure content and MessageType passed to sendMessage method are valid.']);
      Object.setPrototypeOf(this, MalformedRequestErrors.MalformedRequestError.prototype);
      const msg = typeof message === 'string' ? message : this.explanation;
      this.message = `${this.name} (${this.code}): ${msg}`;
    }
  }
  _MalformedRequestErrors.MalformedRequestError = MalformedRequestError;
})(MalformedRequestErrors || (exports.MalformedRequestErrors = MalformedRequestErrors = {}));
let RegistrationErrors = exports.RegistrationErrors = void 0;
/**
 * @public
 * UserMedia errors.
 */
(function (_RegistrationErrors) {
  class RegistrationError extends _TwilioError.TwilioError {
    constructor(message) {
      super(message, 31301);
      /**
       * Not applicable.
       */
      _defineProperty(this, "causes", []);
      /**
       * Registration error
       */
      _defineProperty(this, "description", 'Registration error');
      /**
       * 
       */
      _defineProperty(this, "explanation", '');
      /**
       * RegistrationError
       */
      _defineProperty(this, "name", 'RegistrationError');
      /**
       * Not applicable.
       */
      _defineProperty(this, "solutions", []);
      Object.setPrototypeOf(this, RegistrationErrors.RegistrationError.prototype);
      const msg = typeof message === 'string' ? message : this.explanation;
      this.message = `${this.name} (${this.code}): ${msg}`;
    }
  }
  _RegistrationErrors.RegistrationError = RegistrationError;
  class UnsupportedCancelMessageError extends _TwilioError.TwilioError {
    constructor(message) {
      super(message, 31302);
      /**
       * The identity associated with the Twilio Voice SDK is still registered to receive cancel push notification messages.
       */
      _defineProperty(this, "causes", ['The identity associated with the Twilio Voice SDK is still registered to receive cancel push notification messages.']);
      /**
       * Unsupported Cancel Message Error
       */
      _defineProperty(this, "description", 'Unsupported Cancel Message Error');
      /**
       * This version of the SDK no longer supports processing cancel push notification messages. You must register via Voice.register(...) on Android or [TwilioVoice registerWithAccessToken:deviceToken:completion:] on iOS with this version of the SDK to stop receiving cancel push notification messages. Cancellations are now handled internally and reported to you on behalf of the SDK.
       */
      _defineProperty(this, "explanation", 'This version of the SDK no longer supports processing cancel push notification messages. You must register via Voice.register(...) on Android or [TwilioVoice registerWithAccessToken:deviceToken:completion:] on iOS with this version of the SDK to stop receiving cancel push notification messages. Cancellations are now handled internally and reported to you on behalf of the SDK.');
      /**
       * UnsupportedCancelMessageError
       */
      _defineProperty(this, "name", 'UnsupportedCancelMessageError');
      /**
       * The application must register via Voice.register(...) on Android or [TwilioVoice registerWithAccessToken:deviceToken:completion:] on iOS to stop receiving cancel push notification messages.
       */
      _defineProperty(this, "solutions", ['The application must register via Voice.register(...) on Android or [TwilioVoice registerWithAccessToken:deviceToken:completion:] on iOS to stop receiving cancel push notification messages.']);
      Object.setPrototypeOf(this, RegistrationErrors.UnsupportedCancelMessageError.prototype);
      const msg = typeof message === 'string' ? message : this.explanation;
      this.message = `${this.name} (${this.code}): ${msg}`;
    }
  }
  _RegistrationErrors.UnsupportedCancelMessageError = UnsupportedCancelMessageError;
})(RegistrationErrors || (exports.RegistrationErrors = RegistrationErrors = {}));
let UserMediaErrors = exports.UserMediaErrors = void 0;
/**
 * @public
 * Signaling errors.
 */
(function (_UserMediaErrors) {
  class PermissionDeniedError extends _TwilioError.TwilioError {
    constructor(message) {
      super(message, 31401);
      /**
       * The user denied the getUserMedia request.
       * The browser denied the getUserMedia request.
       * The application has not been configured with the proper permissions.
       */
      _defineProperty(this, "causes", ['The user denied the getUserMedia request.', 'The browser denied the getUserMedia request.', 'The application has not been configured with the proper permissions.']);
      /**
       * UserMedia Permission Denied Error
       */
      _defineProperty(this, "description", 'UserMedia Permission Denied Error');
      /**
       * The browser or end-user denied permissions to user media. Therefore we were unable to acquire input audio.
       */
      _defineProperty(this, "explanation", 'The browser or end-user denied permissions to user media. Therefore we were unable to acquire input audio.');
      /**
       * PermissionDeniedError
       */
      _defineProperty(this, "name", 'PermissionDeniedError');
      /**
       * The user should accept the request next time prompted. If the browser saved the deny, the user should change that permission in their browser.
       * The user should to verify that the browser has permission to access the microphone at this address.
       * The user should ensure that the proper permissions have been granted in the mobile device OS.
       */
      _defineProperty(this, "solutions", ['The user should accept the request next time prompted. If the browser saved the deny, the user should change that permission in their browser.', 'The user should to verify that the browser has permission to access the microphone at this address.', 'The user should ensure that the proper permissions have been granted in the mobile device OS.']);
      Object.setPrototypeOf(this, UserMediaErrors.PermissionDeniedError.prototype);
      const msg = typeof message === 'string' ? message : this.explanation;
      this.message = `${this.name} (${this.code}): ${msg}`;
    }
  }
  _UserMediaErrors.PermissionDeniedError = PermissionDeniedError;
})(UserMediaErrors || (exports.UserMediaErrors = UserMediaErrors = {}));
let SignalingErrors = exports.SignalingErrors = void 0;
/**
 * @public
 * Media errors.
 */
(function (_SignalingErrors) {
  class ConnectionDisconnected extends _TwilioError.TwilioError {
    constructor(message) {
      super(message, 53001);
      /**
       * The device running your application lost its Internet connection.
       */
      _defineProperty(this, "causes", ['The device running your application lost its Internet connection.']);
      /**
       * Signaling connection disconnected
       */
      _defineProperty(this, "description", 'Signaling connection disconnected');
      /**
       * Raised whenever the signaling connection is unexpectedly disconnected.
       */
      _defineProperty(this, "explanation", 'Raised whenever the signaling connection is unexpectedly disconnected.');
      /**
       * ConnectionDisconnected
       */
      _defineProperty(this, "name", 'ConnectionDisconnected');
      /**
       * Ensure the device running your application has access to a stable Internet connection.
       */
      _defineProperty(this, "solutions", ['Ensure the device running your application has access to a stable Internet connection.']);
      Object.setPrototypeOf(this, SignalingErrors.ConnectionDisconnected.prototype);
      const msg = typeof message === 'string' ? message : this.explanation;
      this.message = `${this.name} (${this.code}): ${msg}`;
    }
  }
  _SignalingErrors.ConnectionDisconnected = ConnectionDisconnected;
})(SignalingErrors || (exports.SignalingErrors = SignalingErrors = {}));
let MediaErrors = exports.MediaErrors = void 0;
/**
 * @internal
 */
(function (_MediaErrors) {
  class ClientLocalDescFailed extends _TwilioError.TwilioError {
    constructor(message) {
      super(message, 53400);
      /**
       * The Client may not be using a supported WebRTC implementation.
       * The Client may not have the necessary resources to create or apply a new media description.
       */
      _defineProperty(this, "causes", ['The Client may not be using a supported WebRTC implementation.', 'The Client may not have the necessary resources to create or apply a new media description.']);
      /**
       * Client is unable to create or apply a local media description
       */
      _defineProperty(this, "description", 'Client is unable to create or apply a local media description');
      /**
       * Raised whenever a Client is unable to create or apply a local media description.
       */
      _defineProperty(this, "explanation", 'Raised whenever a Client is unable to create or apply a local media description.');
      /**
       * ClientLocalDescFailed
       */
      _defineProperty(this, "name", 'ClientLocalDescFailed');
      /**
       * If you are experiencing this error using the JavaScript SDK, ensure you are running it with a supported WebRTC implementation.
       */
      _defineProperty(this, "solutions", ['If you are experiencing this error using the JavaScript SDK, ensure you are running it with a supported WebRTC implementation.']);
      Object.setPrototypeOf(this, MediaErrors.ClientLocalDescFailed.prototype);
      const msg = typeof message === 'string' ? message : this.explanation;
      this.message = `${this.name} (${this.code}): ${msg}`;
    }
  }
  _MediaErrors.ClientLocalDescFailed = ClientLocalDescFailed;
  class ServerLocalDescFailed extends _TwilioError.TwilioError {
    constructor(message) {
      super(message, 53401);
      /**
       * A server-side error has occurred.
       */
      _defineProperty(this, "causes", ['A server-side error has occurred.']);
      /**
       * Server is unable to create or apply a local media description
       */
      _defineProperty(this, "description", 'Server is unable to create or apply a local media description');
      /**
       * Raised whenever the Server is unable to create or apply a local media description.
       */
      _defineProperty(this, "explanation", 'Raised whenever the Server is unable to create or apply a local media description.');
      /**
       * ServerLocalDescFailed
       */
      _defineProperty(this, "name", 'ServerLocalDescFailed');
      /**
       * If the problem persists, try connecting to another region.
       */
      _defineProperty(this, "solutions", ['If the problem persists, try connecting to another region.']);
      Object.setPrototypeOf(this, MediaErrors.ServerLocalDescFailed.prototype);
      const msg = typeof message === 'string' ? message : this.explanation;
      this.message = `${this.name} (${this.code}): ${msg}`;
    }
  }
  _MediaErrors.ServerLocalDescFailed = ServerLocalDescFailed;
  class ClientRemoteDescFailed extends _TwilioError.TwilioError {
    constructor(message) {
      super(message, 53402);
      /**
       * The Client may not be using a supported WebRTC implementation.
       * The Client may be connecting peer-to-peer with another Participant that is not using a supported WebRTC implementation.
       * The Client may not have the necessary resources to apply a new media description.
       */
      _defineProperty(this, "causes", ['The Client may not be using a supported WebRTC implementation.', 'The Client may be connecting peer-to-peer with another Participant that is not using a supported WebRTC implementation.', 'The Client may not have the necessary resources to apply a new media description.']);
      /**
       * Client is unable to apply a remote media description
       */
      _defineProperty(this, "description", 'Client is unable to apply a remote media description');
      /**
       * Raised whenever the Client receives a remote media description but is unable to apply it.
       */
      _defineProperty(this, "explanation", 'Raised whenever the Client receives a remote media description but is unable to apply it.');
      /**
       * ClientRemoteDescFailed
       */
      _defineProperty(this, "name", 'ClientRemoteDescFailed');
      /**
       * If you are experiencing this error using the JavaScript SDK, ensure you are running it with a supported WebRTC implementation.
       */
      _defineProperty(this, "solutions", ['If you are experiencing this error using the JavaScript SDK, ensure you are running it with a supported WebRTC implementation.']);
      Object.setPrototypeOf(this, MediaErrors.ClientRemoteDescFailed.prototype);
      const msg = typeof message === 'string' ? message : this.explanation;
      this.message = `${this.name} (${this.code}): ${msg}`;
    }
  }
  _MediaErrors.ClientRemoteDescFailed = ClientRemoteDescFailed;
  class ServerRemoteDescFailed extends _TwilioError.TwilioError {
    constructor(message) {
      super(message, 53403);
      /**
       * The Client may not be using a supported WebRTC implementation.
       * The Client may not have the necessary resources to apply a new media description.
       * A Server-side error may have caused the Server to generate an invalid media description.
       */
      _defineProperty(this, "causes", ['The Client may not be using a supported WebRTC implementation.', 'The Client may not have the necessary resources to apply a new media description.', 'A Server-side error may have caused the Server to generate an invalid media description.']);
      /**
       * Server is unable to apply a remote media description
       */
      _defineProperty(this, "description", 'Server is unable to apply a remote media description');
      /**
       * Raised whenever the Server receives a remote media description but is unable to apply it.
       */
      _defineProperty(this, "explanation", 'Raised whenever the Server receives a remote media description but is unable to apply it.');
      /**
       * ServerRemoteDescFailed
       */
      _defineProperty(this, "name", 'ServerRemoteDescFailed');
      /**
       * If you are experiencing this error using the JavaScript SDK, ensure you are running it with a supported WebRTC implementation.
       * If the problem persists, try connecting to another region.
       */
      _defineProperty(this, "solutions", ['If you are experiencing this error using the JavaScript SDK, ensure you are running it with a supported WebRTC implementation.', 'If the problem persists, try connecting to another region.']);
      Object.setPrototypeOf(this, MediaErrors.ServerRemoteDescFailed.prototype);
      const msg = typeof message === 'string' ? message : this.explanation;
      this.message = `${this.name} (${this.code}): ${msg}`;
    }
  }
  _MediaErrors.ServerRemoteDescFailed = ServerRemoteDescFailed;
  class NoSupportedCodec extends _TwilioError.TwilioError {
    constructor(message) {
      super(message, 53404);
      /**
       * The C++ SDK was built without the recommended set of codecs.
       * The JavaScript SDK is running in a browser that does not implement the recommended set of codecs.
       */
      _defineProperty(this, "causes", ['The C++ SDK was built without the recommended set of codecs.', 'The JavaScript SDK is running in a browser that does not implement the recommended set of codecs.']);
      /**
       * No supported codec
       */
      _defineProperty(this, "description", 'No supported codec');
      /**
       * Raised whenever the intersection of codecs supported by the Client and the Server (or, in peer-to-peer, the Client and another Participant) is empty.
       */
      _defineProperty(this, "explanation", 'Raised whenever the intersection of codecs supported by the Client and the Server (or, in peer-to-peer, the Client and another Participant) is empty.');
      /**
       * NoSupportedCodec
       */
      _defineProperty(this, "name", 'NoSupportedCodec');
      /**
       * If you are experiencing this error using the C++ SDK, ensure you build it with the recommended set of codecs.
       * If you are experiencing this error using the JavaScript SDK, ensure you are using a compatible browser.
       */
      _defineProperty(this, "solutions", ['If you are experiencing this error using the C++ SDK, ensure you build it with the recommended set of codecs.', 'If you are experiencing this error using the JavaScript SDK, ensure you are using a compatible browser.']);
      Object.setPrototypeOf(this, MediaErrors.NoSupportedCodec.prototype);
      const msg = typeof message === 'string' ? message : this.explanation;
      this.message = `${this.name} (${this.code}): ${msg}`;
    }
  }
  _MediaErrors.NoSupportedCodec = NoSupportedCodec;
  class ConnectionError extends _TwilioError.TwilioError {
    constructor(message) {
      super(message, 53405);
      /**
       * The Client was unable to establish a media connection.
       * A media connection which was active failed liveliness checks.
       */
      _defineProperty(this, "causes", ['The Client was unable to establish a media connection.', 'A media connection which was active failed liveliness checks.']);
      /**
       * Media connection failed
       */
      _defineProperty(this, "description", 'Media connection failed');
      /**
       * Raised by the Client or Server whenever a media connection fails.
       */
      _defineProperty(this, "explanation", 'Raised by the Client or Server whenever a media connection fails.');
      /**
       * ConnectionError
       */
      _defineProperty(this, "name", 'ConnectionError');
      /**
       * If the problem persists, try connecting to another region.
       * Check your Client's network connectivity.
       * If you've provided custom ICE Servers then ensure that the URLs and credentials are valid.
       */
      _defineProperty(this, "solutions", ['If the problem persists, try connecting to another region.', 'Check your Client\'s network connectivity.', 'If you\'ve provided custom ICE Servers then ensure that the URLs and credentials are valid.']);
      Object.setPrototypeOf(this, MediaErrors.ConnectionError.prototype);
      const msg = typeof message === 'string' ? message : this.explanation;
      this.message = `${this.name} (${this.code}): ${msg}`;
    }
  }
  _MediaErrors.ConnectionError = ConnectionError;
  class MediaDtlsTransportFailedError extends _TwilioError.TwilioError {
    constructor(message) {
      super(message, 53407);
      /**
       * One or both of the DTLS peers have an invalid certificate.
       * One or both of the DTLS peers have an outdated version of DTLS.
       * One or both of the DTLS peers lost internet connectivity while performing a DTLS handshake.
       */
      _defineProperty(this, "causes", ['One or both of the DTLS peers have an invalid certificate.', 'One or both of the DTLS peers have an outdated version of DTLS.', 'One or both of the DTLS peers lost internet connectivity while performing a DTLS handshake.']);
      /**
       * The media connection failed due to DTLS handshake failure
       */
      _defineProperty(this, "description", 'The media connection failed due to DTLS handshake failure');
      /**
       * There was a problem while negotiating with the remote DTLS peer. Therefore the Client will not be able to establish the media connection.
       */
      _defineProperty(this, "explanation", 'There was a problem while negotiating with the remote DTLS peer. Therefore the Client will not be able to establish the media connection.');
      /**
       * MediaDtlsTransportFailedError
       */
      _defineProperty(this, "name", 'MediaDtlsTransportFailedError');
      /**
       * Ensure that your certificate is valid.
       * Ensure that you have a stable internet connection.
       * Ensure that the browser or the Mobile SDK supports newer versions of DTLS.
       */
      _defineProperty(this, "solutions", ['Ensure that your certificate is valid.', 'Ensure that you have a stable internet connection.', 'Ensure that the browser or the Mobile SDK supports newer versions of DTLS.']);
      Object.setPrototypeOf(this, MediaErrors.MediaDtlsTransportFailedError.prototype);
      const msg = typeof message === 'string' ? message : this.explanation;
      this.message = `${this.name} (${this.code}): ${msg}`;
    }
  }
  _MediaErrors.MediaDtlsTransportFailedError = MediaDtlsTransportFailedError;
})(MediaErrors || (exports.MediaErrors = MediaErrors = {}));
const errorsByCode = exports.errorsByCode = new Map([[20101, AuthorizationErrors.AccessTokenInvalid], [20102, AuthorizationErrors.AccessTokenHeaderInvalid], [20103, AuthorizationErrors.AccessTokenIssuerInvalid], [20104, AuthorizationErrors.AccessTokenExpired], [20105, AuthorizationErrors.AccessTokenNotYetValid], [20106, AuthorizationErrors.AccessTokenGrantsInvalid], [20107, AuthorizationErrors.AccessTokenSignatureInvalid], [20151, AuthorizationErrors.AuthenticationFailed], [20157, AuthorizationErrors.ExpirationTimeExceedsMaxTimeAllowed], [20403, ForbiddenErrors.Forbidden], [21218, TwiMLErrors.InvalidApplicationSid], [31005, GeneralErrors.ConnectionError], [31008, GeneralErrors.CallCancelledError], [31009, GeneralErrors.TransportError], [31100, MalformedRequestErrors.MalformedRequestError], [31201, AuthorizationErrors.AuthorizationError], [31206, AuthorizationErrors.RateExceededError], [31210, AuthorizationErrors.CallMessageEventTypeInvalidError], [31211, AuthorizationErrors.CallMessageUnexpectedStateError], [31212, AuthorizationErrors.PayloadSizeExceededError], [31301, RegistrationErrors.RegistrationError], [31302, RegistrationErrors.UnsupportedCancelMessageError], [31400, ClientErrors.BadRequest], [31401, UserMediaErrors.PermissionDeniedError], [31403, ClientErrors.Forbidden], [31404, ClientErrors.NotFound], [31408, ClientErrors.RequestTimeout], [31409, ClientErrors.Conflict], [31426, ClientErrors.UpgradeRequired], [31429, ClientErrors.TooManyRequests], [31480, ClientErrors.TemporarilyUnavailable], [31481, ClientErrors.CallTransactionDoesNotExist], [31484, ClientErrors.AddressIncomplete], [31486, ClientErrors.BusyHere], [31487, ClientErrors.RequestTerminated], [31500, ServerErrors.InternalServerError], [31502, ServerErrors.BadGateway], [31503, ServerErrors.ServiceUnavailable], [31504, ServerErrors.GatewayTimeout], [31530, ServerErrors.DNSResolutionError], [31600, SIPServerErrors.BusyEverywhere], [31603, SIPServerErrors.Decline], [31604, SIPServerErrors.DoesNotExistAnywhere], [51007, AuthorizationErrors.AccessTokenRejected], [53001, SignalingErrors.ConnectionDisconnected], [53400, MediaErrors.ClientLocalDescFailed], [53401, MediaErrors.ServerLocalDescFailed], [53402, MediaErrors.ClientRemoteDescFailed], [53403, MediaErrors.ServerRemoteDescFailed], [53404, MediaErrors.NoSupportedCodec], [53405, MediaErrors.ConnectionError], [53407, MediaErrors.MediaDtlsTransportFailedError]]);
Object.freeze(errorsByCode);
//# sourceMappingURL=generated.js.map