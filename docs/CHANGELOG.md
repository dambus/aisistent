## jun 2026. — Admin panel

- /admin ruta zaštićena middleware-om (is_admin u profiles tabeli)
- Pregled: stat kartice (korisnici, novi, dokumenti, danas, mesec)
- Korisnici: tabela sa emailom, planom, brojem dokumenata, datumom
- Dokumenti: top tipovi sa progress barom, lista poslednjih 100
- Sidebar: Admin link vidljiv samo admin korisnicima
- Supabase migracija: is_admin kolona + RLS politike
