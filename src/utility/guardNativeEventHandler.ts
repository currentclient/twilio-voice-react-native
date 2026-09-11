/**
 * Copyright © 2022 Twilio, Inc. All rights reserved. Licensed under the Twilio
 * license.
 *
 * See LICENSE in the project root for license information.
 */

/**
 * Wraps a native-event listener (the function actually registered with
 * `NativeEventEmitter.addListener`) so that a throw from anywhere inside it
 * -- an unrecognized event type, a malformed native payload, or a listener
 * an app registered via `.on(...)`/`.addListener(...)` re-emitted to --
 * cannot escape back into the native layer.
 *
 * This matters because `NativeEventEmitter`'s dispatch to JS is
 * asynchronous: by the time the wrapped listener actually runs, it runs as
 * the JS side of a native->JS call that Hermes makes directly (the
 * `HermesRuntimeImpl::call()` frame in a crash report). An uncaught throw
 * here is an uncaught JS exception with nothing above it in JS to catch it,
 * and React Native's own fatal-exception handling treats that as
 * unrecoverable (`RCTFatal`, which aborts the process by design) -- observed
 * as the app dying mid-call, taking no native call state down with it
 * (PRO-7754). Catching here means a bug in event handling drops one event
 * instead of the whole app.
 *
 * Deliberately does NOT wrap the handler itself (e.g. `_handleNativeEvent`)
 * in place -- callers rely on that function still throwing synchronously
 * when invoked directly (constructing a matching test event, an explicit
 * "unknown event type" guard), so this wraps only the reference actually
 * handed to `NativeEventEmitter.addListener`.
 *
 * Kept in its own module (rather than alongside `common.ts`'s
 * `NativeEventEmitter` singleton) so it can be unit-tested without
 * triggering that singleton's native-module construction.
 */
export function guardNativeEventHandler<
  THandler extends (...args: any[]) => void
>(scope: string, handler: THandler): THandler {
  return ((...args: Parameters<THandler>) => {
    try {
      handler(...args);
    } catch (error) {
      console.error(
        `[twilio-voice-react-native] Uncaught error handling a "${scope}" ` +
          'native event; dropping this event rather than letting it crash ' +
          'the app:',
        error
      );
    }
  }) as THandler;
}
