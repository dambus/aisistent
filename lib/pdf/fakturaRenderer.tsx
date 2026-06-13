import React from 'react'
import {
  Document, Page, View, Text, Image, StyleSheet,
} from '@react-pdf/renderer'
import { sanitizeText } from '@/lib/pdf/markdownParser'

interface FakturaStavka {
  rb: number
  naziv: string
  kolicina: number
  jedinica: string
  cena_bez_pdv: number
}

interface FakturaData {
  tip_dokumenta: string
  broj_dokumenta?: string
  datum_izdavanja: string
  datum_prometa?: string
  datum_valute: string
  izdavalac_naziv: string
  izdavalac_pib: string
  izdavalac_adresa: string
  izdavalac_tekuci_racun?: string
  izdavalac_email?: string
  izdavalac_telefon?: string
  izdavalac_pdv_obveznik: boolean
  primalac_naziv: string
  primalac_pib?: string
  primalac_adresa: string
  stavke: string
  pdv_stopa?: string
  napomena?: string
  poziv_na_broj?: string
}

interface Props {
  data: FakturaData
  logoUrl?: string
  kompanija?: {
    naziv: string
    pib: string
    adresa: string
    grad: string
  }
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
  page: { fontFamily: 'Helvetica', fontSize: 9, color: '#111827', paddingHorizontal: 40, paddingTop: 36, paddingBottom: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 },
  logo: { width: 120, height: 32, objectFit: 'contain' },
  logoText: { fontSize: 16, fontFamily: 'Helvetica-Bold', color: ZELENA },
  headerRight: { alignItems: 'flex-end' },
  docNaziv: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: ZELENA, marginBottom: 2 },
  docBroj: { fontSize: 9, color: SIVA },
  strane: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  stranaBlok: { width: '47%' },
  stranaLabel: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: SIVA, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  stranaNaziv: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: '#111827', marginBottom: 2 },
  stranaInfo: { fontSize: 8, color: SIVA, marginBottom: 1 },
  metaBlok: { flexDirection: 'row', backgroundColor: SVETLO_SIVA, borderRadius: 6, padding: 12, marginBottom: 20, gap: 20 },
  metaItem: { flex: 1 },
  metaLabel: { fontSize: 7, color: SIVA, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  metaValue: { fontSize: 9, fontFamily: 'Helvetica-Bold' },
  tableHeader: { flexDirection: 'row', backgroundColor: ZELENA, borderRadius: 4, paddingVertical: 6, paddingHorizontal: 6, marginBottom: 2 },
  tableHeaderCell: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#FFFFFF', textTransform: 'uppercase' },
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
  sumaUkupnoLabel: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: ZELENA, width: 130, textAlign: 'right' },
  sumaUkupnoValue: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: ZELENA, width: 90, textAlign: 'right' },
  donji: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 24, gap: 16 },
  napomenaBlok: { flex: 1 },
  napomenaLabel: { fontSize: 7, color: SIVA, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 },
  napomenaText: { fontSize: 8.5 },
  placanjeBok: { width: '42%', backgroundColor: SVETLO_SIVA, borderRadius: 6, padding: 10 },
  placanjeLabel: { fontSize: 7, color: SIVA, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  placanjeRed: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  placanjeKey: { fontSize: 8, color: SIVA },
  placanjeVal: { fontSize: 8, fontFamily: 'Helvetica-Bold' },
  pdvNapomena: { marginTop: 16, borderWidth: 1, borderColor: '#FCD34D', backgroundColor: '#FFFBEB', borderRadius: 4, padding: 8 },
  pdvNapomenaText: { fontSize: 7.5, color: '#92400E' },
  footer: { position: 'absolute', bottom: 20, left: 40, right: 40 },
  footerText: { fontSize: 7, color: '#9CA3AF', textAlign: 'center' },
})

export function FakturaPDF({ data, logoUrl, kompanija }: Props) {
  let stavke: FakturaStavka[] = []
  try { stavke = JSON.parse(data.stavke) } catch {}

  const pdvStopa = data.izdavalac_pdv_obveznik ? (parseInt(data.pdv_stopa ?? '0') || 0) : 0
  const ukupnoBezPdv = stavke.reduce((sum, stavka) => sum + stavka.kolicina * stavka.cena_bez_pdv, 0)
  const iznosPdv = ukupnoBezPdv * pdvStopa / 100
  const ukupnoSaPdv = ukupnoBezPdv + iznosPdv

  const izdavalac = kompanija ? {
    naziv: kompanija.naziv,
    pib: kompanija.pib,
    adresa: `${kompanija.adresa}, ${kompanija.grad}`,
  } : {
    naziv: data.izdavalac_naziv,
    pib: data.izdavalac_pib,
    adresa: data.izdavalac_adresa,
  }

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <View>
            {logoUrl
              ? <Image src={logoUrl} style={s.logo} />
              : <Text style={s.logoText}>AIsistent</Text>}
          </View>
          <View style={s.headerRight}>
            <Text style={s.docNaziv}>{sanitizeText(data.tip_dokumenta.toUpperCase())}</Text>
            {data.broj_dokumenta && (
              <Text style={s.docBroj}>Broj: {sanitizeText(data.broj_dokumenta)}</Text>
            )}
          </View>
        </View>

        <View style={s.strane}>
          <View style={s.stranaBlok}>
            <Text style={s.stranaLabel}>Izdavalac</Text>
            <Text style={s.stranaNaziv}>{sanitizeText(izdavalac.naziv)}</Text>
            <Text style={s.stranaInfo}>PIB: {sanitizeText(izdavalac.pib)}</Text>
            <Text style={s.stranaInfo}>{sanitizeText(izdavalac.adresa)}</Text>
            {data.izdavalac_email && <Text style={s.stranaInfo}>{sanitizeText(data.izdavalac_email)}</Text>}
            {data.izdavalac_telefon && <Text style={s.stranaInfo}>{sanitizeText(data.izdavalac_telefon)}</Text>}
          </View>
          <View style={s.stranaBlok}>
            <Text style={s.stranaLabel}>Primalac</Text>
            <Text style={s.stranaNaziv}>{sanitizeText(data.primalac_naziv)}</Text>
            {data.primalac_pib && <Text style={s.stranaInfo}>PIB: {sanitizeText(data.primalac_pib)}</Text>}
            <Text style={s.stranaInfo}>{sanitizeText(data.primalac_adresa)}</Text>
          </View>
        </View>

        <View style={s.metaBlok}>
          <View style={s.metaItem}>
            <Text style={s.metaLabel}>Datum izdavanja</Text>
            <Text style={s.metaValue}>{formatDate(data.datum_izdavanja)}</Text>
          </View>
          {data.datum_prometa && (
            <View style={s.metaItem}>
              <Text style={s.metaLabel}>Datum prometa</Text>
              <Text style={s.metaValue}>{formatDate(data.datum_prometa)}</Text>
            </View>
          )}
          <View style={s.metaItem}>
            <Text style={s.metaLabel}>Rok placanja</Text>
            <Text style={s.metaValue}>{formatDate(data.datum_valute)}</Text>
          </View>
        </View>

        <View style={s.tableHeader}>
          <Text style={[s.tableHeaderCell, s.colRb]}>Rb.</Text>
          <Text style={[s.tableHeaderCell, s.colNaziv]}>Naziv</Text>
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
          {pdvStopa > 0 && (
            <View style={s.sumaRed}>
              <Text style={s.sumaLabel}>PDV ({pdvStopa}%):</Text>
              <Text style={s.sumaValue}>{fmt(iznosPdv)} RSD</Text>
            </View>
          )}
          <View style={s.sumaUkupnoRed}>
            <Text style={s.sumaUkupnoLabel}>Ukupno za uplatu:</Text>
            <Text style={s.sumaUkupnoValue}>{fmt(ukupnoSaPdv)} RSD</Text>
          </View>
        </View>

        <View style={s.donji}>
          <View style={s.napomenaBlok}>
            {data.napomena && (
              <>
                <Text style={s.napomenaLabel}>Napomena</Text>
                <Text style={s.napomenaText}>{sanitizeText(data.napomena)}</Text>
              </>
            )}
          </View>
          {(data.izdavalac_tekuci_racun || data.poziv_na_broj) && (
            <View style={s.placanjeBok}>
              <Text style={s.placanjeLabel}>Podaci za placanje</Text>
              {data.izdavalac_tekuci_racun && (
                <View style={s.placanjeRed}>
                  <Text style={s.placanjeKey}>Racun:</Text>
                  <Text style={s.placanjeVal}>{sanitizeText(data.izdavalac_tekuci_racun)}</Text>
                </View>
              )}
              {data.poziv_na_broj && (
                <View style={s.placanjeRed}>
                  <Text style={s.placanjeKey}>Poziv na broj:</Text>
                  <Text style={s.placanjeVal}>{sanitizeText(data.poziv_na_broj)}</Text>
                </View>
              )}
              <View style={s.placanjeRed}>
                <Text style={s.placanjeKey}>Iznos:</Text>
                <Text style={s.placanjeVal}>{fmt(ukupnoSaPdv)} RSD</Text>
              </View>
            </View>
          )}
        </View>

        {!data.izdavalac_pdv_obveznik && (
          <View style={s.pdvNapomena}>
            <Text style={s.pdvNapomenaText}>
              Napomena: Izdavalac fakture nije u sistemu PDV-a u smislu Zakona o PDV Republike Srbije. PDV nije obracunat.
            </Text>
          </View>
        )}

        <View style={s.footer} fixed>
          <Text style={s.footerText}>Dokument generisan putem aisistent.rs</Text>
        </View>
      </Page>
    </Document>
  )
}
