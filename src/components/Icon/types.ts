const AllIcons = {
  DOT: 'DOT.svg',
  WND: 'WND.svg',
  KSM: 'KSM.svg',
  settings: 'settings.svg',
  send: 'Send.svg',
  receive: 'Receive.svg',
  buy: 'Buy.svg',
  address: 'Address.svg',
  user: 'User.svg',
  chevronForward: 'chevron-forward.svg',
  scanQr: 'scan.svg',
} as const;

export type IconNames = keyof typeof AllIcons;

export default AllIcons;
