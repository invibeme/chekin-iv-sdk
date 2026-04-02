import {
  CHEKIN_IV_EVENTS,
  CHEKIN_IV_IFRAME_NAME,
  CHEKIN_IV_IFRAME_TITLE,
  CHEKIN_IV_ROOT_IFRAME_ID,
  LOG_LEVELS,
} from './constants.js';
import {ChekinCommunicator} from './communication/ChekinCommunicator.js';
import {
  ChekinIVEventCallback,
  ChekinIVSDKConfig,
  HeightChangedPayload,
  RoutePayload,
} from './types.js';
import {formatChekinUrl} from './utils/formatChekinUrl.js';
import {ChekinLogger} from './utils/logger.js';
import {ChekinIVSDKValidator} from './utils/validation.js';

export class ChekinIVSDK {
  private iframe: HTMLIFrameElement | null = null;
  private communicator: ChekinCommunicator | null = null;
  private observer: MutationObserver | null = null;
  private readonly eventListeners = new Map<string, Set<ChekinIVEventCallback>>();
  private config: ChekinIVSDKConfig;
  private readonly logger: ChekinLogger;
  private readonly validator: ChekinIVSDKValidator;
  private pendingPostMessageConfig?: Partial<ChekinIVSDKConfig>;

  constructor(config: ChekinIVSDKConfig) {
    this.config = {
      autoHeight: false,
      ...config,
    };
    this.validator = new ChekinIVSDKValidator();
    this.logger = new ChekinLogger({
      enabled: this.config.enableLogging ?? false,
      level: this.config.enableLogging ? LOG_LEVELS.DEBUG : LOG_LEVELS.INFO,
    });

    this.validateConfig();
  }

  initialize(config: ChekinIVSDKConfig): void {
    this.config = {
      ...this.config,
      ...config,
    };
    this.logger.updateConfig({
      enabled: this.config.enableLogging ?? false,
      level: this.config.enableLogging ? LOG_LEVELS.DEBUG : LOG_LEVELS.INFO,
    });
    this.validateConfig();
    this.communicator?.updateConfig(this.config);
  }

  async render(container: string | HTMLElement): Promise<HTMLIFrameElement> {
    const target =
      typeof container === 'string' ? document.getElementById(container) : container;

    if (!target) {
      throw new Error(`Container element not found: ${String(container)}`);
    }

    if (this.iframe) {
      target.appendChild(this.iframe);
      return this.iframe;
    }

    return this.createIframe(target);
  }

  destroy(): void {
    this.observer?.disconnect();
    this.communicator?.destroy();

    if (this.iframe?.parentNode) {
      this.iframe.parentNode.removeChild(this.iframe);
    }

    this.pendingPostMessageConfig = undefined;
    this.observer = null;
    this.communicator = null;
    this.iframe = null;
  }

  updateConfig(newConfig: Partial<ChekinIVSDKConfig>): void {
    const nextConfig = {
      ...this.config,
      ...newConfig,
    };

    const result = this.validator.validateConfig(nextConfig);
    if (!result.isValid) {
      throw new Error(
        `SDK configuration validation failed: ${result.errors.map(issue => issue.message).join(', ')}`,
      );
    }

    this.config = nextConfig;
    this.logger.updateConfig({
      enabled: this.config.enableLogging ?? false,
      level: this.config.enableLogging ? LOG_LEVELS.DEBUG : LOG_LEVELS.INFO,
    });
    this.communicator?.updateConfig(this.config);

    if (this.communicator) {
      this.communicator.send(
        CHEKIN_IV_EVENTS.CONFIG_UPDATE,
        this.getSerializableConfig(),
      );
    }
  }

  on<T = unknown>(event: string, callback: ChekinIVEventCallback<T>): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }

    this.eventListeners.get(event)?.add(callback as ChekinIVEventCallback);
    this.communicator?.on(event, callback);
  }

  off(event: string, callback: ChekinIVEventCallback): void {
    this.eventListeners.get(event)?.delete(callback);
    this.communicator?.off(event, callback);
  }

  private validateConfig(): void {
    const result = this.validator.validateConfig(this.config);

    if (!result.isValid) {
      throw new Error(
        `SDK configuration validation failed: ${result.errors.map(issue => issue.message).join(', ')}`,
      );
    }

    result.warnings.forEach(warning => {
      this.logger.warn(
        warning.message,
        {field: warning.field, value: warning.value},
        'CONFIG',
      );
    });
  }

  private createIframe(container: HTMLElement): Promise<HTMLIFrameElement> {
    return new Promise((resolve, reject) => {
      this.iframe = document.createElement('iframe');

      const urlResult = formatChekinUrl(this.config);
      this.iframe.src = urlResult.url;
      this.pendingPostMessageConfig = urlResult.postMessageConfig;

      this.iframe.style.cssText = `
        width: 100%;
        height: 100%;
        min-height: 600px;
        border: none;
        overflow: ${this.config.autoHeight ? 'hidden' : 'initial'};
      `;
      this.iframe.title = CHEKIN_IV_IFRAME_TITLE;
      this.iframe.name = CHEKIN_IV_IFRAME_NAME;
      this.iframe.id = CHEKIN_IV_ROOT_IFRAME_ID;
      this.iframe.setAttribute(
        'sandbox',
        'allow-forms allow-popups allow-scripts allow-same-origin',
      );
      this.iframe.setAttribute('allow', 'camera *');

      this.iframe.onload = () => {
        if (!this.iframe) {
          reject(new Error('Iframe reference missing after load'));
          return;
        }

        this.communicator = new ChekinCommunicator(this.iframe, this.config, this.logger);
        this.bindUserEventListeners();
        this.setupEventListeners();
        this.communicator.sendHandshake();

        if (this.pendingPostMessageConfig) {
          this.communicator.send(
            CHEKIN_IV_EVENTS.CONFIG_UPDATE,
            this.getSerializableConfig(this.pendingPostMessageConfig),
          );
          this.pendingPostMessageConfig = undefined;
        }

        resolve(this.iframe);
      };

      this.iframe.onerror = () => {
        reject(new Error('Failed to load IV iframe'));
      };

      container.appendChild(this.iframe);
      this.observeContainerRemoval(container);
    });
  }

  private setupEventListeners(): void {
    if (!this.communicator) {
      return;
    }

    this.communicator.on(CHEKIN_IV_EVENTS.READY, () => {
      this.config.onReady?.();
    });

    this.communicator.on(CHEKIN_IV_EVENTS.MOUNTED, () => {
      this.config.onMounted?.();
    });

    this.communicator.on(CHEKIN_IV_EVENTS.HEIGHT_CHANGED, payload => {
      const normalized = payload as HeightChangedPayload | number | undefined;
      const height =
        typeof normalized === 'number'
          ? normalized
          : typeof normalized?.height === 'number'
            ? normalized.height
            : undefined;

      if (height === undefined) {
        return;
      }

      if (this.iframe && this.config.autoHeight) {
        this.iframe.style.height = `${height}px`;
      }

      this.config.onHeightChanged?.(height);
    });

    this.communicator.on(CHEKIN_IV_EVENTS.STEP_CHANGED, payload => {
      this.config.onStepChanged?.(payload);
    });

    this.communicator.on(CHEKIN_IV_EVENTS.COMPLETED, payload => {
      this.config.onCompleted?.(payload);
    });

    this.communicator.on(CHEKIN_IV_EVENTS.FAILED, payload => {
      this.config.onFailed?.(payload);
    });

    this.communicator.on(CHEKIN_IV_EVENTS.ERROR, payload => {
      this.config.onError?.(payload as {message: string; code?: string} | string);
    });

    this.communicator.on(CHEKIN_IV_EVENTS.CONNECTION_ERROR, payload => {
      this.config.onConnectionError?.(payload);
    });

    this.communicator.on(CHEKIN_IV_EVENTS.ROUTE_CHANGED, payload => {
      const routePayload = payload as RoutePayload | undefined;
      this.logger.debug('Iframe route changed', routePayload, 'ROUTE');
    });

    this.communicator.on(CHEKIN_IV_EVENTS.INIT_ROUTE, payload => {
      const routePayload = payload as RoutePayload | undefined;
      this.logger.debug('Iframe initial route', routePayload, 'ROUTE');
    });
  }

  private bindUserEventListeners(): void {
    if (!this.communicator) {
      return;
    }

    this.eventListeners.forEach((callbacks, event) => {
      callbacks.forEach(callback => {
        this.communicator?.on(event, callback);
      });
    });
  }

  private observeContainerRemoval(container: HTMLElement): void {
    this.observer?.disconnect();
    this.observer = new MutationObserver(() => {
      if (!document.body.contains(container)) {
        this.destroy();
      }
    });

    this.observer.observe(container.ownerDocument || document, {
      childList: true,
      subtree: true,
    });
  }

  private getSerializableConfig(
    config: Partial<ChekinIVSDKConfig> = this.config,
  ): Partial<ChekinIVSDKConfig> {
    const serializableConfig = {...config};

    delete serializableConfig.onReady;
    delete serializableConfig.onMounted;
    delete serializableConfig.onHeightChanged;
    delete serializableConfig.onStepChanged;
    delete serializableConfig.onCompleted;
    delete serializableConfig.onFailed;
    delete serializableConfig.onError;
    delete serializableConfig.onConnectionError;
    delete serializableConfig.enableLogging;
    delete serializableConfig.baseUrl;

    return serializableConfig;
  }
}
