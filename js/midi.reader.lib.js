/* class to parse the .mid file format (depends on stream.js) */

function MidiFile(data) {


	var lastEventTypeByte;

	// create stream
	stream = Stream(data);


	// read header
	var headerChunk = readChunk(stream);

    if (headerChunk.id != 'MThd' || headerChunk.length != 6) {
		throw "Bad .mid file - header not found";
	}

    var headerStream = Stream(headerChunk.data);
	var formatType = headerStream.readInt16();
	var trackCount = headerStream.readInt16();
	var timeDivision = headerStream.readInt16();

	if (timeDivision & 0x8000) {
		throw "Time division in SMTPE not supported";
	} else {
		ticksPerBeat = timeDivision;
	}

	var header = {
		'formatType': formatType,
		'trackCount': trackCount,
		'ticksPerBeat': ticksPerBeat
	};


	// read tracks
    var tracks = [];

    for (var i = 0; i < header.trackCount; i++) {

		tracks[i] = [];
		var trackChunk = readChunk(stream);

		if (trackChunk.id != 'MTrk') {
			throw "Unexpected chunk - expected MTrk, got "+ trackChunk.id;
		}

		var trackStream = Stream(trackChunk.data);

		while (!trackStream.eof()) {
			var event = readEvent(trackStream);
			tracks[i].push(event);
		}
	}

	return {
		'header': header,
		'tracks': tracks
	};



	function readChunk(stream) {
		var id = stream.read(4);
		var length = stream.readInt32();
		return {
			'id': id,
			'length': length,
			'data': stream.read(length)
		};
	}


	function readEvent(stream) {

		var event = {};
		event.deltaTime = stream.readVarInt();
		var eventTypeByte = stream.readInt8();

		if ((eventTypeByte & 0xf0) == 0xf0) {

			var length = null;

			/* system / meta event */
			if (eventTypeByte == 0xff) {

				/* meta event */
				event.type = 'meta';
				var commandByte = stream.readInt8();
				length = stream.readVarInt();

				switch(commandByte) {
					case 0x00:
						event.command = 'sequenceNumber';
						if (length != 2) throw "Expected length for sequenceNumber event is 2, got " + length;
						event.number = stream.readInt16();
						return event;
					case 0x01:
						event.command = 'text';
						event.text = stream.read(length);
						return event;
					case 0x02:
						event.command = 'copyrightNotice';
						event.text = stream.read(length);
						return event;
					case 0x03:
						event.command = 'trackName';
						event.text = stream.read(length);
						return event;
					case 0x04:
						event.command = 'instrumentName';
						event.text = stream.read(length);
						return event;
					case 0x05:
						event.command = 'lyrics';
						event.text = stream.read(length);
						return event;
					case 0x06:
						event.command = 'marker';
						event.text = stream.read(length);
						return event;
					case 0x07:
						event.command = 'cuePoint';
						event.text = stream.read(length);
						return event;
					case 0x20:
						event.command = 'midiChannelPrefix';
						if (length != 1) throw "Expected length for midiChannelPrefix event is 1, got " + length;
						event.channel = stream.readInt8();
						return event;
					case 0x2f:
						event.command = 'endOfTrack';
						if (length !== 0) throw "Expected length for endOfTrack event is 0, got " + length;
						return event;
					case 0x51:
						event.command = 'setTempo';
						if (length != 3) throw "Expected length for setTempo event is 3, got " + length;
						event.microsecondsPerBeat = (
							(stream.readInt8() << 16) +
							(stream.readInt8() << 8) +
							stream.readInt8()
						);
						return event;
					case 0x54:
						event.command = 'smpteOffset';
						if (length != 5) throw "Expected length for smpteOffset event is 5, got " + length;
						var hourByte = stream.readInt8();
						event.frameRate = {
							0x00: 24, 0x20: 25, 0x40: 29, 0x60: 30
						}[hourByte & 0x60];
						event.hour = hourByte & 0x1f;
						event.min = stream.readInt8();
						event.sec = stream.readInt8();
						event.frame = stream.readInt8();
						event.subframe = stream.readInt8();
						return event;
					case 0x58:
						event.command = 'timeSignature';
						if (length != 4) throw "Expected length for timeSignature event is 4, got " + length;
						event.numerator = stream.readInt8();
						event.denominator = Math.pow(2, stream.readInt8());
						event.metronome = stream.readInt8();
						event.thirtyseconds = stream.readInt8();
						return event;
					case 0x59:
						event.command = 'keySignature';
						if (length != 2) throw "Expected length for keySignature event is 2, got " + length;
						event.key = stream.readInt8();
						event.scale = stream.readInt8();
						return event;
					case 0x7f:
						event.command = 'sequencerSpecific';
						event.data = stream.read(length);
						return event;
					default:
						// console.log("Unrecognised meta event command: " + commandByte);
						event.command = 'unknown';
						event.data = stream.read(length);
						return event;
				}

                event.data = stream.read(length);
				return event;

			} else if (eventTypeByte == 0xf0) {
				event.type = 'sysEx';
				length = stream.readVarInt();
				event.data = stream.read(length);
				return event;

			} else if (eventTypeByte == 0xf7) {
				event.type = 'dividedSysEx';
				length = stream.readVarInt();
				event.data = stream.read(length);
				return event;

			} else {
				throw "Unrecognised MIDI event type byte: " + eventTypeByte;
			}


		/* channel event */
		} else {

			var param1;

			if ((eventTypeByte & 0x80) === 0) {
				/* running status - reuse lastEventTypeByte as the event type.
					eventTypeByte is actually the first parameter
				*/
				param1 = eventTypeByte;
				eventTypeByte = lastEventTypeByte;
			} else {
				param1 = stream.readInt8();
				lastEventTypeByte = eventTypeByte;
			}

			var eventType = eventTypeByte >> 4;
			event.channel = eventTypeByte & 0x0f;
			event.type = 'channel';

			switch (eventType) {
				case 0x08:
					event.command = 'noteOff';
					event.noteNumber = param1;
					event.velocity = stream.readInt8();
					return event;
				case 0x09:
					event.noteNumber = param1;
					event.velocity = stream.readInt8();
					if (event.velocity === 0) {
						event.command = 'noteOff';
					} else {
						event.command = 'noteOn';
					}
					return event;
				case 0x0a:
					event.command = 'noteAftertouch';
					event.noteNumber = param1;
					event.amount = stream.readInt8();
					return event;
				case 0x0b:
					event.command = 'controller';
					event.controllerType = param1;
					event.value = stream.readInt8();
					return event;
				case 0x0c:
					event.command = 'programChange';
					event.programNumber = param1;
					return event;
				case 0x0d:
					event.command = 'channelAftertouch';
					event.amount = param1;
					return event;
				case 0x0e:
					event.command = 'pitchBend';
					event.value = param1 + (stream.readInt8() << 7);
					return event;
				default:
					throw "Unrecognised MIDI event type: " + eventType;
					/*
					console.log("Unrecognised MIDI event type: " + eventType);
					stream.readInt8();
					event.command = 'unknown';
					return event;
					*/
			}
		}
	}


}