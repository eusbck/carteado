// Tipos do catálogo de decks (importar e atualizar pelo link do Moxfield).
//
// A fonte dos decks é a pasta decks/ (no repositório): um arquivo por deck, com a lista jogável (`atual`) e,
// quando uma importação ou atualização traz cartas que ainda não têm regras, a lista que espera essas cartas
// (`preparacao`). As cartas que ../cartas não tem ficam em decks/cartas.json, no mesmo formato dos dados de
// ../cartas/data (cards.json e printings.json), para que a mesma junção gere jogo/gerado/.

export interface EntradaLista { nome: string; quantidade: number }

export interface Lista {
  comandante: string;
  cartas: EntradaLista[];
}

/** de onde a lista veio no Moxfield */
export interface Origem {
  versao: number | null;
  atualizadoEm: string | null;
}

export interface VersaoLista extends Lista {
  origem: Origem;
  /** quando esta versão foi recebida (ISO) */
  desde: string;
}

export interface DeckArquivo {
  formato: 1;
  /** publicId do Moxfield (o fim do link) */
  id: string;
  /** posição fixa na lista dos decks jogáveis (gerado/decks.json): os 7 originais têm 0 a 6 */
  ordem: number;
  nome: string;
  link: string;
  importadoEm: string;
  /** última vez que alguém buscou o deck no Moxfield (importar ou atualizar) */
  verificadoEm: string | null;
  /** lista jogável; null enquanto um deck novo ainda espera cartas */
  atual: VersaoLista | null;
  /** lista que espera cartas sem regras; entra sozinha quando todas ficarem prontas */
  preparacao: VersaoLista | null;
}

// ---------------------------------------------------------------------------- dados do Scryfall

export interface ScryFace {
  name: string;
  mana_cost?: string;
  type_line?: string;
  oracle_text?: string;
  power?: string | null;
  toughness?: string | null;
  loyalty?: string | null;
  colors?: string[];
  color_indicator?: string[];
  printed_name?: string;
  printed_type_line?: string;
  printed_text?: string;
  image_uris?: Record<string, string>;
}

/** identidade de jogo (uma por oracle id), como ../cartas/data/cards.json */
export interface ScryCard extends ScryFace {
  id: string;
  oracle_id: string;
  layout: string;
  cmc: number;
  color_identity: string[];
  keywords: string[];
  legalities?: Record<string, string>;
  card_faces: ScryFace[] | null;
  all_parts?: { id: string; component: string; name: string }[] | null;
  printing_ids: string[];
}

export interface ImagemLocal { face: string; path: string; source_url?: string }

/** uma impressão (edição e idioma), como ../cartas/data/printings.json (só os campos que o jogo usa) */
export interface Printing {
  id: string;
  oracle_id: string;
  name: string;
  lang: string;
  layout: string;
  set: string;
  collector_number: string;
  type_line?: string;
  oracle_text?: string;
  power?: string | null;
  toughness?: string | null;
  colors?: string[];
  printed_name?: string | null;
  printed_type_line?: string | null;
  printed_text?: string | null;
  card_faces?: ScryFace[] | null;
  image_status?: string;
  local_images?: ImagemLocal[];
}

/** objeto de carta como a API do Scryfall devolve (impressão completa) */
export interface ScryObjeto extends ScryFace {
  object: string;
  id: string;
  oracle_id?: string;
  lang: string;
  layout: string;
  set: string;
  collector_number: string;
  cmc?: number;
  color_identity?: string[];
  keywords?: string[];
  legalities?: Record<string, string>;
  card_faces?: (ScryFace & { oracle_id?: string })[];
  all_parts?: { id: string; component: string; name: string; type_line?: string }[];
  image_status?: string;
  highres_image?: boolean;
  digital?: boolean;
  games?: string[];
  released_at?: string;
  illustration_id?: string;
}

/** cartas novas (fora de ../cartas): só cresce, para partidas salvas nunca perderem uma carta */
export interface NovasCartas {
  formato: 1;
  /** por oracle id */
  cards: Record<string, ScryCard>;
  /** por id da impressão */
  printings: Record<string, Printing>;
  /** impressão escolhida de cada carta nova (em inglês e em português) */
  escolhas: Record<string, { en: string; pt: string | null }>;
  /** oracle ids das fichas criadas pelas cartas novas, na ordem em que entraram */
  fichas: string[];
}

export interface Ruling { source: string; published_at: string; comment: string }
export interface NovosRulings { formato: 1; by_oracle_id: Record<string, Ruling[]> }
