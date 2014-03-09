
(function (window) {


var HDR_CHUNKID     = "MThd";
var HDR_CHUNK_SIZE  = "\x00\x00\x00\x06";
var HDR_TYPE0       = "\x00\x00";
var HDR_TYPE1       = "\x00\x01";
var HDR_SPEED       = "\x00\x80";

var TRACK_START = [0x4d, 0x54, 0x72, 0x6b];
var TRACK_END   = [0x0, 0xFF, 0x2F, 0x0];

// Midi event codes
var META_SEQUENCE = 0x00;

var META_TEXT       = 0x01;
var META_COPYRIGHT  = 0x02;
var META_TRACK_NAME = 0x03;
var META_INSTRUMENT = 0x04;
var META_LYRIC      = 0x05;
var META_MARKER     = 0x06;
var META_CUE_POINT = 0x07;

var EVT_NOTE_OFF           = 0x8;
var EVT_NOTE_ON            = 0x9;
var EVT_AFTER_TOUCH        = 0xA;
var EVT_CONTROLLER         = 0xB;
var EVT_PROGRAM_CHANGE     = 0xC;
var EVT_CHANNEL_AFTERTOUCH = 0xD;
var EVT_PITCH_BEND         = 0xE;

var META_CHANNEL_PREFIX = 0x20;
var META_END_OF_TRACK   = 0x2f;
var META_TEMPO      = 0x51;
var META_SMPTE      = 0x54;
var META_TIME_SIG   = 0x58;
var META_KEY_SIG    = 0x59;
var META_SEQ_EVENT  = 0x7f;

var noteTable = { "G9": 0x7F, "Gb9": 0x7E, "F9": 0x7D, "E9": 0x7C, "Eb9": 0x7B,
"D9": 0x7A, "Db9": 0x79, "C9": 0x78, "B8": 0x77, "Bb8": 0x76, "A8": 0x75, "Ab8": 0x74,
"G8": 0x73, "Gb8": 0x72, "F8": 0x71, "E8": 0x70, "Eb8": 0x6F, "D8": 0x6E, "Db8": 0x6D,
"C8": 0x6C, "B7": 0x6B, "Bb7": 0x6A, "A7": 0x69, "Ab7": 0x68, "G7": 0x67, "Gb7": 0x66,
"F7": 0x65, "E7": 0x64, "Eb7": 0x63, "D7": 0x62, "Db7": 0x61, "C7": 0x60, "B6": 0x5F,
"Bb6": 0x5E, "A6": 0x5D, "Ab6": 0x5C, "G6": 0x5B, "Gb6": 0x5A, "F6": 0x59, "E6": 0x58,
"Eb6": 0x57, "D6": 0x56, "Db6": 0x55, "C6": 0x54, "B5": 0x53, "Bb5": 0x52, "A5": 0x51,
"Ab5": 0x50, "G5": 0x4F, "Gb5": 0x4E, "F5": 0x4D, "E5": 0x4C, "Eb5": 0x4B, "D5": 0x4A,
"Db5": 0x49, "C5": 0x48, "B4": 0x47, "Bb4": 0x46, "A4": 0x45, "Ab4": 0x44, "G4": 0x43,
"Gb4": 0x42, "F4": 0x41, "E4": 0x40, "Eb4": 0x3F, "D4": 0x3E, "Db4": 0x3D, "C4": 0x3C,

"E3": 0x34, "Eb3": 0x33, "D3": 0x32, "Db3": 0x31, "C3": 0x30, "B2": 0x2F, "Bb2": 0x2E,
"A2": 0x2D, "Ab2": 0x2C, "G2": 0x2B, "Gb2": 0x2A, "F2": 0x29, "E2": 0x28, "Eb2": 0x27,
"D2": 0x26, "Db2": 0x25, "C2": 0x24, "B1": 0x23, "Bb1": 0x22, "A1": 0x21, "Ab1": 0x20,
"G1": 0x1F, "Gb1": 0x1E, "F1": 0x1D, "E1": 0x1C, "Eb1": 0x1B, "D1": 0x1A, "Db1": 0x19,
"C1": 0x18, "B0": 0x17, "Bb0": 0x16, "A0": 0x15, "Ab0": 0x14, "G0": 0x13, "Gb0": 0x12,
"F0": 0x11, "E0": 0x10, "Eb0": 0x0F, "D0": 0x0E, "Db0": 0x0D, "C0": 0x0C };


function bytesToString(byteArray) {
	//Converts array of bytes to a string of hex chars.
    return String.fromCharCode.apply(null, byteArray);
}

function stringToBytes(string) {

	var bytes = [];

	for (i=0; i < string.length; i++) {
		bytes.push(string.charCodeAt(i));
	}

	return bytes;
}

function hexToBytes(str, finalBytes) {

	//String of hexadecimal values to an array of bytes. Adds
	//remaining "0" nibbles to the array as the finalBytes parameter.

    if (finalBytes) {
        while ((str.length / 2) < finalBytes) {
			str = "0" + str;
		}
    }

    var bytes = [];

    for (var i=str.length-1; i >= 0; i = i-2) {
        var chars = (i === 0) ? str[i] : str[i-1] + str[i];
        bytes.unshift(parseInt(chars, 16));
    }

    return bytes;
}

function integerToBytes(value, finalBytes) {

	return hexToBytes((value).toString(16), finalBytes);
}

function variableLengthInt(value) {

    var buffer = value & 0x7F;

    while (value = value >> 7) {
        buffer <<= 8;
        buffer |= ((value & 0x7F) | 0x80);
    }

    var bList = [];

    while (true) {
        bList.push(buffer & 0xff);

        if (buffer & 0x80)
            buffer >>= 8;
        else
            break;
    }

    return bList;
}



var MidiWriter = function () {

	this.write = function(midi){

		var hex = HDR_CHUNKID + HDR_CHUNK_SIZE;

		hex += bytesToString(integerToBytes(midi.header.formatType, 2));
		hex += bytesToString(integerToBytes(midi.tracks.length, 2));
		hex += bytesToString(integerToBytes(midi.header.ticksPerBeat, 2));

		midi.tracks.forEach(function(track) {
			hex += bytesToString(getTrackBytes(track));
		});

		return hex;
	};

    function getTrackBytes(track) {

        var trackLength = 0;
		var trackBytes = [];
        var eventBytes = [];
        var startBytes = [0x4d, 0x54, 0x72, 0x6b];
        var endBytes   = [0x0, 0xFF, 0x2F, 0x0];

		track.forEach(function(event){
			var bytes = getEventBytes(event);
            trackLength += bytes.length;
			eventBytes = eventBytes.concat(bytes);
		});

        trackLength += endBytes.length;

        var lengthBytes = hexToBytes(trackLength.toString(16), 4);

		trackBytes = trackBytes.concat(startBytes, lengthBytes, eventBytes, endBytes);

		return trackBytes;
    }

	function getEventBytes(e) {

		var bytes = [];

		switch (e.type) {

			case 0x01: // text
			case 0x02: // copyright
			case 0x03: // track name
			case 0x04: // instrument
			case 0x05: // lyric
			case 0x06: // marker
			case 0x07: // cue point
				var textBytes = stringToBytes(e.text);
				var lengthBytes = variableLengthInt(textBytes.length);
				bytes = bytes.concat([0x0, 0xFF, e.type], lengthBytes, textBytes);
				break;

			case 0x8: // note off
			case 0x9: // note on
				bytes = channelEventBytes(e.time, e.channel, e.type, e.note, e.velocity);
				break;

			case 0xA: // aftertouch
				bytes = channelEventBytes(e.time, e.channel, 0xA, e.note, e.value);
				break;

			case 0xB: // controller
				bytes = channelEventBytes(e.time, e.channel, 0xB, e.controller, e.value);
				break;

			case 0xC: // program change
				bytes = channelEventBytes(e.time, e.channel, 0xC, e.value);
				break;

			case 0xD: // channel aftertouch
				bytes = channelEventBytes(e.time, e.channel, 0xD, e.value);
				break;

			case 0xE: // pitch bend
				break;

			case 0x00: // sequence
				break;

			case 0x20: // channel prefix
				bytes = [0x0, 0xFF, 0x20, 0x01, e.channel];
				break;

			case 0x2F: // end of track
				break;

			case 0x51: // tempo
				bytes = bytes.concat([0x0, 0xFF, 0x51, 0x03], integerToBytes(e.mcsPerBeat));
				break;

			case 0x54: // smpte
			case 0x58: // time sig
			case 0x59: // key sig
				break;

			case 0x7F: // seq event
				break;
		}

		return bytes;
	}

	function channelEventBytes(time, channel, type, param1, param2) {

		var bytes = variableLengthInt(time);
		bytes.push(parseInt(type.toString(16) + channel.toString(16), 16));
		bytes.push(param1);
		if (param2) bytes.push(param2);

		return bytes;
	}

	return this;

}();


window.MidiWriter = MidiWriter;
window.noteTable = noteTable;

})(this);
