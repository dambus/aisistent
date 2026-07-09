import Link from 'next/link'
import MobileMenu from './MobileMenu'

const PRIMARY = '#1B6B4A'

const navLinks = [
  { href: '/#kako-radi', label: 'Kako radi' },
  { href: '/#alati', label: 'Alati' },
  { href: '/obrasci', label: 'Obrasci' },
  { href: '/#cenovnik', label: 'Cenovnik' },
  { href: '/blog', label: 'Blog' },
]

export function SiteHeader({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
        <Link href="/" className="flex items-center">
          <img
            src="/logo/AIsistent-Logo_6003x180.png"
            alt="AIsistent"
            height={32}
            style={{ objectFit: 'contain', maxWidth: '160px', width: 'auto' }}
          />
        </Link>

        <div className="hidden items-center gap-8 text-sm font-medium text-gray-600 md:flex">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors duration-200 hover:text-gray-900"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:opacity-90"
              style={{ backgroundColor: PRIMARY }}
            >
              Moji dokumenti
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition-colors duration-200 hover:text-gray-900"
              >
                Prijavi se
              </Link>
              <Link
                href="/register"
                className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:opacity-90"
                style={{ backgroundColor: PRIMARY }}
              >
                Počnite besplatno
              </Link>
            </>
          )}
        </div>

        <MobileMenu isLoggedIn={isLoggedIn} navLinks={navLinks} />
      </nav>
    </header>
  )
}
