import React from 'react'
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import { sanitizeText } from '@/lib/pdf/markdownParser'

interface PutniNalogData {
  naziv_firme: string
  pib?: string
  adresa_firme?: string
  ovlasceno_lice: string
  broj_naloga?: string
  datum_izdavanja: string
  ime_vozaca: string
  pozicija_vozaca?: string
  marka_model: string
  registarski_broj: string
  km_pocetak?: string
  svrha_putovanja: string
  polaziste: string
  odrediste: string
  datum_polaska: string
  datum_povratka?: string
  napomena_ruta?: string
  dnevnica: boolean
  gorivo_na_teret_firme: boolean
  smestaj: boolean
  ostali_troskovi?: string
}

function formatDate(iso: string): string {
  if (!iso) return '___________'
  const d = new Date(iso)
  return `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}.`
}

const ZELENA = '#1B6B4A'
const SIVA = '#6B7280'
const SVETLO_SIVA = '#F9FAFB'
const BORDER = '#E5E7EB'

const s = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: '#111827',
    paddingHorizontal: 40,
    paddingTop: 36,
    paddingBottom: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: ZELENA,
  },
  headerLeft: { flex: 1 },
  headerRight: { alignItems: 'flex-end' },
  firmaLabel: { fontSize: 7, color: SIVA, marginBottom: 2 },
  firmaNaziv: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#111827' },
  firmaPib: { fontSize: 8, color: SIVA, marginTop: 1 },
  firmaAdresa: { fontSize: 8, color: SIVA, marginTop: 1 },
  docNaslov: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: ZELENA },
  docBroj: { fontSize: 8, color: SIVA, marginTop: 2 },
  docDatum: { fontSize: 8, color: SIVA, marginTop: 1 },
  sekcija: { marginBottom: 12 },
  sekcijaHeader: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: ZELENA,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
    paddingBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  redPodataka: {
    flexDirection: 'row',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  redLabel: { width: '35%', fontSize: 8, color: SIVA },
  redValue: { flex: 1, fontSize: 8.5, fontFamily: 'Helvetica-Bold' },
  dvored: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  dvoredBlok: { flex: 1 },
  troskBlock: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  troskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: ZELENA,
    borderRadius: 4,
  },
  troskItemText: { fontSize: 8, color: ZELENA, fontFamily: 'Helvetica-Bold' },
  potpisBlok: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  potpisNaslov: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: ZELENA,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 16,
  },
  potpisRed: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 24,
  },
  potpisKolona: { flex: 1 },
  potpisLabel: { fontSize: 7, color: SIVA, marginBottom: 20 },
  potpisLinija: {
    borderBottomWidth: 1,
    borderBottomColor: '#111827',
    marginBottom: 4,
  },
  potpisIme: { fontSize: 8 },
  tabelaHeader: {
    flexDirection: 'row',
    backgroundColor: ZELENA,
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderRadius: 3,
    marginBottom: 2,
  },
  tabelaHeaderCell: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: '#FFFFFF',
  },
  tabelaRed: {
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  tabelaRedAlt: { backgroundColor: SVETLO_SIVA },
  tabelaCell: { fontSize: 8 },
  colDatum: { width: '20%' },
  colOd: { width: '25%' },
  colDo: { width: '25%' },
  colKm: { width: '15%', textAlign: 'right' },
  colNapomena: { width: '15%' },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
  },
  footerText: { fontSize: 7, color: '#9CA3AF', textAlign: 'center' },
  napomenaBox: {
    marginTop: 12,
    padding: 8,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FCD34D',
    borderRadius: 4,
  },
  napomenaText: { fontSize: 7.5, color: '#92400E' },
})

export function PutniNalogPDF({ data }: { data: PutniNalogData }) {
  const troskovi = [
    data.dnevnica && 'Dnevnica',
    data.gorivo_na_teret_firme && 'Gorivo',
    data.smestaj && 'Smestaj',
  ].filter(Boolean) as string[]

  return (
    <Document>
      <Page size="A4" style={s.page}>

        {/* Header */}
        <View style={s.header}>
          <View style={s.headerLeft}>
            <Text style={s.firmaLabel}>Izdavalac naloga</Text>
            <Text style={s.firmaNaziv}>{sanitizeText(data.naziv_firme)}</Text>
            {data.pib && <Text style={s.firmaPib}>PIB: {data.pib}</Text>}
            {data.adresa_firme && (
              <Text style={s.firmaAdresa}>{sanitizeText(data.adresa_firme)}</Text>
            )}
          </View>
          <View style={s.headerRight}>
            <Text style={s.docNaslov}>PUTNI NALOG</Text>
            {data.broj_naloga && (
              <Text style={s.docBroj}>Broj: {data.broj_naloga}</Text>
            )}
            <Text style={s.docDatum}>
              Datum izdavanja: {formatDate(data.datum_izdavanja)}
            </Text>
          </View>
        </View>

        {/* Vozac i vozilo — dve kolone */}
        <View style={s.dvored}>
          <View style={s.dvoredBlok}>
            <Text style={s.sekcijaHeader}>Vozac</Text>
            <View style={s.redPodataka}>
              <Text style={s.redLabel}>Ime i prezime:</Text>
              <Text style={s.redValue}>{sanitizeText(data.ime_vozaca)}</Text>
            </View>
            {data.pozicija_vozaca && (
              <View style={s.redPodataka}>
                <Text style={s.redLabel}>Radno mesto:</Text>
                <Text style={s.redValue}>{sanitizeText(data.pozicija_vozaca)}</Text>
              </View>
            )}
          </View>
          <View style={s.dvoredBlok}>
            <Text style={s.sekcijaHeader}>Vozilo</Text>
            <View style={s.redPodataka}>
              <Text style={s.redLabel}>Marka i model:</Text>
              <Text style={s.redValue}>{sanitizeText(data.marka_model)}</Text>
            </View>
            <View style={s.redPodataka}>
              <Text style={s.redLabel}>Registarski broj:</Text>
              <Text style={s.redValue}>{data.registarski_broj}</Text>
            </View>
            <View style={s.redPodataka}>
              <Text style={s.redLabel}>Km-sat (polazak):</Text>
              <Text style={s.redValue}>{data.km_pocetak ?? '___________'}</Text>
            </View>
            <View style={s.redPodataka}>
              <Text style={s.redLabel}>Km-sat (povratak):</Text>
              <Text style={s.redValue}>___________</Text>
            </View>
          </View>
        </View>

        {/* Svrha putovanja */}
        <View style={s.sekcija}>
          <Text style={s.sekcijaHeader}>Svrha putovanja</Text>
          <View style={[s.redPodataka, { paddingVertical: 6 }]}>
            <Text style={[s.redValue, { fontFamily: 'Helvetica' }]}>
              {sanitizeText(data.svrha_putovanja)}
            </Text>
          </View>
        </View>

        {/* Tabela kretanja */}
        <View style={s.sekcija}>
          <Text style={s.sekcijaHeader}>Kretanje vozila</Text>
          <View style={s.tabelaHeader}>
            <Text style={[s.tabelaHeaderCell, s.colDatum]}>Datum</Text>
            <Text style={[s.tabelaHeaderCell, s.colOd]}>Mesto polaska</Text>
            <Text style={[s.tabelaHeaderCell, s.colDo]}>Mesto dolaska</Text>
            <Text style={[s.tabelaHeaderCell, s.colKm]}>Km</Text>
            <Text style={[s.tabelaHeaderCell, s.colNapomena]}>Napomena</Text>
          </View>
          {/* Polazak */}
          <View style={s.tabelaRed}>
            <Text style={[s.tabelaCell, s.colDatum]}>
              {formatDate(data.datum_polaska)}
            </Text>
            <Text style={[s.tabelaCell, s.colOd]}>
              {sanitizeText(data.polaziste)}
            </Text>
            <Text style={[s.tabelaCell, s.colDo]}>
              {sanitizeText(data.odrediste)}
            </Text>
            <Text style={[s.tabelaCell, s.colKm]}>___</Text>
            <Text style={[s.tabelaCell, s.colNapomena]}>
              {data.napomena_ruta ? sanitizeText(data.napomena_ruta) : ''}
            </Text>
          </View>
          {/* Povratak */}
          <View style={[s.tabelaRed, s.tabelaRedAlt]}>
            <Text style={[s.tabelaCell, s.colDatum]}>
              {data.datum_povratka ? formatDate(data.datum_povratka) : '___________'}
            </Text>
            <Text style={[s.tabelaCell, s.colOd]}>
              {sanitizeText(data.odrediste)}
            </Text>
            <Text style={[s.tabelaCell, s.colDo]}>
              {sanitizeText(data.polaziste)}
            </Text>
            <Text style={[s.tabelaCell, s.colKm]}>___</Text>
            <Text style={[s.tabelaCell, s.colNapomena]}></Text>
          </View>
          {/* Prazni redovi za rucno dopunjavanje */}
          {[0, 1].map(i => (
            <View key={i} style={[s.tabelaRed, i % 2 === 0 ? {} : s.tabelaRedAlt]}>
              <Text style={[s.tabelaCell, s.colDatum]}> </Text>
              <Text style={[s.tabelaCell, s.colOd]}> </Text>
              <Text style={[s.tabelaCell, s.colDo]}> </Text>
              <Text style={[s.tabelaCell, s.colKm]}> </Text>
              <Text style={[s.tabelaCell, s.colNapomena]}> </Text>
            </View>
          ))}
          {/* Ukupno */}
          <View style={[s.tabelaRed, { backgroundColor: '#F0FDF4' }]}>
            <Text style={[s.tabelaCell, s.colDatum, { fontFamily: 'Helvetica-Bold' }]}>
              Ukupno:
            </Text>
            <Text style={[s.tabelaCell, s.colOd]}> </Text>
            <Text style={[s.tabelaCell, s.colDo]}> </Text>
            <Text style={[s.tabelaCell, s.colKm, { fontFamily: 'Helvetica-Bold' }]}>
              ___
            </Text>
            <Text style={[s.tabelaCell, s.colNapomena]}> </Text>
          </View>
        </View>

        {/* Troskovi */}
        {(troskovi.length > 0 || data.ostali_troskovi) && (
          <View style={s.sekcija}>
            <Text style={s.sekcijaHeader}>Troskovi na teret firme</Text>
            <View style={s.troskBlock}>
              {troskovi.map(t => (
                <View key={t} style={s.troskItem}>
                  <Text style={s.troskItemText}>+ {t}</Text>
                </View>
              ))}
            </View>
            {data.ostali_troskovi && (
              <View style={[s.redPodataka, { marginTop: 6 }]}>
                <Text style={s.redLabel}>Ostali troskovi:</Text>
                <Text style={[s.redValue, { fontFamily: 'Helvetica' }]}>
                  {sanitizeText(data.ostali_troskovi)}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Potpisi */}
        <View style={s.potpisBlok}>
          <Text style={s.potpisNaslov}>Potpisi</Text>
          <View style={s.potpisRed}>
            <View style={s.potpisKolona}>
              <Text style={s.potpisLabel}>
                Nalog izdalo i odobrilo ovlasceno lice:
              </Text>
              <View style={s.potpisLinija} />
              <Text style={s.potpisIme}>{sanitizeText(data.ovlasceno_lice)}</Text>
            </View>
            <View style={s.potpisKolona}>
              <Text style={s.potpisLabel}>
                Vozac — primio vozilo bez vidljivih nedostataka:
              </Text>
              <View style={s.potpisLinija} />
              <Text style={s.potpisIme}>{sanitizeText(data.ime_vozaca)}</Text>
            </View>
            <View style={s.potpisKolona}>
              <Text style={s.potpisLabel}>
                Ovlasceno lice — kontrola po povratku:
              </Text>
              <View style={s.potpisLinija} />
              <Text style={s.potpisIme}> </Text>
            </View>
          </View>
        </View>

        {/* Napomena o dnevnici */}
        {data.dnevnica && (
          <View style={s.napomenaBox}>
            <Text style={s.napomenaText}>
              Napomena: Dnevnica za sluzbeni put u Srbiji — neoporezivi iznos
              3.316 RSD/dan (2026). Za putovanje u inostranstvo do 90 EUR/dan.
              Dnevnica se obracunava za putovanje duze od 8 sati.
            </Text>
          </View>
        )}

        {/* Footer */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>
            Dokument generisan putem aisistent.rs
          </Text>
        </View>

      </Page>
    </Document>
  )
}
