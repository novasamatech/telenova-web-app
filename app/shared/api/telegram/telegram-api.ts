import {
  type BackButton,
  type MainButton,
  type ScanQrPopupParams,
  type ThemeParams,
  type WebApp,
} from '@twa-dev/types';

import { type TelegramLink } from './types';

/**
 * TelegramApi is the main entrypoint to the window.Telegram.WebApp data and
 * methods. It holds WebApp instance to conveniently invoke static methods.
 */
export class TelegramApi {
  static #webApp: WebApp;
  static #initialized: boolean;

  /**
   * Init must be called only once and before any other method execution.
   * TelegramApi is initialized with WebApp and required app styles.
   *
   * @throws {Error}
   */
  static init() {
    if (TelegramApi.#initialized) return;

    if (!window.Telegram) {
      throw new Error('Telegram API is missing, try to restart application');
    }

    window.Telegram.WebApp.ready();
    window.Telegram.WebApp.setHeaderColor('#f2f2f7');
    window.Telegram.WebApp.setBackgroundColor('#f2f2f7');
    window.Telegram.WebApp.expand();
    window.Telegram.WebApp.disableClosingConfirmation();
    TelegramApi.#webApp = window.Telegram.WebApp;
    TelegramApi.#initialized = true;
  }

  static get initData() {
    this.#checkWebApp();

    return this.#webApp.initData;
  }

  static get initDataUnsafe() {
    this.#checkWebApp();

    return this.#webApp.initDataUnsafe;
  }

  static get themeParams(): ThemeParams {
    this.#checkWebApp();

    return this.#webApp.themeParams;
  }

  static get isWebPlatform(): boolean {
    this.#checkWebApp();

    return this.#webApp.platform.startsWith('web');
  }

  static get Buttons(): { Main: MainButton; Back: BackButton } {
    this.#checkWebApp();

    return {
      Main: this.#webApp.MainButton,
      Back: this.#webApp.BackButton,
    };
  }

  static getItem(store: string): Promise<string> {
    this.#checkWebApp();

    return new Promise((resolve, reject) => {
      this.#webApp.CloudStorage.getItem(store, (error, result) => {
        if (error || result === undefined) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }

  static setItem(store: string, value: string): Promise<boolean> {
    this.#checkWebApp();

    return new Promise((resolve, reject) => {
      this.#webApp.CloudStorage.setItem(store, value, (error, result) => {
        if (error || result === undefined) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }

  static getStoreName(key: string): string {
    this.#checkWebApp();

    const userId = this.#webApp.initDataUnsafe.user?.id;

    return userId ? `${userId}_${key}` : '';
  }

  static removeItems(keys: string[]): Promise<boolean> {
    this.#checkWebApp();

    return new Promise((resolve, reject) => {
      this.#webApp.CloudStorage.removeItems(keys, (error, result) => {
        if (error || result === undefined) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }

  static showScanQrPopup(params: ScanQrPopupParams, callback?: (text: string) => void) {
    this.#checkWebApp();

    this.#webApp.showScanQrPopup(params, text => {
      callback?.(text);
      this.#webApp.closeScanQrPopup();
    });
  }

  static showAlert(text: string, callback?: () => void) {
    this.#checkWebApp();

    this.#webApp.showAlert(text, callback);
  }

  static shareLink = (link: TelegramLink, callback?: () => void) => {
    this.#checkWebApp();

    const tgLink = `https://t.me/share/url?url=${encodeURIComponent(link.url)}&text=${encodeURIComponent(link.text)}`;

    // Application will be closed in Web version
    this.#webApp.openTelegramLink(tgLink);
    callback?.();
  };

  static openLink = (link: string) => {
    this.#checkWebApp();

    this.#webApp.openLink(link);
    this.#webApp.close();
  };

  static #checkWebApp() {
    if (this.#initialized) return;

    throw new Error('TelegramApi has not been initialized with TelegramService.init()');
  }
}
