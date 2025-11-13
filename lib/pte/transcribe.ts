import 'server-only'

export interface Transcriber {
  transcribe(input: {
    audioUrl: string
  }): Promise<{ transcript: string; provider: string }>
}

class NoneTranscriber implements Transcriber {
  async transcribe(_input: {
    audioUrl: string
  }): Promise<{ transcript: string; provider: string }> {
    return { transcript: '', provider: 'none' }
  }
}

class OpenAIWhisperTranscriber implements Transcriber {
  constructor(private apiKey: string) {}

  async transcribe(input: {
    audioUrl: string
  }): Promise<{ transcript: string; provider: string }> {
    const { audioUrl } = input
    // 1) Download audio as ArrayBuffer
    const res = await fetch(audioUrl)
    if (!res.ok) {
      throw new Error(
        `Failed to download audio: ${res.status} ${res.statusText}`
      )
    }
    const contentType =
      res.headers.get('content-type') || 'application/octet-stream'
    const arrayBuffer = await res.arrayBuffer()

    // 2) Build multipart form-data
    const form = new FormData()
    const fileName = `audio.${guessExtensionFromContentType(contentType)}`
    const blob = new Blob([arrayBuffer], { type: contentType })
    form.append('file', blob, fileName)
    form.append('model', 'whisper-1')
    form.append('language', 'en')

    // 3) Call OpenAI Whisper
    const openAiRes = await fetch(
      'https://api.openai.com/v1/audio/transcriptions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: form,
      }
    )

    if (!openAiRes.ok) {
      const text = await safeText(openAiRes)
      throw new Error(
        `OpenAI transcription failed: ${openAiRes.status} ${openAiRes.statusText} - ${text}`
      )
    }

    const data = (await openAiRes.json()) as { text?: string; error?: unknown }
    const transcript = (data as any).text ?? ''
    return { transcript, provider: 'openai' }
  }
}

export async function getTranscriber(): Promise<Transcriber> {
  const provider = (process.env.AI_TRANSCRIBE_PROVIDER || 'none').toLowerCase()
  const key = process.env.OPENAI_API_KEY

  if (provider === 'openai' && key) {
    return new OpenAIWhisperTranscriber(key)
  }
  return new NoneTranscriber()
}

// Helpers

function guessExtensionFromContentType(ct: string): string {
  const type = ct.toLowerCase()
  if (type.includes('webm')) return 'webm'
  if (type.includes('ogg')) return 'ogg'
  if (type.includes('mp4') || type.includes('mpeg4')) return 'mp4'
  if (type.includes('mpeg')) return 'mp3'
  if (type.includes('wav')) return 'wav'
  return 'bin'
}

async function safeText(r: Response): Promise<string> {
  try {
    return await r.text()
  } catch {
    return ''
  }
}
