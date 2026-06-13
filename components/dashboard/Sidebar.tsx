'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { LogoutButton } from '@/components/auth/logout-button'

const PRIMARY = '#1B6B4A'
const SIDEBAR_ICON = '#9CA3AF'

interface NavItem {
  label: string
  href: string
  icon?: string
}

interface NavCategory {
  key: string
  icon: string
  title: string
  defaultExpanded: boolean
  items: NavItem[]
}

const navCategories: NavCategory[] = [
  {
    key: 'ugovori',
    icon: '▤',
    title: 'Ugovori i dokumenti',
    defaultExpanded: true,
    items: [
      { label: 'Ugovor o radu',    href: '/dokumenti/ugovor-o-radu' },
      { label: 'Ugovor o delu',    href: '/dokumenti/ugovor-o-delu' },
      { label: 'NDA Sporazum',     href: '/dokumenti/nda' },
      { label: 'Ugovor o zakupu',  href: '/dokumenti/ugovor-o-zakupu' },
      { label: 'Ugovor o saradnji',href: '/dokumenti/ugovor-o-saradnji' },
      { label: 'Punomoćje',        href: '/dokumenti/punomocje' },
      { label: 'Opšti uslovi i PP',href: '/dokumenti/opsti-uslovi' },
    ],
  },
  {
    key: 'komunikacija',
    icon: '✉',
    title: 'Poslovna komunikacija',
    defaultExpanded: false,
    items: [
      { label: 'Poslovni mejl',   href: '/dokumenti/poslovni-mejl' },
      { label: 'Ponuda klijentu', href: '/dokumenti/ponuda-klijentu' },
    ],
  },
  {
    key: 'hr',
    icon: '◎',
    title: 'HR i zapošljavanje',
    defaultExpanded: false,
    items: [
      { label: 'Oglas za posao',            href: '/dokumenti/oglas-za-posao' },
      { label: 'Odgovor kandidatu',          href: '/dokumenti/odgovor-kandidatu' },
      { label: 'Preporuka/Referenca',        href: '/dokumenti/preporuka' },
      { label: 'Rešenje o godišnjem odmoru', href: '/dokumenti/resenje-godisnji-odmor' },
      { label: 'Pravilnik o radu',           href: '/dokumenti/pravilnik-o-radu' },
    ],
  },
  {
    key: 'marketing',
    icon: '◈',
    title: 'Marketing i prodaja',
    defaultExpanded: false,
    items: [
      { label: 'Opis proizvoda/usluge', href: '/dokumenti/opis-proizvoda' },
      { label: 'Bio / O nama',          href: '/dokumenti/bio-o-nama' },
      { label: 'Zapisnik sa sastanka',  href: '/dokumenti/zapisnik-sastanak' },
    ],
  },
]

const upcomingItems: string[] = []

const alatiCategory: NavCategory = {
  key: 'alati',
  icon: '🧮',
  title: 'Alati',
  defaultExpanded: true,
  items: [
    { label: 'Kalkulator zarade', href: '/alati/kalkulator-zarade' },
    { label: 'Paušalno oporezivanje', href: '/alati/kalkulator-pausala' },
    { label: 'Kalkulator ugovora o delu', href: '/alati/kalkulator-ugovora-o-delu' },
  ],
}

const upcomingAlati: string[] = []

const bottomNav: NavItem[] = [
  { label: 'Arhiva',      href: '/arhiva',      icon: '▣' },
  { label: 'Profil',      href: '/profil',      icon: '●' },
  { label: 'Podešavanja', href: '/podesavanja', icon: '⚙' },
]

const planLabels: Record<string, { label: string; cls: string }> = {
  free:     { label: 'Besplatno', cls: 'bg-gray-700 text-gray-300' },
  starter:  { label: 'Starter',   cls: 'bg-blue-900 text-blue-200' },
  pro:      { label: 'Pro',       cls: 'bg-purple-900 text-purple-200' },
  business: { label: 'Business',  cls: 'bg-amber-900 text-amber-200' },
}

function SidebarLogo({ height = 28 }: { height?: number }) {
  return (
    <img
      src="/logo/AIsistent-Logo_6003x180_inverted.png"
      alt="AIsistent"
      height={height}
      width={187}
      style={{ objectFit: 'contain', maxWidth: '160px', width: 'auto' }}
    />
  )
}

interface Props {
  plan: string
  userInitials: string
}

function defaultExpanded(): Record<string, boolean> {
  return {
    ...Object.fromEntries(navCategories.map(c => [c.key, c.defaultExpanded])),
    [alatiCategory.key]: alatiCategory.defaultExpanded,
  }
}

export function Sidebar({ plan, userInitials }: Props) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [expanded, setExpanded] = useState<Record<string, boolean>>(defaultExpanded)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('sidebar-expanded')
      if (saved) setExpanded(JSON.parse(saved))
    } catch {}
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  function toggleCategory(key: string) {
    const next = { ...expanded, [key]: !expanded[key] }
    setExpanded(next)
    try { localStorage.setItem('sidebar-expanded', JSON.stringify(next)) } catch {}
  }

  const planMeta = planLabels[plan] ?? planLabels.free

  function isActive(href: string) {
    return pathname === href
  }

  function NavLink({ item, onClick }: { item: NavItem; onClick?: () => void }) {
    const active = isActive(item.href)
    return (
      <Link
        href={item.href}
        onClick={onClick}
        className="flex items-center rounded-md px-3 py-2 text-sm transition-all duration-150"
        style={
          active
            ? { backgroundColor: 'rgba(27,107,74,0.22)', color: '#ffffff', borderLeft: `2px solid ${PRIMARY}` }
            : { color: '#9CA3AF', borderLeft: '2px solid transparent' }
        }
        onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.05)'; (e.currentTarget as HTMLElement).style.color = '#ffffff' }}
        onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.backgroundColor = ''; (e.currentTarget as HTMLElement).style.color = '#9CA3AF' } }}
      >
        {item.icon && (
          <span className="mr-2 w-4 shrink-0 text-center" style={{ color: active ? '#ffffff' : SIDEBAR_ICON }}>
            {item.icon}
          </span>
        )}
        {item.label}
      </Link>
    )
  }

  function SidebarContent({ onLinkClick }: { onLinkClick?: () => void }) {
    return (
      <div className="flex h-full flex-col overflow-hidden bg-[#111827]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-5">
          <Link
            href="/dashboard"
            onClick={onLinkClick}
            className="flex items-center"
          >
            <SidebarLogo />
          </Link>
          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${planMeta.cls}`}>
            {planMeta.label}
          </span>
        </div>

        {/* Nav categories — scrollable */}
        <div className="sidebar-scroll flex-1 overflow-y-auto px-3 pb-4">
          {navCategories.map(cat => (
            <div key={cat.key} className="mb-1">
              <button
                onClick={() => toggleCategory(cat.key)}
                className="flex w-full items-center justify-between rounded-md px-2 py-2 text-left transition-colors duration-150 hover:bg-white/5"
              >
                <span className="flex items-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <span className="mr-2 w-4 text-center" style={{ color: SIDEBAR_ICON }}>{cat.icon}</span>
                  <span>{cat.title}</span>
                </span>
                <span className="text-gray-600 transition-transform duration-200" style={{ transform: expanded[cat.key] ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                  ▶
                </span>
              </button>

              {/* Smooth height transition via max-height */}
              <div
                className="overflow-hidden transition-all duration-200"
                style={{ maxHeight: expanded[cat.key] ? `${cat.items.length * 44}px` : '0' }}
              >
                <div className="ml-1 mt-0.5 grid gap-0.5 pb-1">
                  {cat.items.map(item => (
                    <NavLink key={item.href} item={item} onClick={onLinkClick} />
                  ))}
                </div>
              </div>
            </div>
          ))}

          {/* Alati */}
          <div className="mb-1">
            <button
              onClick={() => toggleCategory(alatiCategory.key)}
              className="flex w-full items-center justify-between rounded-md px-2 py-2 text-left transition-colors duration-150 hover:bg-white/5"
            >
              <span className="flex items-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                <span className="mr-2 w-4 text-center" style={{ color: SIDEBAR_ICON }}>{alatiCategory.icon}</span>
                <span>{alatiCategory.title}</span>
              </span>
              <span className="text-gray-600 transition-transform duration-200" style={{ transform: expanded[alatiCategory.key] ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                ▶
              </span>
            </button>
            <div
              className="overflow-hidden transition-all duration-200"
              style={{ maxHeight: expanded[alatiCategory.key] ? `${(alatiCategory.items.length + upcomingAlati.length) * 44}px` : '0' }}
            >
              <div className="ml-1 mt-0.5 grid gap-0.5 pb-1">
                {alatiCategory.items.map(item => (
                  <NavLink key={item.href} item={item} onClick={onLinkClick} />
                ))}
                {upcomingAlati.map(name => (
                  <div
                    key={name}
                    title="Uskoro dostupno"
                    className="cursor-not-allowed rounded-md px-3 py-2 text-sm opacity-40"
                    style={{ color: '#9CA3AF', borderLeft: '2px solid transparent' }}
                  >
                    {name}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Uskoro */}
          <div className="mb-1">
            <button
              onClick={() => toggleCategory('uskoro')}
              className="flex w-full items-center justify-between rounded-md px-2 py-2 text-left"
            >
              <span className="flex items-center text-xs font-semibold uppercase tracking-wider text-gray-600 opacity-50">
                <span className="mr-2 w-4 text-center" style={{ color: SIDEBAR_ICON }}>⌂</span>
                <span>Uskoro</span>
              </span>
              <span className="text-gray-700 transition-transform duration-200" style={{ transform: expanded['uskoro'] ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                ▶
              </span>
            </button>
            <div
              className="overflow-hidden transition-all duration-200"
              style={{ maxHeight: expanded['uskoro'] ? `${upcomingItems.length * 44}px` : '0' }}
            >
              <div className="ml-1 mt-0.5 grid gap-0.5 pb-1">
                {upcomingItems.map(name => (
                  <div
                    key={name}
                    title="Uskoro dostupno"
                    className="cursor-not-allowed rounded-md px-3 py-2 text-sm opacity-40"
                    style={{ color: '#9CA3AF', borderLeft: '2px solid transparent' }}
                  >
                    {name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Separator */}
        <div className="mx-3 border-t border-white/10" />

        {/* Bottom nav */}
        <div className="grid gap-0.5 px-3 py-3">
          {bottomNav.map(item => (
            <NavLink key={item.href} item={item} onClick={onLinkClick} />
          ))}
          <div className="mt-1 px-3 py-2">
            <LogoutButton className="text-sm text-gray-500 transition-colors hover:text-white" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* ── Mobile top header ── */}
      <header className="fixed left-0 right-0 top-0 z-30 flex h-12 items-center justify-between bg-[#111827] px-4 md:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 hover:bg-white/10 hover:text-white"
          aria-label="Otvori meni"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M2 4.5h14M2 9h14M2 13.5h14" />
          </svg>
        </button>
        <Link href="/dashboard" className="flex items-center">
          <SidebarLogo />
        </Link>
        <div
          className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
          style={{ backgroundColor: PRIMARY }}
        >
          {userInitials}
        </div>
      </header>

      {/* ── Mobile backdrop ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Desktop sidebar (always visible) ── */}
      <aside className="hidden w-[260px] shrink-0 md:block">
        <div className="fixed inset-y-0 left-0 w-[260px]">
          <SidebarContent />
        </div>
      </aside>

      {/* ── Mobile sidebar (slide-in overlay) ── */}
      <aside
        className="fixed inset-y-0 left-0 z-50 w-[260px] md:hidden"
        style={{
          transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.2s ease',
        }}
      >
        <SidebarContent onLinkClick={() => setMobileOpen(false)} />
      </aside>
    </>
  )
}
