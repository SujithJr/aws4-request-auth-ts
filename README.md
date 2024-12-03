# aws4-request-auth-ts

This is a typescript/javascript package to sign your HTTP requests using aws4 signature. This includes support for both CJS and ESM.

To get started:
```shell
# Using bun.js
bun add aws4-request-auth-ts
```
```shell
# Using npm
npm install aws4-request-auth-ts
```
```shell
# Using pnpm
pnpm add aws4-request-auth-ts
```
```shell
# Using yarn
yarn add aws4-request-auth-ts
```

Common JS require,
```js
const awsSign = require('@sujith/aws4-request-auth-ts');
```

ES module import,
```js
import awsSign from '@sujith/aws4-request-auth-ts';
```

Supports all the HTTP request methods. Example on how to pass required fields to sign the headers,
```js
const headers = awsSign.signHeaders({
  targetUrl: 'https//example.com',
  method: 'POST',
  body: JSON.stringify({ value: 'some text' }),
  awsConfig: {
      region: '<aws-region>',
      accessKey: '<aws-access-key>',
      secretKey: '<aws-secret-key>',
      service: '<aws-service>',
  }
})
```
