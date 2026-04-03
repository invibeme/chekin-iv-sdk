import {IDENTITY_VERIFICATION_TYPES} from '../constants.js';
import {ChekinIVSDKConfig} from '../types.js';

type ConfigWithStringMode = Omit<Partial<ChekinIVSDKConfig>, 'mode'> & {
  mode?: string | null;
};

export const normalizeMode = (
  value: string | null | undefined,
): ChekinIVSDKConfig['mode'] | undefined => {
  if (!value) {
    return undefined;
  }

  const uppercasedValue = value.toUpperCase();

  if (uppercasedValue === IDENTITY_VERIFICATION_TYPES.ocr.toUpperCase()) {
    return IDENTITY_VERIFICATION_TYPES.ocr;
  }

  if (uppercasedValue === IDENTITY_VERIFICATION_TYPES.biomatch.toUpperCase()) {
    return IDENTITY_VERIFICATION_TYPES.biomatch;
  }

  return undefined;
};

export const normalizeConfig = (
  config: ConfigWithStringMode,
): Partial<ChekinIVSDKConfig> => {
  const {mode, ...restConfig} = config;
  const normalizedMode = normalizeMode(mode);

  if (typeof mode === 'undefined') {
    return restConfig as Partial<ChekinIVSDKConfig>;
  }

  return {
    ...(restConfig as Partial<ChekinIVSDKConfig>),
    ...(normalizedMode ? {mode: normalizedMode} : {}),
  };
};
