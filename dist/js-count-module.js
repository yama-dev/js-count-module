!function(t,e){"object"==typeof exports&&"object"==typeof module?module.exports=e():"function"==typeof define&&define.amd?define([],e):"object"==typeof exports?exports.JS_COUNT_MODULE=e():t.JS_COUNT_MODULE=e()}(window,function(){return function(t){var e={};function i(n){if(e[n])return e[n].exports;var o=e[n]={i:n,l:!1,exports:{}};return t[n].call(o.exports,o,o.exports,i),o.l=!0,o.exports}return i.m=t,i.c=e,i.d=function(t,e,n){i.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:n})},i.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},i.t=function(t,e){if(1&e&&(t=i(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var n=Object.create(null);if(i.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var o in t)i.d(n,o,function(e){return t[e]}.bind(null,o));return n},i.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return i.d(e,"a",e),e},i.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},i.p="",i(i.s=0)}([function(t,e,i){t.exports=i(1)},function(t,e,i){"use strict";function n(){return(n=Object.assign||function(t){for(var e=1;e<arguments.length;e++){var i=arguments[e];for(var n in i)Object.prototype.hasOwnProperty.call(i,n)&&(t[n]=i[n])}return t}).apply(this,arguments)}function o(t,e){for(var i=0;i<e.length;i++){var n=e[i];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,n.key,n)}}i.r(e),i.d(e,"default",function(){return f});
/*!
 * JS COUNT MODULE (JavaScript Library)
 *   js-count-module.js
 * Version 0.0.3
 * Repository https://github.com/yama-dev/js-count-module
 * Copyright yama-dev
 * Licensed under the MIT license.
 */
var f=function(){function t(){var e=this,i=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t);var o={type:"down",interval:1e3,autostart:!0,nowObj:new Date,data:[],date:"",complete:null,countDiffMilliSec:0,countDiffObj:{},countDiffListObj:{}};if(this.Config=n(o,i),this.Config.nowObj||(this.Config.nowObj=new Date),this.Config.data.length){var f=!1;this.Config.data.map(function(i){f||new Date(i.date)-e.Config.nowObj>0&&(f=!0,e.Config.date=i.date,e.Config.complete=i.complete,e.Config.countDiffMilliSec=new Date(i.date)-e.Config.nowObj,e.Config.countDiffObj=t.ParseTime2DateObj(e.Config.countDiffMilliSec),e.Config.countDiffListObj=t.ParseTime2DateListObj(e.Config.countDiffMilliSec))})}else this.Config.data={date:this.Config.date,complete:this.Config.complete},this.Config.countDiffMilliSec=new Date(this.Config.date)-this.Config.nowObj,this.Config.countDiffObj=t.ParseTime2DateObj(this.Config.countDiffMilliSec),this.Config.countDiffListObj=t.ParseTime2DateListObj(this.Config.countDiffMilliSec);this.Config.autostart&&this.OnComplete(),this.Config.interval>0&&this.Update()}var e,i,f;return e=t,f=[{key:"ParseTime2DateObj",value:function(t){var e=t,i={};return i.d=Math.floor(e/864e5),e%=864e5,i.h=Math.floor(e/36e5),e%=36e5,i.m=Math.floor(e/6e4),e%=6e4,i.s=Math.floor(e/1e3),e%=1e3,i.ms=e,i}},{key:"ParseTime2DateListObj",value:function(t){return{d:t/1e3/60/60/24,dFloor:Math.floor(t/1e3/60/60/24),dCeil:Math.ceil(t/1e3/60/60/24),dFloorSplit:String(Math.floor(t/1e3/60/60/24)).split(""),dCeilSplit:String(Math.ceil(t/1e3/60/60/24)).split(""),h:t/1e3/60/60,m:t/1e3/60,s:t/1e3,ms:t}}}],(i=[{key:"Update",value:function(){var e=this;setTimeout(function(){e.Config.countDiffMilliSec=e.Config.countDiffMilliSec-e.Config.interval,e.Config.countDiffObj=t.ParseTime2DateObj(e.Config.countDiffMilliSec),e.Config.countDiffListObj=t.ParseTime2DateListObj(e.Config.countDiffMilliSec),e.OnComplete(),e.Config.interval>0&&e.Update()},this.Config.interval)}},{key:"OnComplete",value:function(){var t={date:this.Config.date,complete:this.Config.complete,diffObj:this.Config.countDiffListObj,diffObjParsed:this.Config.countDiffObj,diffMilliSec:this.Config.countDiffMilliSec};this.Config.complete&&this.Config.complete(t)}}])&&o(e.prototype,i),f&&o(e,f),t}()}]).default});