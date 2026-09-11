/**
 * This file is used by Jest manual mocking and meant to be utilized by
 * perfomring `jest.mock('../common')` in test files.
 */
/// <reference types="jest" />
import { EventEmitter } from 'eventemitter3';
export declare const NativeModule: {
    /**
     * Call Mocks
     */
    call_disconnect: jest.Mock<any, any>;
    call_getStats: jest.Mock<any, any>;
    call_hold: jest.Mock<Promise<boolean>, [_uuid: string, hold: boolean]>;
    call_isMuted: jest.Mock<any, any>;
    call_isOnHold: jest.Mock<any, any>;
    call_mute: jest.Mock<Promise<boolean>, [_uuid: string, mute: boolean]>;
    call_postFeedback: jest.Mock<any, any>;
    call_sendDigits: jest.Mock<any, any>;
    call_sendMessage: jest.Mock<any, any>;
    /**
     * Call Invite Mocks
     */
    callInvite_accept: jest.Mock<any, any>;
    callInvite_isValid: jest.Mock<any, any>;
    callInvite_reject: jest.Mock<any, any>;
    callInvite_updateCallerHandle: jest.Mock<any, any>;
    /**
     * Voice Mocks
     */
    voice_connect_android: jest.Mock<any, any>;
    voice_connect_ios: jest.Mock<any, any>;
    voice_getAudioDevices: jest.Mock<any, any>;
    voice_getCalls: jest.Mock<any, any>;
    voice_getCallInvites: jest.Mock<any, any>;
    voice_getDeviceToken: jest.Mock<any, any>;
    voice_getVersion: jest.Mock<any, any>;
    voice_handleEvent: jest.Mock<any, any>;
    voice_initializePushRegistry: jest.Mock<any, any>;
    voice_register: jest.Mock<any, any>;
    voice_selectAudioDevice: jest.Mock<any, any>;
    voice_setCallKitConfiguration: jest.Mock<any, any>;
    voice_showNativeAvRoutePicker: jest.Mock<any, any>;
    voice_setIncomingCallContactHandleTemplate: jest.Mock<any, any>;
    voice_unregister: jest.Mock<any, any>;
    voice_runPreflight: jest.Mock<any, any>;
    /**
     * PreflightTest mocks.
     */
    preflightTest_flushEvents: jest.Mock<any, any>;
    preflightTest_getCallSid: jest.Mock<any, any>;
    preflightTest_getEndTime: jest.Mock<any, any>;
    preflightTest_getLatestSample: jest.Mock<any, any>;
    preflightTest_getReport: jest.Mock<any, any>;
    preflightTest_getStartTime: jest.Mock<any, any>;
    preflightTest_getState: jest.Mock<any, any>;
    preflightTest_stop: jest.Mock<any, any>;
};
export declare class MockNativeEventEmitter extends EventEmitter {
    addListenerSpies: [string | symbol, jest.Mock][];
    addListener: jest.Mock<this, [event: string | symbol, fn: (...args: any[]) => void, context?: any]>;
    expectListenerAndReturnSpy(invocation: number, event: string | symbol, fn: (...args: any[]) => void): jest.Mock<any, any>;
    reset(): void;
}
export declare const NativeEventEmitter: MockNativeEventEmitter;
declare class MockPlatform {
    get OS(): string;
}
export declare const Platform: MockPlatform;
export declare const setTimeout: jest.Mock<any, any>;
export { guardedHandlerTag } from './guardedHandlerTag';
/**
 * Identity passthrough: existing tests invoke handlers directly (e.g.
 * `voice['_handleNativeEvent'](...)`) and assert on the exact reference
 * registered with `NativeEventEmitter.addListener`, so the mock must not
 * wrap `handler` in a new function. `guardNativeEventHandler`'s own
 * catching behavior is covered directly against the real implementation
 * in `src/__tests__/guardNativeEventHandler.test.ts`, not through this
 * mock.
 *
 * It still tags the returned (same) reference so tests can assert that
 * the function actually registered with `NativeEventEmitter.addListener`
 * went through this call at all -- ironhide-cc's PR #31 review nit: a
 * regression that reverted to registering the raw handler directly would
 * otherwise stay green, since a passthrough mock is indistinguishable
 * from no wrapping at all by reference equality.
 */
export declare function guardNativeEventHandler<THandler extends (...args: any[]) => void>(_scope: string, handler: THandler): THandler;
