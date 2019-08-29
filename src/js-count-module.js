/*eslint no-console: "off"*/

export class JS_COUNT_MODULE {

  constructor(options={}){
    let configDefault = {
      type: 'down',       // 'up'|'down'
      interval: 1000,     // interval time [ms]
      autostart: true,    // auto count start flg.
      nowObj: new Date(), // now Date object.
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

      state: {
        updating: true
      }
    };

    // Merge Config Settings.
    this.Config = Object.assign(configDefault, options);

    // newObjの値を修正
    if(!this.Config.nowObj) this.Config.nowObj = new Date();

    if(this.Config.type == 'up'){
      this.Config.nowObj.setTime(1);
      this.Config.date = this.Config.nowObj.getTime();
    }

    if(!this.Config.data.length && !this.Config.date){
      try {
        throw new Error('Not config "date"');
      } catch (e) {
        console.log(e.name + ': ' + e.message);
      }
      return false;
    }

    if(!this.Config.data.length){
      this.Config.data = [
        {
          date: this.Config.date,
          onUpdate: this.Config.onUpdate,
          onComplete: this.Config.onComplete
        }
      ];
    }

    // SetModule.
    if(document.readyState == 'complete' || document.readyState == 'interactive'){
      this._updateData();
      if(this.Config.autostart) this.Update();
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        this._updateData();
        if(this.Config.autostart) this.Update();
      });
    }

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

  UpdateData(){
    let _t = this.Config.nowObj.getTime() + this.Config.elapsedTime;
    this.Config.setObj.setTime(_t);

    let _flg = false;
    this.Config.data.map((item)=>{
      if(_flg) return;

      if( (new Date(item.date) - this.Config.setObj) > this.Config.equalRacio ) {

        _flg = true;
        if(item.date)       this.Config.date = item.date;
        if(item.onUpdate)   this.Config.onUpdate = item.onUpdate;
        if(item.onComplete) this.Config.onComplete = item.onComplete;

        this.Config.countDiffMilliSec = new Date(item.date) - this.Config.setObj;
        this.Config.countDiffObj      = JS_COUNT_MODULE.ParseTime2DateObj(this.Config.countDiffMilliSec);
        this.Config.countDiffListObj  = JS_COUNT_MODULE.ParseTime2DateListObj(this.Config.countDiffMilliSec);
      }
    });
  }

  Update(){

    if(this.Config.elapsedTime >= 0) this.checkEndstop();

    this.Config.countDiffObj     = JS_COUNT_MODULE.ParseTime2DateObj(this.Config.countDiffMilliSec);
    this.Config.countDiffListObj = JS_COUNT_MODULE.ParseTime2DateListObj(this.Config.countDiffMilliSec);

    // check update or last.
    if(this.Config.state.updating){
      this.OnUpdate();
    } else {
      this.OnUpdate();
      this.OnComplete();
    }

    // Update Data.
    if(this.Config.countDiffMilliSec <= 0 && this.Config.data.length){
      this.UpdateData();
      this.checkEndstop();
    }

    setTimeout(()=>{

      // check interval.
      if(this.Config.interval > 0){

        // check update or last.
        if(this.Config.state.updating){

          if(this.Config.interval > 0) this.Config.elapsedTime += this.Config.interval;

          // count down.
          if(this.Config.type == 'up'){
            // Up.
            this.Config.countDiffMilliSec = this.Config.countDiffMilliSec + this.Config.interval;
          } else {
            // Down.
            this.Config.countDiffMilliSec = this.Config.countDiffMilliSec - this.Config.interval;
          }

          this.Update();

        }

      }
    }, this.Config.interval);

  }

  OnUpdate(){
    let _obj = {
      updating     : this.Config.state.updating,
      date         : this.Config.date,
      onUpdate     : this.Config.onUpdate,
      onComplete   : this.Config.onComplete,
      diffObj      : this.Config.countDiffListObj,
      diffObjParsed: this.Config.countDiffObj,
      diffMilliSec : this.Config.countDiffMilliSec,
      elapsedTime  : this.Config.elapsedTime
    };
    if(this.Config.onUpdate){
      this.Config.onUpdate(_obj);
    }
  }

  OnComplete(){
    let _obj = {
      updating     : this.Config.state.updating,
      date         : this.Config.date,
      onUpdate     : this.Config.onUpdate,
      onComplete   : this.Config.onComplete,
      diffObj      : this.Config.countDiffListObj,
      diffObjParsed: this.Config.countDiffObj,
      diffMilliSec : this.Config.countDiffMilliSec,
      elapsedTime  : this.Config.elapsedTime
    };
    if(this.Config.onComplete){
      this.Config.onComplete(_obj);
    }
  }

  checkEndstop(){
    if(this.Config.type !== 'up'){
      if(this.Config.endstop){
        this.Config.state.updating = false;
        if(this.Config.countDiffMilliSec > 0){
          this.Config.state.updating = true;
        } else {
          this.Config.countDiffMilliSec = 0;
        }
      } else {
        this.Config.state.updating = true;
      }
    }
  }

}
