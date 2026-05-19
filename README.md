# JS COUNT MODULE

Simple countdown and countup utility for browsers and npm projects.

## What It Does

- Counts down to a target date-time
- Counts up from the current time
- Supports multiple countdown targets through `data`
- Can exclude recurring daily periods and one-off date-time periods from countdowns
- Works as a browser global bundle, ESM import, and CommonJS require

## Installation

### npm

```bash
npm install @yama-dev/js-count-module
```

### CDN

```html
<script src="https://cdn.jsdelivr.net/gh/yama-dev/js-count-module@v0.5.0/dist/js-count-module.global.js"></script>
```

## Usage

### ESM

```js
import COUNT_MODULE from '@yama-dev/js-count-module';
import { JS_COUNT_MODULE } from '@yama-dev/js-count-module';
```

### CommonJS

```js
const { JS_COUNT_MODULE } = require('@yama-dev/js-count-module');
```

### Browser Global

```html
<script src="./js-count-module.global.js"></script>
<script>
  new JS_COUNT_MODULE({
    date: '2026/12/31 23:59:59',
    onUpdate: function(data){
      console.log(data.diffObjParsed);
    }
  });
</script>
```

## Countdown Example

```js
new JS_COUNT_MODULE({
  date: '2026/12/31 23:59:59',
  onUpdate: function(data){
    var diff = data.diffObjParsed;
    console.log(diff.d, diff.hh, diff.mm, diff.ss);
  },
  onComplete: function(data){
    console.log('completed', data);
  }
});
```

## Countup Example

```js
new JS_COUNT_MODULE({
  type: 'up',
  onUpdate: function(data){
    console.log(data.elapsedTime);
  }
});
```

## Exclude Periods

`excludePeriods` is available for `type: 'down'`.

```js
new JS_COUNT_MODULE({
  date: '2026/12/31 23:59:59',
  excludePeriods: [
    { start: '12:00', end: '13:00' },
    { start: '03:00', end: '05:00' },
    { start: '2026/05/20 10:00:00', end: '2026/05/20 12:30:00' }
  ]
});
```

Rules:

- `HH:mm` or `HH:mm:ss`: recurring every day
- `YYYY/MM/DD HH:mm:ss`: specific one-off period
- overlapping periods are merged automatically
- mixed formats in one period are ignored
- `start >= end` is ignored
- `type: 'up'` ignores `excludePeriods`

Example:

- target is 24 hours later
- `12:00-13:00` is excluded
- displayed remaining time becomes 23 hours of effective countdown

## Options

| option | type | default | note |
| --- | --- | --- | --- |
| `type` | `string` | `'down'` | `'down'` or `'up'` |
| `date` | `string` | `''` | target date-time for countdown |
| `interval` | `number` | `1000` | update interval in ms |
| `autostart` | `boolean` | `true` | starts automatically |
| `nowObj` | `Date` | `new Date()` | base time for countdown |
| `data` | `Array` | `[]` | multiple countdown targets |
| `endstop` | `boolean` | `true` | clamps countdown to zero |
| `excludePeriods` | `Array` | `[]` | excluded countdown periods |
| `onUpdate` | `function` | `null` | called on every update |
| `onComplete` | `function` | `null` | called when countdown completes |

## Callback Payload

`onUpdate` and `onComplete` receive:

```js
{
  updating: true,
  date: '2026/12/31 23:59:59',
  diffObj: {},
  diffObjParsed: {
    d: 0,
    h: 0,
    hh: '00',
    m: 0,
    mm: '00',
    s: 0,
    ss: '00',
    ms: 0
  },
  diffMilliSec: 0,
  elapsedTime: 0
}
```

## Methods

- `start(dateObj)` resumes or starts counting
- `pause()` pauses the timer
- `stop()` stops the timer
- `destroy()` clears internal state

## Development

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:8000/examples/`.

## Build

```bash
npm run build
```

Build output:

- `dist/js-count-module.cjs`
- `dist/js-count-module.mjs`
- `dist/js-count-module.global.js`

The build output is minified.

## Test

```bash
npm test
```

Current tests cover:

- utility helpers
- exclude period normalization
- overlap calculation
- countdown result with excluded periods
- countup behavior with ignored excludes
- lifecycle methods and callback payloads

## License

[MIT](https://github.com/yama-dev/js-count-module/blob/master/LICENSE)
