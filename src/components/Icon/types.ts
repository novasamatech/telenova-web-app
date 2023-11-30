const AllIcons = {
  ethLogo: 'eth-logo.svg',
  dotLogo: 'dot-icon.svg',
} as const;

export type IconNames = keyof typeof AllIcons;

export default AllIcons;
