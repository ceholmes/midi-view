var MidiView = MidiView || {};
MidiView.views = MidiView.views || {};

MidiView.views.Event = function (el) {

    var _el = $(el);    
    var _options = getDefaults();
    var _midiTypes = getMidiTypes();
    var _instruments = Midi.Names.Instruments;
    var _percussion = Midi.Names.Percussion;
    var _controllers = Midi.Names.Controllers;
    var _notes = Midi.Names.Notes("sharp");

    return {
        options : _options, 
        render : render
    };

    function render(midi) {

        _el.find("tbody").remove();

        var tbody = $("<tbody/>");

        // tracks
        midi.tracks.forEach(function (track, index) {

            // events
            track.forEach(function (event) {

                var isChannel = (event.channel !== undefined);

                if ((_options.types.meta && !isChannel) ||
                    (_options.types.channel && isChannel) &&
                    (_options.events[event.type])) {

                    var row = $("<tr></tr>");
                    row.addClass((isChannel) ? 'channel' : 'meta');
                    row.addClass(event.type);

                    row.append("<td>" + (event.delta || 0) + "</td>");
                    row.append("<td>" + index + "</td>");
                    row.append("<td>" + (isChannel ? event.channel : "-") + "</td>");
                    row.append("<td>" + buildEventHtml(event) + "</td>");

                    $(tbody).append(row);
                }
            });
        });

        _el.append(tbody);
    }

    function buildEventHtml(event) {
        
        var html = "<span>" + _midiTypes[event.type] + ":</span>";

        switch (event.type) {
            case "text":
            case "copyright":
            case "track-name":
            case "instrument":
            case "lyrics":
            case "marker":
            case "cue-point":
                html += ("<span>" + event.text + "<span>");
                break;

            case "note-on":
            case "note-off":
                if (_options.noteNames) {
                    var name = (event.channel == 9) ? _percussion[event.note].toLowerCase() : _notes[event.note];
                    html += "<span>" + name + "</span>";
                }
                else {
                    html += "<span>" + event.note + "</span>";
                }
                html += "<span>velocity: " + event.velocity + "</span>";
                break;

            case "note-aftertouch":
                html += "<span>" + _notes[event.note] + "</span>";
                html += "<span>value: " + event.amount + "</span>";
                break;

            case "controller":
                html += "<span>" + _controllers[event.controllerType] + "</span>";
                html += "<span>value: " + event.value + "</span>";
                break;

            case "program-change":
                html += "<span>" + _instruments[event.programNumber] + "</span>";
                break;

            case "channel-aftertouch":
                html += "<span>" + event.amount + "</span>";
                break;

            case "pitch-bend":
                html += "<span>" + event.value + "</span>";
                break;

            case "channel-prefix":
                html += "<span>" + event.channelNumber + "</span>";
                break;

            case "set-tempo":
                html += "<span>" + event.microsecondsPerBeat + " mpb</span>";
                break;

            case "smpte-offset":
                html += "<span>frame rate:" + event.frameRate + " fps</span>";
                break;

            case "time-signature":
                html += "<span>" + event.numerator + "/" + event.denominator + "</span>";
                break;

            case "key-signature":
                html += "<span>" + "scale: " + event.scale + "&nbsp;&nbsp;" + "key: " + event.key + " " + "</span>";
                break;

            case "sequence-number":
            html += "<span>" + event.number + "</span>";
                break;
        }
        
        return html;
    }

    function getDefaults() {
        
        return {
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
        };
    }

    function getMidiTypes() {
        
        return  {

            // types
            "meta": "meta",
            "channel": "chan",

            "text": "Text",
            "copyright": "Copyright",
            "track-name": "Track Name",
            "instrument": "Instrument.",
            "lyrics": "Lyrics",
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
            "sequence-number": "Sequence"
        };
    }

};
