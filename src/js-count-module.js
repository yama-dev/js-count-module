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
      excludePeriods: [],
      excludePeriodsNormalized: {
        daily: [],
        absolute: [],
      },
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

    this.config.excludePeriodsNormalized = JS_COUNT_MODULE.NormalizeExcludePeriods(this.config.excludePeriods);

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

  static GetDayMilliSec(){
    return 1000 * 60 * 60 * 24;
  }

  static IsDailyTimeFormat(value){
    return /^\d{1,2}:\d{2}(:\d{2})?$/.test(String(value).trim());
  }

  static ParseDailyTime(value){
    let _value = String(value).trim();
    let _list = _value.split(':').map((item) => Number(item));

    if(_list.some((item) => Number.isNaN(item))){
      return null;
    }

    let _h = _list[0];
    let _m = _list[1];
    let _s = _list[2] || 0;

    if(_h < 0 || _h > 23) return null;
    if(_m < 0 || _m > 59) return null;
    if(_s < 0 || _s > 59) return null;

    return ((_h * 60 * 60) + (_m * 60) + _s) * 1000;
  }

  static ParseDateTime(value){
    let _time = new Date(value).getTime();
    if(Number.isNaN(_time)){
      return null;
    }
    return _time;
  }

  static NormalizeTimeRanges(list=[]){
    let _list = list
      .filter((item) => item && item.start < item.end)
      .sort((a,b) => a.start - b.start);

    return _list.reduce((result, item) => {
      let _last = result[result.length - 1];

      if(!_last || item.start > _last.end){
        result.push({
          start: item.start,
          end: item.end,
        });
      } else if(item.end > _last.end){
        _last.end = item.end;
      }

      return result;
    }, []);
  }

  static NormalizeExcludePeriods(periods=[]){
    let _result = {
      daily: [],
      absolute: [],
    };

    if(!Array.isArray(periods)){
      return _result;
    }

    periods.forEach((item) => {
      if(!item || !item.start || !item.end){
        return;
      }

      let _isDailyStart = JS_COUNT_MODULE.IsDailyTimeFormat(item.start);
      let _isDailyEnd = JS_COUNT_MODULE.IsDailyTimeFormat(item.end);

      if(_isDailyStart && _isDailyEnd){
        let _start = JS_COUNT_MODULE.ParseDailyTime(item.start);
        let _end = JS_COUNT_MODULE.ParseDailyTime(item.end);

        if(_start === null || _end === null || _start >= _end){
          return;
        }

        _result.daily.push({
          start: _start,
          end: _end,
        });
        return;
      }

      if(_isDailyStart || _isDailyEnd){
        return;
      }

      let _start = JS_COUNT_MODULE.ParseDateTime(item.start);
      let _end = JS_COUNT_MODULE.ParseDateTime(item.end);

      if(_start === null || _end === null || _start >= _end){
        return;
      }

      _result.absolute.push({
        start: _start,
        end: _end,
      });
    });

    _result.daily = JS_COUNT_MODULE.NormalizeTimeRanges(_result.daily);
    _result.absolute = JS_COUNT_MODULE.NormalizeTimeRanges(_result.absolute);

    return _result;
  }

  static GetStartOfDay(time){
    let _date = new Date(time);
    return new Date(_date.getFullYear(), _date.getMonth(), _date.getDate()).getTime();
  }

  static GetRangeOverlap(startA, endA, startB, endB){
    let _start = Math.max(startA, startB);
    let _end = Math.min(endA, endB);
    return Math.max(0, _end - _start);
  }

  static GetAbsoluteExcludedMilliSec(startTime, endTime, absolutePeriods=[]){
    if(endTime <= startTime){
      return 0;
    }

    return absolutePeriods.reduce((total, item) => {
      return total + JS_COUNT_MODULE.GetRangeOverlap(startTime, endTime, item.start, item.end);
    }, 0);
  }

  static GetDailyExcludedMilliSec(startTime, endTime, dailyPeriods=[]){
    if(endTime <= startTime || !dailyPeriods.length){
      return 0;
    }

    let _dayMilliSec = JS_COUNT_MODULE.GetDayMilliSec();
    let _startDayTime = JS_COUNT_MODULE.GetStartOfDay(startTime);
    let _endDayTime = JS_COUNT_MODULE.GetStartOfDay(endTime);
    let _dailyTotal = dailyPeriods.reduce((total, item) => total + (item.end - item.start), 0);
    let _count = 0;

    if(_startDayTime === _endDayTime){
      dailyPeriods.forEach((item) => {
        _count += JS_COUNT_MODULE.GetRangeOverlap(
          startTime,
          endTime,
          _startDayTime + item.start,
          _startDayTime + item.end
        );
      });
      return _count;
    }

    dailyPeriods.forEach((item) => {
      _count += JS_COUNT_MODULE.GetRangeOverlap(
        startTime,
        _startDayTime + _dayMilliSec,
        _startDayTime + item.start,
        _startDayTime + item.end
      );
    });

    dailyPeriods.forEach((item) => {
      _count += JS_COUNT_MODULE.GetRangeOverlap(
        _endDayTime,
        endTime,
        _endDayTime + item.start,
        _endDayTime + item.end
      );
    });

    let _fullDayCount = Math.max(0, Math.round((_endDayTime - _startDayTime) / _dayMilliSec) - 1);
    _count += _fullDayCount * _dailyTotal;

    return _count;
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
    let _nowTime = this._getCurrentTimeMilliSec();
    this.config.setObj.setTime(_nowTime);

    let _flg = false;
    this.config.data.map((item)=>{
      if(_flg) return;

      if( (new Date(item.date) - this.config.setObj) > this.config.equalRacio ) {

        _flg = true;
        if(item.date)       this.config.date = item.date;
        if(item.onUpdate)   this.config.onUpdate = item.onUpdate;
        if(item.onComplete) this.config.onComplete = item.onComplete;

        this.config.countDiffMilliSec = this._getCountDiffMilliSec(new Date(item.date).getTime(), _nowTime);
        this.config.countDiffObj      = JS_COUNT_MODULE.ParseTime2DateObj(this.config.countDiffMilliSec);
        this.config.countDiffListObj  = JS_COUNT_MODULE.ParseTime2DateListObj(this.config.countDiffMilliSec);
      }
    });
  }

  _getCurrentTimeMilliSec(){
    return this.config.nowObjFix.getTime() + this.config.elapsedTime;
  }

  _getExcludedMilliSec(startTime, endTime){
    if(this.config.type === 'up'){
      return 0;
    }

    let _periods = this.config.excludePeriodsNormalized;
    if(!_periods){
      return 0;
    }

    return JS_COUNT_MODULE.GetAbsoluteExcludedMilliSec(startTime, endTime, _periods.absolute)
      + JS_COUNT_MODULE.GetDailyExcludedMilliSec(startTime, endTime, _periods.daily);
  }

  _getCountDiffMilliSec(targetTime, nowTime=this._getCurrentTimeMilliSec()){
    if(this.config.type === 'up'){
      return this.config.elapsedTime;
    }

    let _rawDiffMilliSec = targetTime - nowTime;
    if(_rawDiffMilliSec <= 0){
      return _rawDiffMilliSec;
    }

    return _rawDiffMilliSec - this._getExcludedMilliSec(nowTime, targetTime);
  }

  _update(){
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
      let _nowTime = this._getCurrentTimeMilliSec();
      this.config.setObj.setTime(_nowTime);
      this.config.countDiffMilliSec = this._getCountDiffMilliSec(new Date(this.config.date).getTime(), _nowTime);
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

export default JS_COUNT_MODULE;
