'use client'
import React from 'react';

export function AudioPlayer({ src }: { src: string }) {
  return <audio controls src={src} />;
}
