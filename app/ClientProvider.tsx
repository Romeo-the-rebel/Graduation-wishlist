'use client';

import React from 'react';
import { ReactNode } from 'react';

export default function ClientProvider({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
    </>
  );
}
