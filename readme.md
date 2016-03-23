### Midio
Javascript API for MIDI

```javascript

var track = {    
    name: 'The Track',
    copyright: 'Sojera',
    text: 'Powered by Midio"
};    
    
track.events = [
        
    // meta events        
    { type: 'track-name', text: 'The Track' }        
    { type: 'copyright',  text: 'Sojera' },
    { type: 'text',       text: 'Powered by Midio' },
    
    { type: 'instrument', text: 'Instrument' },
    { type: 'lyrics',     text: 'Lyrics' },    
    { type: 'marker',     text: 'Marker' },
    { type: 'cue-point',  text: 'Cue Point' },
    
    { type: 'tempo', mcsPerBeat: 400000 },
    { type: 'time-signature', numerator: 6, denominator: 8, metronome: 24, thirtyseconds: 8 },

    // track events
    { type: 'note-on',  tick: 0,   channel: 0, note: 'c4', velocity: 90 },
    { type: 'note-off', tick: 128, channel: 0, note: 'c4', velocity: 90 },

    { type: 'controller', tick: 0, channel: 0, controller: 7, value: 128 },
    { type: 'aftertouch', tick: 0, channel: 0, note: 62, value: 64 },    
    { type: 'program', tick: 0, channel: 0, value: 36 },
    
    { type: 'channel-aftertouch', tick: 0, channel: 0, value: 127 },
    { type: 'channel-prefix', tick: 0, channel: 10 }
    
    // ...
];

var sequence = {
    name: 'The Sequence',    
    tracks: [track] 
}
        
    




var event = { tick: 128, message: { type: 'note-on', tick: 0, channel: 0, note: 'c4', velocity: 90 }};
    

```