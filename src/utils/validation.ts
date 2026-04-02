import {IDENTITY_VERIFICATION_TYPES} from '../constants.js';
import {ChekinIVSDKConfig} from '../types.js';

export interface ValidationIssue {
  field: string;
  message: string;
  value?: unknown;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
}

const SUPPORTED_LANGUAGES = [
  'en',
  'es',
  'it',
  'de',
  'fr',
  'hu',
  'ru',
  'cs',
  'bg',
  'pt',
  'ro',
  'et',
  'pl',
  'ca',
] as const;

const LIVENESS_MECHANISMS = ['AUTO', 'CLIENT', 'SERVER'] as const;

export class ChekinIVSDKValidator {
  validateConfig(config: ChekinIVSDKConfig): ValidationResult {
    const errors: ValidationIssue[] = [];
    const warnings: ValidationIssue[] = [];
    const {language} = config;

    if (!config.apiKey) {
      errors.push({field: 'apiKey', message: 'API key is required', value: config.apiKey});
    } else if (typeof config.apiKey !== 'string') {
      errors.push({
        field: 'apiKey',
        message: 'API key must be a string',
        value: config.apiKey,
      });
    }

    if (config.baseUrl !== undefined) {
      this.validateUrl(config.baseUrl, 'baseUrl', errors);
    }

    if (config.stylesLink !== undefined) {
      this.validateUrl(config.stylesLink, 'stylesLink', errors);
    }

    if (config.version !== undefined && typeof config.version !== 'string') {
      errors.push({
        field: 'version',
        message: 'Version must be a string',
        value: config.version,
      });
    }

    if (
      config.mode !== undefined &&
      !Object.values(IDENTITY_VERIFICATION_TYPES).includes(config.mode)
    ) {
      errors.push({
        field: 'mode',
        message: `Mode must be one of: ${Object.values(IDENTITY_VERIFICATION_TYPES).join(', ')}`,
        value: config.mode,
      });
    }

    if (
      language !== undefined &&
      !SUPPORTED_LANGUAGES.includes(language as (typeof SUPPORTED_LANGUAGES)[number])
    ) {
      warnings.push({
        field: 'language',
        message: `Unsupported language "${language}"`,
        value: language,
      });
    }

    if (
      config.forceLivenessMechanism !== undefined &&
      !LIVENESS_MECHANISMS.includes(config.forceLivenessMechanism)
    ) {
      errors.push({
        field: 'forceLivenessMechanism',
        message: `forceLivenessMechanism must be one of: ${LIVENESS_MECHANISMS.join(', ')}`,
        value: config.forceLivenessMechanism,
      });
    }

    if (config.setupData !== undefined) {
      if (typeof config.setupData !== 'object' || config.setupData === null) {
        errors.push({
          field: 'setupData',
          message: 'setupData must be an object',
          value: config.setupData,
        });
      } else {
        if (
          config.setupData.countryCode !== undefined &&
          typeof config.setupData.countryCode !== 'string'
        ) {
          errors.push({
            field: 'setupData.countryCode',
            message: 'countryCode must be a string',
            value: config.setupData.countryCode,
          });
        }

        if (
          config.setupData.isLeader !== undefined &&
          typeof config.setupData.isLeader !== 'boolean'
        ) {
          errors.push({
            field: 'setupData.isLeader',
            message: 'isLeader must be a boolean',
            value: config.setupData.isLeader,
          });
        }
      }
    }

    this.validateBoolean(config.enableLiveness, 'enableLiveness', errors);
    this.validateBoolean(config.optional, 'optional', errors);
    this.validateBoolean(config.autoHeight, 'autoHeight', errors);
    this.validateBoolean(config.enableLogging, 'enableLogging', errors);

    if (config.styles !== undefined && typeof config.styles !== 'string') {
      errors.push({
        field: 'styles',
        message: 'styles must be a string',
        value: config.styles,
      });
    }

    this.validateCallback(config.onReady, 'onReady', errors);
    this.validateCallback(config.onMounted, 'onMounted', errors);
    this.validateCallback(config.onHeightChanged, 'onHeightChanged', errors);
    this.validateCallback(config.onStepChanged, 'onStepChanged', errors);
    this.validateCallback(config.onCompleted, 'onCompleted', errors);
    this.validateCallback(config.onFailed, 'onFailed', errors);
    this.validateCallback(config.onError, 'onError', errors);
    this.validateCallback(config.onConnectionError, 'onConnectionError', errors);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  private validateUrl(value: unknown, field: string, errors: ValidationIssue[]): void {
    if (typeof value !== 'string') {
      errors.push({field, message: `${field} must be a string`, value});
      return;
    }

    try {
      new URL(value);
    } catch {
      errors.push({field, message: `${field} must be a valid URL`, value});
    }
  }

  private validateBoolean(
    value: unknown,
    field: string,
    errors: ValidationIssue[],
  ): void {
    if (value !== undefined && typeof value !== 'boolean') {
      errors.push({field, message: `${field} must be a boolean`, value});
    }
  }

  private validateCallback(
    value: unknown,
    field: string,
    errors: ValidationIssue[],
  ): void {
    if (value !== undefined && typeof value !== 'function') {
      errors.push({field, message: `${field} must be a function`, value: typeof value});
    }
  }
}
