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
						case "copyright":
						case "track-name":
						case "instrument":
						case "lyrics":
						case "marker":
						case "cue-point":
							$("<td colspan='2'>" + event.text + "</td>").appendTo(row);
							break;

						case "note-on":
						case "note-off":
							if (self.options.noteNames) {
								var name = (event.channel == 9) ? percussion[event.noteNumber].toLowerCase() : notes[event.noteNumber];
								$("<td>" + name + "</td><td>vel: " + event.velocity + "</td>").appendTo(row);
							}
							else {
								$("<td>note: " + event.noteNumber + "</td><td>vel: " + event.velocity + "</td>").appendTo(row);
							}
							break;

						case "note-after-touch":
							$("<td>" + notes[event.noteNumber] + "</td>" + "<td>val: " + event.amount + "</td>").appendTo(row);
							break;

						case "controller":
							$("<td title='" + controllers[event.controllerType] + "'>num: " + event.controllerType + "</td>" +
								"<td>val: " + event.value + "</td>").appendTo(row);
							break;

						case "program-change":
							$("<td colspan='2'>" + instruments[event.programNumber] + "</td>").appendTo(row);
							break;

						case "channel-aftertouch":
							$("<td colspan='2'>" + event.amount + "</td>").appendTo(row);
							break;

						case "pitch-bend":
							break;

						case "midi-channel-prefix":
							$("<td colspan='2'>" + event.channel + "</td>").appendTo(row);
							break;

						case "end-of-track" :
							$("<td colspan='2'>-</td>").appendTo(row);
							break;

						case "set-tempo":
							$("<td colspan='2'>" + event.microsecondsPerBeat + " mpb</td>").appendTo(row);
							break;

						case "smpte-offset":
							$("<td colspan='2'>" + event.frameRate + " fps</td>").appendTo(row);
							break;

						case "time-signature":
							$("<td colspan='2'>" + event.numerator + "/" + event.denominator  + "</td>").appendTo(row);
							break;

						case "key-signature":
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
		"noteNames" : true,

		columns : {
			"track": true,
			"delta": true,
			"channel": true,
			"type": true,
			"command": true,
			"data": true
		},

		types: {
			"meta": true,
			"channel": true
		},

		commands: {
			"text": true,
			"copyright": true,
			"track-name": true,
			"instrument": true,
			"lyrics": true,
			"marker": true,
			"cue-point": true,
			"note-on": true,
			"note-off": true,
			"note-aftertouch": true,
			"controller": true,
			"program-change": true,
			"channel-aftertouch": true,
			"pitch-bend": true,
			"midi-channel-prefix": true,
			"end-of-track": true,
			"set-tempo": true,
			"smpte-offset": true,
			"time-signature": true,
			"key-signature": true,
			"sequence": true
		}
	},

	midiTypes : {

		// types
		"meta":    "meta",
		"channel": "chan",

		// commands
		"text":                "text",
		"copyright":           "copyright",
		"track-name":          "trk name",
		"instrument":          "Inst",
		"lyrics":              "lyrics",
		"marker":              "marker",
		"cue-point":           "cue",
		"note-on":             "note on",
		"note-off":            "note off",
		"note-aftertouch":     "after touch",
		"controller":          "controller",
		"program-change":      "program",
		"channel-aftertouch":  "ch aftertouch",
		"pitch-bend":          "pitch bend",
		"midi-channel-prefix": "ch prefix",
		"end-of-track":        "trk end",
		"set-tempo":           "tempo",
		"smpte-offset":        "smtp",
		"time-signature":      "time sig",
		"key-signature":       "key sig",
		"sequence":            "sequence"
	}
    
});
