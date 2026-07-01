import { NextRequest, NextResponse } from 'next/server'
import { DEFAULT_VOICE_ID, isValidVoiceId } from '@/constants/voices'

export async function POST(req: NextRequest) {
  const apiKey = process.env.ELEVENLABS_API_KEY

  if (!apiKey) {
    return new NextResponse(null, { status: 204 })
  }

  const { text, voiceId: requestedVoiceId } = await req.json()

  if (!text || typeof text !== 'string') {
    return NextResponse.json({ error: 'Text is required' }, { status: 400 })
  }

  // Priority: the domain's chosen voice (validated) → env override → default.
  const voiceId = isValidVoiceId(requestedVoiceId)
    ? requestedVoiceId
    : process.env.ELEVENLABS_VOICE_ID || DEFAULT_VOICE_ID
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
