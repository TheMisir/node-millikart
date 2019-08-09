> The project was archived and no longer being maintained!

# MilliKart

This script may be used to accept MilliKart payments on your NodeJS backend simply

# Usage

## Install

You can install the package using **NPM** or **YARN** package manager.

```bash
npm i millikart
# or via yarn
yarn add millikart
```

## Initialize Library

Put your `mid` and `secret` as first and second argument there.

```javascript
// ES6

const millikart = require('millikart')('mid-here', 'secret-here');

// ESNext

import { MilliKart } from 'millikart';
const millikart = new MilliKart('mid-here', 'secret-here');
```

## Create Transaction

```javascript
var response = await millikart.register()
    .setCurrency('944')
    .setLanguage('az')
    .setDescription('Just another item')
    .setAmount(10)
    .setReference('unique-generated-reference')
    .execute();

console.log(response);
```

The `response` will be:

```json
{
    "redirect": "https://...",
    "code": "0",
    "description": "OK"
}
```

> 944 is **currency code** (ISO 4217) for AZN. Full list of currency codes available [here](https://www.iban.com/currency-codes).

> **Amount** is a floating point number

> Available **languages** are: `az`, `ru`, `en`

## Check Status of Transaction


```javascript
var response = await millikart.status('unique-generated-reference').execute();

console.log(response);
```

The `response` will be:

```json
{
    "amount": "1000",
    "reimbursment": "0",
    "description": "OK",
    "currency": "944",
    "payment-description": "Just another item",
    "reference": "unique-generated-reference",
    "timestamp": "20130923113517",
    "xid": "57w0n8N24mAtMm+GAgYuHW0zuCk=",
    "rrn": "424715434469",
    "approval": "330002",
    "pan": "402865******810",
    "RC": "000",
    "code": "0"
}
```

## Using Along With Express.js

You can handle callback using our library. Here's how to handle it.

```javascript
app.get('/payment/callback', millikart.callback(function (status, data, req, res, next) {
    if (status) {
        // Payment successfully completed
    } else {
        // Payment failed
    }
}));
```

# Author

This script is created and maintained by [Misir Jafarov](https://misir.xyz) and is not affiliated with "MilliKart, LLC".
