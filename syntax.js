
function createMidi() {

	var file = new Midi.File({type:1, ticksPerBeat:240});

	var track = new Midi.Track();

	track.addNote({
		channel: 0,
		note: "C3",
		velocity: 128,
		duration: 1
	});


	track.add(createNoteEvents(0, "C3", 128, 1));

	track = [

		{type: events.text, text: "Text"},
		{type: events.copyright, text: "Copyright"},
		{type: events.trackName, text: "Track Name"},
		{type: events.instrument, text: "Instrument"},
		{type: events.lyrics, text: "Lyrics"},
		{type: events.marker, text: "Marker"},
		{type: events.cuePoint, text: "Cue Point"},

		{type: events.tempo, mcsPerBeat: 400000},

		{type: events.noteOn, time:0, channel:0, note:notes.C4, velocity:90},
		{type: events.noteOff, time:128, channel:0, note:notes.C4, velocity:90},

		{type:9, time:0, channel:0, note:62, velocity:90},
		{type:8, time:128, channel:0, note:62, velocity:90},

		{type:events.controller, time:0, channel:0, controller:7, value:128},
		{type:events.aftertouch, time:0, channel:0, note:62, value:64},
		{type:events.program, time:0, channel:0, value:36},
		{type:events.channelAftertouch, time:0, channel:0, value:127},
		{type:events.channelPrefix, time:0, channel:10}


	];



}