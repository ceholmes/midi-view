

```javascript

var track = {};

track.msgs = [
        
    // meta events
    { cmd: 'text',       text: 'powered by midio' },
    { cmd: 'copyright',  text: 'sojera' },
    { cmd: 'track-name', text: 'The Track' }        
    { cmd: 'instrument', text: 'Instrument' },
    { cmd: 'lyrics',     text: 'Lyrics' },    
    { cmd: 'marker',     text: 'Marker' },
    { cmd: 'cue-point',  text: 'Cue Point' },
    
    { cmd: 'tempo', mcsPerBeat: 400000 },
    { cmd: 'time-signature', numerator: 6, denominator: 8, metronome: 24, thirtyseconds: 8 },

    // track events
    { cmd: 'note-on',  time: 0,   channel: 0, note: 'c4', velocity: 90 },
    { cmd: 'note-off', time: 128, channel: 0, note: 'c4', velocity: 90 },

    { cmd: 'note-on',  time:0,    channel: 0, note: 62, velocity: 90 },
    { cmd: 'note-off', time:128,  channel: 0, note: 62, velocity: 90 },

    { cmd: 'controller', time: 0, channel: 0, controller: 7, value: 128 },
    { cmd: 'aftertouch', time: 0, channel: 0, note: 62, value: 64 },
    
    { cmd: 'program', time: 0, channel: 0, value: 36 },
    { cmd: 'channel-aftertouch', time: 0, channel: 0, value: 127 },
    { cmd: 'channel-prefix', time: 0, channel: 10 }
]

```