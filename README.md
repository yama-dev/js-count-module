# COUNT MODULE

<br>

## Feature
utility that can implement count operation.  
can flexibly count the deadline.


<br>

## Demo

- [https://yama-dev.github.io/js-count-module/examples/](https://yama-dev.github.io/js-count-module/examples/)

<br>

## Installation,Download

- Standalone(CDN) -> [https://cdn.jsdelivr.net/gh/yama-dev/js-count-module@v0.4.0/dist/js-count-module.global.js](https://cdn.jsdelivr.net/gh/yama-dev/js-count-module@v0.4.0/dist/js-count-module.global.js)

<br>

## Using

### NPM Usage

``` bash
# install npm package.
npm install @yama-dev/js-count-module
```

``` javascript
// ESM default import.
import COUNT_MODULE from '@yama-dev/js-count-module';

// ESM named import.
import { JS_COUNT_MODULE } from '@yama-dev/js-count-module';

// CommonJS require.
const { JS_COUNT_MODULE } = require('@yama-dev/js-count-module');
```

### Basic Standalone Usage

``` html
<script src="./js-count-module.global.js"></script>
<script>
  new JS_COUNT_MODULE({
    date: '2022/1/10 10:00',
    onUpdate: function(data){
      console.log(data);
      var _d = data.diffObjParsed;
      var _t = _d.d+'[日] '+_d.h+'[時間] '+_d.m+'[分] '+_d.s+'[秒]';
    },
    onComplete: function(data){
      console.log(data);
    }
  });
</script>
```

<br>

## Dependencies

none

<br>

## Development

``` bash
npm install
npm run dev
```

Open `http://127.0.0.1:8000/examples/` to check the demo while editing.  
Use `npm run build` to generate minified `dist/js-count-module.cjs`, `dist/js-count-module.mjs`, and `dist/js-count-module.global.js`.

<br><br><br>

___

**For Developer**

## Licence

[MIT](https://github.com/yama-dev/js-count-module/blob/master/LICENSE)

<br>

## Author

[yama-dev](https://github.com/yama-dev)
