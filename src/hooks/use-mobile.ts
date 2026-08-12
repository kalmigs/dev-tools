import * as React from 'react';

const MOBILE_BREAKPOINT = 768;

function subscribeToViewport(onChange: () => void) {
  const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
  mql.addEventListener('change', onChange);
  return () => mql.removeEventListener('change', onChange);
}

export function useIsMobile() {
  return React.useSyncExternalStore(
    subscribeToViewport,
    () => window.innerWidth < MOBILE_BREAKPOINT,
    () => false,
  );
}

const PHONE_UA = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i;

// The user agent never changes, so there is nothing to subscribe to.
function subscribeToNothing() {
  return () => {};
}

export function useIsLikelyPhone() {
  return React.useSyncExternalStore(
    subscribeToNothing,
    () => PHONE_UA.test(navigator.userAgent),
    () => false,
  );
}
