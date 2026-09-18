"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Platform = exports.NativeModule = exports.NativeEventEmitter = void 0;
Object.defineProperty(exports, "guardNativeEventHandler", {
  enumerable: true,
  get: function () {
    return _guardNativeEventHandler.guardNativeEventHandler;
  }
});
exports.setTimeout = void 0;
var ReactNative = _interopRequireWildcard(require("react-native"));
var _guardNativeEventHandler = require("./utility/guardNativeEventHandler");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
/**
 * Copyright © 2022 Twilio, Inc. All rights reserved. Licensed under the Twilio
 * license.
 *
 * See LICENSE in the project root for license information.
 */

const NativeModule = exports.NativeModule = ReactNative.NativeModules.TwilioVoiceReactNative;
const NativeEventEmitter = exports.NativeEventEmitter = new ReactNative.NativeEventEmitter(NativeModule);
const Platform = exports.Platform = ReactNative.Platform;
const setTimeout = exports.setTimeout = global.setTimeout;
//# sourceMappingURL=common.js.map