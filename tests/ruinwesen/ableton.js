/*
 * Ableton - Control Ableton through MiniCommand script
 *
 * (c) May 2011 - Manuel Odendahl - wesen@ruinwesen.com
 */

var MIDI = require('MIDI');
var _ = require('underscore');
var BufferStream = require('BufferStream');

/** Open the MIDI output **/
var output = new MIDI.MIDIOutput('IAC Driver Bus 1');
var input = new MIDI.MIDIInput('IAC Driver Bus 1');

MIDI.MIDIOutput.prototype.sendNoteOn = function (channel, note, velocity, time) {
  this.send([0x90 + channel, note, velocity], time);
};

MIDI.MIDIOutput.prototype.sendNoteOff = function (channel, note, velocity, time) {
  this.send([0x80 + channel, note, velocity], time);
};

MIDI.MIDIOutput.prototype.sendCC = function (channel, cc, value, time) {
  this.send([0xB0 + channel, cc, value], time);
};

input.on('sysex', function (message, time) { ABLETON.receiveSysex(message); });

/** Convert a string to a 0-terminated ASCII array. **/
String.prototype.toArray = function () {
  var res = [];
  var i;
  for (i = 0; i < this.length; i++) {
    res[i] = this.charCodeAt(i);
  }
  res[i] = 0;
  return res;
};

String.fromArray = function (bytes) {
  return (_.map(bytes, function (x) { return String.fromCharCode(x); })).join("");
};

Array.prototype.compare = function(testArr) {
    if (this.length != testArr.length) return false;
    for (var i = 0; i < testArr.length; i++) {
        if (this[i].compare) {
            if (!this[i].compare(testArr[i])) return false;
        }
        if (this[i] !== testArr[i]) return false;
    }
    return true;
};


var RWHeader = [0xf0, 0x00, 0x13, 0x79];

var ABLETON = {
  "GENERAL_CHANNEL": 0,

  "START_NOTE": 1,
  "STOP_NOTE":  2,

  "GET_TRACK_NAME": 1,
  "SEND_TRACK_NAME": 2,

  receiveSysex: function (message, time) {
    console.log("sysex: " + MIDI.messageToString(message));
    var s = new BufferStream(message);
    if (! RWHeader.compare(s.next(4))) {
      return;
    }
    var cmd;
    while ((cmd = s.next()) !== undefined) {
      switch (cmd) {
       case ABLETON.SEND_TRACK_NAME:
        console.log("name of track " + s.next() + ": " + String.fromArray(s.until(0)));
        break;
      }
    }
  },

  sendSysex: function (bytes) {
    output.send(_.flatten([RWHeader, _.flatten(arguments), 0xf7]));
  },

  requestTrackName: function (idx) {
    ABLETON.sendSysex([ABLETON.GET_TRACK_NAME, idx]);
  },

  start: function () {
    output.sendNoteOn(ABLETON.GENERAL_CHANNEL, ABLETON.START, 127);
  },

  stop: function () {
    output.sendNoteOn(ABLETON.GENERAL_CHANNEL, ABLETON.STOP, 127);
  }

};

