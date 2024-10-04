import '@testing-library/jest-dom/vitest';
import noop from 'lodash/noop';
import { vi } from 'vitest';

vi.mock('react-secure-storage', () => ({
  default: {
    setItem: noop,
    getItem: noop,
    removeItem: noop,
    clear: noop,
  },
}));
