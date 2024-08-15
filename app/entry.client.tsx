import { startTransition } from 'react';

import { RemixBrowser } from '@remix-run/react';
import { hydrateRoot } from 'react-dom/client';

startTransition(() => {
  hydrateRoot(document, <RemixBrowser />);
});
