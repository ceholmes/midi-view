var Midi = Midi || {};
Midi.Views = Midi.Views || {};

Midi.Views.InfoView = Backbone.View.extend({

	render: function(midi) {

		this.$(".fileName").html(midi.info.fileName);

		this.$(".formatType").html(midi.info.formatType);
		this.$(".trackCount").html(midi.info.trackCount);
		this.$(".timeSig").html(midi.info.timeSignature.numerator + "/" +
			midi.info.timeSignature.denominator);

		this.$(".beatsPerMin").html(midi.info.beatsPerMin);
		this.$(".ticksPerBeat").html(midi.info.ticksPerBeat);

		this.$(".mcsPerBeat").html(midi.info.mcsPerBeat);
		this.$(".ticksPerMin").html(midi.info.ticksPerMin);
		this.$(".mcsPerTick").html(midi.info.mcsPerTick);
		this.$(".mlsPerTick").html(midi.info.mlsPerTick);

		$(this.el).css("visibility", "visible");
	}
});