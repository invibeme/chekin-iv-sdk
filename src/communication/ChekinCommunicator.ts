import {
  CHEKIN_IV_EVENTS,
  CHEKIN_IV_MESSAGE_SOURCE,
  CHEKIN_IV_PARENT_MESSAGE_SOURCE,
} from '../constants.js';
import {ChekinLogger} from '../utils/logger.js';
import {
  ChekinIVEventCallback,
  ChekinIVEventName,
  ChekinIVMessage,
  ChekinIVSDKConfig,
} from '../types.js';

declare const __PACKAGE_NAME__: string;
declare const __PACKAGE_VERSION__: string;

export class ChekinCommunicator {
  private readonly iframe: HTMLIFrameElement;
  private readonly logger: ChekinLogger;
  private readonly listeners = new Map<string, Set<ChekinIVEventCallback>>();
  private config: ChekinIVSDKConfig;
  private readonly handleMessageBound: (event: MessageEvent<ChekinIVMessage>) => void;

  constructor(
    iframe: HTMLIFrameElement,
    config: ChekinIVSDKConfig,
    logger: ChekinLogger,
  ) {
    this.iframe = iframe;
    this.config = config;
    this.logger = logger;
    this.handleMessageBound = this.handleMessage.bind(this);

    window.addEventListener('message', this.handleMessageBound);
  }

  updateConfig(config: ChekinIVSDKConfig): void {
    this.config = config;
  }

  on<T = unknown>(type: string, callback: ChekinIVEventCallback<T>): void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }

    this.listeners.get(type)?.add(callback as ChekinIVEventCallback);
  }

  off(type: string, callback: ChekinIVEventCallback): void {
    this.listeners.get(type)?.delete(callback);
  }

  send<T = unknown>(type: ChekinIVEventName | string, payload?: T): void {
    if (!this.iframe.contentWindow) {
      this.logger.warn('Cannot send message: iframe contentWindow is not available');
      return;
    }

    const message: ChekinIVMessage<T> = {
      type,
      payload,
      timestamp: Date.now(),
      source: CHEKIN_IV_PARENT_MESSAGE_SOURCE,
    };

    this.iframe.contentWindow.postMessage(message, '*');
    this.logger.debug('Message sent to iframe', message, 'COMMUNICATION');
  }

  sendHandshake(): void {
    this.send(CHEKIN_IV_EVENTS.HANDSHAKE, {
      timestamp: Date.now(),
      sdk: __PACKAGE_NAME__,
      version: __PACKAGE_VERSION__,
      origin: window.location.origin,
    });
  }

  destroy(): void {
    window.removeEventListener('message', this.handleMessageBound);
    this.listeners.clear();
  }

  private handleMessage(event: MessageEvent<ChekinIVMessage>): void {
    if (event.source !== this.iframe.contentWindow) {
      return;
    }

    if (!event.data || typeof event.data !== 'object' || !event.data.type) {
      return;
    }

    if (event.data.source && event.data.source !== CHEKIN_IV_MESSAGE_SOURCE) {
      return;
    }

    this.logger.debug('Message received from iframe', event.data, 'COMMUNICATION');

    const callbacks = this.listeners.get(event.data.type);
    if (!callbacks) {
      return;
    }

    callbacks.forEach(callback => {
      try {
        callback(event.data.payload);
      } catch (error) {
        this.logger.error('Error in event callback', {type: event.data.type, error});
      }
    });
  }
}
