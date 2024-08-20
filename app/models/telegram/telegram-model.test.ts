import { type WebApp } from '@twa-dev/types';
import { allSettled, fork } from 'effector';
import { describe, expect, test, vi } from 'vitest';

import { telegramModel } from './telegram-model';

describe('models/telegram/telegram-model', () => {
  test('should init $webApp on webAppStarted', async () => {
    const spyReady = vi.fn();
    const spySetHeaderColor = vi.fn();
    const spySetBackgroundColor = vi.fn();
    const spyExpand = vi.fn();
    const spyDisableClosingConfirmation = vi.fn();

    const tgMock = {
      initDataUnsafe: {
        user: 'user',
        start_param: 'start_param',
      },
      ready: spyReady,
      setHeaderColor: spySetHeaderColor,
      setBackgroundColor: spySetBackgroundColor,
      expand: spyExpand,
      disableClosingConfirmation: spyDisableClosingConfirmation,
    };
    window.Telegram = { WebApp: tgMock as unknown as WebApp };

    const scope = fork();

    await allSettled(telegramModel.input.webAppStarted, { scope });

    expect(spyReady).toHaveBeenCalled();
    expect(spySetHeaderColor).toHaveBeenCalledWith('#f2f2f7');
    expect(spySetBackgroundColor).toHaveBeenCalledWith('#f2f2f7');
    expect(spyExpand).toHaveBeenCalled();
    expect(spyDisableClosingConfirmation).toHaveBeenCalled();

    expect(scope.getState(telegramModel.$webApp)).toEqual(tgMock);
    expect(scope.getState(telegramModel.$error)).toBeNull();
  });

  test('should set $error for missing window.Telegram', async () => {
    window.Telegram = undefined;

    const scope = fork();

    await allSettled(telegramModel.input.webAppStarted, { scope });
    expect(scope.getState(telegramModel.$webApp)).toBeNull();
    expect(scope.getState(telegramModel.$error)).toBeInstanceOf(Error);
    expect(scope.getState(telegramModel.$error)?.message).toEqual(
      'Telegram API is missing, try to restart application',
    );
  });
});
