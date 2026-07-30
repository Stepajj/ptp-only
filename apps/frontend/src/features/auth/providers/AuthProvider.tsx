'use client';

import { useEffect, useState } from 'react';
import { bootstrapAuth } from '../lib/bootstrapAuth';

interface Props {
  children: React.ReactNode;
}

export function AuthProvider({ children }: Props) {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    async function init() {
      await bootstrapAuth();
      setInitialized(true);
    }

    void init();
  }, []);

  if (!initialized) {
    return null;
  }

  return children;
}