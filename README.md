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

- Standalone(CDN) -> [https://cdn.jsdelivr.net/gh/yama-dev/js-count-module@v0.1.0/dist/js-count-module.js](https://cdn.jsdelivr.net/gh/yama-dev/js-count-module@v0.1.0/dist/js-count-module.js)

<br>

## Using

### NPM Usage

``` bash
# install npm.
npm install --save-dev js-count-module
```

``` javascript
// import.
import COUNT_MODULE from 'js-count-module';
```

### Basic Standalone Usage

``` html
<script src="./js-count-module.js"></script>
<script>
  new JS_COUNT_MODULE({
    date: '2020/1/10 10:00',
    complete: function(data){
      console.log(data);
      var _d = data.diffObjParsed;
      var _t = _d.d+'[日] '+_d.h+'[時間] '+_d.m+'[分] '+_d.s+'[秒]';
    }
  });
</script>
```

<br>

## Dependencies

none

<br><br><br>

___

**For Developer**

## Contribution

1. Fork it ( https://github.com/yama-dev/js-count-module/fork )
2. Create your feature branch (git checkout -b my-new-feature)
3. Commit your changes (git commit -am 'Add some feature')
4. Push to the branch (git push origin my-new-feature)
5. Create new Pull Request

<br>

## Develop

### at Development

Install node modules.

``` bash
$ npm install
```

Run npm script 'develop'

``` bash
$ npm run develop
```

Run npm script 'production'

``` bash
$ npm run production
```

<br>

## Licence

[MIT](https://github.com/yama-dev/js-count-module/blob/master/LICENSE)

<br>

## Author

[yama-dev](https://github.com/yama-dev)

