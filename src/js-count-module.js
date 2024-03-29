/*eslint no-console: "off"*/

export class JS_COUNT_MODULE {

  constructor(options={}){
    let configDefault = {
      type: 'down',       // 'up'|'down'
      interval: 1000,     // interval time [ms]
      autostart: true,    // auto count start flg.
      nowObj: new Date(), // now Date object.
      nowObjFix: null,    // now Date object.
      data: [],           // 'date' and 'complete' for array.
      endstop: true,

      date       : '',    // ex. '2019/1/23/ 05:35:46'
      onUpdate   : null,  // update function.
      onComplete : null,  // complete function.

      countDiffMilliSec : 0,
      countDiffObj      : {},
      countDiffListObj  : {},

      equalRacio: 0,
      setObj: new Date(),
      elapsedTime: 0,
    };

    // Don't Overwrite
    this.state = {
      updating: true,
      pause: false,
      startTimeObj: new Date(), // now Date object.
    };

    this.timer = null;

    // Merge Config Settings.
    this.config = {
      ...configDefault,
      ...options
    };

    // Adjust interval count time.
    if(this.config.interval < 1) this.config.interval = 1;

    // Adjust newObj.
    if(this.config.nowObj){
      this.config.nowObjFix = this.config.nowObj;
    } else {
      this.config.nowObjFix = new Date();
    }

    // For Countup type.
    if(this.config.type == 'up'){
      this.config.nowObjFix = new Date();
    } else {
      if(!this.config.data.length && !this.config.date){
        try {
          throw new Error('Not config "date"');
        } catch (e) {
          console.log(e.name + ': ' + e.message);
        }
        return false;
      }
    }

    // Convert data string to array.
    if(!this.config.data.length){
      this.config.data = [
        {
          date: this.config.date,
          onUpdate: this.config.onUpdate,
          onComplete: this.config.onComplete
        }
      ];
    }

    // SetModule.
    if(document.readyState == 'complete' || document.readyState == 'interactive'){
      this._updateData();
      if(this.config.autostart) this.Update();
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        this._updateData();
        if(this.config.autostart) this.Update();
      });
    }

  }

  static PadStart(str,length=2,padString='0'){
    return String(str).padStart(length, padString);
  }

  static ParseTime2DateObj (time){
    let _time = time;
    let _obj = {};
    _obj.d = Math.floor(_time / ( 1000 * 60 * 60 * 24 ));
    _time = _time % ( 1000 * 60 * 60 * 24 );
    _obj.h = Math.floor(_time / ( 1000 * 60 * 60 ));
    _obj.hh = JS_COUNT_MODULE.PadStart(_obj.h,2,'0');
    _time = _time % ( 1000 * 60 * 60 );
    _obj.m = Math.floor(_time / ( 1000 * 60 ));
    _obj.mm = JS_COUNT_MODULE.PadStart(_obj.m,2,'0');
    _time = _time % ( 1000 * 60 );
    _obj.s = Math.floor(_time / ( 1000 ));
    _obj.ss = JS_COUNT_MODULE.PadStart(_obj.s,2,'0');
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

  _checkEndstop(){
    if(this.config.type !== 'up'){
      if(this.config.endstop){
        this.state.updating = false;
        if(this.config.countDiffMilliSec > 0){
          this.state.updating = true;
        } else {
          this.config.countDiffMilliSec = 0;
        }
      } else {
        this.state.updating = true;
      }
    }
  }

  // set date data when start & finish.
  _updateData(){
    let _t = this.config.nowObjFix.getTime() + this.config.elapsedTime;
    this.config.setObj.setTime(_t);

    let _flg = false;
    this.config.data.map((item)=>{
      if(_flg) return;

      if( (new Date(item.date) - this.config.setObj) > this.config.equalRacio ) {

        _flg = true;
        if(item.date)       this.config.date = item.date;
        if(item.onUpdate)   this.config.onUpdate = item.onUpdate;
        if(item.onComplete) this.config.onComplete = item.onComplete;

        this.config.countDiffMilliSec = new Date(item.date) - this.config.setObj;
        this.config.countDiffObj      = JS_COUNT_MODULE.ParseTime2DateObj(this.config.countDiffMilliSec);
        this.config.countDiffListObj  = JS_COUNT_MODULE.ParseTime2DateListObj(this.config.countDiffMilliSec);
      }
    });
  }

  _update(){
    // 設定時刻と終了時刻の差を取得 [ms]
    let _diffMilliSec  = new Date(this.config.date).getTime() - this.config.setObj.getTime();

    // 実際にスタートした時間と、nowObjに設定した現時刻の差を確認
    let _diffStartMSec = this.config.nowObjFix.getTime() - this.state.startTimeObj.getTime();

    // 正確な経過時間を取得 [ms]
    this.config.elapsedTime = Date.now() - this.config.nowObjFix.getTime() + _diffStartMSec;

    // count down.
    if(this.config.type == 'up'){
      // Up.
      this.config.countDiffMilliSec = this.config.elapsedTime;
    } else {
      // Down.
      this.config.countDiffMilliSec = _diffMilliSec - this.config.elapsedTime;
    }
  }
  Update(){
    clearTimeout(this.timer);

    if(this.config.elapsedTime >= 0) this._checkEndstop();

    this.config.countDiffObj     = JS_COUNT_MODULE.ParseTime2DateObj(this.config.countDiffMilliSec);
    this.config.countDiffListObj = JS_COUNT_MODULE.ParseTime2DateListObj(this.config.countDiffMilliSec);

    // check update or last.
    if(this.state.updating){
      this.OnUpdate();
    } else {
      this.OnUpdate();
      this.OnComplete();
    }

    // Update Data.
    if(this.config.countDiffMilliSec <= 0 && this.config.data.length){
      this._updateData();
      this._checkEndstop();
    }

    this.timer = setTimeout(()=>{
      // check update or last.
      if(this.state.updating){
        this._update();
        this.Update();
      }
    }, this.config.interval);

  }

  OnUpdate(){
    let _obj = {
      updating     : this.state.updating,
      date         : this.config.date,
      onUpdate     : this.config.onUpdate,
      onComplete   : this.config.onComplete,
      diffObj      : this.config.countDiffListObj,
      diffObjParsed: this.config.countDiffObj,
      diffMilliSec : this.config.countDiffMilliSec,
      elapsedTime  : this.config.elapsedTime
    };
    if(this.config.onUpdate){
      this.config.onUpdate(_obj);
    }
  }

  OnComplete(){
    let _obj = {
      updating     : this.state.updating,
      date         : this.config.date,
      onUpdate     : this.config.onUpdate,
      onComplete   : this.config.onComplete,
      diffObj      : this.config.countDiffListObj,
      diffObjParsed: this.config.countDiffObj,
      diffMilliSec : this.config.countDiffMilliSec,
      elapsedTime  : this.config.elapsedTime
    };
    if(this.config.onComplete){
      this.config.onComplete(_obj);
    }
  }

  start(d = this.config.nowObjFix){
    this.state.updating = true;

    if(!this.state.pause){
      if(this.config.type == 'down'){
        this.config.nowObjFix = d;
      }
      if(this.config.type == 'up'){
        let _elapsedTime = Date.now() - this.config.nowObjFix.getTime();

        this.config.nowObjFix = new Date(d.getTime() + _elapsedTime - this.config.elapsedTime);
        this.config.date = this.config.nowObj.getTime();
      }
    } else {
      this.state.pause = false;
    }

    this._updateData();

    this._update();
    this.Update();
  }

  pause(){
    this.state.updating = false;
    this.state.pause = true;
    clearTimeout(this.timer);
  }

  stop(){
    this.state.updating = false;
    clearTimeout(this.timer);
  }

  destroy(){
    this.state.updating = false;
    clearTimeout(this.timer);
    this.timer = null;
    this.config = null;
  }
}
