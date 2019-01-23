/*!
 * JS COUNT MODULE (JavaScript Library)
 *   js-count-module.js
 * Version 0.0.1
 * Repository https://github.com/yama-dev/js-count-module
 * Copyright yama-dev
 * Licensed under the MIT license.
 */

export default class JS_COUNT_MODULE {

  constructor(options={}){
    let configDefault = {
      type: 'down',        // 'up'|'down'
      interval: 1000,      // interval time [ms]
      autostart: true,     // auto count start flg.
      nowObj: new Date(),  // now Date object.
      data: [],            // 'date' and 'complete' for array.

      date: '',            // ex. '2019/1/23/ 05:35:46'
      complete: null,      // complete function.

      countDiffMilliSec: 0,
      countDiffObj: {},
      countDiffListObj: {},
    };

    // Merge Config Settings.
    this.Config = Object.assign(configDefault, options);

    // newObjの値を修正
    if(!this.Config.nowObj) this.Config.nowObj = new Date();

    if(!this.Config.data.length){
      this.Config.data = {
        date: this.Config.date,
        complete: this.Config.complete 
      };

      this.Config.countDiffMilliSec = new Date(this.Config.date) - this.Config.nowObj;
      this.Config.countDiffObj      = JS_COUNT_MODULE.ParseTime2DateObj(this.Config.countDiffMilliSec);
      this.Config.countDiffListObj  = JS_COUNT_MODULE.ParseTime2DateListObj(this.Config.countDiffMilliSec);
    } else {
      let _flg = false;
      this.Config.data.map((item)=>{
        if(_flg) return;
        if( (new Date(item.date) - this.Config.nowObj) > 0 ) {
          _flg = true;
          this.Config.date = item.date;
          this.Config.complete = item.complete;

          this.Config.countDiffMilliSec = new Date(item.date) - this.Config.nowObj;
          this.Config.countDiffObj      = JS_COUNT_MODULE.ParseTime2DateObj(this.Config.countDiffMilliSec);
          this.Config.countDiffListObj  = JS_COUNT_MODULE.ParseTime2DateListObj(this.Config.countDiffMilliSec);
        }
      });
    }

    if(this.Config.autostart) this.OnComplete();
    if(this.Config.interval > 0) this.Update();
  }

  static ParseTime2DateObj (time){
    let _time = time;
    let _obj = {};
    _obj.d = Math.floor(_time / ( 1000 * 60 * 60 * 24 ));
    _time = _time % ( 1000 * 60 * 60 * 24 );
    _obj.h = Math.floor(_time / ( 1000 * 60 * 60 ));
    _time = _time % ( 1000 * 60 * 60 );
    _obj.m = Math.floor(_time / ( 1000 * 60 ));
    _time = _time % ( 1000 * 60 );
    _obj.s = Math.floor(_time / ( 1000 ));
    _time = _time % ( 1000 );
    _obj.ms = _time;
    return _obj;
  }

  static ParseTime2DateListObj (time){
    let _obj = {
      d: time / 1000 / 60 / 60 / 24,
      dFloor: Math.floor(time / 1000 / 60 / 60 / 24),
      dCeil: Math.ceil(time / 1000 / 60 / 60 / 24),
      dFloorSplit: String(Math.floor(time / 1000 / 60 / 60 / 24)).split(''),
      dCeilSplit: String(Math.ceil(time / 1000 / 60 / 60 / 24)).split(''),
      h: time / 1000 / 60 / 60,
      m: time / 1000 / 60,
      s: time / 1000,
      ms: time
    };
    return _obj;
  }

  Update(){
    setTimeout(()=>{
      this.Config.countDiffMilliSec = this.Config.countDiffMilliSec - this.Config.interval;
      this.Config.countDiffObj      = JS_COUNT_MODULE.ParseTime2DateObj(this.Config.countDiffMilliSec);
      this.Config.countDiffListObj  = JS_COUNT_MODULE.ParseTime2DateListObj(this.Config.countDiffMilliSec);

      this.OnComplete();
      if(this.Config.interval > 0) this.Update();
    }, this.Config.interval);
  }

  OnComplete(){
    let _obj = {
      date         : this.Config.date,
      complete     : this.Config.complete,
      diffObj      : this.Config.countDiffListObj,
      diffObjParsed: this.Config.countDiffObj,
      diffMilliSec : this.Config.countDiffMilliSec
    };
    if(this.Config.complete){
      this.Config.complete(_obj);
    }
  }

}
