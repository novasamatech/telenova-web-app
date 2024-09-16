import secureLocalStorage from 'react-secure-storage';

import { BACKUP_DATE, MNEMONIC_STORE } from '@/shared/helpers';

export const resetWallet = (clearLocal: boolean = false) => {
  localStorage.clear();
  secureLocalStorage.clear();

  if (!clearLocal) {
    window.Telegram?.WebApp.CloudStorage.removeItems([MNEMONIC_STORE, BACKUP_DATE]);
  }
};
