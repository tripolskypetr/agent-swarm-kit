---
title: demo/whisper-voice-chat/readme
group: demo/whisper-voice-chat
---

# Whisper Voice Chat

Voice-to-text chat system with OpenAI Whisper for real-time speech input and processing.

## Purpose

Demonstrates capabilities:
- Speech-to-text with OpenAI Whisper Tiny
- Voice interface for agent-swarm-kit
- Real-time audio processing
- Multi-modal interaction (voice + text)

## Key Features

- **Voice Recognition**: OpenAI Whisper Tiny for transcription
- **Real-time Processing**: Instant audio input processing
- **Web Interface**: HTML5 audio recording interface
- **Multi-modal**: Voice and text input support
- **Offline Capable**: Local Whisper model without external API

## Technology Stack

- **Runtime**: Bun
- **Language**: TypeScript
- **AI Framework**: agent-swarm-kit
- **Speech Recognition**: Xenova Transformers (Whisper)
- **Audio Processing**: Wavefile
- **Web Framework**: Hono
- **Frontend**: HTML5 Web Audio API

## Project Structure

```
├── cache/
│   └── Xenova/
│       └── whisper-tiny/  # Cached Whisper model
├── public/
│   └── index.html        # Web interface
├── src/
│   ├── index.ts         # Main server
│   └── lib/
│       └── swarm.ts     # Swarm configuration
└── package.json
```

## Installation and Setup

```bash
# Install dependencies
bun install

# First run (downloads Whisper model)
bun run src/index.ts

# Open in browser
open http://localhost:3000
```

## Configuration

Create a `.env` file:

```env
PORT=3000
WHISPER_MODEL=Xenova/whisper-tiny
OPENAI_API_KEY=your_openai_api_key
```

## Web Interface

### Interface Functions
- **Record Button**: Start/stop recording
- **Audio Visualization**: Visual feedback during recording
- **Live Transcription**: Real-time result display
- **Chat History**: Voice interaction history

### Usage
1. Open browser at `http://localhost:3000`
2. Allow microphone access
3. Click the record button
4. Speak into microphone
5. Stop recording for processing

## Audio Pipeline

```
Microphone → Web Audio API → WAV Format → 
Whisper Transcription → Agent Processing → Response
```

## Whisper Model

### Whisper Tiny Characteristics
- **Size**: ~39MB
- **Speed**: Fast transcription
- **Languages**: Multilingual support
- **Quality**: Good for general use
- **Offline**: Completely local processing

### Model Loading
```javascript
// Автоматическая загрузка при первом запуске
import { pipeline } from '@xenova/transformers';

const transcriber = await pipeline(
  'automatic-speech-recognition',
  'Xenova/whisper-tiny'
);
```

## Audio Processing

### Supported Formats
- **Input**: WAV, MP3, M4A
- **Sample Rate**: 16kHz (optimal for Whisper)
- **Channels**: Mono/Stereo
- **Duration**: Up to 30 seconds per chunk

### Processing Steps
1. **Audio Capture**: Web Audio API
2. **Format Conversion**: WAV encoding
3. **Preprocessing**: Resampling to 16kHz
4. **Transcription**: Whisper processing
5. **Agent Response**: AI-generated reply

## API Endpoints

### Upload Audio
```bash
POST /api/transcribe
Content-Type: multipart/form-data

# Form data с audio file
curl -X POST http://localhost:3000/api/transcribe \
  -F "audio=@recording.wav"
```

### WebSocket
```javascript
const ws = new WebSocket('ws://localhost:3000/ws');
// Send binary audio data
ws.send(audioBuffer);
```

## Performance Optimization

### Client-Side
- **Chunk Processing**: 10-second audio chunks
- **Compression**: Audio compression before upload
- **Caching**: Model caching for faster startup

### Server-Side
- **Model Warming**: Pre-load Whisper model
- **Memory Management**: Efficient audio buffer handling
- **Parallel Processing**: Multiple audio streams

## Use Cases

Ideal for:
- Voice assistants
- Accessibility applications
- Hands-free interfaces
- Language learning tools
- Transcription services

## Browser Compatibility

### Supported Features
- **Chrome/Edge**: Full support
- **Firefox**: Full support
- **Safari**: Partial (some audio API limitations)
- **Mobile**: iOS Safari, Chrome Mobile

### Required Permissions
- Microphone access
- HTTPS for production (WebRTC requirement)

## Development Features

### Debug Mode
```javascript
// Enable audio visualization
const audioContext = new AudioContext();
const analyser = audioContext.createAnalyser();
```

### Testing
```bash
# Test with sample audio
curl -X POST http://localhost:3000/api/transcribe \
  -F "audio=@test-samples/hello.wav"
```

## Privacy Benefits

- **Local Processing**: Audio doesn't leave your server
- **No External APIs**: Whisper runs locally
- **Data Control**: Complete control over voice data
- **Offline Capable**: Works without internet connection