export interface KnowledgeTopic {
  id: string
  naslov: string
  poslednjaProvera: string // ISO datum — kad je sadržaj poslednji put ručno proveren naspram zakona
  pravniOsnov: string
  sadrzaj: string
}
