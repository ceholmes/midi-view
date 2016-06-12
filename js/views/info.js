var MidiView = MidiView || {};
MidiView.views = MidiView.views || {};

MidiView.views.Info = function(el) {

    var _el = $(el);
    
    return {
        render : render	
    };

    function render(midi) {

        _el.find(".fileName").html(midi.info.fileName);
        _el.find(".formatType").html(midi.info.formatType);
        _el.find(".trackCount").html(midi.info.trackCount);
        _el.find(".timeSig").html(midi.info.timeSignature.numerator + 
            "/" + midi.info.timeSignature.denominator);

        _el.find(".beatsPerMin").html(midi.info.beatsPerMin);
        _el.find(".ticksPerBeat").html(midi.info.ticksPerBeat);
        _el.find(".mcsPerBeat").html(midi.info.mcsPerBeat);
        _el.find(".ticksPerMin").html(midi.info.ticksPerMin);
        _el.find(".mcsPerTick").html(midi.info.mcsPerTick);
        _el.find(".mlsPerTick").html(midi.info.mlsPerTick);

        _el.css("visibility", "visible");
    }
};