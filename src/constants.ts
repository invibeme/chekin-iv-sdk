export const CHEKIN_IV_ROOT_IFRAME_ID = 'chekin-iv-sdk-iframe';
export const CHEKIN_IV_IFRAME_TITLE = 'Chekin Identity Verification SDK';
export const CHEKIN_IV_IFRAME_NAME = 'chekin-iv-sdk-frame';

export const CHEKIN_IV_MESSAGE_SOURCE = 'iv-sdk';
export const CHEKIN_IV_PARENT_MESSAGE_SOURCE = 'iv-sdk-parent';

export const CHEKIN_IV_EVENTS = {
  READY: 'iv-ready',
  HANDSHAKE: 'iv-handshake',
  MOUNTED: 'iv-mounted',
  HEIGHT_CHANGED: 'iv-height-changed',
  ROUTE_CHANGED: 'iv-route-changed',
  INIT_ROUTE: 'iv-init-route',
  STEP_CHANGED: 'iv-step-changed',
  COMPLETED: 'iv-completed',
  FAILED: 'iv-failed',
  ERROR: 'iv-error',
  CONNECTION_ERROR: 'iv-connection-error',
  CONFIG_UPDATE: 'iv-config-update',
} as const;

export const LOG_LEVELS = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
} as const;

export const IDENTITY_VERIFICATION_TYPES = {
  ocr: 'ocr',
  biomatch: 'biomatch',
} as const;

export const DEFAULT_IV_BASE_URL = 'https://cdn.chekin.com/iv-sdk/latest/index.html';
