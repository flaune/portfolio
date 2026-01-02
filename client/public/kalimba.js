// Kalimba Web App - Interactive Instrument
// Uses Web Audio API for realistic kalimba sounds

class Kalimba {
    constructor() {
        this.audioContext = null;
        this.tines = document.querySelectorAll('.tine');
        this.noteFrequencies = this.createNoteFrequencyMap();
        this.activeNotes = new Set();

        this.init();
    }

    init() {
        // Initialize Audio Context on first user interaction
        this.initAudioContext();

        // Set up event listeners
        this.setupTineListeners();
        this.setupKeyboardListeners();
    }

    initAudioContext() {
        // Create audio context on first interaction (required by browsers)
        const createContext = () => {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                console.log('Audio context initialized');
            }
        };

        // Initialize on first click or touch
        document.addEventListener('click', createContext, { once: true });
        document.addEventListener('touchstart', createContext, { once: true });
        document.addEventListener('keydown', createContext, { once: true });
    }

    createNoteFrequencyMap() {
        // Standard frequency map for notes (A4 = 440Hz)
        const noteFreq = {
            'C5': 523.25,
            'D5': 587.33,
            'E5': 659.25,
            'F5': 698.46,
            'G5': 783.99,
            'A5': 880.00,
            'B5': 987.77,
            'C6': 1046.50,
            'D6': 1174.66,
            'E6': 1318.51,
            'F6': 1396.91,
            'G6': 1567.98,
            'A6': 1760.00,
            'B6': 1975.53,
            'C7': 2093.00,
            'D7': 2349.32,
            'E7': 2637.02
        };
        return noteFreq;
    }

    playNote(note, tineElement) {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }

        const frequency = this.noteFrequencies[note];
        if (!frequency) return;

        // Prevent overlapping same note
        const noteKey = `${note}-${tineElement}`;
        if (this.activeNotes.has(noteKey)) return;
        this.activeNotes.add(noteKey);

        // Visual feedback
        this.animateTine(tineElement);

        // Create kalimba-like sound
        this.createKalimbaSound(frequency);

        // Clean up active note tracking
        setTimeout(() => {
            this.activeNotes.delete(noteKey);
        }, 100);
    }

    createKalimbaSound(frequency) {
        const now = this.audioContext.currentTime;
        const duration = 2.0; // Sound duration in seconds

        // Create main oscillator (fundamental frequency)
        const oscillator = this.audioContext.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, now);

        // Create second oscillator for harmonic richness
        const oscillator2 = this.audioContext.createOscillator();
        oscillator2.type = 'sine';
        oscillator2.frequency.setValueAtTime(frequency * 2, now); // Octave up

        // Create third oscillator for metallic shimmer
        const oscillator3 = this.audioContext.createOscillator();
        oscillator3.type = 'triangle';
        oscillator3.frequency.setValueAtTime(frequency * 3, now);

        // Create gain nodes for each oscillator
        const gain1 = this.audioContext.createGain();
        const gain2 = this.audioContext.createGain();
        const gain3 = this.audioContext.createGain();

        // Create master gain for overall volume control
        const masterGain = this.audioContext.createGain();

        // Add subtle vibrato for organic feel
        const vibrato = this.audioContext.createOscillator();
        const vibratoGain = this.audioContext.createGain();
        vibrato.frequency.setValueAtTime(5, now); // 5Hz vibrato
        vibratoGain.gain.setValueAtTime(2, now); // Subtle pitch variation

        vibrato.connect(vibratoGain);
        vibratoGain.connect(oscillator.frequency);
        vibratoGain.connect(oscillator2.frequency);

        // Apply ADSR envelope for realistic kalimba sound
        // Attack
        gain1.gain.setValueAtTime(0, now);
        gain1.gain.linearRampToValueAtTime(0.3, now + 0.01);

        gain2.gain.setValueAtTime(0, now);
        gain2.gain.linearRampToValueAtTime(0.15, now + 0.01);

        gain3.gain.setValueAtTime(0, now);
        gain3.gain.linearRampToValueAtTime(0.08, now + 0.005);

        // Decay and Sustain
        gain1.gain.exponentialRampToValueAtTime(0.15, now + 0.1);
        gain2.gain.exponentialRampToValueAtTime(0.08, now + 0.1);
        gain3.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

        // Release
        gain1.gain.exponentialRampToValueAtTime(0.001, now + duration);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + duration);
        gain3.gain.exponentialRampToValueAtTime(0.001, now + duration);

        // Master gain for overall volume
        masterGain.gain.setValueAtTime(0.6, now);

        // Create a low-pass filter for warmth
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(3000, now);
        filter.Q.setValueAtTime(1, now);

        // Add subtle reverb/delay for depth
        const delay = this.audioContext.createDelay();
        delay.delayTime.setValueAtTime(0.02, now);
        const delayGain = this.audioContext.createGain();
        delayGain.gain.setValueAtTime(0.2, now);

        // Connect audio graph
        oscillator.connect(gain1);
        oscillator2.connect(gain2);
        oscillator3.connect(gain3);

        gain1.connect(masterGain);
        gain2.connect(masterGain);
        gain3.connect(masterGain);

        masterGain.connect(filter);
        filter.connect(this.audioContext.destination);

        // Add delay effect
        filter.connect(delay);
        delay.connect(delayGain);
        delayGain.connect(this.audioContext.destination);

        // Start oscillators
        oscillator.start(now);
        oscillator2.start(now);
        oscillator3.start(now);
        vibrato.start(now);

        // Stop oscillators after duration
        oscillator.stop(now + duration);
        oscillator2.stop(now + duration);
        oscillator3.stop(now + duration);
        vibrato.stop(now + duration);
    }

    animateTine(tineElement) {
        tineElement.classList.add('active', 'playing');

        // Remove active class quickly, but keep playing animation
        setTimeout(() => {
            tineElement.classList.remove('active');
        }, 100);

        // Remove playing class after animation completes
        setTimeout(() => {
            tineElement.classList.remove('playing');
        }, 500);
    }

    setupTineListeners() {
        this.tines.forEach(tine => {
            const note = tine.dataset.note;

            // Mouse click
            tine.addEventListener('click', (e) => {
                e.preventDefault();
                this.playNote(note, tine);
            });

            // Touch events for mobile
            tine.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.playNote(note, tine);
            }, { passive: false });

            // Prevent context menu on long press
            tine.addEventListener('contextmenu', (e) => {
                e.preventDefault();
            });
        });
    }

    setupKeyboardListeners() {
        const keyMap = new Map();

        // Build key to tine mapping
        this.tines.forEach(tine => {
            const key = tine.dataset.key;
            keyMap.set(key, { note: tine.dataset.note, element: tine });
        });

        const pressedKeys = new Set();

        document.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            const mappedKey = key === ' ' ? 'space' : key;

            // Prevent key repeat
            if (pressedKeys.has(mappedKey)) return;
            pressedKeys.add(mappedKey);

            if (keyMap.has(mappedKey)) {
                e.preventDefault();
                const { note, element } = keyMap.get(mappedKey);
                this.playNote(note, element);
            }
        });

        document.addEventListener('keyup', (e) => {
            const key = e.key.toLowerCase();
            const mappedKey = key === ' ' ? 'space' : key;
            pressedKeys.delete(mappedKey);
        });
    }
}

// Initialize the kalimba when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new Kalimba();
    console.log('Virtual Kalimba initialized! Play using keyboard or touch/click.');
});
