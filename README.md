# Chekin IV SDK

Client-side SDK for embedding Chekin's identity verification iframe into web applications.

## Installation

```bash
npm install @chekinapp/iv-sdk
```

## Usage

```ts
import {ChekinIVSDK, IDENTITY_VERIFICATION_TYPES} from '@chekinapp/iv-sdk';

const sdk = new ChekinIVSDK({
  apiKey: 'your-api-key',
  mode: IDENTITY_VERIFICATION_TYPES.ocr,
  enableLiveness: true,
  forceLivenessMechanism: 'AUTO',
  language: 'en',
  autoHeight: true,
  onCompleted: data => {
    console.log('IV completed', data);
  },
  onFailed: error => {
    console.error('IV failed', error);
  },
});

await sdk.render('chekin-container');
```

## Configuration

Defaults follow the current iframe app contract in `../chekin-guestapp/apps/iv-sdk`.

| Parameter | Required | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `apiKey` | Yes | `string` | None | API key used by the iframe app to initialize the verification flow. |
| `setupData` | No | `{ countryCode?: string; isLeader?: boolean }` | None | Optional guest and booking context forwarded to the iframe. |
| `mode` | No | `'ocr' \| 'biomatch'` | `'ocr'` | Verification mode. |
| `enableLiveness` | No | `boolean` | `undefined` | Enables liveness-related flow in the iframe when supported. |
| `forceLivenessMechanism` | No | `'AUTO' \| 'CLIENT' \| 'SERVER'` | `undefined` | Forces a specific liveness mechanism used by the iframe app. |
| `version` | No | `string` | `undefined` | CDN version used to build the iframe URL. Examples: `latest`, `dev`, `1.2.3`. |
| `language` | No | `string` | `'en'` | Language code consumed by the iframe app. Unsupported values currently log a warning in this SDK. |
| `optional` | No | `boolean` | `undefined` | Marks the verification flow as optional when supported by the iframe. |
| `styles` | No | `string` | `undefined` | Raw CSS string injected into the iframe app. |
| `stylesLink` | No | `string` | `undefined` | URL of an external stylesheet injected into the iframe app. |
| `autoHeight` | No | `boolean` | `false` | Resizes the iframe height based on `iv-height-changed` events. |
| `baseUrl` | No | `string` | `https://cdn.chekin.com/iv-sdk/latest/index.html` | Override for the iframe URL, mainly for local or staging environments. |
| `enableLogging` | No | `boolean` | `false` | Enables SDK-side debug logging in the host page. |
| `onReady` | No | `() => void` | `undefined` | Called when the iframe signals `iv-ready`. |
| `onMounted` | No | `() => void` | `undefined` | Called when the iframe signals `iv-mounted`. |
| `onHeightChanged` | No | `(height: number) => void` | `undefined` | Called when the iframe reports a new content height. |
| `onStepChanged` | No | `(step: unknown) => void` | `undefined` | Called when the iframe emits `iv-step-changed`. |
| `onCompleted` | No | `(data: unknown) => void` | `undefined` | Called when the verification flow completes successfully. |
| `onFailed` | No | `(error: unknown) => void` | `undefined` | Called when the verification flow fails. |
| `onError` | No | `(error: { message: string; code?: string } \| string) => void` | `undefined` | Called for iframe-level errors. |
| `onConnectionError` | No | `(error: unknown) => void` | `undefined` | Called for network or connectivity failures reported by the iframe. |

### `setupData`

| Field | Required | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `countryCode` | No | `string` | `undefined` | Country context used by document and flow selection. |
| `isLeader` | No | `boolean` | `undefined` | Indicates whether the guest is the booking leader. |

## Events

| Event | Payload | Description |
| --- | --- | --- |
| `iv-ready` | `undefined` | Fired when the iframe communication layer is ready. |
| `iv-mounted` | `undefined` | Fired after the iframe app finishes mounting. |
| `iv-height-changed` | `{ height: number }` | Fired when the iframe content height changes. |
| `iv-route-changed` | `{ route: string }` | Fired when the iframe route changes. |
| `iv-init-route` | `{ route: string }` | Fired with the initial iframe route after mount. |
| `iv-step-changed` | `unknown` | Fired when the verification step changes. |
| `iv-completed` | `unknown` | Fired when the verification flow completes. |
| `iv-failed` | `unknown` | Fired when the verification flow fails. |
| `iv-error` | `{ message: string; code?: string } \| string` | Fired for iframe-side errors. |
| `iv-connection-error` | `unknown` | Fired for connectivity-related failures. |

The SDK supports both config callbacks and `on`/`off` event listeners.

## Notes

- This package is the parent-side iframe SDK only.
- It targets the existing IV iframe app contract.
