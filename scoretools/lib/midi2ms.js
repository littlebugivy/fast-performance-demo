// Generated by CoffeeScript 1.11.1
(function() {
  var deltaTime, dt, event, file, fs, i, j, k, len, len1, len2, mapi, microseconds, microsecondsPerBeat, midi, midiFileParser, midifilein, midifileout, midiout, output, outputBuffer, ref, ref1, tempomap, ticksPerBeat, timeMicroseconds, timeTicks, track, trackout, writeMidi, writtenTempo;

  if (process.argv.length !== 4) {
    console.error('Usage: node readmidi.js MIDIFILEIN MIDIFILEOUT');
    process.exit(-1);
  }

  midiFileParser = require('midi-file').parseMidi;

  writeMidi = require('midi-file').writeMidi;

  fs = require('fs');

  midifilein = process.argv[2];

  midifileout = process.argv[3];

  console.log('read ' + midifilein);

  file = fs.readFileSync(midifilein);

  midi = midiFileParser(file);

  if (!midi.header.ticksPerBeat) {
    console.error('File is not beat-based: ' + (JSON.stringify(midi.header)));
    process.exit(-2);
  }

  ticksPerBeat = midi.header.ticksPerBeat;

  microsecondsPerBeat = 500000;

  delete midi.header.ticksPerBeat;

  midi.header.ticksPerFrame = 40;

  midi.header.framesPerSecond = 25;

  midiout = {
    header: midi.header,
    tracks: []
  };

  tempomap = [];

  tempomap.push({
    timeTicks: 0,
    timeMicroseconds: 0,
    microsecondsPerBeat: microsecondsPerBeat
  });

  if (midi.tracks.length === 0) {
    console.error('ERROR: file contains no tracks');
  } else {
    console.log('reading tempo information from first track');
    timeMicroseconds = 0;
    timeTicks = 0;
    ref = midi.tracks[0];
    for (i = 0, len = ref.length; i < len; i++) {
      event = ref[i];
      if (event.deltaTime != null) {
        timeTicks += event.deltaTime;
        microseconds = Math.round(microsecondsPerBeat * event.deltaTime / ticksPerBeat);
        timeMicroseconds += microseconds;
      } else {
        console.log(event);
      }
      if (event.type === 'setTempo') {
        microsecondsPerBeat = event.microsecondsPerBeat;
        console.log('at ' + (timeMicroseconds / 1000000) + ' tempo now ' + microsecondsPerBeat + 'us/beat = ' + (60000000 / microsecondsPerBeat) + ' bpm');
        tempomap.push({
          timeTicks: timeTicks,
          timeMicroseconds: timeMicroseconds,
          microsecondsPerBeat: microsecondsPerBeat
        });
      }
    }
  }

  ref1 = midi.tracks;
  for (j = 0, len1 = ref1.length; j < len1; j++) {
    track = ref1[j];
    trackout = [];
    midiout.tracks.push(trackout);
    mapi = 0;
    timeTicks = 0;
    timeMicroseconds = 0;
    microsecondsPerBeat = tempomap[mapi++].microsecondsPerBeat;
    writtenTempo = false;
    for (k = 0, len2 = track.length; k < len2; k++) {
      event = track[k];
      if (event.deltaTime != null) {
        deltaTime = event.deltaTime;
        microseconds = 0;
        while (deltaTime > 0) {
          if (mapi < tempomap.length && timeTicks + deltaTime >= tempomap[mapi].timeTicks) {
            dt = tempomap[mapi].timeTicks - timeTicks;
            if (dt > 0) {
              microseconds += microsecondsPerBeat * dt / ticksPerBeat;
              deltaTime -= dt;
              timeTicks += dt;
            }
            microsecondsPerBeat = tempomap[mapi++].microsecondsPerBeat;
            continue;
          }
          microseconds += microsecondsPerBeat * deltaTime / ticksPerBeat;
          timeTicks += deltaTime;
          break;
        }
        microseconds = Math.round(microseconds);
        event.deltaTime = Math.floor((microseconds + (timeMicroseconds % 1000)) / 1000);
        timeMicroseconds += microseconds;
      } else {
        console.log('no deltaTime: ' + event);
      }
      if (event.type === 'setTempo') {
        microsecondsPerBeat = event.microsecondsPerBeat;
        console.log('check: at ' + (timeMicroseconds / 1000000) + ' tempo now ' + microsecondsPerBeat + 'us/beat = ' + (60000000 / microsecondsPerBeat) + ' bpm');
      } else {
        trackout.push(event);
      }
      if (event.type === 'endOfTrack') {
        console.log('end of track: at ' + (timeMicroseconds / 1000000) + ' s = ' + timeTicks + ' ticks, average ' + (60 * timeTicks / ticksPerBeat * 1000000 / timeMicroseconds) + ' bpm');
      }
    }
  }

  console.log('ok');

  output = writeMidi(midiout);

  outputBuffer = new Buffer(output);

  console.log('writing ' + midifileout);

  fs.writeFileSync(midifileout, outputBuffer);

  console.log('done');

}).call(this);
