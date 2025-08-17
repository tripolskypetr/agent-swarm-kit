---
title: demo/whisper-voice-chat/readme
group: demo/whisper-voice-chat
---

# Whisper Voice Chat

Voice-to-text chat system с OpenAI Whisper для real-time речевого ввода и обработки.

## Назначение

Демонстрирует возможности:
- Speech-to-text с OpenAI Whisper Tiny
- Voice interface для agent-swarm-kit
- Real-time audio processing
- Multi-modal interaction (voice + text)

## Ключевые возможности

- **Voice Recognition**: OpenAI Whisper Tiny для transcription
- **Real-time Processing**: Мгновенная обработка audio input
- **Web Interface**: HTML5 audio recording interface
- **Multi-modal**: Voice и text input support
- **Offline Capable**: Local Whisper model без external API

## Технологический стек

- **Runtime**: Bun
- **Язык**: TypeScript
- **AI Framework**: agent-swarm-kit
- **Speech Recognition**: Xenova Transformers (Whisper)
- **Audio Processing**: Wavefile
- **Web Framework**: Hono
- **Frontend**: HTML5 Web Audio API

## Структура проекта

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

## Установка и запуск

```bash
# Установка зависимостей
bun install

# Первый запуск (загружает Whisper model)
bun run src/index.ts

# Открыть в браузере
open http://localhost:3000
```

## Конфигурация

Создайте файл `.env`:

```env
PORT=3000
WHISPER_MODEL=Xenova/whisper-tiny
OPENAI_API_KEY=your_openai_api_key
```

## Web Interface

### Функции интерфейса
- **Record Button**: Начать/остановить запись
- **Audio Visualization**: Visual feedback во время записи
- **Live Transcription**: Real-time отображение результатов
- **Chat History**: История voice interactions

### Использование
1. Откройте браузер на `http://localhost:3000`
2. Разрешите доступ к микрофону
3. Нажмите кнопку записи
4. Говорите в микрофон
5. Остановите запись для обработки

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
- **Quality**: Good для general use
- **Offline**: Полностью локальная обработка

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
- **Sample Rate**: 16kHz (optimal для Whisper)
- **Channels**: Mono/Stereo
- **Duration**: До 30 секунд per chunk

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
- **Caching**: Model caching для faster startup

### Server-Side
- **Model Warming**: Pre-load Whisper model
- **Memory Management**: Efficient audio buffer handling
- **Parallel Processing**: Multiple audio streams

## Применение

Идеально для:
- Voice assistants
- Accessibility applications
- Hands-free interfaces
- Language learning tools
- Transcription services

## Browser Compatibility

### Supported Features
- **Chrome/Edge**: Full support
- **Firefox**: Full support
- **Safari**: Partial (некоторые audio API limitations)
- **Mobile**: iOS Safari, Chrome Mobile

### Required Permissions
- Microphone access
- HTTPS для production (WebRTC requirement)

## Development Features

### Debug Mode
```javascript
// Enable audio visualization
const audioContext = new AudioContext();
const analyser = audioContext.createAnalyser();
```

### Testing
```bash
# Test с sample audio
curl -X POST http://localhost:3000/api/transcribe \
  -F "audio=@test-samples/hello.wav"
```

## Privacy Benefits

- **Local Processing**: Audio не покидает ваш сервер
- **No External APIs**: Whisper runs locally
- **Data Control**: Полный контроль над voice data
- **Offline Capable**: Works без internet connection