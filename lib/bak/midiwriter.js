var Midi = Midi || {};

Midi.Writer = function () {

	var HDR_CHUNKID     = "MThd";
	var HDR_CHUNK_SIZE  = "\x00\x00\x00\x06";
	var TRACK_START = [0x4d, 0x54, 0x72, 0x6b];
	var TRACK_END   = [0x0, 0xFF, 0x2F, 0x0];

	var eventTypes = {"noteOff" : 0x8, "noteOn" : 0x9};
	var typeId = {0 : "\x00\x00", 1 : "\x00\x01", 2 : "\x00\x02"};

	this.write = function(midi){

        var hexMidi = HDR_CHUNKID + HDR_CHUNK_SIZE + typeId[midi.header.formatType];

		hexMidi += codes2Str(str2Bytes(midi.tracks.length.toString(16), 2));
		hexMidi += codes2Str(str2Bytes(midi.header.ticksPerBeat, 2));

        midi.tracks.forEach(function(track) {

			hexMidi += codes2Str(writeTrack(track));

			//writeTrack(track);
		});

		return hexMidi;

	};

	function writeTrack(track) {

        var trackLength = 0;
        var eventBytes = [];
        var startBytes = TRACK_START;
        var endBytes = TRACK_END;

		track.forEach(function(event) {
			if (event.command == "noteOn" || event.command == "noteOff") {
				var bytes = writeEvent(event);
				trackLength += bytes.length;
				Array.prototype.push.apply(eventBytes, bytes);
			}
		});

		trackLength += endBytes.length;

        var lengthBytes = str2Bytes(trackLength.toString(16), 4);

        return startBytes.concat(lengthBytes, eventBytes, endBytes);

		//return startBytes;
	}

	function writeEvent(event) {

		console.log(event);

		var byteArray = [];

		console.log(event.command);

        var typeChannelByte = parseInt(eventTypes[event.command].toString(16) + event.channel.toString(16), 16);

        byteArray.push.apply(byteArray, translateTickTime(event.deltaTime));
        byteArray.push(typeChannelByte);
        byteArray.push(event.noteNumber);
		byteArray.push(event.velocity);

        // Some events don't have a second parameter
        //if (this.param2 !== undefined && this.param2 !== null) {
        //    byteArray.push(this.param2);
        //}

        return byteArray;

	}

	function codes2Str(byteArray) {
		return String.fromCharCode.apply(null, byteArray);
	}

	function str2Bytes(str, finalBytes) {
		if (finalBytes) {
			while ((str.length / 2) < finalBytes) { str = "0" + str; }
		}

		var bytes = [];
		for (var i=str.length-1; i>=0; i = i-2) {
			var chars = i === 0 ? str[i] : str[i-1] + str[i];
			bytes.unshift(parseInt(chars, 16));
		}

		return bytes;
	}

	function translateTickTime(ticks) {

		var buffer = ticks & 0x7F;

		while (ticks = ticks >> 7) {
			buffer <<= 8;
			buffer |= ((ticks & 0x7F) | 0x80);
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