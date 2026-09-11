/**
 * Shared between `__mocks__/common.ts` (which tags a handler passed
 * through the mocked `guardNativeEventHandler`) and any test that wants to
 * assert a handler was actually guarded.
 *
 * Deliberately its own module, not re-exported solely from
 * `__mocks__/common.ts`: a test file that both relies on `jest.mock('../common')`
 * (routing `../common` through Jest's mock registry) AND separately imports
 * `../__mocks__/common` directly (a different specifier, resolved through
 * the *normal* registry) ends up with two independent instantiations of
 * that module -- and since `Symbol(...)` is unique per evaluation, two
 * different, unequal tag values. Importing this tiny module directly
 * sidesteps that: it is never the target of `jest.mock(...)`, so it is
 * only ever instantiated once.
 */
export declare const guardedHandlerTag: unique symbol;
