const PUBLIC_PATHS = ['/favicon.ico']

function unauthorized() {
  return new Response('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Tommy Social Copy Studio"',
      'Cache-Control': 'no-store',
    },
  })
}

export default function middleware(req) {
  const url = new URL(req.url)
  if (PUBLIC_PATHS.some((p) => url.pathname === p)) return

  const user = process.env.SITE_BASIC_AUTH_USER
  const pass = process.env.SITE_BASIC_AUTH_PASS

  // If env is not set, auth is disabled intentionally.
  if (!user || !pass) return

  const auth = req.headers.get('authorization') || ''
  if (!auth.startsWith('Basic ')) return unauthorized()

  const encoded = auth.slice('Basic '.length)
  const decoded = atob(encoded)
  const [inputUser, ...rest] = decoded.split(':')
  const inputPass = rest.join(':')

  if (inputUser !== user || inputPass !== pass) return unauthorized()
}

export const config = {
  matcher: ['/((?!api/health).*)'],
}
