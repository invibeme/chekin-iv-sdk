import {LOG_LEVELS} from '../constants.js';

declare const __PACKAGE_NAME__: string;
declare const __PACKAGE_VERSION__: string;

export type LogLevel = (typeof LOG_LEVELS)[keyof typeof LOG_LEVELS];

export interface LogEntry {
  timestamp: number;
  level: LogLevel;
  message: string;
  data?: unknown;
  context?: string;
}

export interface ChekinLoggerConfig {
  enabled?: boolean;
  level?: LogLevel;
  prefix?: string;
  onLog?: (entry: LogEntry) => void;
}

const LOG_PRIORITY: Record<LogLevel, number> = {
  [LOG_LEVELS.DEBUG]: 10,
  [LOG_LEVELS.INFO]: 20,
  [LOG_LEVELS.WARN]: 30,
  [LOG_LEVELS.ERROR]: 40,
};

export class ChekinLogger {
  private config: Required<Omit<ChekinLoggerConfig, 'onLog'>> &
    Pick<ChekinLoggerConfig, 'onLog'>;

  constructor(config: ChekinLoggerConfig = {}) {
    this.config = {
      enabled: true,
      level: LOG_LEVELS.INFO,
      prefix: '[Chekin IV SDK]',
      ...config,
    };
  }

  private shouldLog(level: LogLevel): boolean {
    return this.config.enabled && LOG_PRIORITY[level] >= LOG_PRIORITY[this.config.level];
  }

  private emit(level: LogLevel, message: string, data?: unknown, context?: string): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      message,
      data,
      context,
    };

    const prefix = `${this.config.prefix} ${new Date(entry.timestamp).toISOString()}`;
    const suffix = context ? ` [${context}]` : '';
    const text = `${prefix} ${level.toUpperCase()}${suffix} ${message}`;

    switch (level) {
      case LOG_LEVELS.DEBUG:
        console.debug(text, data ?? '');
        break;
      case LOG_LEVELS.INFO:
        console.info(text, data ?? '');
        break;
      case LOG_LEVELS.WARN:
        console.warn(text, data ?? '');
        break;
      case LOG_LEVELS.ERROR:
        console.error(text, data ?? '');
        break;
    }

    this.config.onLog?.(entry);
  }

  debug(message: string, data?: unknown, context?: string): void {
    this.emit(LOG_LEVELS.DEBUG, message, data, context);
  }

  info(message: string, data?: unknown, context?: string): void {
    this.emit(LOG_LEVELS.INFO, message, data, context);
  }

  warn(message: string, data?: unknown, context?: string): void {
    this.emit(LOG_LEVELS.WARN, message, data, context);
  }

  error(message: string, data?: unknown, context?: string): void {
    this.emit(LOG_LEVELS.ERROR, message, data, context);
  }

  updateConfig(config: Partial<ChekinLoggerConfig>): void {
    this.config = {
      ...this.config,
      ...config,
    };
  }

  getPackageInfo(): {name: string; version: string} {
    return {
      name: __PACKAGE_NAME__,
      version: __PACKAGE_VERSION__,
    };
  }
}
