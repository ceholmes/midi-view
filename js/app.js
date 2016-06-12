var Midi = Midi || {};

Midi.Reader = function () {

    var self = this;

    // load file
    this.loadFile = function (file, callback) {

        var reader = new FileReader();

        reader.onload = function (event) {
            var midi = self.loadBuffer(event.target.result);
            midi.info.fileName = file.name.toLowerCase();
            callback(midi);
        };

        reader.readAsArrayBuffer(file);
    };

    // load arraybuffer
    this.loadBuffer = function (buffer) {

        // read midi
        var reader = new Midio.Reader();
        var midi = reader.read(buffer);                
                                              
        // get tempo
        var tempo = midi.tracks[0].filter(function(m){return m.type === 'set-tempo';})[0] || null;
        tempo = tempo || { microsecondsPerBeat: (60000000 / 120) };
                                                                 
        // get time signature
        var timeSignature = midi.tracks[0].filter(function(m){return m.type === 'time-signature';})[0] || null;
        timeSignature = timeSignature || { numerator: 4, denominator: 4 };
        
        // calc info
        var mcsPerBeat = tempo.microsecondsPerBeat;
        var beatsPerMeasure = timeSignature.numerator;
        var beatsPerMin = Math.floor(60000000 / mcsPerBeat);
        var ticksPerBeat = midi.header.timeDivision;
        var ticksPerMin = ticksPerBeat * beatsPerMin;
        var mcsPerTick = Math.floor(60000000 / ticksPerMin);
        var mlsPerTick = Math.floor(mcsPerTick / 1000);
                
        midi.info = {            
            formatType : midi.header.type,
            trackCount : midi.header.trackCount,
            ticksPerBeat : midi.header.timeDivision,                        		        
            mcsPerBeat : mcsPerBeat,
            beatsPerMeasure : beatsPerMeasure,
            beatsPerMin : beatsPerMin,
            ticksPerMin : ticksPerMin,
            mcsPerTick : mcsPerTick,
            mlsPerTick : mlsPerTick,
            timeSignature : timeSignature                        
        };
                
        midi.tracks.forEach(function(track, index){                        
            var total = 0;            
            track.forEach(function(event){
                total = total + event.delta;
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

    return this;
} ();