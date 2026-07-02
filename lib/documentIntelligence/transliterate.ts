// Srpska transliteracija (latinica ↔ ćirilica) prema standardu SRPS ISO 9
// Digraphi (lj, nj, dž) se obrađuju pre jednoslovnih da bi imali prioritet.

const LAT_TO_CYR: [string, string][] = [
  ['lj', 'љ'], ['Lj', 'Љ'], ['LJ', 'Љ'],
  ['nj', 'њ'], ['Nj', 'Њ'], ['NJ', 'Њ'],
  ['dž', 'џ'], ['Dž', 'Џ'], ['DŽ', 'Џ'],
  ['a',  'а'], ['A',  'А'],
  ['b',  'б'], ['B',  'Б'],
  ['c',  'ц'], ['C',  'Ц'],
  ['č',  'ч'], ['Č',  'Ч'],
  ['ć',  'ћ'], ['Ć',  'Ћ'],
  ['d',  'д'], ['D',  'Д'],
  ['đ',  'ђ'], ['Đ',  'Ђ'],
  ['e',  'е'], ['E',  'Е'],
  ['f',  'ф'], ['F',  'Ф'],
  ['g',  'г'], ['G',  'Г'],
  ['h',  'х'], ['H',  'Х'],
  ['i',  'и'], ['I',  'И'],
  ['j',  'ј'], ['J',  'Ј'],
  ['k',  'к'], ['K',  'К'],
  ['l',  'л'], ['L',  'Л'],
  ['m',  'м'], ['M',  'М'],
  ['n',  'н'], ['N',  'Н'],
  ['o',  'о'], ['O',  'О'],
  ['p',  'п'], ['P',  'П'],
  ['r',  'р'], ['R',  'Р'],
  ['s',  'с'], ['S',  'С'],
  ['š',  'ш'], ['Š',  'Ш'],
  ['t',  'т'], ['T',  'Т'],
  ['u',  'у'], ['U',  'У'],
  ['v',  'в'], ['V',  'В'],
  ['z',  'з'], ['Z',  'З'],
  ['ž',  'ж'], ['Ž',  'Ж'],
];

const CYR_TO_LAT: [string, string][] = [
  ['љ', 'lj'], ['Љ', 'Lj'],
  ['њ', 'nj'], ['Њ', 'Nj'],
  ['џ', 'dž'], ['Џ', 'Dž'],
  ['а', 'a'],  ['А', 'A'],
  ['б', 'b'],  ['Б', 'B'],
  ['в', 'v'],  ['В', 'V'],
  ['г', 'g'],  ['Г', 'G'],
  ['д', 'd'],  ['Д', 'D'],
  ['ђ', 'đ'],  ['Ђ', 'Đ'],
  ['е', 'e'],  ['Е', 'E'],
  ['ж', 'ž'],  ['Ж', 'Ž'],
  ['з', 'z'],  ['З', 'Z'],
  ['и', 'i'],  ['И', 'I'],
  ['ј', 'j'],  ['Ј', 'J'],
  ['к', 'k'],  ['К', 'K'],
  ['л', 'l'],  ['Л', 'L'],
  ['м', 'm'],  ['М', 'M'],
  ['н', 'n'],  ['Н', 'N'],
  ['о', 'o'],  ['О', 'O'],
  ['п', 'p'],  ['П', 'P'],
  ['р', 'r'],  ['Р', 'R'],
  ['с', 's'],  ['С', 'S'],
  ['т', 't'],  ['Т', 'T'],
  ['ћ', 'ć'],  ['Ћ', 'Ć'],
  ['у', 'u'],  ['У', 'U'],
  ['ф', 'f'],  ['Ф', 'F'],
  ['х', 'h'],  ['Х', 'H'],
  ['ц', 'c'],  ['Ц', 'C'],
  ['ч', 'č'],  ['Ч', 'Č'],
  ['ш', 'š'],  ['Ш', 'Š'],
];

function applyMap(text: string, map: [string, string][]): string {
  let result = text;
  for (const [from, to] of map) {
    result = result.split(from).join(to);
  }
  return result;
}

export function latinToCyrillic(text: string): string {
  return applyMap(text, LAT_TO_CYR);
}

export function cyrillicToLatin(text: string): string {
  return applyMap(text, CYR_TO_LAT);
}

// Broji ćirilična i latinična slova — >50% ćirilice → ćirilični dokument
export function detectScript(text: string): 'cyrillic' | 'latin' {
  let cyr = 0;
  let lat = 0;
  for (const ch of text) {
    const code = ch.codePointAt(0) ?? 0;
    if (code >= 0x0400 && code <= 0x04FF) cyr++;
    else if ((code >= 0x0041 && code <= 0x005A) || (code >= 0x0061 && code <= 0x007A)) lat++;
  }
  return cyr > lat ? 'cyrillic' : 'latin';
}

// Email adrese, veb sajtovi i slične tehničke vrednosti nikad ne smeju biti
// transliterisane — @ i domen moraju ostati latinicom bez obzira na pismo dokumenta.
const NON_TRANSLITERABLE_RE = /@|^(https?:\/\/|www\.)/i;

export function isNonTransliterable(value: string): boolean {
  return NON_TRANSLITERABLE_RE.test(value.trim());
}

// Konvertuje vrednost prema pismu dokumenta
export function toDocumentScript(value: string, script: 'cyrillic' | 'latin'): string {
  if (isNonTransliterable(value)) return value;
  const valueScript = detectScript(value);
  if (script === 'cyrillic' && valueScript === 'latin') return latinToCyrillic(value);
  if (script === 'latin' && valueScript === 'cyrillic') return cyrillicToLatin(value);
  return value;
}
