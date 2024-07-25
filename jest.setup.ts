import '@testing-library/jest-dom/'
import { TextEncoder, TextDecoder } from 'util';
// workaround to fix bug when performing backend testing
Object.assign(global, { TextDecoder, TextEncoder });