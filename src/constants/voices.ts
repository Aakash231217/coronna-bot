// Curated ElevenLabs premade voices offered to clients for the voice bot.
// Ids are the public ElevenLabs voice library ids.
export type BotVoice = {
  id: string
  label: string
  description: string
}

export const BOT_VOICES: BotVoice[] = [
  {
    id: '9BWtsMINqrJLrRacOk9x',
    label: 'Aria',
    description: 'Female · warm & natural (default)',
  },
  {
    id: 'EXAVITQu4vr4xnSDxMaL',
    label: 'Sarah',
    description: 'Female · soft & friendly',
  },
  {
    id: 'XB0fDUnXU5powFXDhCwa',
    label: 'Charlotte',
    description: 'Female · British, calm',
  },
  {
    id: 'CwhRBWXzGAHq8TQ746Fj',
    label: 'Roger',
    description: 'Male · confident & clear',
  },
  {
    id: 'JBFqnCBsd6RMkjVDRZzb',
    label: 'George',
    description: 'Male · British, mature',
  },
  {
    id: 'N2lVS1w4EtoT3dr4eOWO',
    label: 'Callum',
    description: 'Male · characterful',
  },
]

export const DEFAULT_VOICE_ID = BOT_VOICES[0].id

export const isValidVoiceId = (id?: string | null): id is string =>
  !!id && BOT_VOICES.some((voice) => voice.id === id)
