import React from 'react'
import path from 'path'
import {
  Document, Page, View, Text, StyleSheet, Font,
} from '@react-pdf/renderer'
import { sanitizeText } from '@/lib/pdf/markdownParser'

const FONTS_DIR = path.resolve(process.cwd(), 'public/fonts')
Font.register({ family: 'Roboto', src: `${FONTS_DIR}/Roboto-Regular.ttf` })
Font.register({ family: 'Roboto-Bold', src: `${FONTS_DIR}/Roboto-Bold.ttf` })

interface Stavka {
  rb: number
  naziv: string
  kolicina: number
  jedinica: string
  cena_bez_pdv: number
}

interface PonudaZaRadoveData {
  broj_ponude?: string
  datum_izdavanja: string
  rok_vazenja?: string
  izvodjac_naziv: string
  izvodjac_pib?: string
  izvodjac_adresa: string
  izvodjac_tekuci_racun?: string
  izvodjac_email?: string
  izvodjac_telefon?: string
  izvodjac_pdv_obveznik: boolean
  narucilac_naziv: string
  narucilac_pib?: string
  narucilac_adresa: string
  lokacija_radova?: string
  opis_radova?: string
  stavke: string
  pdv_stopa?: string
  napomena?: string
}

function fmt(n: number) {
  return n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatDate(iso: string) {
  if (!iso) return ''
  const d = new Date(iso)
  return `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}.`
}

const ZELENA = '#1B6B4A'
const SIVA = '#6B7280'
const SVETLO_SIVA = '#F9FAFB'
const BORDER = '#E5E7EB'

const s = StyleSheet.create({
  page: { fontFamily: 'Roboto', fontSize: 9, color: '#111827', paddingHorizontal: 40, paddingTop: 36, paddingBottom: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  headerLeft: { flex: 1 },
  docNaziv: { fontSize: 18, fontFamily: 'Roboto-Bold', color: ZELENA, marginBottom: 2 },
  docBroj: { fontSize: 9, color: SIVA },

  strane: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  stranaBlok: { width: '47%' },
  stranaLabel: { fontSize: 7, fontFamily: 'Roboto-Bold', color: SIVA, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  stranaNaziv: { fontSize: 10, fontFamily: 'Roboto-Bold', color: '#111827', marginBottom: 2 },
  stranaInfo: { fontSize: 8, color: SIVA, marginBottom: 1 },

  metaBlok: { flexDirection: 'row', backgroundColor: SVETLO_SIVA, borderRadius: 6, padding: 12, marginBottom: 16, gap: 20 },
  metaItem: { flex: 1 },
  metaLabel: { fontSize: 7, color: SIVA, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  metaValue: { fontSize: 9, fontFamily: 'Roboto-Bold' },

  opisBlok: { marginBottom: 16, backgroundColor: SVETLO_SIVA, borderRadius: 6, padding: 10 },
  opisLabel: { fontSize: 7, color: SIVA, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 },
  opisText: { fontSize: 8.5, color: '#374151' },

  tableHeader: { flexDirection: 'row', backgroundColor: ZELENA, borderRadius: 4, paddingVertical: 6, paddingHorizontal: 6, marginBottom: 2 },
  tableHeaderCell: { fontSize: 7, fontFamily: 'Roboto-Bold', color: '#FFFFFF', textTransform: 'uppercase' },
  tableRow: { flexDirection: 'row', paddingVertical: 5, paddingHorizontal: 6, borderBottomWidth: 1, borderBottomColor: BORDER },
  tableRowAlt: { backgroundColor: SVETLO_SIVA },
  tableCell: { fontSize: 8.5 },
  colRb: { width: '5%' },
  colNaziv: { width: '40%' },
  colKol: { width: '10%', textAlign: 'right' },
  colJed: { width: '8%', textAlign: 'center' },
  colCena: { width: '17%', textAlign: 'right' },
  colUkupno: { width: '20%', textAlign: 'right' },

  sumaBlok: { alignItems: 'flex-end', marginTop: 12 },
  sumaRed: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginBottom: 3 },
  sumaLabel: { fontSize: 8.5, color: SIVA, width: 130, textAlign: 'right' },
  sumaValue: { fontSize: 8.5, width: 90, textAlign: 'right' },
  sumaUkupnoRed: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 4, borderTopWidth: 1.5, borderTopColor: ZELENA, paddingTop: 5 },
  sumaUkupnoLabel: { fontSize: 10, fontFamily: 'Roboto-Bold', color: ZELENA, width: 130, textAlign: 'right' },
  sumaUkupnoValue: { fontSize: 10, fontFamily: 'Roboto-Bold', color: ZELENA, width: 90, textAlign: 'right' },

  napomenaBlok: { marginTop: 16 },
  napomenaLabel: { fontSize: 7, color: SIVA, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 },
  napomenaText: { fontSize: 8.5 },

  pdvNapomena: { marginTop: 12, borderWidth: 1, borderColor: '#FCD34D', backgroundColor: '#FFFBEB', borderRadius: 4, padding: 8 },
  pdvNapomenaText: { fontSize: 7.5, color: '#92400E' },

  potpisiBlok: { marginTop: 36 },
  potpisiLabel: { fontSize: 7, color: SIVA, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  potpisiLinija: { width: '45%', borderTopWidth: 1, borderTopColor: BORDER, paddingTop: 6 },
  potpisiNazivLabel: { fontSize: 8, color: SIVA, marginBottom: 2 },
  potpisiNaziv: { fontSize: 8 },

  footer: { position: 'absolute', bottom: 20, left: 40, right: 40 },
  footerText: { fontSize: 7, color: '#9CA3AF', textAlign: 'center' },
})

export function PonudaZaRadovePDF({ data }: { data: PonudaZaRadoveData }) {
  let stavke: Stavka[] = []
  try { stavke = JSON.parse(data.stavke) } catch {}

  const pdvStopa = data.izvodjac_pdv_obveznik
    ? (data.pdv_stopa === 'oslobodjeno' ? 0 : parseInt(data.pdv_stopa ?? '0') || 0)
    : 0
  const ukupnoBezPdv = stavke.reduce((sum, s) => sum + s.kolicina * s.cena_bez_pdv, 0)
  const iznosPdv = data.izvodjac_pdv_obveznik && data.pdv_stopa !== 'oslobodjeno'
    ? ukupnoBezPdv * pdvStopa / 100
    : 0
  const ukupnoSaPdv = ukupnoBezPdv + iznosPdv

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <View style={s.headerLeft}>
            <Text style={s.docNaziv}>PONUDA ZA RADOVE</Text>
            {data.broj_ponude && (
              <Text style={s.docBroj}>Broj: {sanitizeText(data.broj_ponude)}</Text>
            )}
          </View>
        </View>

        <View style={s.strane}>
          <View style={s.stranaBlok}>
            <Text style={s.stranaLabel}>Izvođač</Text>
            <Text style={s.stranaNaziv}>{sanitizeText(data.izvodjac_naziv)}</Text>
            {data.izvodjac_pib && <Text style={s.stranaInfo}>PIB: {sanitizeText(data.izvodjac_pib)}</Text>}
            <Text style={s.stranaInfo}>{sanitizeText(data.izvodjac_adresa)}</Text>
            {data.izvodjac_email && <Text style={s.stranaInfo}>{sanitizeText(data.izvodjac_email)}</Text>}
            {data.izvodjac_telefon && <Text style={s.stranaInfo}>{sanitizeText(data.izvodjac_telefon)}</Text>}
          </View>
          <View style={s.stranaBlok}>
            <Text style={s.stranaLabel}>Naručilac</Text>
            <Text style={s.stranaNaziv}>{sanitizeText(data.narucilac_naziv)}</Text>
            {data.narucilac_pib && <Text style={s.stranaInfo}>PIB: {sanitizeText(data.narucilac_pib)}</Text>}
            <Text style={s.stranaInfo}>{sanitizeText(data.narucilac_adresa)}</Text>
          </View>
        </View>

        <View style={s.metaBlok}>
          <View style={s.metaItem}>
            <Text style={s.metaLabel}>Datum izdavanja</Text>
            <Text style={s.metaValue}>{formatDate(data.datum_izdavanja)}</Text>
          </View>
          {data.rok_vazenja && (
            <View style={s.metaItem}>
              <Text style={s.metaLabel}>Rok vazenja</Text>
              <Text style={s.metaValue}>{sanitizeText(data.rok_vazenja)}</Text>
            </View>
          )}
          {data.lokacija_radova && (
            <View style={s.metaItem}>
              <Text style={s.metaLabel}>Lokacija radova</Text>
              <Text style={s.metaValue}>{sanitizeText(data.lokacija_radova)}</Text>
            </View>
          )}
        </View>

        {data.opis_radova && (
          <View style={s.opisBlok}>
            <Text style={s.opisLabel}>Opis radova</Text>
            <Text style={s.opisText}>{sanitizeText(data.opis_radova)}</Text>
          </View>
        )}

        <View style={s.tableHeader}>
          <Text style={[s.tableHeaderCell, s.colRb]}>Rb.</Text>
          <Text style={[s.tableHeaderCell, s.colNaziv]}>Opis rada / materijala</Text>
          <Text style={[s.tableHeaderCell, s.colKol]}>Kol.</Text>
          <Text style={[s.tableHeaderCell, s.colJed]}>Jed.</Text>
          <Text style={[s.tableHeaderCell, s.colCena]}>Cena</Text>
          <Text style={[s.tableHeaderCell, s.colUkupno]}>Ukupno</Text>
        </View>

        {stavke.map((stavka, i) => {
          const ukupno = stavka.kolicina * stavka.cena_bez_pdv
          return (
            <View key={i} style={[s.tableRow, i % 2 === 1 ? s.tableRowAlt : {}]}>
              <Text style={[s.tableCell, s.colRb]}>{stavka.rb}.</Text>
              <Text style={[s.tableCell, s.colNaziv]}>{sanitizeText(stavka.naziv)}</Text>
              <Text style={[s.tableCell, s.colKol]}>{fmt(stavka.kolicina)}</Text>
              <Text style={[s.tableCell, s.colJed]}>{sanitizeText(stavka.jedinica)}</Text>
              <Text style={[s.tableCell, s.colCena]}>{fmt(stavka.cena_bez_pdv)}</Text>
              <Text style={[s.tableCell, s.colUkupno]}>{fmt(ukupno)}</Text>
            </View>
          )
        })}

        <View style={s.sumaBlok}>
          <View style={s.sumaRed}>
            <Text style={s.sumaLabel}>Ukupno bez PDV:</Text>
            <Text style={s.sumaValue}>{fmt(ukupnoBezPdv)} RSD</Text>
          </View>
          {data.izvodjac_pdv_obveznik && data.pdv_stopa !== 'oslobodjeno' && pdvStopa > 0 && (
            <View style={s.sumaRed}>
              <Text style={s.sumaLabel}>PDV ({pdvStopa}%):</Text>
              <Text style={s.sumaValue}>{fmt(iznosPdv)} RSD</Text>
            </View>
          )}
          <View style={s.sumaUkupnoRed}>
            <Text style={s.sumaUkupnoLabel}>Ukupna vrednost:</Text>
            <Text style={s.sumaUkupnoValue}>{fmt(ukupnoSaPdv)} RSD</Text>
          </View>
        </View>

        {data.napomena && (
          <View style={s.napomenaBlok}>
            <Text style={s.napomenaLabel}>Napomena</Text>
            <Text style={s.napomenaText}>{sanitizeText(data.napomena)}</Text>
          </View>
        )}

        {!data.izvodjac_pdv_obveznik && (
          <View style={s.pdvNapomena}>
            <Text style={s.pdvNapomenaText}>
              Napomena: Izvođač nije u sistemu PDV-a u smislu Zakona o PDV Republike Srbije. PDV nije obracunat.
            </Text>
          </View>
        )}
        {data.izvodjac_pdv_obveznik && data.pdv_stopa === 'oslobodjeno' && (
          <View style={s.pdvNapomena}>
            <Text style={s.pdvNapomenaText}>
              Promet je oslobodjen PDV-a u skladu sa Zakonom o porezu na dodatu vrednost Republike Srbije.
            </Text>
          </View>
        )}

        <View style={s.potpisiBlok}>
          <Text style={s.potpisiLabel}>Ponudu sačinio</Text>
          <View style={s.potpisiLinija}>
            <Text style={s.potpisiNazivLabel}>IZVOĐAČ</Text>
            <Text style={s.potpisiNaziv}>{sanitizeText(data.izvodjac_naziv)}</Text>
          </View>
        </View>

        <View style={s.footer} fixed>
          <Text style={s.footerText}>Dokument generisan putem aisistent.rs</Text>
        </View>
      </Page>
    </Document>
  )
}
