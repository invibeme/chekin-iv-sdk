import {DEFAULT_IV_BASE_URL, IDENTITY_VERIFICATION_TYPES} from '../constants.js';
import {ChekinIVSDKConfig} from '../types.js';

export interface UrlConfigResult {
  url: string;
  postMessageConfig?: Partial<ChekinIVSDKConfig>;
  isLengthLimited: boolean;
}

const VERSION_ALIASES = {
  latest: 'latest',
  development: 'dev',
  dev: 'dev',
} as const;

const SAFE_URL_LIMIT = 2000;

function getBaseUrl(version = 'latest'): string {
  const normalizedVersion = VERSION_ALIASES[version as keyof typeof VERSION_ALIASES]
    ? VERSION_ALIASES[version as keyof typeof VERSION_ALIASES]
    : version.startsWith('v')
      ? version
      : `v${version}`;

  return `https://cdn.chekin.com/iv-sdk/${normalizedVersion}/index.html`;
}

export function formatChekinUrl(config: ChekinIVSDKConfig): UrlConfigResult {
  const url = new URL(config.baseUrl || getBaseUrl(config.version) || DEFAULT_IV_BASE_URL);

  url.searchParams.set('apiKey', config.apiKey);

  if (config.version) {
    url.searchParams.set('version', config.version);
  }

  if (config.defaultLanguage) {
    url.searchParams.set('lang', config.defaultLanguage);
  }

  if (config.autoHeight !== undefined) {
    url.searchParams.set('autoHeight', String(config.autoHeight));
  }

  if (config.stylesLink) {
    url.searchParams.set('stylesLink', encodeURIComponent(config.stylesLink));
  }

  let postMessageConfig: Partial<ChekinIVSDKConfig> = {};
  let isLengthLimited = false;

  if (config.mode !== undefined) {
    postMessageConfig.mode = config.mode;
  } else {
    postMessageConfig.mode = IDENTITY_VERIFICATION_TYPES.ocr;
  }

  if (config.enableLiveness !== undefined) {
    postMessageConfig.enableLiveness = config.enableLiveness;
  }

  if (config.setupData !== undefined) {
    postMessageConfig.setupData = config.setupData;
  }

  if (config.styles !== undefined) {
    postMessageConfig.styles = config.styles;
  }

  const finalUrl = url.toString();

  if (finalUrl.length > SAFE_URL_LIMIT) {
    const minimalUrl = new URL(config.baseUrl || getBaseUrl(config.version));
    minimalUrl.searchParams.set('apiKey', config.apiKey);

    if (config.version) {
      minimalUrl.searchParams.set('version', config.version);
    }

    postMessageConfig = {
      ...postMessageConfig,
      defaultLanguage: config.defaultLanguage,
      autoHeight: config.autoHeight,
      stylesLink: config.stylesLink,
    };

    return {
      url: minimalUrl.toString(),
      postMessageConfig,
      isLengthLimited: true,
    };
  }

  return {
    url: finalUrl,
    postMessageConfig:
      Object.keys(postMessageConfig).length > 0 ? postMessageConfig : undefined,
    isLengthLimited,
  };
}
