"use client"
import React, { useEffect, useState } from 'react';
import { WebMidi } from 'webmidi';
import { Piano, KeyboardShortcuts, MidiNumbers } from 'react-piano';
import * as Tone from 'tone';
import 'react-piano/dist/styles.css';
import styles from '../styles/Home.module.css';

const Home = () => {
  const [activeKeys, setActiveKeys] = useState([]);
  const [audioStarted, setAudioStarted] = useState(false);
  const synth = new Tone.PolySynth(Tone.Synth).toDestination();

  useEffect(() => {
    WebMidi.enable((err) => {
      if (err) {
        console.error('WebMidi could not be enabled.', err);
      } else {
        console.log('WebMidi enabled!');

        const inputs = WebMidi.inputs;
        inputs.forEach((device, index) => {
          console.log(`${index}: ${device.name}`)
          console.log('device :>> ', device);
        })

        const input = inputs[0];
        if (input) {
          input.addListener('noteon', 'all', (e) => {
            handleNoteOn(e.note.number);
          });

          input.addListener('noteoff', 'all', (e) => {
            handleNoteOff(e.note.number);
          });
        } else {
          console.log('No MIDI input devices found.');
        }
      }
    });

    return () => {
      WebMidi.inputs.forEach((input) => {
        input.removeListener('noteon');
        input.removeListener('noteoff');
      });
    };
  }, []);

  const handleNoteOn = (noteNumber) => {
    console.log('noteNumber :>> ', noteNumber);
    setActiveKeys((prevKeys) => [...prevKeys, noteNumber]);
    // synth.triggerAttack(Tone.Frequency(noteNumber, "midi").toFrequency());
  };

  const handleNoteOff = (noteNumber) => {
    setActiveKeys((prevKeys) => prevKeys.filter((key) => key !== noteNumber));
    synth.triggerRelease(Tone.Frequency(noteNumber, "midi").toFrequency());
  };


  useEffect(() => {
    synth.triggerAttack(Tone.Frequency(activeKeys[activeKeys.length - 1], "midi").toFrequency())
    return () => {

      synth.triggerRelease(Tone.Frequency(activeKeys[activeKeys.length - 1], "midi").toFrequency());

    }
  }, [activeKeys])



  // const startAudio = async () => {
  //   await Tone.start();
  //   setAudioStarted(true);
  //   console.log('Audio started');
  //   await Tone.stop()
  //   setAudioStarted(false);
  // };

  const startAudio = async () => {
    await Tone.start();
    setAudioStarted(true);
    console.log('Audio started');
  };


  const noteRangeKeyB = {
    first: MidiNumbers.fromNote('c4'),
    last: MidiNumbers.fromNote('c6'),
  };
  const noteRange = {
    first: MidiNumbers.fromNote('a0'),
    last: MidiNumbers.fromNote('c8'),
  };

  const keyboardShortcuts = KeyboardShortcuts.create({
    firstNote: noteRangeKeyB.first,
    lastNote: noteRangeKeyB.last,
    keyboardConfig: KeyboardShortcuts.HOME_ROW,
  });

  return (
    <div className={styles.container}>
      <h1>Virtual Piano</h1>
      {!audioStarted && (
        <button onClick={startAudio}>Start Audio</button>
      )}
      <Piano
        noteRange={noteRange}
        playNote={(midiNumber) => {
          console.log('playing note :>> ', midiNumber);
          handleNoteOn(midiNumber);
        }}
        stopNote={(midiNumber) => {
          console.log('stopping note :>> ', midiNumber);
          handleNoteOff(midiNumber);
        }}
        activeNotes={activeKeys}
        width={1000}
        keyboardShortcuts={keyboardShortcuts}
      />
    </div>
  );
};

export default Home;