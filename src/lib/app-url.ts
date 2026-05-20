export const getAppUrl = () => {
  const url =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.BETTER_AUTH_URL ||
    'http://localhost:3000'

  return url.replace(/\/$/, '')
}
