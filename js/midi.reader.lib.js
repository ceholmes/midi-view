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

			// meta 
			if (eventTypeByte == 0xff) {

				/* meta event */
				var eventByte = stream.readInt8();
				length = stream.readVarInt();

                //event.type = Midi.stores.events.find('value', eventByte).name;
                
				switch(eventByte) {
					case 0x00:  // sequence-number
						event.type = 'sequence-number';
						if (length != 2) throw "Expected length for sequence-number event is 2, got " + length;
						event.number = stream.readInt16();
						return event;
                        
					case 0x01:  // text
						event.type = 'text';
						event.text = stream.read(length);
						return event;
					case 0x02:  // copyright
						event.type = 'copyright';
						event.text = stream.read(length);
						return event;
					case 0x03:  // track name
						event.type = 'track-name';
						event.text = stream.read(length);
						return event;
					case 0x04:  // instrument
						event.type = 'instrument';
						event.text = stream.read(length);
						return event;
					case 0x05:  // lyrics
						event.type = 'lyrics';
						event.text = stream.read(length);
						return event;
					case 0x06:  // marker
						event.type = 'marker';
						event.text = stream.read(length);
						return event;
					case 0x07:  // cue point
						event.type = 'cue-point';
						event.text = stream.read(length);
						return event;
                                                
					case 0x20:  // midi channel prefix
						event.type = 'midi-channel-prefix';
						if (length != 1) throw "Expected length for midi-channel-prefix event is 1, got " + length;
						event.channel = stream.readInt8();
						return event;
                        
					case 0x2f:  // end of track
						event.type = 'end-of-track';
						if (length !== 0) throw "Expected length for end-of-track event is 0, got " + length;
						return event;
                        
					case 0x51:
						event.type = 'set-tempo';
						if (length != 3) throw "Expected length for set-tempo event is 3, got " + length;
						event.microsecondsPerBeat = (
							(stream.readInt8() << 16) +
							(stream.readInt8() << 8) +
							stream.readInt8()
						);
						return event;
					case 0x54:
						event.type = 'smpte-offset';
						if (length != 5) throw "Expected length for smpte-offset event is 5, got " + length;
						var hourByte = stream.readInt8();
						event.frameRate = { 0x00: 24, 0x20: 25, 0x40: 29, 0x60: 30 }[hourByte & 0x60];
						event.hour = hourByte & 0x1f;
						event.min = stream.readInt8();
						event.sec = stream.readInt8();
						event.frame = stream.readInt8();
						event.subframe = stream.readInt8();
						return event;
					case 0x58:
						event.type = 'time-signature';
						if (length != 4) throw "Expected length for time-signature event is 4, got " + length;
						event.numerator = stream.readInt8();
						event.denominator = Math.pow(2, stream.readInt8());
						event.metronome = stream.readInt8();
						event.thirtyseconds = stream.readInt8();
						return event;
					case 0x59:
						event.type = 'key-signature';
						if (length != 2) throw "Expected length for key-signature event is 2, got " + length;
						event.key = stream.readInt8();
						event.scale = stream.readInt8();
						return event;
					case 0x7f:
						event.type = 'sequencer-specific';
						event.data = stream.read(length);
						return event;
                        
					default:
						// console.log("Unrecognised meta event type: " + eventByte);
						event.type = 'unknown';
						event.data = stream.read(length);
						return event;
				}

			} 
            // system-exclusive
            else if (eventTypeByte == 0xf0) {
				event.type = 'system-exclusive';
				length = stream.readVarInt();
				event.data = stream.read(length);
				return event;

			} 
            // devided-system-exclusive
            else if (eventTypeByte == 0xf7) {
				event.type = 'divided-system-exclusive';
				length = stream.readVarInt();
				event.data = stream.read(length);
				return event;

			} else {
				throw "Unrecognised MIDI event type byte: " + eventTypeByte;
			}

		/* channel */
		} else {

			var param1;

			if ((eventTypeByte & 0x80) === 0) {
				// running status - reuse lastEventTypeByte as the event type.
				// eventTypeByte is actually the first parameter				
				param1 = eventTypeByte;
				eventTypeByte = lastEventTypeByte;
			} else {
				param1 = stream.readInt8();
				lastEventTypeByte = eventTypeByte;
			}

			var eventType = eventTypeByte >> 4;
			event.channel = eventTypeByte & 0x0f;

			switch (eventType) {
				case 0x08:
					event.type = 'note-off';
					event.note = param1;
					event.velocity = stream.readInt8();
					return event;
				case 0x09:
					event.note = param1;
					event.velocity = stream.readInt8();
                    event.type = (event.velocity === 0) ? 'note-off' : 'note-on';					
					return event;
				case 0x0a:
					event.type = 'note-aftertouch';
					event.note = param1;
					event.amount = stream.readInt8();
					return event;
				case 0x0b:
					event.type = 'controller';
					event.controllerType = param1;
					event.value = stream.readInt8();
					return event;
				case 0x0c:
					event.type = 'program-change';
					event.programNumber = param1;
					return event;
				case 0x0d:
					event.type = 'channel-aftertouch';
					event.amount = param1;
					return event;
				case 0x0e:
					event.type = 'pitch-bend';
					event.value = param1 + (stream.readInt8() << 7);
					return event;
				default:
					throw "Unrecognised MIDI event type: " + eventType;
					/*
					console.log("Unrecognised MIDI event type: " + eventType);
					stream.readInt8();
					event.type = 'unknown';
					return event;
					*/
			}
		}
	}


}