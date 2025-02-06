import { AVAIL } from './avail';

type Extension = Record<string, { value: unknown }>;

export const EXTENSIONS: Record<ChainId, { signedExtensions: Extension }> = {
  '0xb91746b45e0346cc2f815a520b9c6cb4d5c0902af848db0a80f85932d2e8276a': AVAIL,
};
