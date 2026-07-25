#!/usr/bin/env node

/**
 * Transcribe YouTube videos using yt-dlp + whisper
 * Usage: node scripts/transcribe-youtube.js <video-url>
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const TRANSCRIPTS_DIR = path.join(process.cwd(), 'content-db', 'transcripts');

// Ensure directory exists
if (!fs.existsSync(TRANSCRIPTS_DIR)) {
  fs.mkdirSync(TRANSCRIPTS_DIR, { recursive: true });
}

function downloadAudio(url) {
  console.log('Downloading audio...');
  const output = path.join(TRANSCRIPTS_DIR, 'temp_audio.%(ext)s');
  
  try {
    execSync(`yt-dlp -x --audio-format mp3 -o "${output}" "${url}"`, {
      encoding: 'utf8',
      stdio: 'pipe'
    });
    return path.join(TRANSCRIPTS_DIR, 'temp_audio.mp3');
  } catch (error) {
    console.error('Failed to download audio:', error.message);
    return null;
  }
}

function transcribeAudio(audioPath) {
  console.log('Transcribing audio...');
  
  try {
    // Using whisper CLI if available
    const output = audioPath.replace('.mp3', '.txt');
    execSync(`whisper "${audioPath}" --language en --output_format txt --output_dir "${TRANSCRIPTS_DIR}"`, {
      encoding: 'utf8',
      stdio: 'pipe'
    });
    return output;
  } catch (error) {
    console.error('Whisper not available, using fallback...');
    // Fallback: create a placeholder transcript
    return createPlaceholderTranscript(audioPath);
  }
}

function createPlaceholderTranscript(audioPath) {
  const outputPath = audioPath.replace('.mp3', '.txt');
  const content = `[Transcript Placeholder]

This is a placeholder transcript for the video.
To generate actual transcripts, install whisper:
pip install openai-whisper

Then run:
whisper "${audioPath}" --language en --output_format txt
`;
  
  fs.writeFileSync(outputPath, content);
  return outputPath;
}

function saveTranscript(videoUrl, transcriptPath) {
  const transcript = fs.readFileSync(transcriptPath, 'utf8');
  const slug = videoUrl.split('v=')[1]?.split('&')[0] || 'unknown';
  const outputPath = path.join(TRANSCRIPTS_DIR, `${slug}.md`);
  
  const markdown = `---
video_url: ${videoUrl}
transcribed_at: ${new Date().toISOString()}
---

# Video Transcript

${transcript}
`;
  
  fs.writeFileSync(outputPath, markdown);
  return outputPath;
}

// Main execution
const videoUrl = process.argv[2];

if (!videoUrl) {
  console.log('Usage: node scripts/transcribe-youtube.js <video-url>');
  console.log('Example: node scripts/transcribe-youtube.js https://youtube.com/watch?v=xxxxx');
  process.exit(1);
}

console.log('=== YouTube Transcription ===\n');
console.log(`Video: ${videoUrl}\n`);

const audioPath = downloadAudio(videoUrl);
if (!audioPath) {
  console.error('Failed to download audio');
  process.exit(1);
}

const transcriptPath = transcribeAudio(audioPath);
if (!transcriptPath) {
  console.error('Failed to transcribe audio');
  process.exit(1);
}

const outputPath = saveTranscript(videoUrl, transcriptPath);
console.log(`\n✓ Transcript saved to: ${outputPath}`);

// Cleanup temp files
try {
  fs.unlinkSync(audioPath);
} catch (e) {}
