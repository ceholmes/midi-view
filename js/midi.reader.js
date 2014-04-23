var Midi = Midi || {};

Midi.Reader = function () {

    var self = this;

    // loadFile
    this.loadFile = function (file, callback) {

        var reader = new FileReader();

        reader.onload = function (event) {

            var midi = self.loadBinary(event.target.result);
            midi.info.fileName = file.name.toLowerCase();
            console.log(midi);

            callback(midi);
        };

        reader.readAsBinaryString(file);
    };

    // loadBinary
    this.loadBinary = function (binary) {

        var midi = MidiFile(binary);

                                
        var tempo, timeSignature;
                                
        for (var i = 0; i < midi.tracks[0].length; i++) {
            if (midi.tracks[0][i].subtype === 'setTempo') {
                tempo = midi.tracks[0][i]; break;
            }
        }
                                
        for (var i = 0; i < midi.tracks[0].length; i++) {
            if (midi.tracks[0][i].subtype === 'timeSignature') {
                timeSignature = midi.tracks[0][i]; break;
            }
        }
        
        tempo = tempo || { microsecondsPerBeat: (60000000 / 120) };
        timeSignature = timeSignature || { numerator: 4, denominator: 4 };
        
        
        //if (typeof (tempo) == "undefined")
        //    tempo = { microsecondsPerBeat: (60000000 / 120) };

        
        // time signature
        //var timeSignature = _.find(midi.tracks[0],
		//	function (e) { return e.subtype == 'timeSignature'; });

        //if (typeof (timeSignature) == "undefined")
        //    timeSignature = { numerator: 4, denominator: 4 };

        
        
        var mcsPerBeat = tempo.microsecondsPerBeat;
        var beatsPerMeasure = timeSignature.numerator;
        var beatsPerMin = Math.floor(60000000 / mcsPerBeat);
        var ticksPerBeat = midi.header.ticksPerBeat;
        var ticksPerMin = ticksPerBeat * beatsPerMin;
        var mcsPerTick = Math.floor(60000000 / ticksPerMin);
        var mlsPerTick = Math.floor(mcsPerTick / 1000);

                
        midi.info = {};
        midi.info.formatType = midi.header.formatType;
        midi.info.trackCount = midi.header.trackCount;
        midi.info.ticksPerBeat = midi.header.ticksPerBeat;                        		        
        midi.info.mcsPerBeat = mcsPerBeat;
        midi.info.beatsPerMeasure = beatsPerMeasure;
        midi.info.beatsPerMin = beatsPerMin;
        midi.info.ticksPerBeat = ticksPerBeat;
        midi.info.ticksPerMin = ticksPerMin;
        midi.info.mcsPerTick = mcsPerTick;
        midi.info.mlsPerTick = mlsPerTick;
        midi.info.timeSignature = timeSignature;
                
        midi.tracks.forEach(function(track, index){            
            
            var total = 0;
            
            track.forEach(function(event){
                total = total + event.deltaTime;
                event.time = {};
                event.time.ticks = total;
                event.time.mcs = total * mcsPerTick;
                event.time.hms = toHMS(event.time.mcs);
                event.time.mbt = toMBT(total, ticksPerBeat, beatsPerMeasure);
            });
        });

        return midi;
    };

    function toHMS(microseconds) {

        var r = "",
        t = (microseconds / 1000 / 1000) >> 0,
        h = (t / (60 * 60)) >> 0,
        m = ((t % (60 * 60)) / 60) >> 0,
        s = t % (60),
        ms = (((microseconds / 1000) - (h * 3600000) - (m * 60000) - (s * 1000)) + 0.5) >> 0;

        r += h > 0 ? h + ":" : "";
        r += h > 0 ? m < 10 ? "0" + m : m : m;
        r += ":";
        r += s < 10 ? "0" + s : s;
        r += ":";
        r += ms === 0 ? "000" : ms < 10 ? "00" + ms : ms < 100 ? "0" + ms : ms;

        return r;
    }

    function toMBT(totalTicks, ticksPerBeat, beatsPerBar) {

        var totalBeats = Math.floor(totalTicks / ticksPerBeat);

        var ticks = totalTicks % ticksPerBeat;
        var bars = Math.floor(totalBeats / beatsPerBar);
        var beats = totalBeats % beatsPerBar;

        return bars + "." + beats + "." + ticks;
    }

    function quantitize(midi, division) {
        // not yet implemented
    }

    // btoa() for base64

    return this;
} ();