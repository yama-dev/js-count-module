const assert = require('assert');

describe('JS_COUNT_MODULE', function(){
  let JS_COUNT_MODULE;
  let originalDocument;
  let originalSetTimeout;
  let originalClearTimeout;

  before(async function(){
    ({ JS_COUNT_MODULE } = await import('../dist/js-count-module.mjs'));
  });

  beforeEach(function(){
    originalDocument = global.document;
    originalSetTimeout = global.setTimeout;
    originalClearTimeout = global.clearTimeout;
    global.document = {
      readyState: 'complete',
      addEventListener: function(){},
    };
    global.setTimeout = function(){
      return 1;
    };
    global.clearTimeout = function(){};
  });

  afterEach(function(){
    global.document = originalDocument;
    global.setTimeout = originalSetTimeout;
    global.clearTimeout = originalClearTimeout;
  });

  describe('utility methods', function(){
    it('pads time values', function(){
      assert.strictEqual(JS_COUNT_MODULE.PadStart(3), '03');
      assert.strictEqual(JS_COUNT_MODULE.PadStart(12, 4), '0012');
    });

    it('parses time into structured objects', function(){
      assert.deepStrictEqual(JS_COUNT_MODULE.ParseTime2DateObj(90061007), {
        d: 1,
        h: 1,
        hh: '01',
        m: 1,
        mm: '01',
        s: 1,
        ss: '01',
        ms: 7,
      });

      assert.deepStrictEqual(JS_COUNT_MODULE.ParseTime2DateListObj(3600000), {
        d: 1 / 24,
        dFloor: 0,
        dCeil: 1,
        dFloorSplit: ['0'],
        dCeilSplit: ['1'],
        h: 1,
        m: 60,
        s: 3600,
        ms: 3600000,
      });
    });

    it('parses and validates daily times', function(){
      assert.strictEqual(JS_COUNT_MODULE.IsDailyTimeFormat('09:30'), true);
      assert.strictEqual(JS_COUNT_MODULE.IsDailyTimeFormat('09:30:45'), true);
      assert.strictEqual(JS_COUNT_MODULE.IsDailyTimeFormat('2026/05/20 09:30'), false);
      assert.strictEqual(JS_COUNT_MODULE.ParseDailyTime('09:30:45'), 34245000);
      assert.strictEqual(JS_COUNT_MODULE.ParseDailyTime('24:00'), null);
    });

    it('parses date-time and range helpers', function(){
      const parsed = JS_COUNT_MODULE.ParseDateTime('2026/05/20 09:30:00');
      assert.strictEqual(parsed, new Date('2026/05/20 09:30:00').getTime());
      assert.strictEqual(JS_COUNT_MODULE.ParseDateTime('invalid'), null);
      assert.strictEqual(JS_COUNT_MODULE.GetDayMilliSec(), 86400000);
      assert.strictEqual(
        JS_COUNT_MODULE.GetStartOfDay(new Date('2026/05/20 09:30:00').getTime()),
        new Date('2026/05/20 00:00:00').getTime()
      );
      assert.strictEqual(JS_COUNT_MODULE.GetRangeOverlap(0, 10, 3, 7), 4);
      assert.strictEqual(JS_COUNT_MODULE.GetRangeOverlap(0, 10, 10, 12), 0);
    });

    it('normalizes overlapping ranges', function(){
      assert.deepStrictEqual(JS_COUNT_MODULE.NormalizeTimeRanges([
        { start: 30, end: 50 },
        { start: 10, end: 20 },
        { start: 15, end: 40 },
        { start: 60, end: 70 },
      ]), [
        { start: 10, end: 50 },
        { start: 60, end: 70 },
      ]);
    });
  });

  describe('NormalizeExcludePeriods', function(){
    it('merges overlapping daily periods', function(){
      const normalized = JS_COUNT_MODULE.NormalizeExcludePeriods([
        { start: '12:00', end: '13:00' },
        { start: '12:30', end: '14:00' },
        { start: '15:00', end: '16:00' },
      ]);

      assert.deepStrictEqual(normalized.daily, [
        { start: 12 * 60 * 60 * 1000, end: 14 * 60 * 60 * 1000 },
        { start: 15 * 60 * 60 * 1000, end: 16 * 60 * 60 * 1000 },
      ]);
    });

    it('merges overlapping absolute periods', function(){
      const normalized = JS_COUNT_MODULE.NormalizeExcludePeriods([
        { start: '2026/05/20 10:00:00', end: '2026/05/20 12:30:00' },
        { start: '2026/05/20 11:30:00', end: '2026/05/20 13:00:00' },
      ]);

      assert.deepStrictEqual(normalized.absolute, [
        {
          start: new Date('2026/05/20 10:00:00').getTime(),
          end: new Date('2026/05/20 13:00:00').getTime(),
        },
      ]);
    });

    it('ignores invalid and mixed-format periods', function(){
      const normalized = JS_COUNT_MODULE.NormalizeExcludePeriods([
        { start: '12:00', end: '11:00' },
        { start: '12:00', end: '2026/05/20 13:00:00' },
        { start: 'invalid', end: '2026/05/20 13:00:00' },
      ]);

      assert.deepStrictEqual(normalized, {
        daily: [],
        absolute: [],
      });
    });
  });

  describe('excluded time calculation', function(){
    it('returns zero for empty or inverted ranges', function(){
      assert.strictEqual(JS_COUNT_MODULE.GetAbsoluteExcludedMilliSec(10, 5, []), 0);
      assert.strictEqual(JS_COUNT_MODULE.GetDailyExcludedMilliSec(10, 5, []), 0);
    });

    it('calculates daily overlap within the same day', function(){
      const start = new Date('2026/05/20 11:30:00').getTime();
      const end = new Date('2026/05/20 13:15:00').getTime();
      const dailyPeriods = JS_COUNT_MODULE.NormalizeExcludePeriods([
        { start: '12:00', end: '13:00' },
      ]).daily;

      const excluded = JS_COUNT_MODULE.GetDailyExcludedMilliSec(start, end, dailyPeriods);

      assert.strictEqual(excluded, 60 * 60 * 1000);
    });

    it('calculates daily overlap across multiple days', function(){
      const start = new Date('2026/05/20 11:00:00').getTime();
      const end = new Date('2026/05/22 15:00:00').getTime();
      const dailyPeriods = JS_COUNT_MODULE.NormalizeExcludePeriods([
        { start: '12:00', end: '13:00' },
        { start: '15:00', end: '16:30' },
      ]).daily;

      const excluded = JS_COUNT_MODULE.GetDailyExcludedMilliSec(start, end, dailyPeriods);

      assert.strictEqual(excluded, 6 * 60 * 60 * 1000);
    });

    it('calculates absolute overlap', function(){
      const start = new Date('2026/05/20 11:00:00').getTime();
      const end = new Date('2026/05/20 15:00:00').getTime();
      const absolutePeriods = JS_COUNT_MODULE.NormalizeExcludePeriods([
        { start: '2026/05/20 12:00:00', end: '2026/05/20 13:30:00' },
      ]).absolute;

      const excluded = JS_COUNT_MODULE.GetAbsoluteExcludedMilliSec(start, end, absolutePeriods);

      assert.strictEqual(excluded, 90 * 60 * 1000);
    });
  });

  describe('countdown with excludePeriods', function(){
    it('clamps interval smaller than one millisecond', function(){
      const module = new JS_COUNT_MODULE({
        autostart: false,
        interval: 0,
        nowObj: new Date('2026/05/20 11:00:00'),
        date: '2026/05/20 15:00:00',
      });

      assert.strictEqual(module.config.interval, 1);
    });

    it('keeps raw countdown when no excludes exist', function(){
      const module = new JS_COUNT_MODULE({
        autostart: false,
        nowObj: new Date('2026/05/20 11:00:00'),
        date: '2026/05/20 15:00:00',
      });

      assert.strictEqual(module.config.countDiffMilliSec, 4 * 60 * 60 * 1000);
    });

    it('subtracts both daily and absolute excluded time', function(){
      const module = new JS_COUNT_MODULE({
        autostart: false,
        nowObj: new Date('2026/05/20 11:00:00'),
        date: '2026/05/20 15:00:00',
        excludePeriods: [
          { start: '14:00', end: '14:30' },
          { start: '2026/05/20 12:00:00', end: '2026/05/20 13:30:00' },
        ],
      });

      assert.strictEqual(module.config.countDiffMilliSec, 2 * 60 * 60 * 1000);
    });

    it('selects the first future date from data', function(){
      const module = new JS_COUNT_MODULE({
        autostart: false,
        nowObj: new Date('2026/05/20 11:00:00'),
        data: [
          { date: '2026/05/20 10:00:00' },
          { date: '2026/05/20 12:00:00' },
          { date: '2026/05/20 13:00:00' },
        ],
      });

      assert.strictEqual(module.config.date, '2026/05/20 12:00:00');
      assert.strictEqual(module.config.countDiffMilliSec, 60 * 60 * 1000);
    });

    it('ignores excludePeriods for countup', function(){
      const module = new JS_COUNT_MODULE({
        type: 'up',
        autostart: false,
        excludePeriods: [
          { start: '12:00', end: '13:00' },
        ],
      });

      assert.strictEqual(module._getExcludedMilliSec(
        new Date('2026/05/20 11:00:00').getTime(),
        new Date('2026/05/20 15:00:00').getTime()
      ), 0);
    });
  });

  describe('instance methods and callbacks', function(){
    it('calls onUpdate and onComplete when countdown is complete', function(){
      let updatePayload;
      let completePayload;

      const module = new JS_COUNT_MODULE({
        autostart: false,
        nowObj: new Date('2026/05/20 11:00:00'),
        date: '2026/05/20 10:00:00',
        onUpdate: function(data){
          updatePayload = data;
        },
        onComplete: function(data){
          completePayload = data;
        },
      });

      module.Update();

      assert.strictEqual(updatePayload.updating, false);
      assert.strictEqual(completePayload.updating, false);
      assert.strictEqual(updatePayload.diffMilliSec, 0);
      assert.strictEqual(completePayload.diffMilliSec, 0);
    });

    it('pause, stop, start, and destroy update internal state', function(){
      const module = new JS_COUNT_MODULE({
        autostart: false,
        nowObj: new Date('2026/05/20 11:00:00'),
        date: '2026/05/20 15:00:00',
      });

      module.pause();
      assert.strictEqual(module.state.updating, false);
      assert.strictEqual(module.state.pause, true);

      module.start(new Date('2026/05/20 12:00:00'));
      assert.strictEqual(module.state.updating, true);
      assert.strictEqual(module.state.pause, false);

      module.stop();
      assert.strictEqual(module.state.updating, false);

      module.destroy();
      assert.strictEqual(module.timer, null);
      assert.strictEqual(module.config, null);
    });
  });
});
