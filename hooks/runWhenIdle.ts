type IdleHandle = ReturnType<typeof setTimeout>;

interface IdleCapableGlobal {
  requestIdleCallback?: (
    callback: () => void,
    options?: {timeout?: number},
  ) => number;
  cancelIdleCallback?: (handle: number) => void;
}

const idleGlobal = globalThis as typeof globalThis & IdleCapableGlobal;

/** Defer work until the JS thread is idle (replaces deprecated InteractionManager.runAfterInteractions). */
export function runWhenIdle(callback: () => void, timeoutMs = 2000): {cancel: () => void} {
  const {requestIdleCallback, cancelIdleCallback} = idleGlobal;

  if (typeof requestIdleCallback === 'function') {
    const id = requestIdleCallback(callback, {timeout: timeoutMs});
    return {
      cancel: () => {
        cancelIdleCallback?.(id);
      },
    };
  }

  const id = setTimeout(callback, 1) as IdleHandle;
  return {cancel: () => clearTimeout(id)};
}
