import { createEvent, restore } from 'effector';
import { readonly } from 'patronum';

const accountChanged = createEvent<AccountId>();

const $account = restore(accountChanged, null);

export const walletModel = {
  $account: readonly($account),

  input: {
    accountChanged,
  },
};
