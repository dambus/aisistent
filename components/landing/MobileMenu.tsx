'use client'

import { useState } from 'react'

interface NavLink {
  href: string
  label: string
}

interface Props {
  isLoggedIn: boolean
  navLinks: NavLink[]
}

export default function MobileMenu({ isLoggedIn, navLinks }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative md:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700"
        aria-expanded={open}
        aria-label="Navigacioni meni"
      >
        {open ? (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 3l10 10M13 3L3 13" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 4h12M2 8h12M2 12h12" />
          </svg>
        )}
        Meni
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-gray-200 bg-white p-3 shadow-xl">
          {navLinks.map(link => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-[#F8FAF9] hover:text-[#1B6B4A]"
            >
              {link.label}
            </a>
          ))}
          <div className="mt-2 grid gap-2 border-t border-gray-100 pt-3">
            {isLoggedIn ? (
              <a
                href="/dashboard"
                className="rounded-xl bg-[#1B6B4A] px-4 py-3 text-center text-sm font-bold text-white"
              >
                Moji dokumenti
              </a>
            ) : (
              <>
                <a
                  href="/login"
                  className="rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Prijavi se
                </a>
                <a
                  href="/register"
                  className="rounded-xl bg-[#1B6B4A] px-4 py-3 text-center text-sm font-bold text-white"
                >
                  Počnite besplatno
                </a>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
