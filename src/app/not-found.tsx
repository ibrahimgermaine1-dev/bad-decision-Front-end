/**
 * Custom 404 page — no Clerk dependency so it doesn't fail at build time
 * when NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is not yet available.
 */
export default function NotFound() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: '#F8FAFC',
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '4rem', fontWeight: 'bold', color: '#0F172A', marginBottom: '0.5rem' }}>404</h1>
        <p style={{ color: '#64748B', marginBottom: '1.5rem', fontSize: '1.1rem' }}>Page not found</p>
        <a
          href="/"
          style={{
            color: '#2563EB',
            textDecoration: 'underline',
            fontSize: '1rem',
          }}
        >
          Go back home
        </a>
      </div>
    </div>
  )
}
