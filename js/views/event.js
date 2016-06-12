var Midi = Midi || {};
Midi.Views = Midi.Views || {};

Midi.Views.EventView = Backbone.View.extend({

    initialize: function (options) {

        this.options = _.extend(this.defaults, options);
        this.options.types = _.extend(this.defaults.types, options.types);
        this.options.events = _.extend(this.defaults.events, options.events);
        this.options.columns = _.extend(this.defaults.columns, options.columns);
    },

    render: function (midi) {

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
        this.model.tracks.forEach(function (track, index) {

            // events			
            track.forEach(function (event) {

            if (((self.options.types.meta && event.channel === undefined) ||
                    (self.options.types.channel && event.channel !== undefined)) &&
                    (self.options.events[event.type] === true)) {

                    var isChannel = (event.channel !== undefined);

                    var row = $("<tr></tr>");

                    row.addClass((isChannel) ? 'channel' : 'meta');
                    row.addClass(event.type);

                    row.append("<td>" + (event.delta || 0) + "</td>");
                    row.append("<td>" + index + "</td>");
                    row.append("<td>" + (isChannel ? event.channel : "-") + "</td>");

                    var eventHtml = "<span>" + midiTypes[event.type] + "</span>";

                    switch (event.type) {
                        case "text":
                        case "copyright":
                        case "track-name":
                        case "instrument":
                        case "lyrics":
                        case "marker":
                        case "cue-point":
                            eventHtml += ("<span>" + event.text + "<span>");
                            break;

                        case "note-on":
                        case "note-off":
                            if (self.options.noteNames) {
                                var name = (event.channel == 9) ? percussion[event.note].toLowerCase() : notes[event.note];
                                eventHtml += "<span>note: " + name + "</span>";
                            }
                            else {
                                eventHtml += "<span>note: " + event.note + "</span>";
                            }
                            eventHtml += "<span>velocity: " + event.velocity + "</span>";
                            break;

                        case "note-aftertouch":
                            eventHtml += "<span>note: " + notes[event.note] + "</span>";
                            eventHtml += "<span>value: " + event.amount + "</span>";
                            break;

                        case "controller":
                            eventHtml += "<span title='" + controllers[event.controllerType] + "'>control: " + event.controllerType + "</span>";
                            eventHtml += "<span>value: " + event.value + "</span>";
                            break;

                        case "program-change":
                            eventHtml += "<span>" + instruments[event.programNumber] + "</span>";
                            break;

                        case "channel-aftertouch":
                            eventHtml += "<span>value: " + event.amount + "</span>";
                            break;

                        case "pitch-bend":
                            eventHtml += "<span>value: " + event.value + "</span>";
                            break;

                        case "channel-prefix":
                            eventHtml += "<span>channel: " + event.channelNumber + "</span>";
                            break;

                        case "set-tempo":
                            eventHtml += "<span>" + event.microsecondsPerBeat + " mpb</span>";
                            break;

                        case "smpte-offset":
                            eventHtml += "<span>frame rate:" + event.frameRate + " fps</span>";
                            break;

                        case "time-signature":
                            eventHtml += "<span>" + event.numerator + "/" + event.denominator + "</span>";
                            break;

                        case "key-signature":
                            eventHtml += "<span>" + "scale: " + event.scale + "&nbsp;&nbsp;" + "key: " + event.key + " " + "</span>";
                            break;

                        case "sequence":
                            break;
                    }

                    row.append("<td>" + eventHtml + "</td>");
                    $(tbody).append(row);
                }

            });
        });

        $(this.el).append(tbody);
    },

    defaults: {
        "noteNames": true,

        columns: {
            "track": true,
            "delta": true,
            "channel": true,
            "type": true,
            "event": true,
            "data": true
        },

        types: {
            "meta": true,
            "channel": true
        },

        events: {
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
            "channel-prefix": true,
            "end-track": true,
            "set-tempo": true,
            "smpte-offset": true,
            "time-signature": true,
            "key-signature": true,
            "sequence": true
        }
    },

    midiTypes: {

        // types
        "meta": "meta",
        "channel": "chan",

        "text": "Text",
        "copyright": "Copyright",
        "track-name": "Track Name",
        "instrument": "Instrument.",
        "lyrics": "lyrics",
        "marker": "Marker",
        "cue-point": "Cue",
        "note-on": "Note On",
        "note-off": "Note Off",
        "note-aftertouch": "Key Pressure",
        "controller": "Controller",
        "program-change": "Program",
        "channel-aftertouch": "Channel Pressure",
        "pitch-bend": "Pitch Bend",
        "channel-prefix": "Channel Prefix",
        "end-track": "End of Track",
        "set-tempo": "Tempo",
        "smpte-offset": "SMTP",
        "time-signature": "Time Signature",
        "key-signature": "Key Signature",
        "sequence": "Sequence"
    }

});
