import { type WebApp } from '@twa-dev/types';
import { createEffect, createEvent, createStore, sample } from 'effector';
import { readonly } from 'patronum';

const webAppStarted = createEvent();

const $webApp = createStore<WebApp | null>(null);
const $error = createStore<Error | null>(null);

const webAppStartedFx = createEffect((): WebApp | never => {
  const webApp = window.Telegram?.WebApp;

  if (!webApp) {
    throw new Error('Telegram API is missing, try to restart application');
  }

  webApp.ready();
  webApp.setHeaderColor('#f2f2f7');
  webApp.expand();
  webApp.disableClosingConfirmation();

  return webApp;
});

const $user = $webApp.map(webApp => webApp?.initDataUnsafe.user || null);

const $startParam = $webApp.map(webApp => webApp?.initDataUnsafe.start_param || null);

sample({
  clock: webAppStarted,
  target: webAppStartedFx,
});

sample({
  clock: webAppStartedFx.doneData,
  target: $webApp,
});

sample({
  clock: webAppStartedFx.failData,
  target: $error,
});

export const telegramModel = {
  // Telegram WebApp instance
  $webApp: readonly($webApp),

  // Telegram WebApp instance
  $user: readonly($user),

  // Telegram WebApp instance
  $startParam: readonly($startParam),

  // Error if window.Telegram.WebApp is missing
  $error: readonly($error),

  input: {
    webAppStarted,
  },

  /* Internal API (tests only) */
  _internal: {
    webAppStartedFx,
  },
};
