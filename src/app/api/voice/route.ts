import { NextRequest, NextResponse } from 'next/server'

// "Rachel" (21m00Tcm4TlvDq8ikWAM) is the original default.
// "Aria" (9BWtsMINqrJLrRacOk9x) is a clear, natural-sounding female voice.
const DEFAULT_VOICE_ID = '9BWtsMINqrJLrRacOk9x'

export async function POST(req: NextRequest) {
  const apiKey = process.env.ELEVENLABS_API_KEY

  if (!apiKey) {
    return new NextResponse(null, { status: 204 })
  }

  const { text } = await req.json()

  if (!text || typeof text !== 'string') {
    return NextResponse.json({ error: 'Text is required' }, { status: 400 })
  }

  const voiceId = process.env.ELEVENLABS_VOICE_ID || DEFAULT_VOICE_ID
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: 'POST',
      headers: {
        Accept: 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text: text.slice(0, 1200),
        model_id: 'eleven_turbo_v2_5',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.85,
          style: 0.2,
          use_speaker_boost: true,
        },
      }),
    }
  )

  if (!response.ok) {
    return NextResponse.json(
      { error: 'Unable to generate voice response' },
      { status: response.status }
    )
  }

  return new NextResponse(response.body, {
    headers: {
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'no-store',
    },
  })
}
