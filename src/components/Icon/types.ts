const AllIcons = {
  DOT: 'assets/DOT.svg',
  WND: 'assets/WND.svg',
  KSM: 'assets/KSM.svg',
  settings: 'settings.svg',
  send: 'Send.svg',
  receive: 'Receive.svg',
  buy: 'Buy.svg',
  address: 'Address.svg',
  user: 'User.svg',
  chevronForward: 'chevron-forward.svg',
  scanQr: 'scan.svg',
  gift: 'gift.svg',
  backup: 'backup.svg',
  currency: 'currency.svg',
  language: 'language.svg',
  novaWallet: 'nova-wallet.svg',
  telegram: 'Telegram.svg',
  twitter: 'X-twitter.svg',
  youtube: 'Youtube.svg',
} as const;

export type IconNames = keyof typeof AllIcons;

export default AllIcons;
