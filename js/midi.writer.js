var Midi = Midi || {};

Midi.Writer = function () {

	var HDR_CHUNKID     = "MThd";
	var HDR_CHUNK_SIZE  = "\x00\x00\x00\x06";
	var TRACK_START = [0x4d, 0x54, 0x72, 0x6b];
	var TRACK_END   = [0x0, 0xFF, 0x2F, 0x0];

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

        var eventId = Midi.Enums.Events[e.type];

		switch (eventId) {

			case 0x01: // text
				bytes = longMsgBytes(eventId, stringToBytes(e.text));
				break;

			case 0x02: // copyright
				bytes = longMsgBytes(eventId, stringToBytes(e.text));
				break;

			case 0x03: // track name
				bytes = longMsgBytes(eventId, stringToBytes(e.text));
				break;

			case 0x04: // instrument
				bytes = longMsgBytes(eventId, stringToBytes(e.text));
				break;

			case 0x05: // lyric
				bytes = longMsgBytes(eventId, stringToBytes(e.text));
				break;

			case 0x06: // marker
				bytes = longMsgBytes(eventId, stringToBytes(e.text));
				break;

			case 0x07: // cue point
				bytes = longMsgBytes(eventId, stringToBytes(e.text));
				break;

			case 0x8: // note off
				bytes = shortMsgBytes(eventId, e.time, e.channel, e.note, e.velocity);
				break;

			case 0x9: // note on
				bytes = shortMsgBytes(eventId, e.time, e.channel, e.note, e.velocity);
				break;

			case 0xA: // note aftertouch
				bytes = shortMsgBytes(eventId, e.time, e.channel, e.note, e.value);
				break;

			case 0xB: // controller
				bytes = shortMsgBytes(eventId, e.time, e.channel, e.controller, e.value);
				break;

			case 0xC: // program change
				bytes = shortMsgBytes(eventId, e.time, e.channel, e.value);
				break;

			case 0xD: // channel aftertouch
				bytes = shortMsgBytes(eventId, e.time, e.channel, e.value);
				break;

			case 0xE: // pitch bend
				break;

			case 0x00: // sequence number
				break;

			case 0x20: // channel prefix
				bytes = longMsgBytes(0x20, [e.channel]);
				break;

			case 0x51: // tempo
				bytes = longMsgBytes(0x51, integerToBytes(e.mcsPerBeat));
				break;

			case 0x54: // smpte
				break;

			case 0x58: // time sig
				bytes = longMsgBytes(0x58, [e.numerator, Math.round(Math.sqrt(e.denominator)), e.metronome, e.thirtyseconds]);
				break;

			case 0x59: // key sig
				break;

			case 0x7F: // sequencer specific
				break;

			case 0x2F: // end of track
				break;
		}

		return bytes;
	}

	function longMsgBytes(command, bytes) {
		var length = variableLengthInt(bytes.length);
		return [].concat([0x0, 0xFF, command], length, bytes);
	}

	function shortMsgBytes(command, time, channel, param1, param2) {

		var bytes = variableLengthInt(time);
		bytes.push(parseInt(command.toString(16) + channel.toString(16), 16));
		bytes.push(param1);
		if (param2) bytes.push(param2);

		return bytes;
	}

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

		while ((value = value >> 7)) {
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

	return this;

}();
