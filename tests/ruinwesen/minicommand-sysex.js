/*
 * MidiCtrl - Send Sysex messages to MiniCommand with SysexReceiveFirmware loaded
 *
 * (c) May 2011 - Manuel Odendahl - wesen@ruinwesen.com
 */

var MIDI = require('MIDI');
var _ = require('underscore');

/** Open the MIDI output **/
var output = new MIDI.MIDIOutput('USB MIDI Device Port 1');

/** Sysex header for SysexReceiveFirmware sketch **/
var RWHeader = [0xf0, 0x00, 0x13, 0x79];

/** CMD byte definitions **/
var RW_CMD_SET_ENCODER_NAME = 0x01;
var RW_CMD_SET_PAGE_NAME = 0x02;
var RW_CMD_SET_ENCODER_CC = 0x03;
var RW_CMD_SET_ENCODER_VALUE = 0x04;
var RW_CMD_FLASH_STRING = 0x05;


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

/** Send all the arguments to the function out as MIDI sysex. **/
function sendMidi() {
  output.send(_.flatten([RWHeader, _.flatten(arguments), 0xf7]));
}

/** Sysex encoding helpers **/
function setEncoderName(enc, name) {
  return [RW_CMD_SET_ENCODER_NAME, enc, name.toArray()];
}

function setPageName(page, name) {
  return [RW_CMD_SET_PAGE_NAME, page, name.toArray()];
}

function setEncoderValue(enc, value) {
  return [RW_CMD_SET_ENCODER_VALUE, enc, value];
}

function setEncoderCC(enc, cc) {
  return [RW_CMD_SET_ENCODER_CC, enc, cc];
}

function flashString(line, str) {
  return [RW_CMD_FLASH_STRING, line, str.toArray()];
}