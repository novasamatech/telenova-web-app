const AllIcons = {
  createWallet: 'create-gif.gif',
  dotLogo: 'dot-icon.svg',
  firework: 'firework.png',
} as const;

export type IconNames = keyof typeof AllIcons;

export default AllIcons;
