import { guardNativeEventHandler } from '../utility/guardNativeEventHandler';

describe('guardNativeEventHandler', () => {
  it('invokes the wrapped handler with the given arguments', () => {
    const handler = jest.fn();
    const guarded = guardNativeEventHandler('TestScope', handler);

    guarded('foo', 42);

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith('foo', 42);
  });

  it('returns the wrapped handler return value undefined (fire-and-forget)', () => {
    const handler = jest.fn(() => 'ignored');
    const guarded = guardNativeEventHandler('TestScope', handler);

    expect(guarded()).toBeUndefined();
  });

  it('catches a throw from the wrapped handler instead of propagating it', () => {
    const error = new Error('boom');
    const handler = jest.fn(() => {
      throw error;
    });
    const guarded = guardNativeEventHandler('TestScope', handler);

    expect(() => guarded()).not.toThrow();
  });

  it('logs the scope and the caught error via console.error', () => {
    const error = new Error('boom');
    const handler = jest.fn(() => {
      throw error;
    });
    const guarded = guardNativeEventHandler('TestScope', handler);
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    guarded();

    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy.mock.calls[0]?.[0]).toEqual(
      expect.stringContaining('TestScope')
    );
    expect(consoleErrorSpy.mock.calls[0]?.[1]).toBe(error);

    consoleErrorSpy.mockRestore();
  });

  it('does not affect a handler invoked directly (bypassing the guard)', () => {
    const handler = jest.fn(() => {
      throw new Error('boom');
    });

    // The guard only protects the reference registered with
    // NativeEventEmitter -- the underlying handler still throws when
    // called directly, which is what the Voice/Call/CallInvite/
    // PreflightTest suites rely on to test their own validation logic.
    expect(() => handler()).toThrow('boom');
  });
});
