import {DEFAULT_IV_BASE_URL, IDENTITY_VERIFICATION_TYPES} from '../constants.js';
import {ChekinIVSDKConfig} from '../types.js';

export interface UrlConfigResult {
  url: string;
  postMessageConfig?: Partial<ChekinIVSDKConfig>;
}

const VERSION_ALIASES = {
  latest: 'latest',
  development: 'dev',
  dev: 'dev',
} as const;

function getBaseUrl(version = 'latest'): string {
  const normalizedVersion = VERSION_ALIASES[version as keyof typeof VERSION_ALIASES]
    ? VERSION_ALIASES[version as keyof typeof VERSION_ALIASES]
    : version.startsWith('v')
      ? version
      : `v${version}`;

  return `https://cdn.chekin.com/iv-sdk/${normalizedVersion}/index.html`;
}

export function formatChekinUrl(config: ChekinIVSDKConfig): UrlConfigResult {
  const url = new URL(
    config.baseUrl || getBaseUrl(config.version) || DEFAULT_IV_BASE_URL,
  );

  url.searchParams.set('apikey', config.apiKey);

  if (config.version) {
    url.searchParams.set('version', config.version);
  }

  if (config.language) {
    url.searchParams.set('language', config.language);
  }

  url.searchParams.set(
    'mode',
    config.mode?.toLowerCase() ?? IDENTITY_VERIFICATION_TYPES.ocr,
  );

  if (config.enableLiveness !== undefined) {
    url.searchParams.set('enableLiveness', String(config.enableLiveness));
  }

  if (config.forceLivenessMechanism !== undefined) {
    url.searchParams.set('forceLivenessMechanism', config.forceLivenessMechanism);
  }

  if (config.optional !== undefined) {
    url.searchParams.set('optional', String(config.optional));
  }

  if (config.setupData !== undefined) {
    if (config.setupData.countryCode !== undefined) {
      url.searchParams.set('countryCode', config.setupData.countryCode);
    }

    if (config.setupData.isLeader !== undefined) {
      url.searchParams.set('isLeader', String(config.setupData.isLeader));
    }
  }

  if (config.autoHeight !== undefined) {
    url.searchParams.set('autoHeight', String(config.autoHeight));
  }

  if (config.stylesLink) {
    url.searchParams.set('stylesLink', encodeURIComponent(config.stylesLink));
  }

  const postMessageConfig: Partial<ChekinIVSDKConfig> = {};

  if (config.styles !== undefined) {
    postMessageConfig.styles = config.styles;
  }

  if (config.stylesLink !== undefined) {
    postMessageConfig.stylesLink = config.stylesLink;
  }

  return {
    url: url.toString(),
    postMessageConfig:
      Object.keys(postMessageConfig).length > 0 ? postMessageConfig : undefined,
  };
}
