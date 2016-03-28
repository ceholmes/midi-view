var Midi = Midi || {};
Midi.Enums = Midi.Enums || {};

Midi.Enums.Events = {
        
	"sequence": 0x00,
	"text": 0x01,
	"copyright": 0x02,
	"track-name": 0x03,
	"instrument": 0x04,
	"lyrics": 0x05,
	"marker": 0x06,
	"cue-point": 0x07,
	"note-off": 0x8,
	"note-on": 0x9,
	"note-aftertouch": 0xA,
	"controller": 0xB,
	"program": 0xC,
	"channel-aftertouch": 0xD,
	"pitch-bend": 0xE,
	"channel-prefix": 0x20,
	"end-of-track": 0x2f,
	"tempo": 0x51,
	"smpte": 0x54,
	"time-signature": 0x58,
	"key-signature": 0x59    
};

// midi event map
Midi.stores = Midi.stores || {};

Midi.stores.events ={
     
    data: [        
        { name: "sequence", value: 0x00 },
        { name: "text", value: 0x01 },
        { name: "copyright", value: 0x02 },
        { name: "track-name", value: 0x03 },
        { name: "instrument", value: 0x04 },
        { name: "lyrics", value: 0x05 },
        { name: "marker", value: 0x06 },
        { name: "cue-point", value: 0x07 },
        { name: "note-off", value: 0x8 },
        { name: "note-on", value: 0x9 },    
        { name: "note-aftertouch", value: 0xA },
        { name: "controller", value: 0xB },
        { name: "program", value: 0xC },
        { name: "channel-aftertouch", value: 0xD },
        { name: "pitch-bend", value: 0xE },
        { name: "channel-prefix", value : 0x20 },
        { name: "end-of-track", value: 0x2f },
        { name: "tempo", value: 0x51 },
        { name: "smpte", value: 0x54 },
        { name: "time-signature", value: 0x58 },
        { name: "key-signature", value: 0x59 }    
    ],
    
    find: function (propertyName, propertyValue ) {
        
        var results = this.data.filter(function (e, index) {
            return (e[propertyName] === propertyValue);
        });
        
        return results[0] || null; 
    }
    
    
};

