import { useState } from 'react';

/**
 * Detect if user is on Mac (for keyboard shortcut display)
 */
export function useIsMac() {
  const [isMac] = useState(() => {
    if (typeof navigator === 'undefined') return false;
    return navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  });

  return isMac;
}
