import 'jest-canvas-mock'; 
import '@testing-library/jest-dom';

import { TextEncoder, TextDecoder } from 'util';

Object.assign(global, { TextDecoder, TextEncoder });