// app/providers.tsx
'use client';

import { ExtrinsicProvider } from '@/common/extrinsicService/ExtrinsicProvider';
import { TelegramProvider } from '@/common/providers/telegramProvider';
import { NextUIProvider } from '@nextui-org/react';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextUIProvider>
      <TelegramProvider>{children}</TelegramProvider>
    </NextUIProvider>
  );
}
