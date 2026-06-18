import React from 'react'
import path from 'path'
import {
  Document, Page, View, Text, StyleSheet, Font,
} from '@react-pdf/renderer'
import { sanitizeText } from '@/lib/pdf/markdownParser'

const FONTS_DIR = path.resolve(process.cwd(), 'public/fonts')
Font.register({ family: 'Roboto', src: `${FONTS_DIR}/Roboto-Regular.ttf` })
Font.register({ family: 'Roboto-Bold', src: `${FONTS_DIR}/Roboto-Bold.ttf` })

interface OtpremnicaStavka {
  rb: number
  naziv: string
  kolicina: number
  jedinica: string
  cena_bez_pdv: number
}

interface OtpremnicaData {
  broj_dokumenta?: string
  datum_izdavanja: string
  datum_isporuke?: string
  isporucilac_naziv: string
  isporucilac_pib?: string
  isporucilac_adresa: string
  isporucilac_tekuci_racun?: string
  isporucilac_email?: string
  isporucilac_telefon?: string
  isporucilac_pdv_obveznik: boolean
  primalac_naziv: string
  primalac_pib?: string
  primalac_adresa: string
  nacin_isporuke?: string
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  docNaziv: { fontSize: 18, fontFamily: 'Roboto-Bold', color: ZELENA, marginBottom: 2 },
  docBroj: { fontSize: 9, color: SIVA },
  headerLeft: { flex: 1 },

  metaBlok: { flexDirection: 'row', backgroundColor: SVETLO_SIVA, borderRadius: 6, padding: 12, marginBottom: 20, gap: 20 },
  metaItem: { flex: 1 },
  metaLabel: { fontSize: 7, color: SIVA, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  metaValue: { fontSize: 9, fontFamily: 'Roboto-Bold' },

  strane: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  stranaBlok: { width: '47%' },
  stranaLabel: { fontSize: 7, fontFamily: 'Roboto-Bold', color: SIVA, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  stranaNaziv: { fontSize: 10, fontFamily: 'Roboto-Bold', color: '#111827', marginBottom: 2 },
  stranaInfo: { fontSize: 8, color: SIVA, marginBottom: 1 },

  tableHeader: { flexDirection: 'row', backgroundColor: ZELENA, borderRadius: 4, paddingVertical: 6, paddingHorizontal: 6, marginBottom: 2 },
  tableHeaderCell: { fontSize: 7, fontFamily: 'Roboto-Bold', color: '#FFFFFF', textTransform: 'uppercase' },
  tableRow: { flexDirection: 'row', paddingVertical: 5, paddingHorizontal: 6, borderBottomWidth: 1, borderBottomColor: BORDER },
  tableRowAlt: { backgroundColor: SVETLO_SIVA },
  tableCell: { fontSize: 8.5 },
  colRb: { width: '5%' },
  colNaziv: { width: '45%' },
  colKol: { width: '10%', textAlign: 'right' },
  colJed: { width: '8%', textAlign: 'center' },
  colUkupno: { width: '32%', textAlign: 'right' },

  sumaBlok: { alignItems: 'flex-end', marginTop: 12 },
  sumaRed: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginBottom: 3 },
  sumaLabel: { fontSize: 8.5, color: SIVA, width: 130, textAlign: 'right' },
  sumaValue: { fontSize: 8.5, width: 90, textAlign: 'right' },
  sumaUkupnoRed: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 4, borderTopWidth: 1.5, borderTopColor: ZELENA, paddingTop: 5 },
  sumaUkupnoLabel: { fontSize: 10, fontFamily: 'Roboto-Bold', color: ZELENA, width: 130, textAlign: 'right' },
  sumaUkupnoValue: { fontSize: 10, fontFamily: 'Roboto-Bold', color: ZELENA, width: 90, textAlign: 'right' },

  napomenaBlok: { marginTop: 20, marginBottom: 20 },
  napomenaLabel: { fontSize: 7, color: SIVA, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 },
  napomenaText: { fontSize: 8.5 },

  pdvNapomena: { marginTop: 12, borderWidth: 1, borderColor: '#FCD34D', backgroundColor: '#FFFBEB', borderRadius: 4, padding: 8 },
  pdvNapomenaText: { fontSize: 7.5, color: '#92400E' },

  potpisiLabel: { fontSize: 7, color: SIVA, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, marginTop: 20 },
  potpisiRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 40 },
  potpisiBlok: { width: '45%', borderTopWidth: 1, borderTopColor: BORDER, paddingTop: 6 },
  potpisiNaziv: { fontSize: 8, color: SIVA, marginBottom: 2 },
  potpisiPotpis: { fontSize: 8 },

  footer: { position: 'absolute', bottom: 20, left: 40, right: 40 },
  footerText: { fontSize: 7, color: '#9CA3AF', textAlign: 'center' },
})

export function OtpremnicaPDF({ data }: { data: OtpremnicaData }) {
  let stavke: OtpremnicaStavka[] = []
  try { stavke = JSON.parse(data.stavke) } catch {}

  const pdvStopa = data.isporucilac_pdv_obveznik
    ? (data.pdv_stopa === 'oslobodjeno' ? 0 : parseInt(data.pdv_stopa ?? '0') || 0)
    : 0
  const ukupnoKolicina = stavke.reduce((sum, s) => sum + s.kolicina, 0)
  const ukupnoBezPdv = stavke.reduce((sum, s) => sum + s.kolicina * s.cena_bez_pdv, 0)
  const iznosPdv = data.isporucilac_pdv_obveznik && data.pdv_stopa !== 'oslobodjeno'
    ? ukupnoBezPdv * pdvStopa / 100
    : 0
  const ukupnoSaPdv = ukupnoBezPdv + iznosPdv

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.header}>
          <View style={s.headerLeft}>
            <Text style={s.docNaziv}>OTPREMNICA</Text>
            {data.broj_dokumenta && (
              <Text style={s.docBroj}>Broj: {sanitizeText(data.broj_dokumenta)}</Text>
            )}
          </View>
        </View>

        {/* Meta datumi */}
        <View style={s.metaBlok}>
          <View style={s.metaItem}>
            <Text style={s.metaLabel}>Datum izdavanja</Text>
            <Text style={s.metaValue}>{formatDate(data.datum_izdavanja)}</Text>
          </View>
          {data.datum_isporuke && (
            <View style={s.metaItem}>
              <Text style={s.metaLabel}>Datum isporuke</Text>
              <Text style={s.metaValue}>{formatDate(data.datum_isporuke)}</Text>
            </View>
          )}
          {data.nacin_isporuke && (
            <View style={s.metaItem}>
              <Text style={s.metaLabel}>Nacin isporuke</Text>
              <Text style={s.metaValue}>{sanitizeText(data.nacin_isporuke)}</Text>
            </View>
          )}
        </View>

        {/* Isporučilac / Primalac */}
        <View style={s.strane}>
          <View style={s.stranaBlok}>
            <Text style={s.stranaLabel}>Isporucilac</Text>
            <Text style={s.stranaNaziv}>{sanitizeText(data.isporucilac_naziv)}</Text>
            {data.isporucilac_pib && <Text style={s.stranaInfo}>PIB: {sanitizeText(data.isporucilac_pib)}</Text>}
            <Text style={s.stranaInfo}>{sanitizeText(data.isporucilac_adresa)}</Text>
            {data.isporucilac_email && <Text style={s.stranaInfo}>{sanitizeText(data.isporucilac_email)}</Text>}
            {data.isporucilac_telefon && <Text style={s.stranaInfo}>{sanitizeText(data.isporucilac_telefon)}</Text>}
            {data.isporucilac_tekuci_racun && <Text style={s.stranaInfo}>Racun: {sanitizeText(data.isporucilac_tekuci_racun)}</Text>}
          </View>
          <View style={s.stranaBlok}>
            <Text style={s.stranaLabel}>Primalac</Text>
            <Text style={s.stranaNaziv}>{sanitizeText(data.primalac_naziv)}</Text>
            {data.primalac_pib && <Text style={s.stranaInfo}>PIB: {sanitizeText(data.primalac_pib)}</Text>}
            <Text style={s.stranaInfo}>{sanitizeText(data.primalac_adresa)}</Text>
          </View>
        </View>

        {/* Tabela stavki */}
        <View style={s.tableHeader}>
          <Text style={[s.tableHeaderCell, s.colRb]}>Rb.</Text>
          <Text style={[s.tableHeaderCell, s.colNaziv]}>Naziv robe/usluge</Text>
          <Text style={[s.tableHeaderCell, s.colKol]}>Kol.</Text>
          <Text style={[s.tableHeaderCell, s.colJed]}>Jed.</Text>
          <Text style={[s.tableHeaderCell, s.colUkupno]}>Kolicina ukupno</Text>
        </View>

        {stavke.map((stavka, i) => (
          <View key={i} style={[s.tableRow, i % 2 === 1 ? s.tableRowAlt : {}]}>
            <Text style={[s.tableCell, s.colRb]}>{stavka.rb}.</Text>
            <Text style={[s.tableCell, s.colNaziv]}>{sanitizeText(stavka.naziv)}</Text>
            <Text style={[s.tableCell, s.colKol]}>{fmt(stavka.kolicina)}</Text>
            <Text style={[s.tableCell, s.colJed]}>{sanitizeText(stavka.jedinica)}</Text>
            <Text style={[s.tableCell, s.colUkupno]}>{fmt(stavka.kolicina)}</Text>
          </View>
        ))}

        {/* Suma */}
        <View style={s.sumaBlok}>
          <View style={s.sumaRed}>
            <Text style={s.sumaLabel}>Ukupna kolicina:</Text>
            <Text style={s.sumaValue}>{fmt(ukupnoKolicina)}</Text>
          </View>
          {data.isporucilac_pdv_obveznik && data.pdv_stopa !== 'oslobodjeno' && (
            <>
              <View style={s.sumaRed}>
                <Text style={s.sumaLabel}>Ukupno bez PDV:</Text>
                <Text style={s.sumaValue}>{fmt(ukupnoBezPdv)} RSD</Text>
              </View>
              {pdvStopa > 0 && (
                <View style={s.sumaRed}>
                  <Text style={s.sumaLabel}>PDV ({pdvStopa}%):</Text>
                  <Text style={s.sumaValue}>{fmt(iznosPdv)} RSD</Text>
                </View>
              )}
              <View style={s.sumaUkupnoRed}>
                <Text style={s.sumaUkupnoLabel}>Ukupna vrednost:</Text>
                <Text style={s.sumaUkupnoValue}>{fmt(ukupnoSaPdv)} RSD</Text>
              </View>
            </>
          )}
        </View>

        {/* Napomena */}
        {data.napomena && (
          <View style={s.napomenaBlok}>
            <Text style={s.napomenaLabel}>Napomena</Text>
            <Text style={s.napomenaText}>{sanitizeText(data.napomena)}</Text>
          </View>
        )}

        {/* PDV napomena */}
        {!data.isporucilac_pdv_obveznik && (
          <View style={s.pdvNapomena}>
            <Text style={s.pdvNapomenaText}>
              Napomena: Isporucilac nije u sistemu PDV-a u smislu Zakona o PDV Republike Srbije. PDV nije obracunat.
            </Text>
          </View>
        )}
        {data.isporucilac_pdv_obveznik && data.pdv_stopa === 'oslobodjeno' && (
          <View style={s.pdvNapomena}>
            <Text style={s.pdvNapomenaText}>
              Promet je oslobodjen PDV-a u skladu sa Zakonom o porezu na dodatu vrednost Republike Srbije.
            </Text>
          </View>
        )}

        {/* Potpisi */}
        <Text style={s.potpisiLabel}>Potpisi</Text>
        <View style={s.potpisiRow}>
          <View style={s.potpisiBlok}>
            <Text style={s.potpisiNaziv}>ISPORUCILAC</Text>
            <Text style={s.potpisiPotpis}>{sanitizeText(data.isporucilac_naziv)}</Text>
          </View>
          <View style={s.potpisiBlok}>
            <Text style={s.potpisiNaziv}>PRIMALAC</Text>
            <Text style={s.potpisiPotpis}>{sanitizeText(data.primalac_naziv)}</Text>
          </View>
        </View>

        <View style={s.footer} fixed>
          <Text style={s.footerText}>Dokument generisan putem aisistent.rs</Text>
        </View>
      </Page>
    </Document>
  )
}
