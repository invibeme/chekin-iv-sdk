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

## Supported Config

- `apiKey`
- `setupData`
- `mode`
- `enableLiveness`
- `version`
- `defaultLanguage`
- `styles`
- `stylesLink`
- `autoHeight`
- `baseUrl`
- `enableLogging`

## Events

- `iv-ready`
- `iv-mounted`
- `iv-height-changed`
- `iv-route-changed`
- `iv-init-route`
- `iv-step-changed`
- `iv-completed`
- `iv-failed`
- `iv-error`
- `iv-connection-error`

The SDK supports both config callbacks and `on`/`off` event listeners.

## Notes

- This package is the parent-side iframe SDK only.
- It targets the existing IV iframe app contract.
- Parent-driven route navigation is intentionally not exposed because the current iframe app does not consume it.
