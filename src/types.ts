import {CHEKIN_IV_EVENTS, IDENTITY_VERIFICATION_TYPES} from './constants.js';

export type IdentityVerificationType =
  (typeof IDENTITY_VERIFICATION_TYPES)[keyof typeof IDENTITY_VERIFICATION_TYPES];

export interface IVSetupData {
  countryCode?: string;
  isLeader?: boolean;
}

export interface ChekinIVSDKConfig {
  apiKey: string;
  setupData?: IVSetupData;
  mode?: IdentityVerificationType;
  enableLiveness?: boolean;
  version?: string;
  defaultLanguage?: string;
  styles?: string;
  stylesLink?: string;
  autoHeight?: boolean;
  baseUrl?: string;
  enableLogging?: boolean;
  onReady?: () => void;
  onMounted?: () => void;
  onHeightChanged?: (height: number) => void;
  onStepChanged?: (step: unknown) => void;
  onCompleted?: (data: unknown) => void;
  onFailed?: (error: unknown) => void;
  onError?: (error: {message: string; code?: string} | string) => void;
  onConnectionError?: (error: unknown) => void;
}

export interface ChekinIVMessage<T = unknown> {
  type: ChekinIVEventName | string;
  payload?: T;
  timestamp?: number;
  source?: string;
}

export interface HeightChangedPayload {
  height: number;
}

export interface RoutePayload {
  route: string;
}

export type ChekinIVEventPayloadMap = {
  [CHEKIN_IV_EVENTS.READY]: undefined;
  [CHEKIN_IV_EVENTS.HANDSHAKE]: {
    timestamp: number;
    sdk: string;
    version: string;
    origin: string;
  };
  [CHEKIN_IV_EVENTS.MOUNTED]: undefined;
  [CHEKIN_IV_EVENTS.HEIGHT_CHANGED]: HeightChangedPayload;
  [CHEKIN_IV_EVENTS.ROUTE_CHANGED]: RoutePayload;
  [CHEKIN_IV_EVENTS.INIT_ROUTE]: RoutePayload;
  [CHEKIN_IV_EVENTS.STEP_CHANGED]: unknown;
  [CHEKIN_IV_EVENTS.COMPLETED]: unknown;
  [CHEKIN_IV_EVENTS.FAILED]: unknown;
  [CHEKIN_IV_EVENTS.ERROR]: {message: string; code?: string} | string;
  [CHEKIN_IV_EVENTS.CONNECTION_ERROR]: unknown;
  [CHEKIN_IV_EVENTS.CONFIG_UPDATE]: Partial<ChekinIVSDKConfig>;
};

export type ChekinIVEventName = (typeof CHEKIN_IV_EVENTS)[keyof typeof CHEKIN_IV_EVENTS];

export type ChekinIVEventCallback<T = unknown> = (payload: T) => void;
