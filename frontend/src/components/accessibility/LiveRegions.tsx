/**
 * Live Regions Component - Provides aria-live regions for status announcements
 */

import React from 'react';

interface LiveRegionsProps {
  politeRegionRef: React.RefObject<HTMLDivElement>;
  assertiveRegionRef: React.RefObject<HTMLDivElement>;
}

export function LiveRegions({ politeRegionRef, assertiveRegionRef }: LiveRegionsProps) {
  return (
    <>
      <div
        ref={politeRegionRef}
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        role="status"
      />
      <div
        ref={assertiveRegionRef}
        aria-live="assertive" 
        aria-atomic="true"
        className="sr-only"
        role="alert"
      />
    </>
  );
}

export default LiveRegions;