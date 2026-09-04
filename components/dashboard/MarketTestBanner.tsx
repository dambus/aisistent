const PRIMARY = '#1B6B4A'

export function MarketTestBanner() {
  return (
    <div
      className="mb-6 rounded-2xl border px-5 py-4 text-sm"
      style={{ borderColor: `${PRIMARY}30`, backgroundColor: `${PRIMARY}08` }}
    >
      <p className="text-gray-700">
        <span className="font-semibold" style={{ color: PRIMARY }}>Trenutno smo u fazi testiranja tržišta</span>
        {' '}— svi planovi su privremeno besplatni na korišćenje u okviru limita. Kad krenemo sa
        naplatom, korisnici prijavljeni na listu čekanja dobijaju poseban popust.
      </p>
    </div>
  )
}
