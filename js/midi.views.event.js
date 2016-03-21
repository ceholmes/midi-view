var Midi = Midi || {};
Midi.Views = Midi.Views || {};

Midi.Views.EventView = Backbone.View.extend({

	initialize: function (options){

		this.options = _.extend(this.defaults, options);
		this.options.types = _.extend(this.defaults.types, options.types);
		this.options.commands = _.extend(this.defaults.commands, options.commands);
		this.options.columns = _.extend(this.defaults.columns, options.columns);
	},

	render: function (midi){

		if (midi) this.model = midi;

		var self = this;

		this.$("tbody").remove();

		var midiTypes = this.midiTypes;
		var instruments = Midi.Names.Instruments;
		var percussion = Midi.Names.Percussion;
		var notes = Midi.Names.Notes("sharp");
		var controllers = Midi.Names.Controllers;

		var tbody = $("<tbody/>");

		// tracks
		_.each(this.model.tracks, function (track, index) {

			// events
			_.each(track, function (event) {

				if (self.options.types[event.type] === true && self.options.commands[event.command] === true) {

					var row = $("<tr></tr>");

					$("<td>" + index + "</td>").appendTo(row);
					$("<td>" + event.deltaTime + "</td>").appendTo(row);
					$("<td>" + midiTypes[event.type] + "</td>").appendTo(row);
					$("<td>" + ((event.type == "channel") ? event.channel : "-") + "</td>").appendTo(row);
					$("<td>" + (midiTypes[event.command] || event.command) + "</td>").appendTo(row);

					switch(event.command) {

						case "text":
						case "copyrightNotice":
						case "trackName":
						case "instrumentName":
						case "lyrics":
						case "marker":
						case "cuePoint":
							$("<td colspan='2'>" + event.text + "</td>").appendTo(row);
							break;

						case "noteOn":
						case "noteOff":
							if (self.options.noteNames) {
								var name = (event.channel == 9) ? percussion[event.noteNumber].toLowerCase() : notes[event.noteNumber];
								$("<td>" + name + "</td><td>vel: " + event.velocity + "</td>").appendTo(row);
							}
							else {
								$("<td>note: " + event.noteNumber + "</td><td>vel: " + event.velocity + "</td>").appendTo(row);
							}
							break;

						case "noteAftertouch":
							$("<td>" + notes[event.noteNumber] + "</td>" + "<td>val: " + event.amount + "</td>").appendTo(row);
							break;

						case "controller":
							$("<td title='" + controllers[event.controllerType] + "'>num: " + event.controllerType + "</td>" +
								"<td>val: " + event.value + "</td>").appendTo(row);
							break;

						case "programChange":
							$("<td colspan='2'>" + instruments[event.programNumber] + "</td>").appendTo(row);
							break;

						case "channelAftertouch":
							$("<td colspan='2'>" + event.amount + "</td>").appendTo(row);
							break;

						case "pitchBend":
							break;

						case "midiChannelPrefix":
							$("<td colspan='2'>" + event.channel + "</td>").appendTo(row);
							break;

						case "endOfTrack" :
							$("<td colspan='2'>-</td>").appendTo(row);
							break;

						case "setTempo":
							$("<td colspan='2'>" + event.microsecondsPerBeat + " mpb</td>").appendTo(row);
							break;

						case "smpteOffset":
							$("<td colspan='2'>" + event.frameRate + " fps</td>").appendTo(row);
							break;

						case "timeSignature":
							$("<td colspan='2'>" + event.numerator + "/" + event.denominator  + "</td>").appendTo(row);
							break;

						case "keySignature":
							$("<td colspan='2'>" + "scale: " + event.scale + "&nbsp;&nbsp;" + "key: " +
								event.key + " " + "</td>").appendTo(row);
							break;

						case "sequence":
							break;

					}

					$(tbody).append(row);
				}

			});
		});


		$(this.el).append(tbody);


	},

	defaults: {
		noteNames : true,

		columns : {
			track: true,
			delta: true,
			channel: true,
			type: true,
			command: true,
			data: true
		},

		types: {
			meta: true,
			channel: true
		},

		commands: {
			text: true,
			copyrightNotice: true,
			trackName: true,
			instrumentName: true,
			lyrics: true,
			marker: true,
			cuePoint: true,
			noteOn: true,
			noteOff: true,
			noteAftertouch: true,
			controller: true,
			programChange: true,
			channelAftertouch: true,
			pitchBend: true,
			midiChannelPrefix: true,
			endOfTrack: true,
			setTempo: true,
			smpteOffset: true,
			timeSignature: true,
			keySignature: true,
			sequence: true
		}
	},

	midiTypes : {

		// types
		meta: "meta",
		channel: "chan",

		// commands
		text: "text",
		copyrightNotice: "copyright",
		trackName: "trk name",
		instrumentName: "Inst",
		lyrics: "lyrics",
		marker: "marker",
		cuePoint: "cue",
		noteOn: "note on",
		noteOff: "note off",
		noteAftertouch: "after touch",
		controller: "controller",
		programChange: "program",
		channelAftertouch: "ch aftertouch",
		pitchBend: "pitch bend",
		midiChannelPrefix: "ch prefix",
		endOfTrack: "trk end",
		setTempo: "tempo",
		smpteOffset: "smtp",
		timeSignature: "time sig",
		keySignature: "key sig",
		sequence: "sequence"
	}

	//events: {}


});
