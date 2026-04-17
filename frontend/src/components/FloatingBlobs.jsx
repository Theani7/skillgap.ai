import React from 'react';

/**
 * FloatingBlobs - Background ambient lighting component
 * Creates 4 animated, blurred gradient orbs that float slowly
 * Essential for the Claymorphism "zero-gravity" atmosphere
 */
const FloatingBlobs = () => {
  return (
    <div className="clay-blobs-container" aria-hidden="true">
      <div className="clay-blob clay-blob-purple" />
      <div className="clay-blob clay-blob-pink" />
      <div className="clay-blob clay-blob-blue" />
      <div className="clay-blob clay-blob-green" />
    </div>
  );
};

export default FloatingBlobs;
