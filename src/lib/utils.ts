import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import * as PusherClientNS from 'pusher-js'
import PusherServer from 'pusher'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const extractUUIDFromString = (url: string) => {
  return url.match(
    /^[0-9a-f]{8}-?[0-9a-f]{4}-?[1-5][0-9a-f]{3}-?[89ab][0-9a-f]{3}-?[0-9a-f]{12}$/i
  )
}

export const pusherServer = new PusherServer({
  appId: process.env.NEXT_PUBLIC_PUSHER_APP_ID as string,
  key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY as string,
  secret: process.env.NEXT_PUBLIC_PUSHER_APP_SECRET as string,
  cluster: process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTOR as string,
  useTLS: true,
})

// pusher-js's node build exports the constructor as `.Pusher`, while the web
// build exposes it as the default export. Resolve whichever is available so
// this file can be safely imported from both server and client bundles.
const PusherCtor: any =
  (PusherClientNS as any).default?.Pusher ??
  (PusherClientNS as any).default ??
  (PusherClientNS as any).Pusher ??
  PusherClientNS

// Lazily instantiate so importing this module from a Server Component (e.g.
// via `cn`) does not try to connect to Pusher on the server.
let _pusherClient: any = null
const getPusherClient = () => {
  if (!_pusherClient) {
    _pusherClient = new PusherCtor(
      process.env.NEXT_PUBLIC_PUSHER_APP_KEY as string,
      {
        cluster: process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTOR as string,
      }
    )
  }
  return _pusherClient
}

export const pusherClient: any = new Proxy(
  {},
  {
    get(_t, prop) {
      const client = getPusherClient()
      const value = client[prop as keyof typeof client]
      return typeof value === 'function' ? value.bind(client) : value
    },
  }
)

export const postToParent = (message: string) => {
  window.parent.postMessage(message, '*')
}

export const extractURLfromString = (url: string) => {
  return url.match(/https?:\/\/[^\s"<>]+/)
}

export const extractEmailsFromString = (text: string) => {
  return text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi)
}

export const getMonthName = (month: number) => {
  return month == 1
    ? 'Jan'
    : month == 2
    ? 'Feb'
    : month == 3
    ? 'Mar'
    : month == 4
    ? 'Apr'
    : month == 5
    ? 'May'
    : month == 6
    ? 'Jun'
    : month == 7
    ? 'Jul'
    : month == 8
    ? 'Aug'
    : month == 9
    ? 'Sep'
    : month == 10
    ? 'Oct'
    : month == 11
    ? 'Nov'
    : month == 12 && 'Dec'
}
