var Midi = Midi || {};
Midi.Enums = Midi.Enums || {};

Midi.Enums.Events = {
	sequence: 0x00,
	text: 0x01,
	copyright: 0x02,
	trackName: 0x03,
	instrument: 0x04,
	lyrics: 0x05,
	marker: 0x06,
	cuePoint: 0x07,
	noteOff: 0x8,
	noteOn: 0x9,
	aftertouch: 0xA,
	controller: 0xB,
	program: 0xC,
	channelAftertouch: 0xD,
	pitchBend: 0xE,
	channelPrefix: 0x20,
	endOfTrack: 0x2f,
	tempo: 0x51,
	smpte: 0x54,
	timeSig: 0x58,
	keySig: 0x59
};

